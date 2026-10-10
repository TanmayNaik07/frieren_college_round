import assert from "node:assert/strict";
import test from "node:test";

import { locateClaimSpans } from "../lib/claim-spans.ts";

test("locates Eiffel Tower claims with end-exclusive offsets", () => {
  const answer = "The Eiffel Tower is in Paris. It opened in 1889.";
  const result = locateClaimSpans(answer, [
    { claim_text: "The Eiffel Tower is in Paris." },
    { claim_text: "It opened in 1889." },
  ]);

  assert.equal(result.success, true);
  assert.deepEqual(result.claims, [
    { claim_text: "The Eiffel Tower is in Paris.", answer_start: 0, answer_end: 29 },
    { claim_text: "It opened in 1889.", answer_start: 30, answer_end: 48 },
  ]);
  for (const claim of result.claims) {
    assert.equal(answer.slice(claim.answer_start, claim.answer_end), claim.claim_text);
  }
});

test("preserves multiline spans and line breaks", () => {
  const answer = "First line states 12%.\nSecond line states 20 offices.\nFinal note.";
  const span = "First line states 12%.\nSecond line states 20 offices.";
  const result = locateClaimSpans(answer, [{ claim_text: span }]);

  assert.equal(result.success, true);
  assert.equal(result.claims[0].answer_start, 0);
  assert.equal(answer.slice(result.claims[0].answer_start, result.claims[0].answer_end), span);
});

test("preserves punctuation and Unicode exactly", () => {
  const answer = "The café’s sign reads “Open—24/7.” Prices rose 5%.";
  const spans = [
    { claim_text: "The café’s sign reads “Open—24/7.”" },
    { claim_text: "Prices rose 5%." },
  ];
  const result = locateClaimSpans(answer, spans);

  assert.equal(result.success, true);
  for (const claim of result.claims) {
    assert.equal(answer.slice(claim.answer_start, claim.answer_end), claim.claim_text);
  }
});

test("matches repeated sentences in order without reusing an occurrence", () => {
  const sentence = "Paris is in France.";
  const answer = `${sentence} ${sentence}`;
  const result = locateClaimSpans(answer, [
    { claim_text: sentence },
    { claim_text: sentence },
  ]);

  assert.equal(result.success, true);
  assert.equal(result.claims[0].answer_start, 0);
  assert.equal(result.claims[1].answer_start, sentence.length + 1);
  assert.ok(result.claims[1].answer_start >= result.claims[0].answer_end);
});

test("rejects a paraphrase or otherwise invalid span", () => {
  const result = locateClaimSpans("Revenue increased by 12%.", [
    { claim_text: "Revenue grew by 12%." },
  ]);

  assert.deepEqual(result, {
    success: false,
    claim_index: 0,
    claim_text: "Revenue grew by 12%.",
    search_start: 0,
  });
});
