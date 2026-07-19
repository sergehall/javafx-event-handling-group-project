import { NextResponse } from "next/server";
import type { z } from "zod";
import { taskProblemSchema } from "@/features/event-lab/contracts/task";

const MAX_REQUEST_BYTES = 2_048;

type ParsedRequest<T> =
  Readonly<{ ok: true; data: T }> | Readonly<{ ok: false; response: NextResponse }>;

export function taskErrorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function parseTaskRequest<T>(
  request: Request,
  schema: z.ZodType<T>,
  invalidMessage: string,
): Promise<ParsedRequest<T>> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return { ok: false, response: taskErrorResponse("The request body is too large.", 413) };
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return {
      ok: false,
      response: taskErrorResponse("The request body could not be read.", 400),
    };
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return { ok: false, response: taskErrorResponse("The request body is too large.", 413) };
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return {
      ok: false,
      response: taskErrorResponse("The request body must be valid JSON.", 400),
    };
  }

  const parsed = schema.safeParse(body);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, response: taskErrorResponse(invalidMessage, 400) };
}

export async function proxyTaskJson<T>(
  response: Response,
  schema: z.ZodType<T>,
  successStatus = response.status,
): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return taskErrorResponse("The group API returned an unreadable task response.", 502);
  }

  if (!response.ok) {
    const problem = taskProblemSchema.safeParse(body);
    const message = problem.success
      ? problem.data.detail
      : "The group API rejected the task request.";
    const safeStatus = response.status >= 400 && response.status < 500 ? response.status : 502;
    return taskErrorResponse(message, safeStatus);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return taskErrorResponse("The group API returned an invalid task response.", 502);
  }

  return NextResponse.json(parsed.data, { status: successStatus });
}
