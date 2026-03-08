import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FileUploadZone from "@/components/FileUploadZone";
import DatasetSummaryBar from "@/components/DatasetSummaryBar";
import DataTable from "@/components/DataTable";
import ColumnInspector from "@/components/ColumnInspector";
import type { ParsedData } from "@/lib/dataUtils";

const UploadPage = () => {
  const [data, setData] = useState<ParsedData | null>(null);

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 font-display">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
          </Link>
          <h1 className="font-display text-lg font-bold text-foreground">Upload & Preview</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Upload zone always visible for re-upload */}
        <FileUploadZone onDataParsed={setData} />

        {data && (
          <>
            <DatasetSummaryBar data={data} />

            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <DataTable data={data} />
              <ColumnInspector data={data} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UploadPage;
