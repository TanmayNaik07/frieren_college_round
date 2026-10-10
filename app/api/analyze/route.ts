import { errorResponse, secondOpinionErrorResponse } from "@/lib/api-response";
import {
  extractClaims,
  SecondOpinionError,
  verifyClaim,
  type Classification,
} from "@/lib/second-opinion";
import { z } from "zod";

const requestSchema = z.object({
  answer: z
    .string()
    .refine((value) => value.trim().length > 0, "answer must not be empty"),
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
      "Request body must contain non-empty answer and source strings.",
      parsedRequest.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const { answer, source } = parsedRequest.data;

  try {
    const extractedClaims = await extractClaims(answer, source);
    const claims = [];

    for (const [index, claim] of extractedClaims.entries()) {
      try {
        const verification = await verifyClaim(claim.claim_text, source);

        claims.push({
          ...claim,
          ...verification,
          evidence_verified: verification.evidence !== null,
        });
      } catch (error) {
        if (error instanceof SecondOpinionError) {
          throw new SecondOpinionError(
            error.status,
            error.code,
            error.message,
            { claim_index: index, claim_text: claim.claim_text },
          );
        }

        throw error;
      }
    }

    const counts: Record<Classification, number> = {
      supported: 0,
      contradicted: 0,
      unsupported: 0,
      ambiguous: 0,
    };

    for (const claim of claims) {
      counts[claim.classification] += 1;
    }

    return Response.json({
      claims,
      summary: {
        total_claims: claims.length,
        ...counts,
      },
    });
  } catch (error) {
    return secondOpinionErrorResponse(error);
  }
}
