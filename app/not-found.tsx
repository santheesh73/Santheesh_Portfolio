import type { Metadata } from "next";
import { LazyNotFound } from "@/components/layout/Lazy";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return <LazyNotFound />;
}
