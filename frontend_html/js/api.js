const API_BASE = 'http://127.0.0.1:8000/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) delete headers['Content-Type'];

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, message: data.message || 'Request failed' };
  return data;
}

const api = {
  get:    (path, params) => apiFetch(path + (params ? '?' + new URLSearchParams(params) : '')),
  post:   (path, body)   => apiFetch(path, { method: 'POST',  body: body instanceof FormData ? body : JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path, body)   => apiFetch(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
  postForm: (path, form) => apiFetch(path, { method: 'POST',  body: form }),
  putForm:  (path, form) => apiFetch(path, { method: 'PUT',   body: form }),
};
