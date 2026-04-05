// Shared navbar renderer — call renderNavbar() on every page
function renderNavbar(activePage) {
  const user = getUser();
  const isOwner = user?.role === 'owner';

  const navLinks = isOwner ? [
    { href: '/owner-dashboard.html', label: 'Dashboard', icon: '⊞' },
    { href: '/turf-form.html', label: 'Add Turf', icon: '+' },
  ] : [
    { href: '/turfs.html', label: 'Find Turfs', icon: '⊞' },
    { href: '/matches.html', label: 'Find Players', icon: '👥' },
    ...(user ? [{ href: '/my-bookings.html', label: 'My Bookings', icon: '📅' }] : []),
  ];

  const bottomTabs = isOwner ? [
    { href: '/index.html', label: 'Home', icon: '🏠' },
    { href: '/owner-dashboard.html', label: 'Dashboard', icon: '⊞' },
    { href: '/turf-form.html', label: 'Add Turf', icon: '+' },
  ] : [
    { href: '/index.html', label: 'Home', icon: '🏠' },
    { href: '/turfs.html', label: 'Turfs', icon: '⊞' },
    { href: '/matches.html', label: 'Players', icon: '👥' },
    ...(user ? [{ href: '/my-bookings.html', label: 'Bookings', icon: '📅' }] : [{ href: '/login.html', label: 'Login', icon: '👤' }]),
  ];

  const isActive = (href) => window.location.pathname.endsWith(href.replace('/', '')) || window.location.pathname === href;

  // Desktop navbar
  document.getElementById('navbar-links').innerHTML = navLinks.map(l => `
    <a href="${l.href}" class="nav-link-item ${isActive(l.href) ? 'active' : ''}">${l.icon} ${l.label}</a>
  `).join('');

  // Right side
  const navRight = document.getElementById('navbar-right');
  if (user) {
    navRight.innerHTML = `
      <div style="position:relative" id="notif-wrap">
        <button onclick="toggleNotif()" style="position:relative;width:36px;height:36px;border-radius:12px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-500);font-size:18px;transition:all 0.2s" onmouseover="this.style.background='var(--ink-100)'" onmouseout="this.style.background='transparent'">
          🔔
          <span id="notif-badge" style="display:none;position:absolute;top:-2px;right:-2px;width:16px;height:16px;background:#EF4444;color:#fff;font-size:9px;font-weight:900;border-radius:50%;display:flex;align-items:center;justify-content:center"></span>
        </button>
        <div id="notif-dropdown" class="notif-dropdown" style="display:none"></div>
      </div>
      <div style="position:relative" id="user-wrap">
        <button onclick="toggleUserDrop()" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;border:1px solid var(--ink-200);background:#fff;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='var(--pitch-400)'" onmouseout="this.style.borderColor='var(--ink-200)'">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--pitch-600),var(--pitch-900));display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:900;flex-shrink:0">${(user.name||'U')[0].toUpperCase()}</div>
          <span style="font-size:0.875rem;font-weight:600;color:var(--ink-800);max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${user.name?.split(' ')[0]||'User'}</span>
          <span style="font-size:10px;color:var(--ink-400)">▾</span>
        </button>
        <div id="user-dropdown" class="user-dropdown" style="display:none">
          <div style="padding:16px;background:linear-gradient(135deg,var(--pitch-900),var(--pitch-800))">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;flex-shrink:0">${(user.name||'U')[0].toUpperCase()}</div>
              <div style="min-width:0">
                <p style="font-size:0.875rem;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${user.name||'User'}</p>
                <p style="font-size:11px;color:var(--pitch-300)">${user.role==='owner'?'Turf Owner':'Player'}</p>
              </div>
            </div>
          </div>
          <div style="padding:4px 0">
            <button onclick="logout()" style="width:100%;display:flex;align-items:center;gap:12px;padding:12px 16px;font-size:0.875rem;color:#EF4444;background:transparent;border:none;cursor:pointer;font-weight:500;transition:background 0.2s" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'">
              ↩ Sign Out
            </button>
          </div>
        </div>
      </div>`;
    loadNotifications();
  } else {
    navRight.innerHTML = `
      <a href="/login.html" style="font-size:0.875rem;font-weight:600;padding:8px 16px;border-radius:12px;color:var(--ink-700);text-decoration:none;transition:all 0.2s" onmouseover="this.style.color='var(--pitch-800)'" onmouseout="this.style.color='var(--ink-700)'">Login</a>
      <a href="/register.html" class="btn-primary" style="font-size:0.875rem;padding:10px 20px">Sign Up Free</a>`;
  }

  // Mobile header
  const mobileRight = document.getElementById('mobile-right');
  if (mobileRight) {
    if (user) {
      mobileRight.innerHTML = `
        <button onclick="window.location.href='/turfs.html'" style="width:36px;height:36px;border-radius:12px;border:none;background:transparent;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;color:var(--ink-500)">🔍</button>
        <div style="position:relative" id="mobile-notif-wrap">
          <button onclick="toggleMobileNotif()" style="width:36px;height:36px;border-radius:12px;border:none;background:transparent;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;color:var(--ink-500);position:relative">
            🔔
            <span id="mobile-notif-badge" style="display:none;position:absolute;top:4px;right:4px;width:14px;height:14px;background:#EF4444;color:#fff;font-size:9px;font-weight:900;border-radius:50%;display:flex;align-items:center;justify-content:center"></span>
          </button>
          <div id="mobile-notif-dropdown" class="notif-dropdown" style="display:none;position:fixed;top:56px;right:12px"></div>
        </div>
        <div style="position:relative" id="mobile-user-wrap">
          <button onclick="toggleMobileUserDrop()" style="width:36px;height:36px;border-radius:12px;background:var(--pitch-800);border:none;cursor:pointer;color:#fff;font-size:14px;font-weight:900;display:flex;align-items:center;justify-content:center">${(user.name||'U')[0].toUpperCase()}</button>
          <div id="mobile-user-dropdown" class="user-dropdown" style="display:none">
            <div style="padding:12px 16px;background:linear-gradient(135deg,var(--pitch-900),var(--pitch-800));display:flex;align-items:center;gap:8px">
              <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;flex-shrink:0">${(user.name||'U')[0].toUpperCase()}</div>
              <div><p style="font-size:0.875rem;font-weight:700;color:#fff">${user.name||'User'}</p><p style="font-size:11px;color:var(--pitch-300)">${user.role==='owner'?'Turf Owner':'Player'}</p></div>
            </div>
            <button onclick="logout()" style="width:100%;display:flex;align-items:center;gap:12px;padding:12px 16px;font-size:0.875rem;color:#EF4444;background:transparent;border:none;cursor:pointer;font-weight:500">↩ Sign Out</button>
          </div>
        </div>`;
    } else {
      mobileRight.innerHTML = `
        <button onclick="window.location.href='/turfs.html'" style="width:36px;height:36px;border-radius:12px;border:none;background:transparent;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;color:var(--ink-500)">🔍</button>
        <a href="/login.html" style="padding:6px 12px;border-radius:12px;background:var(--pitch-800);color:#fff;font-size:12px;font-weight:900;text-decoration:none">Login</a>`;
    }
  }

  // Bottom tabs
  const bottomBar = document.getElementById('bottom-tab-bar');
  if (bottomBar) {
    bottomBar.innerHTML = bottomTabs.map(t => `
      <a href="${t.href}" class="tab-item ${isActive(t.href) ? 'active' : ''}">
        <span class="tab-icon">${t.icon}</span>
        <span>${t.label}</span>
      </a>`).join('');
  }

  // Close dropdowns on outside click
  document.addEventListener('click', e => {
    if (!document.getElementById('user-wrap')?.contains(e.target)) document.getElementById('user-dropdown') && (document.getElementById('user-dropdown').style.display = 'none');
    if (!document.getElementById('notif-wrap')?.contains(e.target)) document.getElementById('notif-dropdown') && (document.getElementById('notif-dropdown').style.display = 'none');
    if (!document.getElementById('mobile-user-wrap')?.contains(e.target)) document.getElementById('mobile-user-dropdown') && (document.getElementById('mobile-user-dropdown').style.display = 'none');
    if (!document.getElementById('mobile-notif-wrap')?.contains(e.target)) document.getElementById('mobile-notif-dropdown') && (document.getElementById('mobile-notif-dropdown').style.display = 'none');
  });
}

function toggleUserDrop() {
  const d = document.getElementById('user-dropdown');
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
}
function toggleMobileUserDrop() {
  const d = document.getElementById('mobile-user-dropdown');
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
}
function toggleNotif() {
  const d = document.getElementById('notif-dropdown');
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
  if (d.style.display === 'block') markAllRead();
}
function toggleMobileNotif() {
  const d = document.getElementById('mobile-notif-dropdown');
  d.style.display = d.style.display === 'none' ? 'block' : 'none';
  if (d.style.display === 'block') markAllRead();
}

async function loadNotifications() {
  try {
    const notifs = await api.get('/notifications');
    const unread = notifs.filter(n => !n.is_read).length;
    const html = `
      <div style="padding:12px 16px;border-bottom:1px solid var(--ink-100);display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:700;font-size:0.875rem">Notifications</span>
        ${notifs.length ? `<button onclick="markAllRead()" style="font-size:0.75rem;color:var(--pitch-800);font-weight:600;background:none;border:none;cursor:pointer">Mark all read</button>` : ''}
      </div>
      <div style="max-height:288px;overflow-y:auto">
        ${notifs.length === 0 ? '<p style="text-align:center;color:var(--ink-400);font-size:0.875rem;padding:32px 16px">No notifications yet</p>' :
          notifs.map(n => `<div style="padding:12px 16px;border-bottom:1px solid var(--ink-50);font-size:0.875rem;${!n.is_read?'background:var(--pitch-50);font-weight:600;color:var(--ink-900)':'color:var(--ink-500)'}">
            <p>${n.message}</p>
            <p style="font-size:0.75rem;color:var(--ink-400);margin-top:2px">${new Date(n.created_at).toLocaleString()}</p>
          </div>`).join('')}
      </div>`;
    ['notif-dropdown','mobile-notif-dropdown'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    });
    if (unread > 0) {
      ['notif-badge','mobile-notif-badge'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.display = 'flex'; el.textContent = unread > 9 ? '9+' : unread; }
      });
    }
  } catch {}
}

async function markAllRead() {
  try {
    await api.patch('/notifications/read-all');
    ['notif-badge','mobile-notif-badge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  } catch {}
}
