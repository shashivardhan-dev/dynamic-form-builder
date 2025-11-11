import React from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api';

export default function Submissions() {
  const { groupId } = useParams();
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState({ items:[], total:0, limit:20 });

  const load = () => {
    api.adminListSubmissions({ groupId, page, limit: 20 }).then(setData);
  };

  React.useEffect(() => { load(); }, [page, groupId]);

  const exportCsv = async () => {
    const resp = await api.adminExportCSV({ groupId });
    const blob = new Blob([resp.data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'submissions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const pages = Math.ceil(data.total / data.limit);

  return (
    <div>
      <h3>Submissions for {groupId}</h3>
      <button onClick={exportCsv}>Export CSV</button>
      <table border="1" cellPadding="6" style={{ marginTop:8 }}>
        <thead><tr><th>submittedAt</th><th>formVersion</th><th>data</th></tr></thead>
        <tbody>
          {data.items.map((s,i) => (
            <tr key={i}>
              <td>{new Date(s.submittedAt).toLocaleString()}</td>
              <td>{s.formVersion}</td>
              <td><pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(s.data, null, 2)}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop:8, display:'flex', gap:8 }}>
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span>Page {page} / {pages||1}</span>
        <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  );
}
