import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ParsedData } from "@/lib/dataUtils";

interface FileUploadZoneProps {
  onDataParsed: (data: ParsedData) => void;
}

const ACCEPTED = [".csv", ".xlsx"];

const FileUploadZone = ({ onDataParsed }: FileUploadZoneProps) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parseFile = useCallback(
    async (file: File) => {
      setError(null);
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

      if (!ACCEPTED.includes(ext)) {
        setError(`Unsupported file format "${ext}". Please upload a .csv or .xlsx file.`);
        return;
      }

      setLoading(true);

      try {
        if (ext === ".csv") {
          const text = await file.text();
          const result = Papa.parse<Record<string, unknown>>(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });
          if (result.errors.length > 0) {
            setError(`CSV parsing error: ${result.errors[0].message}`);
            setLoading(false);
            return;
          }
          const headers = result.meta.fields ?? [];
          onDataParsed({ headers, rows: result.data, fileName: file.name, fileSize: file.size });
        } else {
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
          const headers = json.length > 0 ? Object.keys(json[0]) : [];
          onDataParsed({ headers, rows: json, fileName: file.name, fileSize: file.size });
        }
      } catch {
        setError("Failed to parse the file. Please check it and try again.");
      } finally {
        setLoading(false);
      }
    },
    [onDataParsed],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
    },
    [parseFile],
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer
          ${dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="font-body text-sm text-muted-foreground">Parsing file…</p>
          </div>
        ) : (
          <>
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {dragging ? <FileSpreadsheet className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
            </div>
            <p className="font-display text-lg font-semibold text-foreground">
              {dragging ? "Drop it here!" : "Drag & drop your file"}
            </p>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              or <span className="text-primary underline">browse</span> — CSV and XLSX supported
            </p>
          </>
        )}

        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="font-body text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
