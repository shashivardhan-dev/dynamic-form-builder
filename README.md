# Dynamic Form Builder (React, Express.js, MongoDB)

A small  Dynamic Form Builder web app with an admin panel to create forms and fields (with conditional nested fields), and a public renderer to submit responses. Submissions are stored in MongoDB with versioned schemas. Exports to CSV supported.

## Demo

![Demo](./Demo.mp4)

## Quick Start

### 1) Backend
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```
Server defaults to `http://localhost:4000`.

### 2) Frontend
```bash
cd ../frontend
npm install 
npm start
```
Parcel dev server defaults to `http://localhost:1234`.

### 3) Admin Authentication
Add your admin token in the top-right of the admin UI or set it once via the "Set Admin Token" button. The token is sent as the `x-admin-token` header.

### 4) MongoDB
Provide a connection string in `backend/.env`.

### 5) Run Tests (Backend)
```bash
cd backend
npm test
```

## API Summary

- `GET /api/admin/forms` (admin)
- `POST /api/admin/forms` (admin) — create new form (version 1)
- `PUT /api/admin/forms/:groupId` (admin) — create new version
- `DELETE /api/admin/forms/:groupId` (admin) — soft delete all versions
- `GET /api/forms` — list latest forms (public)
- `GET /api/forms/:groupId` — latest form def (or `?version=2` for specific)
- `POST /api/forms/:groupId/submit` — submit response (multipart for files)
- `GET /api/admin/submissions?groupId=<id>&page=1&limit=20&version=latest|number` (admin)
- `GET /api/admin/submissions/export?groupId=<id>&version=latest|number` (admin)

---