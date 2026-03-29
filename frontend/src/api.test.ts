import { beforeEach, describe, expect, it, vi } from "vitest";
import { getClients } from "./api";
import type { Client } from "./types/models";

function okJson<T>(data: T): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve(data),
  } as Response;
}

describe("getClients", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("returns parsed clients", async () => {
    const rows: Client[] = [
      {
        id: "1",
        name: "Test",
        phone: "555",
        address: "Here",
        created_at: "2026-01-01T00:00:00Z",
      },
    ];
    vi.mocked(fetch).mockResolvedValue(okJson(rows));
    const out = await getClients();
    expect(out).toEqual(rows);
    expect(fetch).toHaveBeenCalledWith("/api/clients", {
      headers: { "Content-Type": "application/json" },
    });
  });

  it("throws on error response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: () => Promise.resolve({ error: "boom" }),
    } as Response);
    await expect(getClients()).rejects.toThrow("boom");
  });
});
