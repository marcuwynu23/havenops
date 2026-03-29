import { create } from "zustand";
import * as api from "../api";
import type { Client, Employee, Job } from "../types/models";

export type HavenOpsStore = {
  clients: Client[];
  employees: Employee[];
  jobs: Job[];
  listError: string | null;

  fetchLists: () => Promise<void>;
  refreshAll: () => Promise<void>;
};

export const useHavenOpsStore = create<HavenOpsStore>((set, get) => ({
  clients: [],
  employees: [],
  jobs: [],
  listError: null,

  fetchLists: async () => {
    set({ listError: null });
    try {
      const [clients, employees, jobs] = await Promise.all([
        api.getClients(),
        api.getEmployees(),
        api.getJobs(),
      ]);
      set({ clients, employees, jobs });
    } catch (e) {
      set({
        listError: e instanceof Error ? e.message : "Failed to load",
      });
    }
  },

  refreshAll: async () => {
    await get().fetchLists();
  },
}));
