import { useState } from "react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ParsedData } from "@/lib/dataUtils";

const ROWS_PER_PAGE = 20;

const DataTable = ({ data }: { data: ParsedData }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.rows.length / ROWS_PER_PAGE);
  const slice = data.rows.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 text-center font-display text-xs">#</TableHead>
              {data.headers.map((h) => (
                <TableHead key={h} className="font-display text-xs whitespace-nowrap">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {page * ROWS_PER_PAGE + i + 1}
                </TableCell>
                {data.headers.map((h) => (
                  <TableCell key={h} className="font-body text-sm whitespace-nowrap max-w-[200px] truncate">
                    {row[h] == null || row[h] === "" ? (
                      <span className="text-muted-foreground/50 italic">—</span>
                    ) : (
                      String(row[h])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="font-body text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
