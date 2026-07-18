import { EventLab } from "@/features/event-lab/components/event-lab";

export default function HomePage() {
  return (
    <main>
      <header className="hero">
        <div className="hero__eyebrow">JavaFX group project companion</div>
        <h1>Event Handling Web Lab</h1>
        <p>
          Practice the same greeting, pointer, and reset flows in a browser,
          then verify that optional events reach the Spring Boot API.
        </p>
      </header>
      <EventLab />
    </main>
  );
}
