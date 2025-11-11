import request from "supertest";
import mongoose from "mongoose";
import app from "../src/server.js";
import { configDotenv } from "dotenv";

configDotenv();

const ADMIN = process.env.ADMIN_TOKEN;

beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("admin create + public get form", async () => {
  const resp = await request(app)
    .post("/api/admin/forms")
    .set("x-admin-token", ADMIN)
    .send({
      title: "Test Form",
      description: "Desc",
      fields: [
        {
          label: "Email",
          type: "email",
          name: "email",
          required: true,
          order: 1,
        },
      ],
    });
  expect(resp.status).toBe(201);
  const groupId = resp.body.groupId;

  const list = await request(app).get("/api/forms");
  expect(list.status).toBe(200);
  expect(Array.isArray(list.body)).toBe(true);

  const one = await request(app).get("/api/forms/" + groupId);
  expect(one.status).toBe(200);
  expect(one.body.title).toBe("Test Form");
});
