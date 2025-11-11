import express from 'express';
import mongoose from 'mongoose';
import Form from '../models/Form.js';
import adminAuth from '../middleware/auth.js';


const router = express.Router();

router.get('/forms', adminAuth, async (req, res) => {
  const pipeline = [
    { $match: { softDeleted: false } },
    { $sort: { groupId: 1, version: -1 } },
    {
      $group: {
        _id: '$groupId',
        doc: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { createdAt: -1 } }
  ];
  const forms = await Form.aggregate(pipeline);
  res.json(forms);
});


router.post('/forms', adminAuth, async (req, res) => {
  try{
  const { title, description, fields } = req.body;
  const groupId = new mongoose.Types.ObjectId().toString();
  const form = await Form.create({ groupId, version: 1, title, description, fields });
  res.status(201).json(form);
  }catch(e){
    console.log(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/forms/:groupId', adminAuth, async (req, res) => {
  try{
  const { groupId } = req.params;
  const latest = await Form.findOne({ groupId, softDeleted: false }).sort({ version: -1 });
  if (!latest) return res.status(404).json({ error: 'Form not found' });
  const { title, description, fields } = req.body;
  const newVersion = (latest.version || 1) + 1;
  const created = await Form.create({ groupId, version: newVersion, title, description, fields });
  res.json(created);
  }catch(e){
    console.log(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/forms/:groupId', adminAuth, async (req, res) => {
  try{
  const { groupId } = req.params;
  await Form.updateMany({ groupId }, { $set: { softDeleted: true } });
  res.json({ ok: true });
  }catch(e){
    console.log(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
