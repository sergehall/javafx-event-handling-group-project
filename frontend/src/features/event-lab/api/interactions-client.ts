import {
  apiHealthSchema,
  apiMessageSchema,
  interactionListSchema,
  interactionPayloadSchema,
  interactionResponseSchema,
  type ApiHealth,
  type InteractionPayload,
  type InteractionResponse,
} from "@/features/event-lab/contracts/interaction";

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error("The server returned an unreadable response.");
  }
}

async function requireSuccessfulResponse(response: Response): Promise<unknown> {
  const body = await readJson(response);
  if (response.ok) {
    return body;
  }

  const parsedMessage = apiMessageSchema.safeParse(body);
  throw new Error(
    parsedMessage.success
      ? parsedMessage.data.message
      : "The API request was not successful.",
  );
}

export async function getApiHealth(): Promise<ApiHealth> {
  const response = await fetch("/api/group/health", { cache: "no-store" });
  return apiHealthSchema.parse(await requireSuccessfulResponse(response));
}

export async function getRecentInteractions(
  limit = 10,
): Promise<InteractionResponse[]> {
  const response = await fetch(`/api/group/interactions?limit=${limit}`, {
    cache: "no-store",
  });
  return interactionListSchema.parse(await requireSuccessfulResponse(response));
}

export async function createInteraction(
  payload: InteractionPayload,
): Promise<InteractionResponse> {
  const validatedPayload = interactionPayloadSchema.parse(payload);
  const response = await fetch("/api/group/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedPayload),
  });
  return interactionResponseSchema.parse(
    await requireSuccessfulResponse(response),
  );
}
