import type { Metadata } from "next";
import Link from "next/link";
import {
  ASSIGNMENT_REQUIREMENTS,
  RUBRIC_ITEMS,
  RUBRIC_TOTAL,
} from "@/features/assignment/assignment-data";

export const metadata: Metadata = {
  title: "Assignment Requirements",
  description: "Requirements, grading rubric, and submission checklist for the JavaFX Task List.",
};

export default function RequirementsPage() {
  return (
    <main className="content-page requirements-page">
      <header className="hero hero--compact requirements-hero">
        <div className="hero__eyebrow">Project brief · Group assignment</div>
        <h1>Assignment Requirements</h1>
        <p>
          Create a simple JavaFX To-Do List that demonstrates layout management, event handling, and
          basic UI data manipulation.
        </p>
      </header>

      <section className="requirements-summary" aria-label="Assignment summary">
        <div>
          <span>Deliverable</span>
          <strong>JavaFX To-Do List</strong>
        </div>
        <div>
          <span>Rubric</span>
          <strong>{RUBRIC_TOTAL} points</strong>
        </div>
        <div>
          <span>Team size</span>
          <strong>Up to 5 members</strong>
        </div>
        <div>
          <span>Code target</span>
          <strong>200–300 lines</strong>
        </div>
      </section>

      <section
        className="assignment-section assignment-section--split"
        aria-labelledby="brief-title"
      >
        <div>
          <p className="section-heading__label">Description</p>
          <h2 id="brief-title">What you are building</h2>
        </div>
        <div className="prose-block">
          <p>
            The application needs a text field for entering tasks, an <strong>Add Task</strong>
            button, and a list view that displays every task. Each task must include a checkbox for
            completion and a <strong>Remove</strong> button.
          </p>
          <p>
            Adding, completing, and removing tasks must update the interface immediately. The goal
            is to apply JavaFX UI components and event handlers in a meaningful interactive project.
          </p>
          <aside className="group-callout">
            <span aria-hidden="true">G</span>
            <div>
              <strong>Group assignment</strong>
              <p>
                Groups are limited to five members. Find your team in Canvas under
                <em> People → Groups → Assignment: JavaFX group set</em>.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="assignment-section" aria-labelledby="requirements-title">
        <div className="assignment-section__heading">
          <div>
            <p className="section-heading__label">Build checklist</p>
            <h2 id="requirements-title">Seven implementation requirements</h2>
          </div>
          <Link className="inline-link" href="/materials">
            Review starter materials <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ol className="requirement-list">
          {ASSIGNMENT_REQUIREMENTS.map((requirement, index) => (
            <li key={requirement}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <p>{requirement}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="assignment-section" aria-labelledby="rubric-title">
        <div className="assignment-section__heading">
          <div>
            <p className="section-heading__label">Grading rubric</p>
            <h2 id="rubric-title">How the project earns {RUBRIC_TOTAL} points</h2>
          </div>
          <span className="rubric-total">{RUBRIC_TOTAL} pts total</span>
        </div>
        <div className="rubric-table-wrap">
          <table className="rubric-table">
            <caption className="sr-only">JavaFX Task List grading criteria</caption>
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                <th scope="col">Full marks</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {RUBRIC_ITEMS.map((item) => (
                <tr key={item.criterion}>
                  <th scope="row">{item.criterion}</th>
                  <td>{item.fullMarks}</td>
                  <td>
                    <strong>{item.points}</strong> {item.points === 1 ? "pt" : "pts"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={2}>
                  Total
                </th>
                <td>{RUBRIC_TOTAL} pts</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section
        id="submission"
        className="assignment-section submission-section"
        aria-labelledby="submission-title"
      >
        <div>
          <p className="section-heading__label">Final delivery</p>
          <h2 id="submission-title">Submission checklist</h2>
          <p>
            The recording is worth four points, so demonstrate the complete workflow clearly—not
            only the finished interface.
          </p>
        </div>
        <ol className="submission-steps">
          <li>
            <span>1</span>
            <div>
              <strong>Show the source</strong>
              <p>Open the JavaFX file in the IDE so the application code is visible.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Run and interact</strong>
              <p>Add, complete, and remove tasks while the recording is running.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Add the recording</strong>
              <p>Place the completed screen recording inside the project folder.</p>
            </div>
          </li>
          <li>
            <span>4</span>
            <div>
              <strong>Create the ZIP</strong>
              <p>Compress the entire project and submit the resulting ZIP in Canvas.</p>
            </div>
          </li>
        </ol>
      </section>
    </main>
  );
}
