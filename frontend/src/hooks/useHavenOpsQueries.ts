import { useQuery } from "@tanstack/react-query";
import { getClients, getEmployees, getJobs } from "../api";
import { queryKeys } from "../lib/queryKeys";

export function useClientsQuery() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: getClients,
  });
}

export function useEmployeesQuery() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: getEmployees,
  });
}

export function useJobsQuery() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: () => getJobs(),
  });
}
