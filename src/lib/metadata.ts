import type { Metadata } from "next";

const siteName = "iPAS AI Daily";

export function pageMetadata(title: string, description: string): Metadata {
  return {
    title: `${title}｜${siteName}`,
    description,
  };
}
