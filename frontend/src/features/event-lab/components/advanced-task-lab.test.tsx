import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdvancedTaskLab } from "@/features/event-lab/components/advanced-task-lab";
import { installTaskApiMock } from "@/features/event-lab/testing/task-api-mock";

describe("AdvancedTaskLab", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds an active task with the selected priority", async () => {
    installTaskApiMock();
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await screen.findByText("Connect add and remove handlers");
    await user.type(screen.getByLabelText("New task"), "Write JUnit tests");
    await user.selectOptions(screen.getByLabelText("Task priority"), "HIGH");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(screen.getByText("Write JUnit tests")).toBeVisible();
    expect(screen.getByLabelText('Priority for "Write JUnit tests"')).toHaveValue("HIGH");
    expect(screen.getByLabelText('Status for "Write JUnit tests"')).toHaveValue("ACTIVE");
    expect(within(screen.getByLabelText("Task statistics")).getByText("4")).toBeVisible();
  });

  it("moves tasks into review and combines status and priority filters", async () => {
    installTaskApiMock();
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await screen.findByText("Connect add and remove handlers");
    await user.selectOptions(
      screen.getByLabelText('Status for "Connect add and remove handlers"'),
      "IN_REVIEW",
    );
    await user.click(screen.getByRole("button", { name: "In Review" }));

    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.getByText("Record the final walkthrough")).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Priority"), "MEDIUM");

    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();
    expect(screen.queryByText("Design the JavaFX task layout")).not.toBeInTheDocument();
  });

  it("edits priority and reapplies the active high-priority view", async () => {
    installTaskApiMock();
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await screen.findByText("Connect add and remove handlers");
    await user.selectOptions(
      screen.getByLabelText('Priority for "Connect add and remove handlers"'),
      "HIGH",
    );
    await user.click(screen.getByRole("button", { name: "Active" }));
    await user.selectOptions(screen.getByLabelText("Priority"), "HIGH");

    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.queryByText("Design the JavaFX task layout")).not.toBeInTheDocument();
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();
  });

  it("clears only completed tasks", async () => {
    installTaskApiMock();
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await screen.findByText("Connect add and remove handlers");
    await user.selectOptions(
      screen.getByLabelText('Status for "Connect add and remove handlers"'),
      "COMPLETED",
    );
    await user.click(screen.getByRole("button", { name: "Completed" }));

    expect(screen.getByText("Design the JavaFX task layout")).toBeVisible();
    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear completed" }));

    expect(screen.getByText("No tasks in this view.")).toBeVisible();
  });

  it("removes tasks and rejects duplicate titles", async () => {
    installTaskApiMock();
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await screen.findByText("Design the JavaFX task layout");
    await user.type(screen.getByLabelText("New task"), "Design the JavaFX task layout");
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByText("That task is already on the list.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: 'Remove "Record the final walkthrough"' }));
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();
  });
});
