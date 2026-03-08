import { useRef, useState } from "react";
import { Download, Copy, Code, Image, FileText, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  exportAsPng,
  exportAsSvg,
  exportAsPdf,
  copyToClipboard,
  generateEmbedCode,
} from "@/lib/exportUtils";

interface Props {
  chartRef: React.RefObject<HTMLDivElement>;
  chartTitle?: string;
  variant?: "default" | "compact";
}

const ExportMenu = ({ chartRef, chartTitle = "chart", variant = "default" }: Props) => {
  const [embedOpen, setEmbedOpen] = useState(false);
  const embedCode = generateEmbedCode(chartTitle);

  const handleExport = (format: "png" | "svg" | "pdf") => {
    if (!chartRef.current) return;
    const name = chartTitle.replace(/\s+/g, "-").toLowerCase() || "chart";
    if (format === "png") exportAsPng(chartRef.current, name);
    else if (format === "svg") exportAsSvg(chartRef.current, name);
    else if (format === "pdf") exportAsPdf(chartRef.current, name);
  };

  const handleCopy = () => {
    if (!chartRef.current) return;
    copyToClipboard(chartRef.current);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied!");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={variant === "compact" ? "sm" : "sm"} className="gap-2 text-xs">
            <Download className="h-3.5 w-3.5" />
            {variant === "default" && "Export"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleExport("png")} className="gap-2 text-xs">
            <FileImage className="h-3.5 w-3.5" /> Download PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("svg")} className="gap-2 text-xs">
            <Image className="h-3.5 w-3.5" /> Download SVG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 text-xs">
            <FileText className="h-3.5 w-3.5" /> Download PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopy} className="gap-2 text-xs">
            <Copy className="h-3.5 w-3.5" /> Copy to Clipboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEmbedOpen(true)} className="gap-2 text-xs">
            <Code className="h-3.5 w-3.5" /> Embed Code
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Embed Chart</DialogTitle>
            <DialogDescription>Copy this HTML snippet and paste it into your website.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <code className="text-xs text-foreground break-all whitespace-pre-wrap">{embedCode}</code>
          </div>
          <Button onClick={handleCopyEmbed} className="gap-2 text-xs w-full">
            <Copy className="h-3.5 w-3.5" /> Copy Embed Code
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportMenu;
