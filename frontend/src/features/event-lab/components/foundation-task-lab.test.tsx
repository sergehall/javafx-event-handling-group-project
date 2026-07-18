import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FoundationTaskLab } from "@/features/event-lab/components/foundation-task-lab";

describe("FoundationTaskLab", () => {
  it("adds tasks through the required input and button", async () => {
    const user = userEvent.setup();
    render(<FoundationTaskLab />);

    await user.type(screen.getByLabelText("New task"), "Record the screen demo");
    await user.click(screen.getByRole("button", { name: "Add Task" }));

    expect(screen.getByText("Record the screen demo")).toBeVisible();
    expect(within(screen.getByLabelText("Foundation tasks")).getAllByRole("listitem")).toHaveLength(
      3,
    );
  });

  it("marks tasks completed and removes them", async () => {
    const user = userEvent.setup();
    render(<FoundationTaskLab />);

    await user.click(
      screen.getByRole("checkbox", { name: 'Mark "Connect task event handlers" as completed' }),
    );
    expect(screen.getByText("2/2 complete")).toBeVisible();

    await user.click(screen.getByRole("button", { name: 'Remove "Connect task event handlers"' }));
    expect(screen.queryByText("Connect task event handlers")).not.toBeInTheDocument();
    expect(screen.getByText("1/1 complete")).toBeVisible();
  });

  it("validates blank and duplicate task titles", async () => {
    const user = userEvent.setup();
    render(<FoundationTaskLab />);

    await user.click(screen.getByRole("button", { name: "Add Task" }));
    expect(screen.getByText("Enter a task before adding it.")).toBeVisible();

    await user.type(screen.getByLabelText("New task"), "design the javafx layout");
    await user.click(screen.getByRole("button", { name: "Add Task" }));
    expect(screen.getByText("That task is already on the list.")).toBeVisible();
  });
});
