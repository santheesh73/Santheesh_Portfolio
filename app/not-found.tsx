import type { Metadata } from "next";
import { NotFoundField } from "@/components/sections/NotFoundField";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return <NotFoundField />;
}
