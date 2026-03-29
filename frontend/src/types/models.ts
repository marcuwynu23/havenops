export type JobStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "done"
  | "cancelled";

export type Client = {
  id: string;
  name: string;
  phone: string;
  address: string;
  /** WGS84 when set (from portal map picker). */
  latitude?: number;
  longitude?: number;
  created_at: string;
};

export type Employee = {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
};

export type Job = {
  id: string;
  client_id: string;
  assigned_employee_id?: string;
  service_type: string;
  scheduled_at: string;
  status: JobStatus;
  notes?: string;
  created_at: string;
};
