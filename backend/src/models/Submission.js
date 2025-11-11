import mongoose from 'mongoose';

const FileMetaSchema = new mongoose.Schema({
  fieldName: String,
  originalName: String,
  storedPath: String,
  mimeType: String,
  size: Number
}, { _id: false });

const SubmissionSchema = new mongoose.Schema({
  formGroupId: { type: String, index: true },
  formVersion: { type: Number },
  data: { type: Object, default: {} },
  files: { type: [FileMetaSchema], default: [] },
  submittedAt: { type: Date, default: Date.now },
  ip: String
});

export default mongoose.model('Submission', SubmissionSchema);
