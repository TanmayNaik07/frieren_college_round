import { SecondOpinionError } from "@/lib/second-opinion";

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
) {
  return Response.json(
    { error: { code, message, ...(details === undefined ? {} : { details }) } },
    { status },
  );
}

export function secondOpinionErrorResponse(error: unknown) {
  if (error instanceof SecondOpinionError) {
    return errorResponse(error.status, error.code, error.message, error.details);
  }

  console.error("Unexpected Second Opinion error:", error);
  return errorResponse(
    500,
    "INTERNAL_SERVER_ERROR",
    "An unexpected server error occurred.",
  );
}
