/* esc aliases */
var escString = (typeof esc !== 'undefined') ? esc : function(s){return String(s||'');}; var escpick = escString;
// --- Global safe escape helper ---
function escpick(str){ if(!str) return ""; return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
// Registries + Templates (Phase 9)

const THEME_REGISTRY = {
  neon:    { name: "Neon Night", vars: {'--bg':'#0B0E13','--text':'#EDEFF3','--muted':'#9AA3AE','--accent':'#00FFD1','--border':'#1A1F27'} },
  charcoal:{ name: "Charcoal Yellow", vars: {'--bg':'#0c0c0f','--text':'#f7f7f7','--muted':'#9c9c9c','--accent':'#ffcc00','--border':'#242424'} },
  cream:   { name: "Minimal Cream", vars: {'--bg':'#f7f5ef','--text':'#1b1b1b','--muted':'#6c6c6c','--accent':'#2a6f97','--border':'#d9d4c7'} },
  rustic:  { name: "Rustic Wood", vars: {'--bg':'#231a12','--text':'#f2ece6','--muted':'#c8b8a8','--accent':'#ff9f1c','--border':'#3a2a1d'} },
  classic: { name: "Classic Black", vars: {'--bg':'#000000','--text':'#ffffff','--muted':'#9AA3AE','--accent':'#ffcc00','--border':'#222222'} },
  custom:  { name: "Custom", vars: {'--bg':'#0B0E13','--text':'#EDEFF3','--muted':'#9AA3AE','--accent':'#7C4DFF','--border':'#1A1F27'} }
};

function money(n,c='₹'){ return `${c} ${new Intl.NumberFormat('en-IN').format(n||0)}`; }
function esc(s){ return String(s||'').replace(/[&<>\"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function cssVars(theme){ return Object.entries(theme).map(([k,v])=>`${k}:${v}`).join(';'); }
function badgeEmoji(id){
  const map = { spicy:'🌶️', veg:'🥦', nonveg:'🍗', chef:'⭐', cheese:'🧀' };
  return map[id] || '';
}
function badgeHTML(badges){
  if(!badges || !badges.length) return '';
  return `<span class="badges">` + badges.map(b=>`<i title="${esc(b)}">${badgeEmoji(b)}</i>`).join('') + `</span>`;
}


function pick(obj, key){ if(!obj) return ''; const v2 = obj[key + '_' + (window.currentLang||'en')]; return v2!=null && v2!=='' ? v2 : obj[key] || ''; }

// Two templates
const TEMPLATE_REGISTRY = [
  {
    id:"template-e-fullpage",
    name:"Template E – Full Page",
    html:`<div id="menu-root"></div>`,
    css:`
      *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif}
      header,footer{position:sticky;z-index:5;background:#0b0e13d9;backdrop-filter:blur(6px);border-bottom:1px solid var(--border)}
      footer{border-top:1px solid var(--border);border-bottom:none;bottom:0;top:auto}
      .wrap{max-width:880px;margin:0 auto;padding:14px}
      h1{margin:6px 0 0;color:var(--accent)} .muted{color:var(--muted)}
      nav{position:sticky;top:64px;background:#0b0e13cc;border-bottom:1px solid var(--border)}
      .tabs{display:flex;gap:8px;overflow:auto;padding:8px 14px}
      .tabs a{color:var(--text);text-decoration:none;border:1px solid var(--border);padding:6px 10px;border-radius:999px;white-space:nowrap}
      main{padding-bottom:120px}
      .section{margin:18px 0}
      .section.hardbreak{border:1px dashed #3a455c}
      .section h2{font-size:18px;margin:0 0 8px;color:var(--accent)}
      .card{background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:14px;padding:10px}
      .item{display:grid;grid-template-columns:1fr auto;gap:10px;padding:8px 6px;border-radius:10px}
      .item + .item{border-top:1px dashed #223}
      .name{font-weight:600;display:flex;gap:8px;align-items:center}
      .badges i{filter:drop-shadow(0 0 4px rgba(0,0,0,.35))}
      .price{color:var(--accent)}
      .highlight{background:rgba(255,255,255,.04);padding:2px 6px;border-radius:6px}
      mark{background:rgba(255,255,0,.25);padding:0 2px}
      @media print{header,nav,footer{display:none}!important;body{background:#fff;color:#000}.card{border-color:#ccc}.section.hardbreak{page-break-before:always;break-before:page}}
    `,
    render(mount, data){
      mount.innerHTML = `
        <header><div class="wrap">
          <h1>${esc(String(pick(data.restaurant||{}, 'name')||'Menu'))}</h1>
          <div class="muted">${esc(String(pick(data.restaurant||{}, 'address')||''))} • ${esc(data.restaurant?.phone||'')}</div>
        </div></header>
        <nav><div class="tabs">
          ${(data.sections||[]).map((s,i)=>`<a href="#s${i}">${escString(pick(s||{}, 'title')||( 'Section '+(i+1)))}</a>`).join('')}
        </div></nav>
        <main class="wrap">
          ${(data.sections||[]).map((s,i)=>`
            <a id="s${i}" class="sr"></a>
            <section class="section ${s.pageBreak?'hardbreak':''}">
              <h2>${esc(String(pick(s||{}, 'title')||''))}</h2>
              <div class="card">
                ${(s.items||[]).map(it=>`
                  <div class="item" data-name="${esc(String(pick(it||{}, 'name')||'')).toLowerCase()}">
                    <div class="name"><span>${esc(String(pick(it||{}, 'name')||''))}</span>${badgeHTML(it.badges)}</div>
                    <div class="price">${money(it.price, data.currency||'₹')}</div>
                  </div>
                `).join('')}
              </div>
            </section>
          `).join('')}
        </main>
        <footer><div class="wrap muted">
          ${esc(String(pick(data.restaurant||{}, 'hours')||''))} • WhatsApp: ${esc(data.restaurant?.whatsapp||'')}
        </div></footer>`;
    },
    buildStatic(menuData, theme, searchTerm=''){
      const vars = cssVars(theme);
      const q = (searchTerm||'').trim().toLowerCase();
      const tabs = (menuData.sections||[]).map((s,i)=>`<a href="#s${i}">${escString(pick(s||{}, 'title')||( 'Section '+(i+1)))}</a>`).join('');
      const sections = (menuData.sections||[]).map((s,i)=>{
        const items = (s.items||[]).filter(it=>!q || (it.name||'').toLowerCase().includes(q)).map(it=>`
          <div class="item" data-name="${esc(String(pick(it||{}, 'name')||'')).toLowerCase()}">
            <div class="name"><span>${highlight(esc(String(pick(it||{}, 'name')||'')), q)}</span>${badgeHTML(it.badges)}</div>
            <div class="price">${money(it.price, menuData.currency||'₹')}</div>
          </div>`).join('');
        if(!items) return '';
        return `<a id="s${i}" class="sr"></a>
          <section class="section ${s.pageBreak?'hardbreak':''}"><h2>${esc(String(pick(s||{}, 'title')||''))}</h2><div class="card">${items}</div></section>`;
      }).join('');
      return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>${esc(String(pick(menuData.restaurant||{}, 'name')||'Menu'))}</title>
        <style>:root{${vars}} ${this.css}</style></head>
        <body><div id="menu-root">
          <header><div class="wrap"><h1>${esc(String(pick(menuData.restaurant||{}, 'name')||'Menu'))}</h1>
          <div class="muted">${esc(String(pick(menuData.restaurant||{}, 'address')||''))} • ${esc(menuData.restaurant?.phone||'')}</div></div></header>
          <nav><div class="tabs">${tabs}</div></nav>
          <main class="wrap">${sections}</main>
          <footer><div class="wrap muted">${esc(String(pick(menuData.restaurant||{}, 'hours')||''))} • WhatsApp: ${esc(menuData.restaurant?.whatsapp||'')}</div></footer>
        </div></body></html>`;
    }
  },
  {
    id:"template-c-split",
    name:"Template C – Split Two Column",
    html:`<div id="menu-root"></div>`,
    css:`
      *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif}
      main{max-width:1100px;margin:0 auto;padding:20px}
      .section{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;margin:22px 0}
      .section.hardbreak{border:1px dashed #3a455c}
      .title{color:var(--accent);font-size:20px;margin:0 0 10px}
      .item{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px dashed var(--border)}
      .name{display:flex;gap:8px;align-items:center}
      .badges i{filter:drop-shadow(0 0 4px rgba(0,0,0,.35))}
      .right img{width:100%;border-radius:18px;box-shadow:0 8px 25px rgba(0,0,0,.28)}
      mark{background:rgba(255,255,0,.25);padding:0 2px}
      @media(max-width:760px){.section{grid-template-columns:1fr}.right{order:-1}}
      @media print{.section.hardbreak{page-break-before:always;break-before:page}}
    `,
    render(mount, data){
      mount.innerHTML = `
        <main>
          ${(data.sections||[]).map(sec=>`
            <section class="section ${sec.pageBreak?'hardbreak':''}">
              <div class="left">
                <h2 class="title">${esc(sec.title||'')}</h2>
                ${(sec.items||[]).map(it=>`
                  <div class="item" data-name="${esc(String(pick(it||{}, 'name')||'')).toLowerCase()}">
                    <span class="name"><span>${esc(String(pick(it||{}, 'name')||''))}</span>${badgeHTML(it.badges)}</span>
                    <b>${money(it.price, data.currency||'₹')}</b>
                  </div>
                `).join('')}
              </div>
              <div class="right">
                <img src="${sec.image || 'https://via.placeholder.com/560x380?text='+encodeURIComponent(sec.title||'Image')}" alt="${esc(sec.title||'')}" loading="lazy"/>
              </div>
            </section>
          `).join('')}
        </main>`;
    },
    buildStatic(menuData, theme, searchTerm=''){
      const vars = cssVars(theme);
      const q = (searchTerm||'').trim().toLowerCase();
      const sections = (menuData.sections||[]).map(sec=>{
        const items = (sec.items||[]).filter(it=>!q || (it.name||'').toLowerCase().includes(q)).map(it=>`
          <div class="item" data-name="${esc(String(pick(it||{}, 'name')||'')).toLowerCase()}">
            <span class="name"><span>${highlight(esc(String(pick(it||{}, 'name')||'')), q)}</span>${badgeHTML(it.badges)}</span>
            <b>${money(it.price, menuData.currency||'₹')}</b>
          </div>`).join('');
        if(!items) return '';
        return `<section class="section ${sec.pageBreak?'hardbreak':''}">
          <div class="left"><h2 class="title">${esc(sec.title||'')}</h2>${items}</div>
          <div class="right"><img src="${sec.image || 'https://via.placeholder.com/560x380?text='+encodeURIComponent(sec.title||'Image')}" alt="${esc(sec.title||'')}" loading="lazy"/></div>
        </section>`;
      }).join('');
      return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>${esc(String(pick(menuData.restaurant||{}, 'name')||'Menu'))}</title>
        <style>:root{${vars}} ${this.css}</style></head>
        <body><div id="menu-root"><main>${sections}</main></div></body></html>`;
    }
  }
];

function highlight(text, q){
  if(!q) return text;
  const i = text.toLowerCase().indexOf(q);
  if(i<0) return text;
  return text.slice(0,i) + '<mark>' + text.slice(i,i+q.length) + '</mark>' + text.slice(i+q.length);
}
