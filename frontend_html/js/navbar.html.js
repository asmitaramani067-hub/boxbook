// Returns the shared navbar + mobile header + bottom tab bar HTML
function getNavbarHTML() {
  return `
  <!-- Desktop Navbar -->
  <nav class="navbar-pitchup" style="display:flex">
    <div style="max-width:1280px;margin:0 auto;padding:0 24px;width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px">
      <a href="/index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" fill="url(#ballGrad)"/>
          <path d="M10 10 Q18 16 26 10" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
          <path d="M10 26 Q18 20 26 26" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
          <rect x="22" y="4" width="5" height="14" rx="2.5" fill="#D97706"/>
          <rect x="23.5" y="17" width="2" height="5" rx="1" fill="#92400E"/>
          <defs><radialGradient id="ballGrad" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="#4CAF50"/><stop offset="100%" stop-color="#1B5E20"/></radialGradient></defs>
        </svg>
        <span style="font-size:1.25rem;font-weight:900;color:var(--ink-900)">Pitch<span style="color:var(--pitch-800)">Up</span></span>
      </a>
      <div style="display:flex;align-items:center;gap:4px" id="navbar-links"></div>
      <div style="display:flex;align-items:center;gap:8px" id="navbar-right"></div>
    </div>
  </nav>

  <!-- Mobile Header -->
  <header class="mobile-header" style="position:fixed;top:0;left:0;right:0;z-index:1000;background:#fff;border-bottom:1px solid var(--ink-100);box-shadow:0 1px 3px rgba(0,0,0,0.06);height:56px;align-items:center;justify-content:space-between;padding:0 16px;gap:12px">
    <a href="/index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" fill="url(#mballGrad)"/>
        <path d="M10 10 Q18 16 26 10" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
        <path d="M10 26 Q18 20 26 26" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.7"/>
        <rect x="22" y="4" width="5" height="14" rx="2.5" fill="#D97706"/>
        <rect x="23.5" y="17" width="2" height="5" rx="1" fill="#92400E"/>
        <defs><radialGradient id="mballGrad" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="#4CAF50"/><stop offset="100%" stop-color="#1B5E20"/></radialGradient></defs>
      </svg>
      <div>
        <p style="font-weight:900;font-size:1rem;line-height:1.2;color:var(--ink-900)">Pitch<span style="color:var(--pitch-800)">Up</span></p>
        <p style="font-size:10px;color:var(--ink-400);line-height:1.2">Book · Play · Connect</p>
      </div>
    </a>
    <div style="display:flex;align-items:center;gap:4px" id="mobile-right"></div>
  </header>

  <!-- Bottom Tab Bar -->
  <div class="bottom-tab-bar" id="bottom-tab-bar"></div>`;
}

// Inject navbar into page
document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.getElementById('nav-container');
  if (navContainer) {
    navContainer.innerHTML = getNavbarHTML();
    renderNavbar();
  }
});
