import { errorResponse } from "@/lib/api-response";
import {
  extractPdfText,
  MAX_PDF_BYTES,
  PdfExtractionError,
} from "@/lib/pdf-extractor";

export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = MAX_PDF_BYTES + 1024 * 1024;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return errorResponse(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be multipart/form-data.",
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const parsedLength = Number(contentLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_MULTIPART_BYTES) {
      return errorResponse(
        413,
        "PDF_TOO_LARGE",
        "The uploaded PDF exceeds the 10 MB file-size limit.",
      );
    }
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error(
      "PDF multipart parsing failed:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return errorResponse(
      400,
      "INVALID_MULTIPART_BODY",
      "The upload could not be read because the multipart request is malformed.",
    );
  }

  const files = formData.getAll("file");

  if (files.length !== 1 || !(files[0] instanceof File)) {
    return errorResponse(
      400,
      "INVALID_PDF_UPLOAD",
      "Upload exactly one PDF using the form field named file.",
    );
  }

  const file = files[0];

  if (file.size === 0) {
    return errorResponse(400, "EMPTY_PDF", "The uploaded PDF is empty.");
  }

  if (file.size > MAX_PDF_BYTES) {
    return errorResponse(
      413,
      "PDF_TOO_LARGE",
      "The PDF exceeds the 10 MB file-size limit.",
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extracted = await extractPdfText(bytes);

    return Response.json(extracted);
  } catch (error) {
    if (error instanceof PdfExtractionError) {
      return errorResponse(error.status, error.code, error.message);
    }

    console.error(
      "Unexpected PDF extraction error:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return errorResponse(
      500,
      "PDF_EXTRACTION_FAILED",
      "An unexpected error occurred while extracting the PDF.",
    );
  }
}
