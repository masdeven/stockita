// CSV export utilities with formula injection neutralization
function protectCell(cell: string) {
  if (!cell) return '';
  // If cell starts with = + - @, prefix with a single quote to neutralize formula execution in spreadsheets.
  if (/^[=+\-@]/.test(cell)) return `'${cell}`;
  return cell;
}

export function parseCSVSafe(rows: Array<Array<string | number | null>>) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return rows.map(cols => cols.map(c => esc(protectCell(String(c ?? '')))).join(',')).join('\r\n');
}

export function csvFromObjects(items: object[], headers?: string[]) {
  if (!items || !items.length) return '';
  const keys = headers ?? Object.keys(items[0]);
  const rows = [keys, ...items.map(item => keys.map(k => (item as any)[k] ?? ''))];
  return parseCSVSafe(rows as any);
}
