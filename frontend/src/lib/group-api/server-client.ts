import { z } from "zod";

const DEFAULT_GROUP_API_URL = "http://127.0.0.1:8081";
const GROUP_API_TIMEOUT_MS = 5_000;

const baseUrlSchema = z
  .string()
  .url()
  .transform((value) => new URL(value))
  .refine((url) => url.protocol === "http:" || url.protocol === "https:", {
    message: "GROUP_API_BASE_URL must use HTTP or HTTPS.",
  })
  .refine((url) => url.username === "" && url.password === "", {
    message: "GROUP_API_BASE_URL must not contain credentials.",
  });

function getGroupApiBaseUrl(): URL {
  return baseUrlSchema.parse(process.env.GROUP_API_BASE_URL ?? DEFAULT_GROUP_API_URL);
}

export async function fetchGroupApi(path: `/${string}`, init: RequestInit = {}): Promise<Response> {
  const baseUrl = getGroupApiBaseUrl();
  const url = new URL(path, `${baseUrl.toString().replace(/\/$/, "")}/`);

  return fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(GROUP_API_TIMEOUT_MS),
  });
}
