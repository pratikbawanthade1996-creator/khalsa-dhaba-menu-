function applyThemeToDoc(themeKeyOrVars, doc){
  const vars = (typeof themeKeyOrVars === 'object' && themeKeyOrVars)
    ? themeKeyOrVars
    : (THEME_REGISTRY[themeKeyOrVars]||THEME_REGISTRY.neon).vars;
  for(const k in vars){ doc.documentElement.style.setProperty(k, vars[k]); }
}