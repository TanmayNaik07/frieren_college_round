export type ClaimTextSpan = {
  claim_text: string;
};

export type LocatedClaim = ClaimTextSpan & {
  answer_start: number;
  answer_end: number;
};

export type LocateClaimSpansResult =
  | { success: true; claims: LocatedClaim[] }
  | {
      success: false;
      claim_index: number;
      claim_text: string;
      search_start: number;
    };

export function locateClaimSpans(
  answer: string,
  spans: readonly ClaimTextSpan[],
): LocateClaimSpansResult {
  const claims: LocatedClaim[] = [];
  let searchStart = 0;

  for (const [index, span] of spans.entries()) {
    if (span.claim_text.length === 0) {
      return {
        success: false,
        claim_index: index,
        claim_text: span.claim_text,
        search_start: searchStart,
      };
    }

    const answerStart = answer.indexOf(span.claim_text, searchStart);

    if (answerStart === -1) {
      return {
        success: false,
        claim_index: index,
        claim_text: span.claim_text,
        search_start: searchStart,
      };
    }

    const answerEnd = answerStart + span.claim_text.length;

    if (answer.slice(answerStart, answerEnd) !== span.claim_text) {
      return {
        success: false,
        claim_index: index,
        claim_text: span.claim_text,
        search_start: searchStart,
      };
    }

    claims.push({
      claim_text: span.claim_text,
      answer_start: answerStart,
      answer_end: answerEnd,
    });
    searchStart = answerEnd;
  }

  return { success: true, claims };
}
