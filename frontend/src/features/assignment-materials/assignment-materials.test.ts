import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ASSIGNMENT_MATERIALS,
  getMaterialHref,
} from "@/features/assignment-materials/assignment-materials";

describe("assignment materials", () => {
  it("uses unique file names and safe public links", () => {
    const fileNames = ASSIGNMENT_MATERIALS.map(({ fileName }) => fileName);

    expect(new Set(fileNames).size).toBe(fileNames.length);
    for (const fileName of fileNames) {
      expect(getMaterialHref(fileName)).toBe(
        `/assignment-materials/${encodeURIComponent(fileName)}`,
      );
    }
  });

  it.each(ASSIGNMENT_MATERIALS)(
    "includes the readable source for $fileName",
    async ({ fileName }) => {
      const filePath = path.join(process.cwd(), "public", "assignment-materials", fileName);

      await expect(readFile(filePath, "utf8")).resolves.not.toHaveLength(0);
    },
  );
});
