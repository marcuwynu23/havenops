import type { Client, Employee, Job, JobStatus } from "./types/models";
import type { AuthUser } from "./types/auth";

export type { Client, Employee, Job, JobStatus } from "./types/models";
export type { AuthUser, Role } from "./types/auth";

const prefix = "/api";

let bearerToken: string | null = null;

export function setAuthToken(token: string | null) {
  bearerToken = token;
  if (typeof localStorage === "undefined") return;
  if (token) localStorage.setItem("havenops_token", token);
  else localStorage.removeItem("havenops_token");
}

export function getAuthToken() {
  return bearerToken;
}

function jsonHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (bearerToken) h.Authorization = `Bearer ${bearerToken}`;
  return h;
}

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    return j.error ?? res.statusText;
  } catch {
    return res.statusText;
  }
}

async function readJSON<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

export async function authRegister(body: {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
}): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${prefix}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON(res);
}

export async function authLogin(body: {
  email: string;
  password: string;
}): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${prefix}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON(res);
}

export async function authMe(): Promise<AuthUser> {
  const res = await fetch(`${prefix}/auth/me`, { headers: jsonHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON(res);
}

export async function authRecoveryRequest(email: string): Promise<{
  message: string;
  recovery_token?: string;
}> {
  const res = await fetch(`${prefix}/auth/recovery/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON(res);
}

export async function authRecoveryReset(
  token: string,
  new_password: string,
): Promise<{ message: string }> {
  const res = await fetch(`${prefix}/auth/recovery/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON(res);
}

export async function getClients(): Promise<Client[]> {
  const res = await fetch(`${prefix}/clients`, { headers: jsonHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON<Client[]>(res);
}

export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch(`${prefix}/employees`, { headers: jsonHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON<Employee[]>(res);
}

export async function createEmployee(body: {
  name: string;
  phone: string;
  email: string;
  password: string;
  is_active?: boolean;
}): Promise<Employee> {
  const res = await fetch(`${prefix}/employees`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON<Employee>(res);
}

export async function setEmployeeActive(
  id: string,
  is_active: boolean,
): Promise<Employee> {
  const res = await fetch(`${prefix}/employees/${id}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ is_active }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON<Employee>(res);
}

export async function getJobs(employeeId?: string): Promise<Job[]> {
  const q = employeeId
    ? `?employee_id=${encodeURIComponent(employeeId)}`
    : "";
  const res = await fetch(`${prefix}/jobs${q}`, { headers: jsonHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON<Job[]>(res);
}

export async function createJob(body: {
  client_id: string;
  service_type: string;
  scheduled_at: string;
  notes?: string;
}): Promise<Job> {
  const res = await fetch(`${prefix}/jobs`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON<Job>(res);
}

export async function patchJobStatus(
  id: string,
  status: JobStatus,
): Promise<Job> {
  const res = await fetch(`${prefix}/jobs/${id}/status`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON<Job>(res);
}

export async function patchJobAssign(
  id: string,
  employee_id: string | null,
): Promise<Job> {
  const res = await fetch(`${prefix}/jobs/${id}/assign`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ employee_id }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return readJSON<Job>(res);
}
