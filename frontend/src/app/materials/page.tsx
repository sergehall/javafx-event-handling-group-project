import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ASSIGNMENT_MATERIALS,
  getMaterialHref,
} from "@/features/assignment-materials/assignment-materials";

export const metadata: Metadata = {
  title: "Assignment Materials",
  description: "Original JavaFX starter files and examples supplied for the group assignment.",
};

async function readMaterial(fileName: string): Promise<string> {
  const materialsDirectory = path.join(process.cwd(), "public", "assignment-materials");
  return readFile(path.join(materialsDirectory, fileName), "utf8");
}

export default async function MaterialsPage() {
  const materials = await Promise.all(
    ASSIGNMENT_MATERIALS.map(async (material) => ({
      ...material,
      content: await readMaterial(material.fileName),
    })),
  );

  return (
    <main>
      <header className="hero hero--compact">
        <div className="hero__eyebrow">Project reference</div>
        <h1>Assignment Materials</h1>
        <p>
          These are the original starter examples and project files supplied for the JavaFX event
          handling assignment. Use them as reference material; the working implementation remains in
          the desktop application module.
        </p>
      </header>

      <aside className="material-note" aria-label="Important note">
        <strong>Starter files are preserved as supplied.</strong>
        <span>
          Some names and references may not compile together without correction. Compare them with
          the current project instead of copying them blindly.
        </span>
      </aside>

      <section className="materials-grid" aria-label="Assignment source files">
        {materials.map((material) => (
          <article className="material-card" key={material.fileName}>
            <div className="material-card__header">
              <div>
                <span className="material-card__category">{material.category}</span>
                <h2>{material.title}</h2>
                <code>{material.fileName}</code>
              </div>
              <a
                className="material-card__raw-link"
                href={getMaterialHref(material.fileName)}
                target="_blank"
                rel="noreferrer"
              >
                Open original<span className="sr-only"> in a new tab</span>
              </a>
            </div>
            <p>{material.description}</p>
            <details className="source-viewer">
              <summary>View source</summary>
              <pre tabIndex={0} aria-label={`${material.fileName} source code`}>
                <code>{material.content}</code>
              </pre>
            </details>
          </article>
        ))}
      </section>
    </main>
  );
}
