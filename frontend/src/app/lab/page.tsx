import type { Metadata } from "next";
import { FoundationTaskLab } from "@/features/event-lab/components/foundation-task-lab";
import { LabModeNavigation } from "@/features/event-lab/components/lab-mode-navigation";

export const metadata: Metadata = {
  title: "Foundation Task Web Lab",
  description: "Required JavaFX Task List workflow mirrored in the browser.",
};

export default function LabPage() {
  return (
    <main className="content-page">
      <LabModeNavigation activeMode="foundation" />
      <header className="hero hero--compact">
        <div className="hero__eyebrow">Foundation path · Required workflow</div>
        <h1>Foundation Task Web Lab</h1>
        <p>
          Practice the exact task workflow required by the assignment: add items, mark them
          complete, remove them, and keep the list synchronized after every event.
        </p>
      </header>
      <FoundationTaskLab />
    </main>
  );
}
