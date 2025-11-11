import React from 'react';

const types = ['text','textarea','number','email','date','checkbox','radio','select','file'];

export default function FieldEditor({ field, onChange, onDelete }) {
  const update = (k, v) => onChange({ ...field, [k]: v });
  const ensureOptions = () => update('options', field.options || []);
  const ensureConds = () => update('conditionalFields', field.conditionalFields || []);

  return (
    <div style={{ border:'1px solid #aaa', padding:8, borderRadius:6 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <input placeholder="Label" value={field.label} onChange={e=>update('label', e.target.value)} />
        <select value={field.type} onChange={e=>update('type', e.target.value)}>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input placeholder="name (unique)" value={field.name} onChange={e=>update('name', e.target.value)} />
        <input type="number" placeholder="order" value={field.order||0} onChange={e=>update('order', Number(e.target.value))} />
        <label><input type="checkbox" checked={field.required||false} onChange={e=>update('required', e.target.checked)} /> required</label>
        {(field.type==='number') && (
          <>
            <input type="number" placeholder="min" value={field.validation?.min||''} onChange={e=>update('validation', { ...(field.validation||{}), min: e.target.value===''?undefined:Number(e.target.value) })} />
            <input type="number" placeholder="max" value={field.validation?.max||''} onChange={e=>update('validation', { ...(field.validation||{}), max: e.target.value===''?undefined:Number(e.target.value) })} />
          </>
        )}
        {(field.type==='text' || field.type==='textarea') && (
          <input placeholder="regex" value={field.validation?.regex||''} onChange={e=>update('validation',{ ...(field.validation||{}), regex: e.target.value })} />
        )}
      </div>

      {(field.type==='select' || field.type==='radio' || field.type==='checkbox') && (
        <div style={{ marginTop:8 }}>
          <strong>Options</strong>{" "}
          <button type="button" onClick={()=>{ ensureOptions(); update('options', [...(field.options||[]), 'Option']); }}>Add</button>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
            {(field.options||[]).map((opt, i) => (
              <span key={i} style={{ border:'1px solid #999', padding:4 }}>
                <input value={opt} onChange={e=>{
                  const arr=[...(field.options||[])]; arr[i]=e.target.value; update('options', arr);
                }} />
                <button onClick={()=>{
                  const arr=[...(field.options||[])]; arr.splice(i,1); update('options', arr);
                }}>x</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {(field.type==='select' || field.type==='radio') && (
        <div style={{ marginTop:8 }}>
          <strong>Conditional Fields per Option</strong>{" "}
          <button onClick={()=>{ ensureConds(); update('conditionalFields', [...(field.conditionalFields||[]), { option:'', fields:[] }]); }}>Add Condition</button>
          <div style={{ display:'grid', gap:8, marginTop:4 }}>
            {(field.conditionalFields||[]).map((cf, idx) => (
              <div key={idx} style={{ border:'1px dashed #bbb', padding:6 }}>
                <div>
                  <em>Show when selected option equals:</em>{" "}
                  <input value={cf.option} onChange={e=>{
                    const arr=[...(field.conditionalFields||[])]; arr[idx]={...cf, option:e.target.value}; update('conditionalFields', arr);
                  }} />
                  <button onClick={()=>{
                    const arr=[...(field.conditionalFields||[])]; arr.splice(idx,1); update('conditionalFields', arr);
                  }}>Remove</button>
                </div>
                <div style={{ marginTop:6 }}>
                  <em>Nested Fields</em>{" "}
                  <button onClick={()=>{
                    const arr=[...(field.conditionalFields||[])];
                    const list=[...(cf.fields||[]), { label:'Nested Field', type:'text', name:`${field.name}_nested_${(cf.fields?.length||0)+1}`, required:false, order:(cf.fields?.length||0)+1 }];
                    arr[idx]={...cf, fields:list}; update('conditionalFields', arr);
                  }}>Add Nested Field</button>
                  <div style={{ display:'grid', gap:6, marginTop:4 }}>
                    {(cf.fields||[]).map((nf, j) => (
                      <div key={j} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6 }}>
                        <input placeholder="Label" value={nf.label} onChange={e=>{
                          const arr=[...(field.conditionalFields||[])]; const list=[...(cf.fields||[])];
                          list[j]={...nf, label:e.target.value}; arr[idx]={...cf, fields:list}; update('conditionalFields', arr);
                        }} />
                        <select value={nf.type} onChange={e=>{
                          const arr=[...(field.conditionalFields||[])]; const list=[...(cf.fields||[])];
                          list[j]={...nf, type:e.target.value}; arr[idx]={...cf, fields:list}; update('conditionalFields', arr);
                        }}>
                          {['text','textarea','number','email','date','checkbox','radio','select','file'].map(t=> <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input placeholder="name" value={nf.name} onChange={e=>{
                          const arr=[...(field.conditionalFields||[])]; const list=[...(cf.fields||[])];
                          list[j]={...nf, name:e.target.value}; arr[idx]={...cf, fields:list}; update('conditionalFields', arr);
                        }} />
                        <label><input type="checkbox" checked={nf.required||false} onChange={e=>{
                          const arr=[...(field.conditionalFields||[])]; const list=[...(cf.fields||[])];
                          list[j]={...nf, required:e.target.checked}; arr[idx]={...cf, fields:list}; update('conditionalFields', arr);
                        }} /> req</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop:8, display:'flex', gap:8 }}>
        <button onClick={onDelete}>Delete Field</button>
      </div>
    </div>
  );
}
