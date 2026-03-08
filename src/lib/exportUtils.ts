import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

/** Capture a DOM element as a canvas */
async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
  });
}

/** Download as PNG */
export async function exportAsPng(el: HTMLElement, filename = "chart") {
  try {
    const canvas = await captureElement(el);
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("PNG downloaded!");
  } catch (e) {
    console.error(e);
    toast.error("Failed to export PNG");
  }
}

/** Download as SVG (extracts inner SVG from recharts) */
export function exportAsSvg(el: HTMLElement, filename = "chart") {
  try {
    const svgEl = el.querySelector("svg");
    if (!svgEl) {
      toast.error("No SVG found in chart");
      return;
    }
    const clone = svgEl.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = `${filename}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("SVG downloaded!");
  } catch (e) {
    console.error(e);
    toast.error("Failed to export SVG");
  }
}

/** Download as PDF */
export async function exportAsPdf(el: HTMLElement, filename = "chart") {
  try {
    const canvas = await captureElement(el);
    const imgData = canvas.toDataURL("image/png");
    const imgW = canvas.width;
    const imgH = canvas.height;
    const pdfW = imgW * 0.75; // points
    const pdfH = imgH * 0.75;
    const pdf = new jsPDF({
      orientation: pdfW > pdfH ? "landscape" : "portrait",
      unit: "pt",
      format: [pdfW, pdfH],
    });
    pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`${filename}.pdf`);
    toast.success("PDF downloaded!");
  } catch (e) {
    console.error(e);
    toast.error("Failed to export PDF");
  }
}

/** Export multiple elements as a single PDF */
export async function exportDashboardAsPdf(el: HTMLElement, title = "dashboard") {
  try {
    const canvas = await captureElement(el);
    const imgData = canvas.toDataURL("image/png");
    const imgW = canvas.width * 0.5;
    const imgH = canvas.height * 0.5;
    const pdf = new jsPDF({
      orientation: imgW > imgH ? "landscape" : "portrait",
      unit: "pt",
      format: [imgW + 40, imgH + 40],
    });
    pdf.addImage(imgData, "PNG", 20, 20, imgW, imgH);
    pdf.save(`${title}.pdf`);
    toast.success("Dashboard PDF downloaded!");
  } catch (e) {
    console.error(e);
    toast.error("Failed to export dashboard PDF");
  }
}

/** Export dashboard as PNG */
export async function exportDashboardAsPng(el: HTMLElement, title = "dashboard") {
  return exportAsPng(el, title);
}

/** Copy chart image to clipboard */
export async function copyToClipboard(el: HTMLElement) {
  try {
    const canvas = await captureElement(el);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Failed to copy");
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Chart copied to clipboard!");
      } catch {
        toast.error("Clipboard access denied");
      }
    }, "image/png");
  } catch (e) {
    console.error(e);
    toast.error("Failed to copy chart");
  }
}

/** Generate embed HTML snippet */
export function generateEmbedCode(chartTitle: string): string {
  const url = `${window.location.origin}/chart?embed=true`;
  return `<iframe src="${url}" width="800" height="500" frameborder="0" title="${chartTitle || "DataViz Chart"}" style="border-radius:12px;border:1px solid #e2e8f0;"></iframe>`;
}

/** Generate a mock share link */
export function generateShareLink(): string {
  const id = Math.random().toString(36).substring(2, 10);
  return `${window.location.origin}/shared/dashboard-${id}`;
}
