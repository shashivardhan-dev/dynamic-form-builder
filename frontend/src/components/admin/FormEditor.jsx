import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';
import FieldEditor from './FieldEditor.jsx';

export default function FormEditor() {
  const { mode, groupId } = useParams(); // mode: new | update
  const nav = useNavigate();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [fields, setFields] = React.useState([]);

  React.useEffect(() => {
    if (mode === 'update' && groupId) {
      api.getForm(groupId).then(f => {
        setTitle(f.title);
        setDescription(f.description || '');
        setFields(f.fields || []);
      });
    }
  }, [mode, groupId]);

  const save = async () => {
    const payload = { title, description, fields };
    if (mode === 'new') {
      await api.adminCreateForm(payload);
    } else {
      await api.adminNewVersion(groupId, payload);
    }
    nav('/admin');
  };

  const addField = () => {
    setFields([...fields, { label:'New Field', type:'text', name:`field_${fields.length+1}`, required:false, order: fields.length+1 }]);
  };

  return (
    <div>
      <h3>{mode === 'new' ? 'Create Form' : 'Create New Version'}</h3>
      <div style={{ display:'grid', gap:8, maxWidth:600 }}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
      </div>

      <h4>Fields</h4>
      <button onClick={addField}>Add Field</button>
      <div style={{ display:'grid', gap:12, marginTop:8 }}>
        {fields.sort((a,b)=>a.order-b.order).map((f, idx) => (
          <FieldEditor key={idx} field={f} onChange={(nf)=>{
            const copy=[...fields]; copy[idx]=nf; setFields(copy);
          }} onDelete={()=>{
            const copy=[...fields]; copy.splice(idx,1); setFields(copy);
          }} />
        ))}
      </div>

      <div style={{ marginTop:16 }}>
        <button onClick={save}>Save</button>
      </div>
    </div>
  );
}
