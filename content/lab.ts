/**
 * Frontend Craft internals for /lab: the rule set of the `craft` CLI's Slop Lint,
 * copied from github.com/santheesh73/craftlyst (cli/rules/*, `id` + `description`).
 */
export const SLOP_RULES_SOURCE = "github.com/santheesh73/craftlyst · cli/rules";

export const slopRules: { id: string; description: string }[] = [
  { id: "a11y/alt", description: "Images without alt; icon-only buttons and links without an accessible name." },
  { id: "a11y/contrast", description: "Token foreground/background pairs below WCAG AA." },
  { id: "a11y/focus", description: "outline: none without a :focus-visible replacement." },
  {
    id: "a11y/semantics",
    description: "Clickable div/span without role and keyboard support, heading-level skips, missing lang or main.",
  },
  { id: "a11y/target", description: "Interactive targets under the 44×44px touch recommendation." },
  { id: "con/fabricated", description: "Placeholder text, invented names and counts, unsourced proof, unattributed testimonials." },
  { id: "ctr/contract", description: "DESIGN.md missing sections, axes or reasons; tokens.json invalid." },
  { id: "exc/unreasoned", description: "A craft-allow exception without a rule id or a reason." },
  { id: "imm/no-dom-text", description: "Meaningful text inside canvas/WebGL without a DOM text alternative." },
  { id: "imm/no-fallback", description: "WebGL/canvas scenes without no-WebGL, reduced-motion and low-power paths." },
  { id: "imm/unbounded-loop", description: "Render loops with no visibility pause, no DPR clamp or no frame budget." },
  { id: "lay/card-depth", description: "Cards nested more than one level, or cards making up most sections." },
  { id: "lay/clone-grid", description: "Three or more sibling blocks with the same icon + heading + short text." },
  { id: "mot/no-reduced", description: "Animation with no prefers-reduced-motion handling." },
  { id: "rsp/overflow", description: "Horizontal page scroll at a 320px viewport." },
  { id: "rsp/viewport", description: "Missing or zoom-blocking meta viewport; fixed widths that overflow." },
  { id: "tok/hardcoded", description: "Literal colours, spacing or font sizes that are not design tokens." },
  { id: "tok/unknown-var", description: "var(--x) references a custom property defined nowhere." },
  { id: "vis/default-stack", description: "One large radius plus shadow on everything, or every button a pill." },
  { id: "vis/gradient-text", description: "Gradient text or large coloured glows without a token role." },
];
