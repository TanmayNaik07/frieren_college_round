import { errorResponse, secondOpinionErrorResponse } from "@/lib/api-response";
import { verifyClaim } from "@/lib/second-opinion";
import { z } from "zod";

const requestSchema = z.object({
  claim: z
    .string()
    .refine((value) => value.trim().length > 0, "claim must not be empty"),
  source: z
    .string()
    .refine((value) => value.trim().length > 0, "source must not be empty"),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const parsedRequest = requestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return errorResponse(
      400,
      "INVALID_INPUT",
      "Request body must contain non-empty claim and source strings.",
      parsedRequest.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  try {
    const { claim, source } = parsedRequest.data;
    return Response.json(await verifyClaim(claim, source));
  } catch (error) {
    return secondOpinionErrorResponse(error);
  }
}
