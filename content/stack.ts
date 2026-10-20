import { z } from "zod";
import { StackLayerSchema, type StackLayer } from "./schema";

const data: StackLayer[] = [
  {
    id: "ai",
    title: "AI / ML",
    tools: [
      { name: "LLMs", aliases: [] },
      { name: "RAG", aliases: [] },
      { name: "AI agents", aliases: ["Claude Code"] },
      { name: "PyTorch", aliases: [] },
      { name: "Gemini", aliases: ["Gemini Vision", "Gemini Flash"] },
      { name: "Gemma", aliases: ["Gemma 4"] },
      { name: "Groq LLaMA", aliases: ["Groq", "LLaMA"] },
      { name: "Hugging Face", aliases: [] },
      { name: "WebLLM", aliases: ["WebGPU"] },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    tools: [
      { name: "TypeScript", aliases: [] },
      { name: "JavaScript", aliases: [] },
      { name: "React", aliases: [] },
      { name: "Next.js", aliases: [] },
      { name: "Vite", aliases: [] },
      { name: "Tailwind", aliases: ["Tailwind CSS"] },
      { name: "PWA", aliases: [] },
    ],
  },
  {
    id: "backend",
    title: "Backend & data",
    tools: [
      { name: "Python", aliases: [] },
      { name: "FastAPI", aliases: [] },
      { name: "Django", aliases: [] },
      { name: "Celery", aliases: [] },
      { name: "PostgreSQL", aliases: [] },
      { name: "MongoDB", aliases: [] },
      { name: "SQLite", aliases: [] },
      { name: "Supabase", aliases: [] },
      { name: "Redis", aliases: [] },
      { name: "ChromaDB", aliases: [] },
      { name: "IndexedDB", aliases: ["Dexie"] },
    ],
  },
  {
    id: "ship",
    title: "Ship & operate",
    tools: [
      { name: "Docker", aliases: [] },
      { name: "Git", aliases: [] },
      { name: "GitHub Actions", aliases: [] },
      { name: "Vercel", aliases: [] },
      { name: "Render", aliases: [] },
      { name: "Sentry", aliases: [] },
    ],
  },
];

export const stack = z.array(StackLayerSchema).parse(data);
