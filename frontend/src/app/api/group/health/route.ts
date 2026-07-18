import { NextResponse } from "next/server";
import { apiHealthSchema } from "@/features/event-lab/contracts/interaction";
import { fetchGroupApi } from "@/lib/group-api/server-client";

export async function GET() {
  try {
    const response = await fetchGroupApi("/actuator/health");
    if (!response.ok) {
      return NextResponse.json(
        { message: "The group API health check failed." },
        { status: 503 },
      );
    }

    const health = apiHealthSchema.parse(await response.json());
    return NextResponse.json(health);
  } catch {
    return NextResponse.json(
      { message: "The group API is unavailable." },
      { status: 502 },
    );
  }
}
