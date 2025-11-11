import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import FormList from '../components/admin/FormList.jsx';
import FormEditor from '../components/admin/FormEditor.jsx';
import Submissions from '../components/admin/Submissions.jsx';

export default function Admin() {
  return (
    <div>
      <h2>Admin</h2>
      <Routes>
        <Route path="/" element={<FormList />} />
        <Route path="edit/:mode/:groupId?" element={<FormEditor />} />
        <Route path="submissions/:groupId" element={<Submissions />} />
      </Routes>
    </div>
  );
}
