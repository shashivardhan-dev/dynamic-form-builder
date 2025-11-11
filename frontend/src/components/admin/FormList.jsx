import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';

export default function FormList() {
  const [forms, setForms] = React.useState([]);
  const nav = useNavigate();

  React.useEffect(() => {
    api.adminListForms().then(setForms).catch(e => alert(e?.response?.data?.error || e.message));
  }, []);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3>Forms</h3>
        <button onClick={() => nav('/admin/edit/new')}>Create Form</button>
      </div>
      <table border="1" cellPadding="6">
        <thead><tr><th>Title</th><th>Version</th><th>GroupId</th><th>Actions</th></tr></thead>
        <tbody>
          {forms.map(f => (
            <tr key={f._id}>
              <td>{f.title}</td>
              <td>{f.version}</td>
              <td>{f.groupId}</td>
              <td>
                <Link to={`/admin/edit/update/${f.groupId}`}>New Version</Link>{" | "}
                <Link to={`/admin/submissions/${f.groupId}`}>Submissions</Link>{" | "}
                <Link to={`/form/${f.groupId}`}>Open Public</Link>{" | "}
                <button onClick={async () => {
                  if (!confirm('Delete all versions?')) return;
                  await api.adminDeleteForm(f.groupId);
                  setForms(forms.filter(x => x.groupId !== f.groupId));
                }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
