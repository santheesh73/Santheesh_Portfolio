import { ProfileSchema, type Profile } from "./schema";

const data: Profile = {
  name: "Santheesh S",
  headline: "AI Software Engineer · Full-Stack Developer · Generative AI Enthusiast",
  roles: ["AI Software Engineer", "Full-Stack Developer", "Generative AI"],
  location: {
    city: "Tiruppur",
    region: "Tamil Nadu",
    country: "India",
    timezone: "Asia/Kolkata",
  },
  email: "santheesh737@gmail.com",
  links: {
    github: "https://github.com/santheesh73",
    linkedin: "https://www.linkedin.com/in/santheesh-s-b154b1384/",
  },
  builds: [
    "Generative AI",
    "LLM applications",
    "RAG & knowledge systems",
    "On-device AI",
    "AI developer tools",
    "Full-stack products",
  ],
  focus: [
    {
      title: "LLM engineering & agents",
      detail: "Agent workflows where every model output passes deterministic validation.",
    },
    {
      title: "On-device inference",
      detail: "Browser-native models on WebGPU and WebLLM. Nothing leaves the machine.",
    },
    {
      title: "High-precision RAG",
      detail: "Hybrid retrieval with vector embeddings and semantic reranking.",
    },
    {
      title: "Document intelligence",
      detail: "Structured extraction from bills, invoices and filings for audits and compliance.",
    },
  ],
  philosophy: "AI should be a component of a reliable software system, not the entire system.",
  taglines: {
    motto: "Think deeply. Build deliberately. Ship continuously.",
    contact: "Let's build something useful.",
  },
  thesis: "AI is one part of the system. I engineer the rest.",
  bootLog: ["> initializing profile… ok", "> loading ai systems… ok", "> building…"],
  principles: [
    {
      title: "The model reads. Code decides.",
      detail:
        "Models handle perception and language: reading a bill, extracting an entity, explaining a result. Anything that has to be right, like money, rules and timing, runs in deterministic code that can be tested.",
    },
    {
      title: "Prove it, don't claim it.",
      detail:
        "A guarantee is only real with the mechanism that enforces it and the test that proves it. Pulse has 19 written guarantees; Frontend Craft only lets an agent claim what a report supports.",
    },
    {
      title: "Ship continuously.",
      detail:
        "Small, gated phases. Each one lints, builds, tests and gets looked at before the next starts.",
    },
  ],
  bio: [
    "I'm Santheesh, an AI software engineer in Tiruppur, Tamil Nadu. I build LLM applications, retrieval and document systems, on-device AI, and the full-stack products around them.",
    "My rule is simple: a model is one component of a reliable system, not the system. It reads and explains. Deterministic code calculates and decides.",
  ],
  portrait: "TODO(santheesh): portrait photo",
  resume: "TODO(santheesh): resume PDF",
  education: "TODO(santheesh): education timeline",
  experience: "TODO(santheesh): experience timeline",
  githubSignals: {
    asOf: "Oct 2026",
    publicRepos: 20,
    stars: 93,
    achievements: ["Pull Shark ×2", "YOLO", "Quickdraw"],
  },
};

export const profile = ProfileSchema.parse(data);
