export function normalizeHomeLink(link: string): string {
  return link.replace(/^\/catalogo\/?(?=[?#]|$)/, "/catalog");
}
