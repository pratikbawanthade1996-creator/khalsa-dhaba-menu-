function renderInIframe({templateId, theme, data}){
  const tpl = TEMPLATE_REGISTRY.find(t=>t.id===templateId) || TEMPLATE_REGISTRY[0];
  const iframe = document.getElementById('preview');
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`<!doctype html><html><head>
    <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
    <title>${(data.restaurant&&data.restaurant.name)||'Menu'}</title>
    <style>${tpl.css||''}</style>
  </head><body>${tpl.html}</body></html>`);
  doc.close();
  applyThemeToDoc(theme, doc);
  tpl.render(doc.getElementById('menu-root'), data, theme);
}