import type { Metadata } from "next";
import Link from "next/link";
import { ASSIGNMENT_REQUIREMENTS, RUBRIC_TOTAL } from "@/features/assignment/assignment-data";

export const metadata: Metadata = {
  title: "JavaFX Task List",
  description: "Project home for the JavaFX Task List group assignment.",
};

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <p className="hero__eyebrow">JavaFX · Group Assignment</p>
          <h1 id="home-title">
            Build a task list that feels <em>effortless.</em>
          </h1>
          <p className="home-hero__summary">
            Design an interactive JavaFX To-Do List where users can add tasks, mark work complete,
            and remove items—all through clear event-driven controls.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/lab">
              Launch Web Lab
              <span aria-hidden="true">↗</span>
            </Link>
            <Link className="button-outline" href="/requirements">
              View requirements
            </Link>
          </div>
          <p className="home-hero__note">
            The Web Lab is a browser companion. Your graded deliverable remains the JavaFX desktop
            application.
          </p>
        </div>

        <div className="task-preview" role="img" aria-label="JavaFX task list interface preview">
          <div className="task-preview__window-bar" aria-hidden="true">
            <span />
            <span />
            <span />
            <strong>Task List</strong>
          </div>
          <div className="task-preview__body">
            <div className="task-preview__heading">
              <div>
                <span>Saturday, July 18</span>
                <h2>Today’s focus</h2>
              </div>
              <span className="task-count">3 tasks</span>
            </div>
            <div className="task-preview__input" aria-hidden="true">
              <span>Add a new task…</span>
              <strong>+</strong>
            </div>
            <div className="preview-task preview-task--complete">
              <span className="preview-check" aria-hidden="true">
                ✓
              </span>
              <span>Design the JavaFX layout</span>
              <span className="preview-remove" aria-hidden="true">
                ×
              </span>
            </div>
            <div className="preview-task">
              <span className="preview-check" aria-hidden="true" />
              <span>Connect event handlers</span>
              <span className="preview-remove" aria-hidden="true">
                ×
              </span>
            </div>
            <div className="preview-task">
              <span className="preview-check" aria-hidden="true" />
              <span>Record the project demo</span>
              <span className="preview-remove" aria-hidden="true">
                ×
              </span>
            </div>
            <div className="task-preview__progress">
              <div>
                <span>Project progress</span>
                <strong>33%</strong>
              </div>
              <span className="progress-track" aria-hidden="true">
                <span />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="project-facts" aria-label="Assignment at a glance">
        <div>
          <strong>{RUBRIC_TOTAL}</strong>
          <span>rubric points</span>
        </div>
        <div>
          <strong>{ASSIGNMENT_REQUIREMENTS.length}</strong>
          <span>core requirements</span>
        </div>
        <div>
          <strong>200–300</strong>
          <span>target lines of code</span>
        </div>
        <div>
          <strong>≤ 5</strong>
          <span>members per group</span>
        </div>
      </section>

      <section className="home-section" aria-labelledby="core-flow-title">
        <div className="home-section__heading">
          <div>
            <p className="section-heading__label">The core interaction loop</p>
            <h2 id="core-flow-title">Three actions. One clear experience.</h2>
          </div>
          <p>
            Every control should give immediate visual feedback so the list always reflects the
            current application state.
          </p>
        </div>
        <div className="feature-grid">
          <article>
            <span className="feature-number">01</span>
            <h3>Add a task</h3>
            <p>Read and validate the text field, create a task row, then clear the input.</p>
          </article>
          <article>
            <span className="feature-number">02</span>
            <h3>Mark it complete</h3>
            <p>Use a checkbox event to update the task state and its visual treatment.</p>
          </article>
          <article>
            <span className="feature-number">03</span>
            <h3>Remove it</h3>
            <p>Connect each Remove button to the correct task and refresh the list immediately.</p>
          </article>
        </div>
      </section>

      <section className="delivery-banner" aria-labelledby="delivery-title">
        <div>
          <p className="section-heading__label">Ready for submission</p>
          <h2 id="delivery-title">Build it, demonstrate it, package it.</h2>
          <p>
            Your final ZIP must include the full project and a screen recording that shows the
            source in the IDE, the running JavaFX interface, and real task interactions.
          </p>
        </div>
        <Link className="button-light" href="/requirements#submission">
          Open submission checklist
        </Link>
      </section>
    </main>
  );
}
