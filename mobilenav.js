// mobilenav.js — adds a hamburger button + slide-out drawer that mirrors the
// existing <header.topbar> <nav> on every page. Self-contained: inject styles,
// build the button, build the menu, wire toggle behavior.

(function () {
  const topbar = document.querySelector('header.topbar');
  if (!topbar) return;
  const nav = topbar.querySelector('nav');
  if (!nav) return;

  // Inject styles
  const css = `
    .hamburger{
      display:none;
      width:42px;height:42px;
      align-items:center;justify-content:center;
      background:transparent;border:1px solid var(--rule);border-radius:8px;
      cursor:pointer;color:var(--cream);
      padding:0;
      transition:border-color .15s ease, background .15s ease;
    }
    .hamburger:hover{border-color:var(--orange);background:color-mix(in oklab, var(--orange) 10%, transparent);}
    .hamburger:focus-visible{outline:2px solid var(--orange);outline-offset:4px;}
    .hamburger .bars{position:relative;width:18px;height:14px;}
    .hamburger .bars span{
      position:absolute;left:0;right:0;height:2px;background:currentColor;border-radius:2px;
      transition:transform .25s ease, top .2s ease, opacity .2s ease;
    }
    .hamburger .bars span:nth-child(1){top:0;}
    .hamburger .bars span:nth-child(2){top:6px;}
    .hamburger .bars span:nth-child(3){top:12px;}
    .hamburger.is-open .bars span:nth-child(1){top:6px;transform:rotate(45deg);}
    .hamburger.is-open .bars span:nth-child(2){opacity:0;}
    .hamburger.is-open .bars span:nth-child(3){top:6px;transform:rotate(-45deg);}

    .mobile-menu{
      position:fixed;inset:0;z-index:90;
      background:color-mix(in oklab, var(--coal) 96%, transparent);
      backdrop-filter:blur(14px);
      display:flex;flex-direction:column;
      min-height:100dvh;
      transform:translateY(-100%);opacity:0;
      transition:transform .35s cubic-bezier(.7,0,.2,1), opacity .25s ease;
      pointer-events:none;
      overflow-y:auto;
      overscroll-behavior:contain;
    }
    .mobile-menu.is-open{transform:translateY(0);opacity:1;pointer-events:auto;}
    .mobile-menu .mm-head{
      height:72px;flex-shrink:0;
      display:flex;align-items:center;justify-content:flex-end;
      padding:calc(14px + env(safe-area-inset-top, 0px)) 26px 14px;
    }
    .mobile-menu .mm-close{
      width:42px;height:42px;
      display:inline-flex;align-items:center;justify-content:center;
      background:transparent;border:1px solid var(--rule);border-radius:8px;
      color:var(--cream);cursor:pointer;padding:0;
      transition:border-color .15s ease, background .15s ease;
    }
    .mobile-menu .mm-close:hover{border-color:var(--orange);background:color-mix(in oklab, var(--orange) 10%, transparent);}
    .mobile-menu .mm-close:focus-visible{outline:2px solid var(--orange);outline-offset:4px;}
    .mobile-menu .mm-close span{
      position:relative;width:18px;height:18px;display:block;
    }
    .mobile-menu .mm-close span::before,
    .mobile-menu .mm-close span::after{
      content:'';position:absolute;left:0;top:8px;width:18px;height:2px;
      background:currentColor;border-radius:2px;
    }
    .mobile-menu .mm-close span::before{transform:rotate(45deg);}
    .mobile-menu .mm-close span::after{transform:rotate(-45deg);}
    .mobile-menu .mm-list{
      flex:1;display:flex;flex-direction:column;justify-content:center;
      padding:clamp(18px, 5vh, 30px) 26px;gap:6px;
    }
    .mobile-menu .mm-list a{
      font-family:var(--display);
      font-size:clamp(32px, 10vw, 56px);
      line-height:1;
      letter-spacing:0;
      text-transform:uppercase;
      color:var(--cream);
      text-decoration:none;
      padding:12px 0;
      border-bottom:1px solid var(--rule);
      display:flex;justify-content:space-between;align-items:center;gap:14px;
      transition:color .15s ease, padding .2s ease;
    }
    .mobile-menu .mm-list a > span:first-child{min-width:0;overflow-wrap:anywhere;}
    .mobile-menu .mm-list a:hover{color:var(--orange);padding-left:14px;}
    .mobile-menu .mm-list a.active,
    .mobile-menu .mm-list a[aria-current="page"]{color:var(--orange);}
    .mobile-menu .mm-list a:focus-visible,
    .mobile-menu .mm-foot a:focus-visible{outline:2px solid var(--orange);outline-offset:4px;}
    .mobile-menu .mm-list a .idx{
      font-family:'DM Mono', monospace;font-size:12px;letter-spacing:.12em;
      color:var(--cream-dim);font-weight:500;
    }
    .mobile-menu .mm-list a .arr{
      font-family:'DM Mono', monospace;font-size:16px;color:var(--cream-dim);
      transition:transform .2s ease, color .2s ease;
    }
    .mobile-menu .mm-list a:hover .arr{color:var(--orange);transform:translateX(6px);}
    .mobile-menu .mm-foot{
      padding:20px 26px calc(20px + env(safe-area-inset-bottom, 0px));border-top:1px solid var(--rule);
      display:flex;justify-content:space-between;align-items:center;
      font-family:'DM Mono', monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;
      color:var(--cream-dim);
      gap:18px;
    }
    .mobile-menu .mm-foot a{color:var(--cream);}
    .mobile-menu .mm-foot a:hover{color:var(--orange);}
    body.mm-open{overflow:hidden;}

    @media (max-width:900px){
      .topbar nav{display:none !important;}
      .topbar .hamburger{display:inline-flex;}
    }
    @media (max-width:520px){
      .hamburger{width:40px;height:40px;}
      .mobile-menu .mm-head{height:64px;padding-left:18px;padding-right:18px;}
      .mobile-menu .mm-list{padding-left:18px;padding-right:18px;justify-content:flex-start;}
      .mobile-menu .mm-list a{font-size:clamp(30px, 11vw, 44px);padding:13px 0;}
      .mobile-menu .mm-foot{padding-left:18px;padding-right:18px;align-items:flex-start;flex-direction:column;line-height:1.45;}
    }
    @media (max-height:620px){
      .mobile-menu .mm-list{justify-content:flex-start;}
      .mobile-menu .mm-list a{font-size:clamp(28px, 9vh, 42px);padding:9px 0;}
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const updateTopbar = () => {
    topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  updateTopbar();
  window.addEventListener('scroll', updateTopbar, { passive: true });

  // Hamburger button — appended to .right (or to topbar)
  const right = topbar.querySelector('.right') || topbar;
  const btn = document.createElement('button');
  btn.className = 'hamburger';
  btn.setAttribute('aria-label', 'Open menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'mobile-navigation');
  btn.innerHTML = '<span class="bars"><span></span><span></span><span></span></span>';
  right.appendChild(btn);

  // Build mobile menu from nav links
  const menu = document.createElement('div');
  menu.id = 'mobile-navigation';
  menu.className = 'mobile-menu';
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Site navigation');
  menu.setAttribute('aria-hidden', 'true');
  menu.setAttribute('inert', '');

  const links = [...nav.querySelectorAll('a')];
  const itemsHtml = links.map((a, i) => {
    const isActive = a.classList.contains('active') || a.getAttribute('aria-current') === 'page';
    return `<a href="${a.getAttribute('href')}" class="${isActive ? 'active' : ''}"${isActive ? ' aria-current="page"' : ''}>
      <span><span class="idx">${String(i + 1).padStart(2, '0')}</span> &nbsp; ${a.textContent.trim()}</span>
      <span class="arr">→</span>
    </a>`;
  }).join('');

  menu.innerHTML = `
    <div class="mm-head">
      <button class="mm-close" type="button" aria-label="Close navigation menu"><span aria-hidden="true"></span></button>
    </div>
    <nav class="mm-list">${itemsHtml}</nav>
    <div class="mm-foot">
      <span>Phlocalyst — 2026</span>
      <a href="Contact.html">Contact</a>
    </div>
  `;
  document.body.appendChild(menu);

  const close = (restoreFocus = true) => {
    btn.classList.remove('is-open');
    menu.classList.remove('is-open');
    document.body.classList.remove('mm-open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-label', 'Open menu');
    menu.setAttribute('inert', '');
    if (restoreFocus) btn.focus();
  };
  const open = () => {
    btn.classList.add('is-open');
    menu.classList.add('is-open');
    document.body.classList.add('mm-open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-label', 'Close menu');
    menu.removeAttribute('inert');
    menu.querySelector('a').focus();
  };

  const closeBtn = menu.querySelector('.mm-close');
  closeBtn.addEventListener('click', () => close());

  btn.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) close();
    else open();
  });

  menu.addEventListener('click', (e) => {
    if (e.target === menu || e.target.classList.contains('mm-head')) close();
  });

  // Close on link click
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => close(false));
  });

  // Close on Escape and contain keyboard focus while open.
  document.addEventListener('keydown', (e) => {
    if (!menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = [closeBtn, ...menu.querySelectorAll('a')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
