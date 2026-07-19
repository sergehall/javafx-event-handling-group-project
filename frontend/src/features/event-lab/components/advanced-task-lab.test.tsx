import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AdvancedTaskLab } from "@/features/event-lab/components/advanced-task-lab";

describe("AdvancedTaskLab", () => {
  it("adds an active task with the selected priority", async () => {
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await user.type(screen.getByLabelText("New task"), "Write JUnit tests");
    await user.selectOptions(screen.getByLabelText("Task priority"), "high");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(screen.getByText("Write JUnit tests")).toBeVisible();
    expect(screen.getByLabelText('Priority for "Write JUnit tests"')).toHaveValue("high");
    expect(screen.getByLabelText('Status for "Write JUnit tests"')).toHaveValue("active");
    expect(within(screen.getByLabelText("Task statistics")).getByText("4")).toBeVisible();
  });

  it("moves tasks into review and combines status and priority filters", async () => {
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await user.selectOptions(
      screen.getByLabelText('Status for "Connect add and remove handlers"'),
      "review",
    );
    await user.click(screen.getByRole("button", { name: "In Review" }));

    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.getByText("Record the final walkthrough")).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Priority"), "medium");

    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();
    expect(screen.queryByText("Design the JavaFX task layout")).not.toBeInTheDocument();
  });

  it("edits priority and reapplies the active high-priority view", async () => {
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await user.selectOptions(
      screen.getByLabelText('Priority for "Connect add and remove handlers"'),
      "high",
    );
    await user.click(screen.getByRole("button", { name: "Active" }));
    await user.selectOptions(screen.getByLabelText("Priority"), "high");

    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.queryByText("Design the JavaFX task layout")).not.toBeInTheDocument();
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();
  });

  it("clears only completed tasks", async () => {
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await user.selectOptions(
      screen.getByLabelText('Status for "Connect add and remove handlers"'),
      "completed",
    );
    await user.click(screen.getByRole("button", { name: "Completed" }));

    expect(screen.getByText("Design the JavaFX task layout")).toBeVisible();
    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear completed" }));

    expect(screen.getByText("No tasks in this view.")).toBeVisible();
  });

  it("removes tasks and rejects duplicate titles", async () => {
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await user.type(screen.getByLabelText("New task"), "Design the JavaFX task layout");
    await user.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByText("That task is already on the list.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: 'Remove "Record the final walkthrough"' }));
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();
  });
});
