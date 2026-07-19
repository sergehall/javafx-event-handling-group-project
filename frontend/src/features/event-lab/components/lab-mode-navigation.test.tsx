import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LabModeNavigation } from "@/features/event-lab/components/lab-mode-navigation";

describe("LabModeNavigation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("launches the local JavaFX application through the protected POST endpoint", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ status: "started", message: "JavaFX is starting." }, { status: 202 }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<LabModeNavigation activeMode="advanced" />);

    await user.click(screen.getByRole("button", { name: /Open JavaFX/ }));

    expect(await screen.findByText("JavaFX is starting.")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith("/api/local/desktop/start", {
      method: "POST",
      headers: { "X-JavaFX-Launcher": "web-lab" },
    });
  });

  it("shows a useful launcher error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ message: "The Maven wrapper could not be found." }, { status: 500 }),
        ),
    );
    const user = userEvent.setup();
    render(<LabModeNavigation activeMode="foundation" />);

    await user.click(screen.getByRole("button", { name: /Open JavaFX/ }));

    expect(await screen.findByText("The Maven wrapper could not be found.")).toBeVisible();
  });
});
