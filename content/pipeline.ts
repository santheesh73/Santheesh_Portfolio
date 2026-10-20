import type { DocVariant } from "@/components/pipeline/DocumentGlyph";

export type PipelineStage = {
  id: string;
  verb: string;
  kind: "model" | "seam" | "engine";
  kindLabel: string;
  line: string;
  doc: DocVariant;
  examples: { slug: string; project: string; fact: string }[];
};

/** Read → Validate → Decide → Explain, each grounded in a real project. */
export const PIPELINE: PipelineStage[] = [
  {
    id: "read",
    verb: "Read",
    kind: "model",
    kindLabel: "Model",
    line: "A model turns pixels and prose into fields. That is what it is good at.",
    doc: "bill",
    examples: [
      {
        slug: "minchal",
        project: "MINCHAL",
        fact: "Gemini Vision reads units, amount, billing period and tariff from a photo of an electricity bill.",
      },
    ],
  },
  {
    id: "validate",
    verb: "Validate",
    kind: "seam",
    kindLabel: "The seam",
    line: "Model output becomes structured records before anything acts on it.",
    doc: "fields",
    examples: [
      {
        slug: "prysm",
        project: "PRYSM",
        fact: "An LLM extracts GSTIN, invoice numbers, amounts and HSN codes into a structured store.",
      },
    ],
  },
  {
    id: "decide",
    verb: "Decide",
    kind: "engine",
    kindLabel: "Engine",
    line: "Deterministic code makes every decision that has to be right.",
    doc: "rules",
    examples: [
      { slug: "prysm", project: "PRYSM", fact: "18 deterministic compliance rules flag the gaps." },
      {
        slug: "minchal",
        project: "MINCHAL",
        fact: "The engine computes kWh per appliance and scales the breakdown to the real bill.",
      },
    ],
  },
  {
    id: "explain",
    verb: "Explain",
    kind: "model",
    kindLabel: "Model",
    line: "The model comes back for language. It explains the result; it does not produce it.",
    doc: "tree",
    examples: [
      { slug: "minchal", project: "MINCHAL", fact: "Gemini writes the audit in English or Tamil." },
      {
        slug: "ahal",
        project: "AHAL AI V2",
        fact: "Gemma 4 summarises a repository and answers questions about it.",
      },
    ],
  },
];
