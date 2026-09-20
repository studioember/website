const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(price) {
  if (price.quote) return "Quoted separately";
  if (price.max == null) return `From ${dollars.format(price.min)}`;
  if (price.min === price.max) return dollars.format(price.min);
  return `${dollars.format(price.min)}–${dollars.format(price.max)}${price.open ? "+" : ""}`;
}

export function calculateEstimate(stage, addons, support) {
  const items = [
    stage,
    ...(stage.assessment ? [stage.assessment] : []),
    ...addons.filter((item) => !item.quote),
  ];
  return {
    project: {
      min: items.reduce((sum, item) => sum + item.min, 0),
      max: items.some((item) => item.max == null)
        ? undefined
        : items.reduce((sum, item) => sum + item.max, 0),
      open: items.some((item) => Boolean(item.open)),
    },
    monthly: support,
    quoted: addons.filter((item) => item.quote).map((item) => item.name),
  };
}

const root =
  typeof document === "undefined"
    ? null
    : document.querySelector("[data-configurator]");
if (root) {
  const data = JSON.parse(
    root.querySelector("[data-pricing-data]").textContent,
  );
  const slider = root.querySelector("#engagement");
  const buttons = [...root.querySelectorAll("[data-stage-button]")];
  const panels = [...root.querySelectorAll("[data-stage-panel]")];
  const addonInputs = [...root.querySelectorAll('[name="addon"]')];
  const supportInputs = [...root.querySelectorAll('[name="support"]')];
  const write = (selector, value) => {
    root.querySelector(selector).textContent = value;
  };
  function update() {
    const index = Number(slider.value);
    const stage = data.stages[index];
    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
    slider.setAttribute(
      "aria-valuetext",
      `${stage.name}, ${formatPrice(stage)}`,
    );
    // Assessment is a standalone recommendation; tailoring and care apply to delivery.
    const assessmentOnly = index === 0;
    root.querySelector("[data-addon-fields]").disabled = assessmentOnly;
    root.querySelector("[data-support-fields]").disabled = assessmentOnly;
    root.querySelector("[data-assessment-note]").hidden = !assessmentOnly;
    const addons = assessmentOnly
      ? []
      : addonInputs
          .filter((input) => input.checked)
          .map((input) => data.addons[Number(input.value)]);
    const support = assessmentOnly
      ? data.support[0]
      : data.support[
          Number(supportInputs.find((input) => input.checked).value)
        ];
    const estimate = calculateEstimate(stage, addons, support);
    write("[data-base-total]", `${stage.name}: ${formatPrice(stage)}`);
    write(
      "[data-assessment-total]",
      stage.assessment
        ? `Required assessment: ${formatPrice(stage.assessment)} (included in estimate below)`
        : "Assessment only; no implementation fees selected.",
    );
    write(
      "[data-extras-total]",
      addons.length
        ? addons.map((item) => `${item.name}: ${formatPrice(item)}`).join(" · ")
        : "No specialist add-ons selected.",
    );
    write("[data-project-total]", formatPrice(estimate.project));
    write("[data-monthly-total]", `${formatPrice(estimate.monthly)} / month`);
    write("[data-support-total]", support.name);
    write(
      "[data-quote-note]",
      estimate.quoted.length
        ? `Not included in the estimate: ${estimate.quoted.join(", ")}. Quoted separately.`
        : "Final fees follow assessment and a written scope.",
    );
  }
  buttons.forEach((button, index) =>
    button.addEventListener("click", () => {
      slider.value = index;
      update();
    }),
  );
  root.addEventListener("input", update);
  root.querySelector("[data-slider-controls]").hidden = false;
  root.querySelector("[data-total]").hidden = false;
  update();
}
