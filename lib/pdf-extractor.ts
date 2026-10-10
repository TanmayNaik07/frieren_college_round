import "server-only";

import {
  getDocument,
  InvalidPDFException,
  PasswordException,
} from "pdfjs-dist/legacy/build/pdf.mjs";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_PDF_PAGES = 50;

export type PdfPageText = {
  page_number: number;
  text: string;
};

export type ExtractedPdf = {
  page_count: number;
  text: string;
  pages: PdfPageText[];
};

export class PdfExtractionError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "PdfExtractionError";
  }
}

export function hasPdfSignature(bytes: Uint8Array) {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
  const searchLength = Math.min(bytes.length, 1024);

  for (let offset = 0; offset <= searchLength - signature.length; offset += 1) {
    if (signature.every((byte, index) => bytes[offset + index] === byte)) {
      return true;
    }
  }

  return false;
}

function normalizePageText(items: unknown[]) {
  let text = "";

  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      !("str" in item) ||
      typeof item.str !== "string" ||
      item.str.length === 0
    ) continue;

    text += item.str;
    text += "hasEOL" in item && item.hasEOL ? "\n" : " ";
  }

  return text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function extractPdfText(bytes: Uint8Array): Promise<ExtractedPdf> {
  if (bytes.length === 0) {
    throw new PdfExtractionError(400, "EMPTY_PDF", "The uploaded PDF is empty.");
  }

  if (bytes.length > MAX_PDF_BYTES) {
    throw new PdfExtractionError(
      413,
      "PDF_TOO_LARGE",
      "The PDF exceeds the 10 MB file-size limit.",
    );
  }

  if (!hasPdfSignature(bytes)) {
    throw new PdfExtractionError(
      400,
      "INVALID_PDF_SIGNATURE",
      "The uploaded file does not contain a valid PDF signature.",
    );
  }

  let loadingTask: ReturnType<typeof getDocument> | undefined;
  let document: Awaited<ReturnType<typeof getDocument>["promise"]> | undefined;

  try {
    loadingTask = getDocument({
      data: bytes.slice(),
      enableXfa: false,
      stopAtErrors: true,
      useSystemFonts: true,
      verbosity: 0,
    });

    document = await loadingTask.promise;

    if (document.numPages === 0) {
      throw new PdfExtractionError(
        422,
        "EMPTY_PDF",
        "The PDF does not contain any pages.",
      );
    }

    if (document.numPages > MAX_PDF_PAGES) {
      throw new PdfExtractionError(
        413,
        "PDF_PAGE_LIMIT_EXCEEDED",
        "The PDF exceeds the 50-page limit.",
      );
    }

    const pages: PdfPageText[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = normalizePageText(content.items);
      pages.push({ page_number: pageNumber, text });
      page.cleanup();
    }

    if (!pages.some((page) => page.text.length > 0)) {
      throw new PdfExtractionError(
        422,
        "PDF_NO_EXTRACTABLE_TEXT",
        "The PDF contains no extractable text. Scanned PDFs require OCR, which is not supported.",
      );
    }

    return {
      page_count: document.numPages,
      text: pages
        .map((page) => `[Page ${page.page_number}]\n${page.text}`)
        .join("\n\n"),
      pages,
    };
  } catch (error) {
    if (error instanceof PdfExtractionError) throw error;

    if (error instanceof PasswordException || (error instanceof Error && error.name === "PasswordException")) {
      throw new PdfExtractionError(
        422,
        "PDF_ENCRYPTED",
        "The PDF is encrypted or password-protected and cannot be read.",
      );
    }

    if (error instanceof InvalidPDFException || (error instanceof Error && error.name === "InvalidPDFException")) {
      throw new PdfExtractionError(
        400,
        "INVALID_PDF",
        "The uploaded file is not a valid readable PDF.",
      );
    }

    throw new PdfExtractionError(
      422,
      "PDF_UNREADABLE",
      "The PDF could not be read or its text could not be extracted.",
    );
  } finally {
    await loadingTask?.destroy();
  }
}
