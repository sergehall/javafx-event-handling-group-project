import { NextResponse } from "next/server";
import { z } from "zod";
import {
  interactionListSchema,
  interactionPayloadSchema,
  interactionResponseSchema,
} from "@/features/event-lab/contracts/interaction";
import { fetchGroupApi } from "@/lib/group-api/server-client";

const MAX_REQUEST_BYTES = 2_048;
const limitSchema = z.coerce.number().int().min(1).max(100);

function errorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function readUpstreamJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error("The group API returned invalid JSON.");
  }
}

export async function GET(request: Request) {
  const rawLimit = new URL(request.url).searchParams.get("limit") ?? "10";
  const parsedLimit = limitSchema.safeParse(rawLimit);
  if (!parsedLimit.success) {
    return errorResponse("Limit must be an integer between 1 and 100.", 400);
  }

  try {
    const response = await fetchGroupApi(
      `/api/v1/interactions?limit=${parsedLimit.data}`,
    );
    if (!response.ok) {
      return errorResponse("The group API rejected the history request.", 502);
    }

    const interactions = interactionListSchema.parse(
      await readUpstreamJson(response),
    );
    return NextResponse.json(interactions);
  } catch {
    return errorResponse("The group API is unavailable.", 502);
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return errorResponse("The request body is too large.", 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse("The request body could not be read.", 400);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return errorResponse("The request body is too large.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return errorResponse("The request body must be valid JSON.", 400);
  }

  const payload = interactionPayloadSchema.safeParse(body);
  if (!payload.success) {
    return errorResponse("The interaction payload is invalid.", 400);
  }

  try {
    const response = await fetchGroupApi("/api/v1/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.data),
    });
    if (!response.ok) {
      return errorResponse("The group API rejected the interaction.", 502);
    }

    const interaction = interactionResponseSchema.parse(
      await readUpstreamJson(response),
    );
    return NextResponse.json(interaction, { status: 201 });
  } catch {
    return errorResponse("The group API is unavailable.", 502);
  }
}
