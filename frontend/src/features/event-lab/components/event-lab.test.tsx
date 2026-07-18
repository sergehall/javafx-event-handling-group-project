import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventLab } from "@/features/event-lab/components/event-lab";

const savedGreeting = {
  id: 1,
  type: "GREETING",
  message: "Hello, Ada!",
  xCoordinate: null,
  yCoordinate: null,
  createdAt: "2026-07-18T12:00:00Z",
} as const;

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}

describe("EventLab", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockImplementation(async (input, init) => {
      const url = requestUrl(input);
      if (url.endsWith("/health")) {
        return Response.json({ status: "UP" });
      }
      if (init?.method === "POST") {
        return Response.json(savedGreeting, { status: 201 });
      }
      return Response.json([]);
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows the API state and an empty history", async () => {
    render(<EventLab />);

    expect(await screen.findByText("No saved events yet.")).toBeVisible();
    expect(screen.getByText("API online")).toBeVisible();
  });

  it("greets the user and sends the observable event contract", async () => {
    const user = userEvent.setup();
    render(<EventLab />);
    await screen.findByText("No saved events yet.");

    await user.type(screen.getByLabelText("Name"), "  Ada  ");
    await user.click(screen.getByRole("button", { name: "Say hello" }));

    expect(screen.getByText("Hello, Ada!")).toBeVisible();
    expect(await screen.findByText("Event saved by the API.")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/group/interactions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ type: "GREETING", message: "Hello, Ada!" }),
      }),
    );
  });

  it("keeps the local lab usable when the API is offline", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<EventLab />);
    const playground = screen.getByRole("button", {
      name: /Record a canvas click/,
    });
    vi.spyOn(playground, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 320,
      height: 240,
      top: 0,
      right: 320,
      bottom: 240,
      left: 0,
      toJSON: () => ({}),
    });

    fireEvent.click(playground, { detail: 0 });

    expect(screen.getByText("Canvas click #1 at (160, 120)")).toBeVisible();
    expect(playground).toHaveStyle("--marker-x: 50%; --marker-y: 50%");
    expect(
      await screen.findByText("Local event completed, but the API could not save it."),
    ).toBeVisible();
  });

  it("validates an empty name without sending a write request", async () => {
    const user = userEvent.setup();
    render(<EventLab />);
    await screen.findByText("No saved events yet.");

    await user.click(screen.getByRole("button", { name: "Say hello" }));

    expect(screen.getByLabelText("Name")).toBeInvalid();
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription("Please enter your name.");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
