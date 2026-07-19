import type { Metadata } from "next";
import { AdvancedTaskLab } from "@/features/event-lab/components/advanced-task-lab";
import { LabModeNavigation } from "@/features/event-lab/components/lab-mode-navigation";

export const metadata: Metadata = {
  title: "Advanced Task Web Lab",
  description: "Advanced interactive task workflow for the JavaFX group assignment.",
};

export default function AdvancedLabPage() {
  return (
    <main className="content-page">
      <LabModeNavigation activeMode="advanced" />
      <header className="hero hero--compact advanced-lab-hero">
        <div className="hero__eyebrow">Advanced path · Task workflow</div>
        <h1>Advanced Task Web Lab</h1>
        <p>
          Match the JavaFX reference workflow with editable priorities, Active, In Review, and
          Completed states, combined filters, delivery progress, and resilient input validation.
        </p>
      </header>
      <AdvancedTaskLab />
    </main>
  );
}
