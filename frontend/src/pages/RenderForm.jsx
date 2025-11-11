import React from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';

function Field({ field, value, setValue }) {
  const common = { name: field.name, required: field.required, onChange: e => setValue(field.name, e.target.type==='checkbox' ? (field.type==='checkbox' ? (e.target.checked ? [...(value||[]), e.target.value] : (value||[]).filter(v=>v!==e.target.value)) : e.target.checked) : e.target.value) };

  switch(field.type){
    case 'text': return <input {...common} value={value||''} />;
    case 'textarea': return <textarea {...common} value={value||''} />;
    case 'number': return <input type="number" {...common} value={value||''} />;
    case 'email': return <input type="email" {...common} value={value||''} />;
    case 'date': return <input type="date" {...common} value={value||''} />;
    case 'checkbox':
      return <div>{(field.options||[]).map(opt => (
        <label key={opt} style={{ marginRight:8 }}><input type="checkbox" value={opt} checked={(value||[]).includes(opt)} onChange={common.onChange} /> {opt}</label>
      ))}</div>;
    case 'radio':
      return <div>{(field.options||[]).map(opt => (
        <label key={opt} style={{ marginRight:8 }}><input type="radio" name={field.name} value={opt} checked={value===opt} onChange={common.onChange}/> {opt}</label>
      ))}</div>;
    case 'select':
      return <select {...common} value={value||''}>
        <option value="">-- select --</option>
        {(field.options||[]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>;
    case 'file':
      return <input type="file" name={field.name} />;
    default: return null;
  }
}

function renderConditional(field, values) {
  if (!(field.type==='radio' || field.type==='select')) return [];
  const selected = values[field.name];
  const selectedStr = Array.isArray(selected) ? selected[0] : selected;
  const cond = (field.conditionalFields||[]).find(cf => cf.option === selectedStr);
  return cond ? (cond.fields||[]) : [];
}

export default function RenderForm() {
  const { groupId } = useParams();
  const [form, setForm] = React.useState(null);
  const [values, setValues] = React.useState({});
  const [errors, setErrors] = React.useState({});
  const [okId, setOkId] = React.useState(null);

  React.useEffect(() => { api.getForm(groupId).then(setForm); }, [groupId]);

  const setValue = (name, v) => setValues(prev => ({ ...prev, [name]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    for (const [k, v] of Object.entries(values)) {
      if (Array.isArray(v)) v.forEach(val => fd.append(k, val));
      else fd.set(k, v ?? '');
    }
    try {
      const resp = await api.submit(groupId, fd);
      setOkId(resp.id);
      setErrors({});
      e.target.reset();
      setValues({});
    } catch (err) {
      setOkId(null);
      setErrors(err?.response?.data?.errors || {});
    }
  };

  if (!form) return <div>Loading...</div>;

  const ordered = [...(form.fields||[])].sort((a,b)=>a.order-b.order);

  return (
    <div>
      <h2>{form.title} <small>(v{form.version})</small></h2>
      <p>{form.description}</p>
      {okId && <div style={{ color:'green' }}>Submitted! id: {okId}</div>}
      <form onSubmit={submit}>
        {ordered.map(f => (
          <div key={f.name} style={{ marginBottom:12 }}>
            <label style={{ display:'block', fontWeight:'bold' }}>{f.label}{f.required?' *':''}</label>
            <Field field={f} value={values[f.name]} setValue={setValue} />
            {errors[f.name] && <div style={{ color:'red' }}>{errors[f.name]}</div>}

            {/* Conditional nested fields */}
            {renderConditional(f, values).map(nf => (
              <div key={nf.name} style={{ marginLeft:16, marginTop:8 }}>
                <label style={{ display:'block' }}>{nf.label}{nf.required?' *':''}</label>
                <Field field={nf} value={values[nf.name]} setValue={setValue} />
                {errors[nf.name] && <div style={{ color:'red' }}>{errors[nf.name]}</div>}
              </div>
            ))}
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
