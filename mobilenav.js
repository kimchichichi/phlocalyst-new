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
      transform:translateY(-100%);opacity:0;
      transition:transform .35s cubic-bezier(.7,0,.2,1), opacity .25s ease;
      pointer-events:none;
    }
    .mobile-menu.is-open{transform:translateY(0);opacity:1;pointer-events:auto;}
    .mobile-menu .mm-spacer{height:72px;flex-shrink:0;}
    .mobile-menu .mm-list{
      flex:1;display:flex;flex-direction:column;justify-content:center;
      padding:30px 26px;gap:6px;
    }
    .mobile-menu .mm-list a{
      font-family:var(--display);
      font-size:clamp(40px, 11vw, 72px);
      line-height:1;
      letter-spacing:-.02em;
      text-transform:uppercase;
      color:var(--cream);
      text-decoration:none;
      padding:12px 0;
      border-bottom:1px solid var(--rule);
      display:flex;justify-content:space-between;align-items:center;gap:14px;
      transition:color .15s ease, padding .2s ease;
    }
    .mobile-menu .mm-list a:hover{color:var(--orange);padding-left:14px;}
    .mobile-menu .mm-list a.active{color:var(--orange);}
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
      padding:24px 26px;border-top:1px solid var(--rule);
      display:flex;justify-content:space-between;align-items:center;
      font-family:'DM Mono', monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;
      color:var(--cream-dim);
    }
    .mobile-menu .mm-foot a{color:var(--cream);}
    .mobile-menu .mm-foot a:hover{color:var(--orange);}
    body.mm-open{overflow:hidden;}

    @media (max-width:900px){
      .topbar nav{display:none !important;}
      .topbar .hamburger{display:inline-flex;}
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Hamburger button — appended to .right (or to topbar)
  const right = topbar.querySelector('.right') || topbar;
  const btn = document.createElement('button');
  btn.className = 'hamburger';
  btn.setAttribute('aria-label', 'Open menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span class="bars"><span></span><span></span><span></span></span>';
  right.appendChild(btn);

  // Build mobile menu from nav links
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.setAttribute('aria-hidden', 'true');

  const links = [...nav.querySelectorAll('a')];
  const itemsHtml = links.map((a, i) => {
    const isActive = a.classList.contains('active');
    return `<a href="${a.getAttribute('href')}" class="${isActive ? 'active' : ''}">
      <span><span class="idx">${String(i + 1).padStart(2, '0')}</span> &nbsp; ${a.textContent.trim()}</span>
      <span class="arr">↗</span>
    </a>`;
  }).join('');

  menu.innerHTML = `
    <div class="mm-spacer"></div>
    <nav class="mm-list">${itemsHtml}</nav>
    <div class="mm-foot">
      <span>Phlocalyst — 2026</span>
      <a href="mailto:hi@phlocalyst.com">hi@phlocalyst.com</a>
    </div>
  `;
  document.body.appendChild(menu);

  const close = () => {
    btn.classList.remove('is-open');
    menu.classList.remove('is-open');
    document.body.classList.remove('mm-open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-label', 'Open menu');
  };
  const open = () => {
    btn.classList.add('is-open');
    menu.classList.add('is-open');
    document.body.classList.add('mm-open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-label', 'Close menu');
  };

  btn.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) close();
    else open();
  });

  // Close on link click
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', close);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
  });
})();
