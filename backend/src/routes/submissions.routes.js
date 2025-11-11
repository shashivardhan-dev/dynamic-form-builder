import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Form from "../models/Form.js";
import Submission from "../models/Submission.js";
import adminAuth from "../middleware/auth.js";
import {
  validateSubmission,
  sanitizeInput,
} from "../utils/validateSubmission.js";
import { submissionsToCSV } from "../utils/exportCSV.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const upload = multer({ storage });

router.post("/forms/:groupId/submit", upload.any(), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { version } = req.query;

    const baseQuery = { groupId, softDeleted: false };
    const form = version
      ? await Form.findOne({ ...baseQuery, version: Number(version) })
      : await Form.findOne(baseQuery).sort({ version: -1 });

    if (!form) return res.status(404).json({ error: "Form not found" });

    const answers = sanitizeInput(req.body || {});

    for (const f of form.fields) {
      if (
        f.type === "checkbox" &&
        answers[f.name] &&
        !Array.isArray(answers[f.name])
      ) {
        answers[f.name] = [answers[f.name]];
      }
    }

    const filesMeta = (req.files || []).map((f) => ({
      fieldName: f.fieldname,
      originalName: f.originalname,
      storedPath: "/uploads/" + path.basename(f.path),
      mimeType: f.mimetype,
      size: f.size,
    }));

    const { valid, errors } = validateSubmission(form.fields, answers);

    for (const f of form.fields) {
      if (f.type === "file" && f.required) {
        const present = filesMeta.find((m) => m.fieldName === f.name);
        console.log(present, "present");

        if (Object.keys(present).length === 0) {
          console.log("not present");
          errors[f.name] = "File is required";
        }
        console.log(errors, "errors", Object.keys(present).length === 0);
      }
    }

    if (!valid || Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    const submission = await Submission.create({
      formGroupId: form.groupId,
      formVersion: form.version,
      data: answers,
      files: filesMeta,
      ip: req.ip,
    });

    res.status(201).json({ ok: true, id: submission._id });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/submissions", adminAuth, async (req, res) => {
  try {
    const { groupId, page = 1, limit = 20, version } = req.query;
    const q = {};
    if (groupId) q.formGroupId = groupId;
    if (version && version !== "latest") q.formVersion = Number(version);

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Submission.find(q)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Submission.countDocuments(q),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/submissions/export", adminAuth, async (req, res) => {
  try {
    const { groupId, version } = req.query;
    const q = {};
    if (groupId) q.formGroupId = groupId;
    if (version && version !== "latest") q.formVersion = Number(version);

    const items = await Submission.find(q).sort({ submittedAt: -1 });
    const csv = submissionsToCSV(items);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="submissions.csv"'
    );
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error exporting submissions" });
  }
});

export default router;
