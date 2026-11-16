// Fictional demo data shared by examples and screens.
import type { StatusOption } from '../sfera';

export const orderStatus: StatusOption[] = [
  { value: 'waiting', label: 'Waiting', tone: 'warning' },
  { value: 'processing', label: 'Processing', tone: 'info' },
  { value: 'completed', label: 'Completed', tone: 'success' },
  { value: 'failed', label: 'Failed', tone: 'danger' },
];

export type Order = { id: string; customer: string; email: string; status: string; delivery: 'shipped' | 'failed' | 'pending'; updated: string; total: number; items: number };

export const orders: Order[] = [
  { id: 'ORD-2041', customer: 'Lea Moss', email: 'lea@moss.studio', status: 'waiting', delivery: 'failed', updated: '2026-09-05', total: 3412, items: 4 },
  { id: 'ORD-2040', customer: 'Theo Park', email: 'theo@parkline.io', status: 'waiting', delivery: 'failed', updated: '2026-03-25', total: 1899, items: 2 },
  { id: 'ORD-2039', customer: 'Ana Ruiz', email: 'ana@ruiz.co', status: 'completed', delivery: 'shipped', updated: '2026-08-01', total: 2752, items: 3 },
  { id: 'ORD-2038', customer: 'Jonas Weber', email: 'jonas@weber.de', status: 'completed', delivery: 'shipped', updated: '2026-04-02', total: 145, items: 1 },
  { id: 'ORD-2037', customer: 'Sam Ito', email: 'sam@ito.jp', status: 'processing', delivery: 'pending', updated: '2026-11-14', total: 708, items: 2 },
  { id: 'ORD-2036', customer: 'Nadia Karim', email: 'nadia@karim.ae', status: 'processing', delivery: 'pending', updated: '2026-11-12', total: 1240, items: 5 },
  { id: 'ORD-2035', customer: 'Owen Hale', email: 'owen@hale.uk', status: 'failed', delivery: 'failed', updated: '2026-11-10', total: 96, items: 1 },
  { id: 'ORD-2034', customer: 'Priya Nair', email: 'priya@nair.in', status: 'completed', delivery: 'shipped', updated: '2026-11-09', total: 4310, items: 6 },
];

export const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: n < 1000 ? 0 : 0 });
export const date = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

export const people = ['Mira Chen', 'Theo Park', 'Ana Ruiz', 'Jonas Weber', 'Lea Moss', 'Sam Ito', 'Nadia Karim', 'Owen Hale', 'Priya Nair'];

/** Deterministic pseudo-random levels for heatmaps. */
export function levels(n: number, seed = 7) {
  let x = seed;
  return Array.from({ length: n }, () => {
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    return r < 0.22 ? 0 : r < 0.45 ? 1 : r < 0.68 ? 2 : r < 0.86 ? 3 : 4;
  });
}

/** Flat inline SVG sample images (no external hosts; no gradients). */
const svg = (bg: string, a: string, b: string, shape: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400"><rect width="640" height="400" fill="${bg}"/>${shape.replace(/A/g, a).replace(/B/g, b)}</svg>`);
export const sampleImages = [
  { src: svg('#E9E4DA', '#C2560A', '#1F2A44', '<circle cx="470" cy="150" r="80" fill="A"/><rect x="0" y="270" width="640" height="130" fill="B"/>'), alt: 'Sun over a dark field', caption: 'Kiln · Autumn glaze' },
  { src: svg('#DDE6F0', '#2E64F0', '#0F1B33', '<rect x="80" y="80" width="200" height="240" rx="24" fill="A"/><rect x="320" y="140" width="240" height="180" rx="24" fill="B"/>'), alt: 'Two blue blocks', caption: 'Harbor · Shelf study' },
  { src: svg('#EFE7F6', '#6D4DE6', '#E0457B', '<circle cx="250" cy="200" r="120" fill="A"/><circle cx="390" cy="200" r="120" fill="B" fill-opacity=".85"/>'), alt: 'Two overlapping circles', caption: 'Signal · Overlap' },
  { src: svg('#E3EFE8', '#17804F', '#121214', '<path d="M0 320 L200 140 L330 260 L450 120 L640 320 Z" fill="A"/><rect x="0" y="320" width="640" height="80" fill="B"/>'), alt: 'Green mountains', caption: 'Relay · Offsite' },
];
