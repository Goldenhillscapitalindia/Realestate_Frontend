import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type ExportPdfOptions = {
  elementId?: string;
  elementIds?: string[];
  fileName: string;
  pageMarginMm?: number;
  orientation?: "p" | "l";
  format?: "a4" | "a3";
  imageScale?: number;
  paginateByChildren?: boolean;
  exportWidthPx?: number;
  backgroundColor?: string;
  pageBackgroundColors?: string[];
  generatedPagePaddingPx?: number;
};

function normalizeHexColor(color: string) {
  const hex = color.replace("#", "");
  return hex.length === 3
    ? hex
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : hex.padEnd(6, "0").slice(0, 6);
}

function getPageBackgroundColor(
  index: number,
  backgroundColor: string,
  pageBackgroundColors?: string[]
) {
  return pageBackgroundColors?.[index] ?? backgroundColor;
}

function sanitizeFileName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "document";
}

function waitForImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll("img"));

  return Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
}

/**
 * Snapshot all canvases in the ORIGINAL live DOM container into data URLs,
 * indexed by their position among all canvases in that container.
 * Returns a map of index → dataURL.
 */
function snapshotCanvases(container: HTMLElement): Map<number, string> {
  const map = new Map<number, string>();
  const canvases = Array.from(container.querySelectorAll("canvas"));

  canvases.forEach((canvas, index) => {
    try {
      canvas.dataset.pdfCanvasIndex = String(index);
      const dataUrl = canvas.toDataURL("image/png");
      // A blank canvas produces a specific small base64 — skip those
      if (dataUrl && dataUrl.length > 200) {
        map.set(index, dataUrl);
      }
    } catch {
      // cross-origin or tainted canvas — skip
    }
  });

  return map;
}

/**
 * After cloning, replace all empty <canvas> elements in the cloned container
 * with <img> tags using the pre-snapshotted data URLs from the original DOM.
 * Uses positional index matching — clone canvas[N] gets snapshot[N].
 */
function injectCanvasSnapshots(
  clonedContainer: HTMLElement,
  snapshots: Map<number, string>,
  originalContainer: HTMLElement
): void {
  if (snapshots.size === 0) return;

  const originalCanvases = Array.from(originalContainer.querySelectorAll("canvas"));
  const clonedCanvases = Array.from(clonedContainer.querySelectorAll("canvas"));

  clonedCanvases.forEach((clonedCanvas, index) => {
    const sourceIndex = Number(clonedCanvas.dataset.pdfCanvasIndex ?? index);
    const dataUrl = snapshots.get(sourceIndex);
    if (!dataUrl) return;

    const originalCanvas = originalCanvases[sourceIndex];
    const img = document.createElement("img");
    img.src = dataUrl;

    // Match the original canvas dimensions
    const w = originalCanvas?.offsetWidth || clonedCanvas.width || 300;
    const h = originalCanvas?.offsetHeight || clonedCanvas.height || 150;
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;
    img.style.display = "block";
    img.width = w;
    img.height = h;

    clonedCanvas.parentNode?.replaceChild(img, clonedCanvas);
  });
}

function cloneWithPdfSplits(
  element: HTMLElement,
  canvasSnapshots: Map<number, string>,
  originalContainer: HTMLElement
) {
  const children = Array.from(element.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.dataset.html2canvasIgnore !== "true"
  );

  if (element.dataset.pdfSplitChildren !== "true" || children.length === 0) {
    const clone = element.cloneNode(true) as HTMLElement;
    injectCanvasSnapshots(clone, canvasSnapshots, originalContainer);
    clone.style.background = "transparent";
    clone.style.backgroundColor = "transparent";
    return [clone];
  }

  return children.map((child) => {
    const wrapper = element.cloneNode(false) as HTMLElement;
    const childClone = child.cloneNode(true) as HTMLElement;

    injectCanvasSnapshots(childClone, canvasSnapshots, originalContainer);
    wrapper.appendChild(childClone);
    wrapper.style.background = "transparent";
    wrapper.style.backgroundColor = "transparent";

    return wrapper;
  });
}

function buildPaginatedTargets(
  container: HTMLElement,
  pageAspectRatio: number,
  exportWidthPx: number,
  canvasSnapshots: Map<number, string>,
  backgroundColor: string,
  pageBackgroundColors?: string[],
  generatedPagePaddingPx = 18
) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = `${exportWidthPx}px`;
  host.style.pointerEvents = "none";
  host.style.opacity = "0";
  host.style.zIndex = "-1";
  document.body.appendChild(host);

  const pageHeightPx = Math.floor(exportWidthPx * pageAspectRatio);
  const sourceBlocks = Array.from(container.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.dataset.html2canvasIgnore !== "true"
  );

  const pages: HTMLElement[] = [];

  const createPage = () => {
    const pageIndex = pages.length;
    const pageBackgroundColor = getPageBackgroundColor(
      pageIndex,
      backgroundColor,
      pageBackgroundColors
    );
    const page = document.createElement("div");
    page.className = "pdf-page-shell";
    page.style.width = `${exportWidthPx}px`;
    page.style.minHeight = `${pageHeightPx}px`;
    page.style.overflow = "visible";    // override CSS overflow:hidden
    page.style.setProperty("background", pageBackgroundColor, "important");
    page.style.setProperty("background-color", pageBackgroundColor, "important");
    page.style.boxSizing = "border-box";
    page.style.padding = `${generatedPagePaddingPx}px`;
    page.style.setProperty("--pdf-page-bg", pageBackgroundColor);
    page.setAttribute("data-pdf-generated-page", "true");
    page.dataset.pdfPageBg = pageBackgroundColor;
    host.appendChild(page);
    pages.push(page);
    return page;
  };

  let currentPage = createPage();

  for (let i = 0; i < sourceBlocks.length; i++) {
    const block = sourceBlocks[i];
    const clones = cloneWithPdfSplits(block, canvasSnapshots, container);

    for (const clone of clones) {
      currentPage.appendChild(clone);

      const fitsOnCurrentPage = currentPage.scrollHeight <= pageHeightPx;

      if (fitsOnCurrentPage) {
        // Keep-with-next: short header block should stay with the next block
        const isShortHeader = clone.offsetHeight < 120;
        const nextBlock = sourceBlocks[i + 1];

        if (isShortHeader && nextBlock) {
          const nextClone = cloneWithPdfSplits(nextBlock, canvasSnapshots, container)[0];
          nextClone.style.visibility = "hidden";
          nextClone.style.pointerEvents = "none";
          currentPage.appendChild(nextClone);
          const nextWouldOverflow = currentPage.scrollHeight > pageHeightPx;
          currentPage.removeChild(nextClone);

          if (nextWouldOverflow) {
            currentPage.removeChild(clone);
            currentPage = createPage();
            currentPage.appendChild(clone);
          }
        }
        continue;
      }

      // Block doesn't fit - move to new page, keeping the block intact.
      currentPage.removeChild(clone);
      currentPage = createPage();
      currentPage.appendChild(clone);
    }
  }

  const nonEmptyPages = pages.filter((page) => page.children.length > 0);

  return {
    pages: nonEmptyPages,
    cleanup: () => {
      host.remove();
    },
  };
}

export async function exportElementToPdf({
  elementId,
  elementIds,
  fileName,
  pageMarginMm = 10,
  orientation = "p",
  format = "a4",
  imageScale = 3,
  paginateByChildren = false,
  exportWidthPx = 1240,
  backgroundColor = "#eef3f8",
  pageBackgroundColors,
  generatedPagePaddingPx = 18,
}: ExportPdfOptions) {
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format,
    compress: true,
  });

  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const contentWidthMm = pageWidthMm - pageMarginMm * 2;
  const contentHeightMm = pageHeightMm - pageMarginMm * 2;
  const pageAspectRatio = contentHeightMm / contentWidthMm;

  let cleanupGeneratedPages: (() => void) | undefined;

  const ids = (elementIds && elementIds.length > 0 ? elementIds : elementId ? [elementId] : [])
    .map((id) => document.getElementById(id))
    .filter((element): element is HTMLElement => Boolean(element));

  if (!ids.length) return;

  // Snapshot canvases from the LIVE original DOM before any cloning happens
  const canvasSnapshots = paginateByChildren && ids[0]
    ? snapshotCanvases(ids[0])
    : new Map<number, string>();

  const targets =
    paginateByChildren && elementId && ids[0]
      ? (() => {
          const { pages, cleanup } = buildPaginatedTargets(
            ids[0],
            pageAspectRatio,
            exportWidthPx,
            canvasSnapshots,
            backgroundColor,
            pageBackgroundColors,
            generatedPagePaddingPx
          );
          cleanupGeneratedPages = cleanup;
          return pages;
        })()
      : ids;

  try {
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      const pageBackgroundColor =
        target.dataset.pdfPageBg ??
        getPageBackgroundColor(index, backgroundColor, pageBackgroundColors);

      await waitForImages(target);

      const canvas = await html2canvas(target, {
        scale: imageScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: pageBackgroundColor,
        logging: false,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: exportWidthPx,
        windowHeight: Math.max(target.scrollHeight, target.offsetHeight),
      });

      const imageData = canvas.toDataURL("image/png");
      const imageRatio = canvas.width / canvas.height;
      const renderWidthMm = contentWidthMm;
      const renderHeightMm = renderWidthMm / imageRatio;

      if (index > 0) {
        pdf.addPage(format, orientation);
      }

      const normalizedHex = normalizeHexColor(pageBackgroundColor);
      const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
      const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
      const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);

      pdf.setFillColor(red, green, blue);
      pdf.rect(0, 0, pageWidthMm, pageHeightMm, "F");

      pdf.addImage(
        imageData,
        "PNG",
        pageMarginMm,
        pageMarginMm,
        renderWidthMm,
        renderHeightMm,
        undefined,
        "FAST"
      );
    }
  } finally {
    cleanupGeneratedPages?.();
  }

  pdf.save(`${sanitizeFileName(fileName)}.pdf`);
}
