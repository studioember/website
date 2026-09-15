import test from "node:test";
import assert from "node:assert/strict";

const { calculateEstimate, formatPrice } =
  await import("../assets/js/pricing.js");

test("includes assessment once and keeps monthly support separate", () => {
  const result = calculateEstimate(
    { min: 6000, max: 9000, assessment: { min: 1500, max: 2500 } },
    [],
    { min: 500, max: 750 },
  );
  assert.deepEqual(result.project, { min: 7500, max: 11500, open: false });
  assert.equal(formatPrice(result.monthly), "$500–$750");
});

test("adds ranged extras but never invents a ceiling for starting prices", () => {
  const result = calculateEstimate(
    { min: 15000, max: 22000, assessment: { min: 3000, max: 4000 } },
    [
      { min: 6000, max: 7500 },
      { min: 15000, open: true },
    ],
    { min: 0, max: 0 },
  );
  assert.equal(formatPrice(result.project), "From $39,000");
  assert.equal(formatPrice(result.monthly), "$0");
});

test("custom quotes remain excluded and explicitly listed", () => {
  const result = calculateEstimate(
    { min: 1500, max: 2500 },
    [{ name: "On-site implementation", quote: true }],
    { min: 0, max: 0 },
  );
  assert.equal(formatPrice(result.project), "$1,500–$2,500");
  assert.deepEqual(result.quoted, ["On-site implementation"]);
});

test("resilient range retains its open upper bound", () => {
  assert.equal(
    formatPrice({ min: 30000, max: 45000, open: true }),
    "$30,000–$45,000+",
  );
  const result = calculateEstimate(
    {
      min: 30000,
      max: 45000,
      open: true,
      assessment: { min: 3000, max: 4000 },
    },
    [],
    { min: 1500, open: true },
  );
  assert.equal(formatPrice(result.project), "$33,000–$49,000+");
  assert.equal(formatPrice(result.monthly), "From $1,500");
});
