import mongoose from 'mongoose';
const { Schema } = mongoose;


const FieldSchema = new Schema({}, { _id: false });

FieldSchema.add({
  label: { type: String, required: true },
  type: { 
    type: String,
    enum: ['text','textarea','number','email','date','checkbox','radio','select','file'],
    required: true
  },
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [{ type: String }], 
  validation: { type: Schema.Types.Mixed },
  order: { type: Number, default: 0 },
  conditionalFields: [{
    option: { type: String, required: true },
    fields: [FieldSchema] 
  }]
});

const FormSchema = new mongoose.Schema({
  groupId: { type: String, index: true },
  version: { type: Number, default: 1 },
  title: { type: String, required: true },
  description: { type: String },
  fields: { type: [FieldSchema], default: [] },
  softDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Form', FormSchema);
