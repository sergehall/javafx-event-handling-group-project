import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FoundationTaskLab } from "@/features/event-lab/components/foundation-task-lab";
import { installTaskApiMock } from "@/features/event-lab/testing/task-api-mock";

describe("FoundationTaskLab", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("adds tasks through the required input and button", async () => {
    const { fetchMock } = installTaskApiMock();
    const user = userEvent.setup();
    render(<FoundationTaskLab />);

    await screen.findByText("Connect add and remove handlers");

    await user.type(screen.getByLabelText("New task"), "Record the screen demo");
    await user.click(screen.getByRole("button", { name: "Add Task" }));

    expect(screen.getByText("Record the screen demo")).toBeVisible();
    expect(within(screen.getByLabelText("Foundation tasks")).getAllByRole("listitem")).toHaveLength(
      4,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/group/tasks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Record the screen demo" }),
      }),
    );
  });

  it("marks tasks completed and removes them", async () => {
    const { fetchMock } = installTaskApiMock();
    const user = userEvent.setup();
    render(<FoundationTaskLab />);

    await screen.findByText("Connect add and remove handlers");
    await user.click(
      screen.getByRole("checkbox", { name: 'Mark "Connect add and remove handlers" as completed' }),
    );
    expect(await screen.findByText("2/3 complete")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/group/tasks/2",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "COMPLETED" }),
      }),
    );

    await user.click(
      screen.getByRole("button", { name: 'Remove "Connect add and remove handlers"' }),
    );
    expect(screen.queryByText("Connect add and remove handlers")).not.toBeInTheDocument();
    expect(screen.getByText("1/2 complete")).toBeVisible();
  });

  it("validates blank and duplicate task titles", async () => {
    installTaskApiMock();
    const user = userEvent.setup();
    render(<FoundationTaskLab />);

    await screen.findByText("Design the JavaFX task layout");
    await user.click(screen.getByRole("button", { name: "Add Task" }));
    expect(screen.getByText("Enter a task before adding it.")).toBeVisible();

    await user.type(screen.getByLabelText("New task"), "design the javafx task layout");
    await user.click(screen.getByRole("button", { name: "Add Task" }));
    expect(screen.getByText("That task is already on the list.")).toBeVisible();
  });

  it("shows an offline state and disables database mutations", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")));
    render(<FoundationTaskLab />);

    expect(await screen.findByText("Database offline")).toBeVisible();
    expect(screen.getByRole("button", { name: "Add Task" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Retry" })).toBeEnabled();
  });
});
