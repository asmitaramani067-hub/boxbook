function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function getToken() { return localStorage.getItem('token'); }

function isLoggedIn() { return !!getToken(); }

function isOwner() { return getUser()?.role === 'owner'; }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

function requireAuth(role) {
  if (!isLoggedIn()) { window.location.href = '/login.html'; return false; }
  if (role === 'owner' && !isOwner()) { window.location.href = '/index.html'; return false; }
  return true;
}

function renderNavUser() {
  const user = getUser();
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;
  if (user) {
    navAuth.innerHTML = `
      <span class="navbar-text me-3 text-white small">Hi, ${user.name}</span>
      ${user.role === 'owner'
        ? `<a href="/owner-dashboard.html" class="btn btn-sm btn-outline-light me-2">Dashboard</a>`
        : `<a href="/my-bookings.html" class="btn btn-sm btn-outline-light me-2">My Bookings</a>`}
      <button onclick="logout()" class="btn btn-sm btn-danger">Logout</button>`;
  } else {
    navAuth.innerHTML = `
      <a href="/login.html" class="btn btn-sm btn-outline-light me-2">Login</a>
      <a href="/register.html" class="btn btn-sm btn-success">Sign Up</a>`;
  }
}

// Toast helper
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    el.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;min-width:280px';
    document.body.appendChild(el);
    return el;
  })();

  const id = 'toast-' + Date.now();
  const bg = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-warning text-dark';
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-white ${bg} border-0 mb-2 show" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${id}').remove()"></button>
      </div>
    </div>`);
  setTimeout(() => document.getElementById(id)?.remove(), 4000);
}
