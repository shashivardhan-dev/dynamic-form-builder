import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function PublicForms() {
  const [forms, setForms] = React.useState([]);

  React.useEffect(() => { api.listForms().then(setForms); }, []);

  return (
    <div>
      <h2>Available Forms</h2>
      <ul>
        {forms.map(f => (
          <li key={f._id}>
            <Link to={`/form/${f.groupId}`}>{f.title} (v{f.version})</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
