import { errorResponse } from "@/lib/api-response";
import {
  extractPdfText,
  MAX_PDF_BYTES,
  PdfExtractionError,
} from "@/lib/pdf-extractor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return errorResponse(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Content-Type must be multipart/form-data.",
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      400,
      "INVALID_MULTIPART_BODY",
      "The multipart form data could not be parsed.",
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
