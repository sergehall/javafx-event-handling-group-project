import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AdvancedTaskLab } from "@/features/event-lab/components/advanced-task-lab";

describe("AdvancedTaskLab", () => {
  it("adds a prioritized task and updates the summary", async () => {
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await user.type(screen.getByLabelText("New task"), "Write JUnit tests");
    await user.selectOptions(screen.getByLabelText("Priority"), "high");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(screen.getByText("Write JUnit tests")).toBeVisible();
    expect(screen.getAllByText("high priority")).toHaveLength(2);
    expect(within(screen.getByLabelText("Task statistics")).getByText("4")).toBeVisible();
  });

  it("toggles completion and filters the task list", async () => {
    const user = userEvent.setup();
    render(<AdvancedTaskLab />);

    await user.click(
      screen.getByRole("checkbox", { name: 'Mark "Connect add and remove handlers" as completed' }),
    );
    await user.click(screen.getByRole("button", { name: "Completed" }));

    expect(screen.getByText("Design the JavaFX task layout")).toBeVisible();
    expect(screen.getByText("Connect add and remove handlers")).toBeVisible();
    expect(screen.queryByText("Record the final walkthrough")).not.toBeInTheDocument();
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
