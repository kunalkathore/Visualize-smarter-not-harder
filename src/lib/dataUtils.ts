export interface ParsedData {
  headers: string[];
  rows: Record<string, unknown>[];
  fileName: string;
  fileSize: number;
}

export interface ColumnInfo {
  name: string;
  type: "number" | "text" | "date" | "mixed";
  missingCount: number;
}

function isDateValue(val: unknown): boolean {
  if (val instanceof Date) return !isNaN(val.getTime());
  if (typeof val !== "string") return false;
  const s = val.trim();
  if (s.length < 6 || s.length > 30) return false;
  const d = new Date(s);
  return !isNaN(d.getTime()) && /\d{2,4}[-/]\d{1,2}[-/]\d{1,4}/.test(s);
}

export function detectColumnType(rows: Record<string, unknown>[], col: string): ColumnInfo["type"] {
  let numCount = 0, dateCount = 0, textCount = 0, total = 0;
  for (const row of rows) {
    const v = row[col];
    if (v == null || v === "") continue;
    total++;
    if (typeof v === "number" || (!isNaN(Number(v)) && String(v).trim() !== "")) numCount++;
    else if (isDateValue(v)) dateCount++;
    else textCount++;
  }
  if (total === 0) return "text";
  if (numCount / total > 0.7) return "number";
  if (dateCount / total > 0.7) return "date";
  if (textCount / total > 0.7) return "text";
  return "mixed";
}

export function getMissingCount(rows: Record<string, unknown>[], col: string): number {
  return rows.filter(r => r[col] == null || r[col] === "").length;
}

export function getColumnInfos(data: ParsedData): ColumnInfo[] {
  return data.headers.map(h => ({
    name: h,
    type: detectColumnType(data.rows, h),
    missingCount: getMissingCount(data.rows, h),
  }));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
