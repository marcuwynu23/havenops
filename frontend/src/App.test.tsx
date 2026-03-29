import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string | Request) => {
        const u = typeof url === "string" ? url : url.url;
        if (u.includes("/clients")) return Promise.resolve(jsonOk([]));
        if (u.includes("/employees")) return Promise.resolve(jsonOk([]));
        if (u.includes("/jobs")) return Promise.resolve(jsonOk([]));
        return Promise.resolve(jsonOk([]));
      }),
    );
  });

  it("shows landing for unauthenticated users at /", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /Operations software built for residential cleaning teams/i,
        }),
      ).toBeInTheDocument();
    });
  });

  it("shows sign-in at /login", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Sign in" }),
      ).toBeInTheDocument();
    });
  });
});

function jsonOk(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as Response;
}
