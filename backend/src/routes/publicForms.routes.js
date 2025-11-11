import express from 'express';
import Form from '../models/Form.js';

const router = express.Router();

router.get('/forms', async (req, res) => {
  try{
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
    { $project: { fields: 0 } } // lighter list
  ];
  const forms = await Form.aggregate(pipeline);
  res.json(forms);
  }catch(e){
    console.log(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/forms/:groupId', async (req, res) => {
  try{
  const { groupId } = req.params;
  const { version } = req.query;
  const query = { groupId, softDeleted: false };
  const form = version
    ? await Form.findOne({ ...query, version: Number(version) })
    : await Form.findOne(query).sort({ version: -1 });
  if (!form) return res.status(404).json({ error: 'Form not found' });
  res.json(form);
  }catch(e){
    console.log(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
