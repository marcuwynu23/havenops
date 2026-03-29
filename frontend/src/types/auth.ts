export type Role = "admin" | "employee" | "client";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  client_id?: string;
  employee_id?: string;
  created_at: string;
};
