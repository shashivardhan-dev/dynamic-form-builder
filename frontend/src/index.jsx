import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Admin from './pages/Admin.jsx';
import PublicForms from './pages/PublicForms.jsx';
import RenderForm from './pages/RenderForm.jsx';

function Layout() {
  const [token, setToken] = React.useState(localStorage.getItem('ADMIN_TOKEN') || '');
  const save = () => {
    localStorage.setItem('ADMIN_TOKEN', token);
    alert('Admin token set');
  };
  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 16 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <Link to="/">Public</Link>
        <Link to="/admin">Admin</Link>
        <div style={{ marginLeft: 'auto' }}>
          <input placeholder="Admin token" value={token} onChange={e=>setToken(e.target.value)} />
          <button onClick={save}>Set Admin Token</button>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<PublicForms />} />
        <Route path="/form/:groupId" element={<RenderForm />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
);
