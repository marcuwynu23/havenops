import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Client } from "../types/models";
import { setAuthToken } from "../api";
import { useHavenOpsStore } from "./havenopsStore";

function okJson<T>(data: T): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve(data),
  } as Response;
}

describe("useHavenOpsStore", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    setAuthToken(null);
    useHavenOpsStore.setState({
      clients: [],
      employees: [],
      jobs: [],
      listError: null,
    });
  });

  it("fetchLists fills clients, employees, jobs", async () => {
    const client: Client = {
      id: "c1",
      name: "Acme",
      phone: "",
      address: "",
      created_at: "t",
    };
    vi.mocked(fetch)
      .mockResolvedValueOnce(okJson([client]))
      .mockResolvedValueOnce(okJson([]))
      .mockResolvedValueOnce(okJson([]));

    await useHavenOpsStore.getState().fetchLists();

    const s = useHavenOpsStore.getState();
    expect(s.clients).toEqual([client]);
    expect(s.employees).toEqual([]);
    expect(s.jobs).toEqual([]);
    expect(s.listError).toBeNull();
  });
});
