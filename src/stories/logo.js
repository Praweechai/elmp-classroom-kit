// Stand-in hospital mark for stories only (the apps use config.LOGO_URL).
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#03692A"/><path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#fff"/><circle cx="25" cy="7" r="3" fill="#BE8E28"/></svg>';

export default `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
