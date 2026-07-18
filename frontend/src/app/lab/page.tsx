import type { Metadata } from "next";
import { EventLab } from "@/features/event-lab/components/event-lab";

export const metadata: Metadata = {
  title: "Event Handling Web Lab",
  description: "Interactive browser companion for practicing event handling flows.",
};

export default function LabPage() {
  return (
    <main>
      <header className="hero hero--compact">
        <div className="hero__eyebrow">Interactive companion</div>
        <h1>Event Handling Web Lab</h1>
        <p>
          Practice input, pointer, and reset events in the browser, then verify that optional events
          reach the Spring Boot API. This lab supports the project but does not replace the JavaFX
          deliverable.
        </p>
      </header>
      <EventLab />
    </main>
  );
}
