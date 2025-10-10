/* =========================
   Menu Engine — Phase 10.5
   Fully defensive controller
   ========================= */

(() => {
  "use strict";

  // ---------- Short helpers ----------
  const $id = (id) => document.getElementById(id);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  const setValById  = (id, val) => { const n = $id(id); if (n) n.value = val ?? ""; };
  const setTextById = (id, val) => { const n = $id(id); if (n) n.textContent = val ?? ""; };

  // ---------- LocalStorage keys ----------
  const LS_DATA  = "ME10_5_DATA";
  const LS_THEME = "ME10_5_THEME";
  const LS_TPL   = "ME10_5_TEMPLATE";
  const LS_LANG  = "ME10_5_LANG";

  // ---------- Defaults (must exist in your registries/index) ----------
  const DEFAULT_TEMPLATE = "template-e-fullpage";
  const DEFAULT_THEME    = "neon";
  const DEFAULT_LANG     = "en";

  // global data
  window.menuData = window.menuData || null;

  // ---------- IO: load sample / choose file / download ----------
  async function loadSample() {
    try {
      const res = await fetch("../data/sample.json");
      const json = await res.json();
      setMenuData(json);
    } catch (e) {
      console.error(e);
      alert("Could not load sample.json");
    }
  }

  function handleFileInput(ev) {
    const file = ev?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        setMenuData(data);
      } catch (err) {
        console.error(err);
        alert("Invalid JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function downloadJSON() {
    try {
      const blob = new Blob([JSON.stringify(window.menuData || {}, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "menu.json";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
      alert("Download failed.");
    }
  }

  // ---------- Persistence ----------
  function persist() {
    try {
      if (window.menuData) localStorage.setItem(LS_DATA, JSON.stringify(window.menuData));
      localStorage.setItem(LS_TPL, getTemplateId());
      localStorage.setItem(LS_THEME, getThemeKey());
      localStorage.setItem(LS_LANG, getLangKey());
    } catch { /* ignore */ }
  }

  function autoload() {
    try {
      const saved = localStorage.getItem(LS_DATA);
      const tpl  = localStorage.getItem(LS_TPL);
      const th   = localStorage.getItem(LS_THEME);
      const lg   = localStorage.getItem(LS_LANG);

      if (tpl && $id("templateSelect")) $id("templateSelect").value = tpl;
      if (th  && $id("themeSelect"))    $id("themeSelect").value    = th;
      if (lg  && $id("langSelect"))     $id("langSelect").value     = lg;

      if (saved) {
        setMenuData(JSON.parse(saved));
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  function clearCache() {
    try {
      localStorage.removeItem(LS_DATA);
      localStorage.removeItem(LS_TPL);
      localStorage.removeItem(LS_THEME);
      localStorage.removeItem(LS_LANG);
      alert("Cache cleared.");
    } catch { /* ignore */ }
  }

  // ---------- Brand / Section UI (defensive; safe if elements absent) ----------
  function bindBrandFields(data) {
    const r = data?.restaurant || {};
    setValById('brandName',     r.name);
    setValById('brandAddress',  r.address);
    setValById('brandPhone',    r.phone);
    setValById('brandWhatsapp', r.whatsapp);
    setValById('brandHours',    r.hours);
  }

  function saveBrandToData() {
    if (!window.menuData) window.menuData = {};
    const r = (window.menuData.restaurant ||= {});
    const get = (id) => $id(id)?.value?.trim();

    if ($id('brandName'))     r.name     = get('brandName');
    if ($id('brandAddress'))  r.address  = get('brandAddress');
    if ($id('brandPhone'))    r.phone    = get('brandPhone');
    if ($id('brandWhatsapp')) r.whatsapp = get('brandWhatsapp');
    if ($id('brandHours'))    r.hours    = get('brandHours');
  }

  function fillSectionDropdown() {
    const sel = $id('sectionSelect');
    if (!sel) return;
    sel.innerHTML = "";
    const secs = window.menuData?.sections || [];
    secs.forEach((s, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = s?.title || `Section ${i+1}`;
      sel.appendChild(opt);
    });
    if (secs.length) sel.value = "0";
  }

  // Optional inline table; harmless if your index.html has no table
  function buildItemsTable(sectionIndex = 0) {
    const table = $id('itemsTable');
    if (!table) return;
    const body = table.tBodies?.[0] || table.createTBody();
    body.innerHTML = "";
    const sec = window.menuData?.sections?.[sectionIndex];
    if (!sec) return;
    (sec.items || []).forEach(it => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" value="${esc(it?.name)}"></td>
        <td><input type="text" value="${esc(it?.desc || "")}"></td>
        <td><input type="number" step="1" value="${Number(it?.price ?? 0)}"></td>
      `;
      body.appendChild(tr);
    });
  }

  function updateItemsFromTable(sectionIndex = 0) {
    const table = $id('itemsTable');
    if (!table) return;
    const sec = window.menuData?.sections?.[sectionIndex];
    if (!sec) return;
    const rows = $$("tbody tr", table);
    sec.items = rows.map(tr => {
      const [nameEl, descEl, priceEl] = $$("input", tr);
      const priceNum = Number(priceEl?.value);
      return {
        name:  nameEl?.value?.trim() || "",
        desc:  descEl?.value?.trim() || "",
        price: Number.isFinite(priceNum) ? priceNum : 0
      };
    });
  }

  // ---------- Validation / Cleaning ----------
  function validateAndClean() {
    const d = window.menuData || {};
    const secs = d.sections || [];
    secs.forEach(sec => {
      sec.title = (sec.title || "").toString().trim();
      sec.items = (sec.items || []).map(it => {
        const price = Number(it?.price);
        return {
          name:  (it?.name || "").toString().trim(),
          desc:  (it?.desc || "").toString().trim(),
          price: Number.isFinite(price) ? price : 0
        };
      });
    });
    alert("Validation complete. Basic cleaning applied.");
    persist();
    render();
  }

  // ---------- Render pipeline ----------
  function getTemplateId() { return $id("templateSelect")?.value || DEFAULT_TEMPLATE; }
  function getThemeKey()   { return $id("themeSelect")?.value    || DEFAULT_THEME; }
  function getLangKey()    { return $id("langSelect")?.value     || DEFAULT_LANG; }

  function pickSafeTemplate(tplId) {
    try {
      if (Array.isArray(TEMPLATE_REGISTRY) && TEMPLATE_REGISTRY.some(t => t.id === tplId)) return tplId;
      return TEMPLATE_REGISTRY?.[0]?.id || DEFAULT_TEMPLATE;
    } catch { return DEFAULT_TEMPLATE; }
  }

  function render() {
    // Save brand fields back (no-ops if inputs absent)
    saveBrandToData();

    const data = window.menuData || {};
    if (!data.currency) data.currency = "₹";

    const templateId = pickSafeTemplate(getTemplateId());
    const themeKey   = getThemeKey();

    // Render inside the preview iframe (provided by template-manager.js)
    renderInIframe({ templateId, theme: themeKey, data });

    // Optional top pills if present
    setTextById("hoursText", data.restaurant?.hours || "—");
    setTextById("phoneText", data.restaurant?.phone || "—");

    persist();
  }

  // ---- SET MENU DATA (central entry) ----
  function setMenuData(data) {
    try {
      window.menuData = data || {};
      bindBrandFields(window.menuData);
      fillSectionDropdown();
      persist();
      render();
    } catch (err) {
      console.error(err);
      alert("Error applying menu data: " + err.message);
    }
  }
  window.setMenuData = setMenuData;

  // ---------- Exporters ----------
  function exportPDF() {
    const iframe = $id('preview');
    if (!iframe || !iframe.contentWindow) { alert("Preview not ready"); return; }
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }

  function exportHTML() {
    const iframe = $id('preview');
    if (!iframe || !iframe.contentDocument) { alert("Preview not ready"); return; }
    const doc = iframe.contentDocument;
    const html = "<!doctype html>\n" + doc.documentElement.outerHTML;
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "menu-static.html";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ---------- Utilities ----------
  function esc(s = "") {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[c]);
  }

  // ---------- Wire UI & boot ----------
  function bindUI() {
    // Buttons/inputs (defensive lookups to support variations of the index)
    const fileInput       = $('input[type="file"]');
    const loadSampleBtn   = $id('loadSampleBtn')   || $$('button').find(b => b.textContent.trim().toLowerCase() === 'load sample');
    const renderBtn       = $id('renderBtn')       || $$('button').find(b => b.textContent.trim().toLowerCase() === 'render');
    const exportHtmlBtn   = $id('exportHtmlBtn')   || $$('button').find(b => b.textContent.trim().toLowerCase() === 'export html');
    const exportPdfBtn    = $id('exportPdfBtn')    || $$('button').find(b => b.textContent.trim().toLowerCase() === 'export pdf');
    const downloadBtn     = $id('downloadJsonBtn') || $$('button').find(b => b.textContent.toLowerCase().includes('download menu.json'));
    const validateBtn     = $id('validateBtn')     || $$('button').find(b => b.textContent.toLowerCase().includes('validate'));
    const clearCacheBtn   = $id('clearCacheBtn')   || $$('button').find(b => b.textContent.toLowerCase().includes('clear cache'));

    on(fileInput, 'change', handleFileInput);
    on(loadSampleBtn, 'click', loadSample);
    on(renderBtn, 'click', render);
    on(exportHtmlBtn, 'click', exportHTML);
    on(exportPdfBtn, 'click', exportPDF);
    on(downloadBtn, 'click', downloadJSON);
    on(validateBtn, 'click', validateAndClean);
    on(clearCacheBtn, 'click', clearCache);

    // Dropdowns
    on($id('templateSelect'), 'change', () => { persist(); render(); });
    on($id('themeSelect'),    'change', () => { persist(); render(); });
    on($id('langSelect'),     'change', () => { persist(); render(); });
  }

  function init() {
    bindUI();
    if (!autoload()) {
      // First-time: keep idle — user can Load sample or pick a file.
      // To auto-load sample on first run, uncomment next line:
      // loadSample();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
