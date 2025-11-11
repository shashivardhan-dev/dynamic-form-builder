import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

export function setAdminToken(token) {
  localStorage.setItem('ADMIN_TOKEN', token);
}

function adminHeaders() {
  const t = localStorage.getItem('ADMIN_TOKEN');
  return t ? { 'x-admin-token': t } : {};
}

export const api = {
  listForms() {
    return axios.get(`${API_BASE}/forms`).then(r => r.data);
  },
  getForm(groupId, version) {
    const qs = version ? `?version=${version}` : '';
    return axios.get(`${API_BASE}/forms/${groupId}${qs}`).then(r => r.data);
  },
  submit(groupId, data) {
    return axios.post(`${API_BASE}/forms/${groupId}/submit`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },

  adminListForms() {
    return axios.get(`${API_BASE}/admin/forms`, { headers: adminHeaders() }).then(r => r.data);
  },
  adminCreateForm(payload) {
    return axios.post(`${API_BASE}/admin/forms`, payload, { headers: adminHeaders() }).then(r => r.data);
  },
  adminNewVersion(groupId, payload) {
    return axios.put(`${API_BASE}/admin/forms/${groupId}`, payload, { headers: adminHeaders() }).then(r => r.data);
  },
  adminDeleteForm(groupId) {
    return axios.delete(`${API_BASE}/admin/forms/${groupId}`, { headers: adminHeaders() }).then(r => r.data);
  },
  adminListSubmissions(params) {
    return axios.get(`${API_BASE}/admin/submissions`, { params, headers: adminHeaders() }).then(r => r.data);
  },
  adminExportCSV(params) {
    return axios.get(`${API_BASE}/admin/submissions/export`, { params, responseType: 'blob', headers: adminHeaders() });
  }
};
