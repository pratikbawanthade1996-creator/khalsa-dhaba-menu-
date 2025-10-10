
/*! cta-addon.js — Drop‑in WhatsApp + Location + Share buttons for Menu Engine 10.5+ */
(function(){
  // 1) Inject CSS if not present
  function injectCSS(){
    if(document.getElementById('cta-addon-style')) return;
    const el = document.createElement('style');
    el.id = 'cta-addon-style';
    el.textContent = `/* injected */` + `
.cta-stack{position:fixed;right:16px;bottom:16px;z-index:100;display:flex;flex-direction:column;gap:10px}
.cta{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-weight:800;letter-spacing:.2px;color:#00110E;padding:12px 16px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
#btnWa{background:linear-gradient(135deg,#00FFD1,#7affe7)}
#btnViewLoc{background:linear-gradient(135deg,#FFD54F,#FFA000)}
#btnShareLoc{background:linear-gradient(135deg,#64B5F6,#1976D2);color:#e9f2ff}
@media print{.cta-stack{display:none}}`;
    document.head.appendChild(el);
  }

  // 2) Ensure buttons exist
  function ensureButtons(){
    if(document.querySelector('.cta-stack')) return;
    const wrap = document.createElement('div'); wrap.className = 'cta-stack';
    wrap.innerHTML = `
      <a id="btnWa" class="cta" href="#" target="_blank" rel="noopener">💬 Chat on WhatsApp</a>
      <a id="btnViewLoc" class="cta" href="#" target="_blank" rel="noopener">📍 View Location</a>
      <a id="btnShareLoc" class="cta" href="#" target="_blank" rel="noopener">📤 Share Location</a>`;
    document.body.appendChild(wrap);
  }

  // 3) Read data from global (Menu Engine uses window.menuData)
  function getData(){
    try { return window.menuData || {}; } catch(e){ return {}; }
  }

  // 4) Update links + visibility
  function updateCTAs(){
    const d = getData();
    const waEl = document.getElementById('btnWa');
    const locEl = document.getElementById('btnViewLoc');
    const shareEl = document.getElementById('btnShareLoc');
    if(!waEl || !locEl || !shareEl) return;

    const wa  = (d?.restaurant?.whatsapp||'').replace(/[^\d]/g,'');
    const loc = (d?.restaurant?.locationLink||'').trim();
    const nm  = (d?.restaurant?.name || 'Restaurant');

    if(wa){
      const msg = encodeURIComponent('Hi! I want to order at ' + nm);
      waEl.href = 'https://wa.me/' + wa + '?text=' + msg;
      waEl.style.display = 'inline-flex';
    } else { waEl.style.display = 'none'; waEl.removeAttribute('href'); }

    if(loc){
      locEl.href = loc;
      locEl.style.display = 'inline-flex';
    } else { locEl.style.display = 'none'; locEl.removeAttribute('href'); }

    if(loc && wa){
      const shareMsg = encodeURIComponent('📍 Here\'s the location of ' + nm + ': ' + loc);
      shareEl.href = 'https://wa.me/' + wa + '?text=' + shareMsg;
      shareEl.style.display = 'inline-flex';
    } else { shareEl.style.display = 'none'; shareEl.removeAttribute('href'); }
  }

  // 5) Public entry — run safely after each render
  function setupCTAs(){
    injectCSS(); ensureButtons(); updateCTAs();
  }

  // 6) Hook into engine's render() if present; else fallback observer
  function hook(){
    // wrap render once
    if(window.__cta_hooked) return;
    window.__cta_hooked = true;

    const tryWrap = () => {
      if(typeof window.render === 'function'){
        const old = window.render;
        window.render = function(){
          const res = old.apply(this, arguments);
          try { setupCTAs(); } catch(e){ /* noop */ }
          return res;
        };
        setupCTAs();
        return true;
      }
      return false;
    };

    if(!tryWrap()){
      // fallback: try again soon; also observe menuData changes
      let lastJSON = null;
      setInterval(()=>{
        if(tryWrap()) return;
        const cur = JSON.stringify(getData());
        if(cur !== lastJSON){ lastJSON = cur; setupCTAs(); }
      }, 600);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', hook);
  } else {
    hook();
  }

  // Expose manual trigger if needed
  window.setupCTAs = setupCTAs;
})();
