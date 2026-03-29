import { Link } from "react-router-dom";
import type { Role } from "../../../types/auth";
import { SignInForm } from "./SignInForm";

const STAFF_LOGIN_ROLES: Role[] = ["employee", "admin"];

export default function EmployeeLoginPage() {
  return (
    <SignInForm
      allowedRoles={STAFF_LOGIN_ROLES}
      brandLinkToHome
      title="Staff sign in"
      description="Crew and operations: your jobs and dashboard."
      footer={
        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/forgot-password" className="text-accent">
            Forgot password?
          </Link>
          <span className="mt-3 block">
            Booking as a client?{" "}
            <Link to="/login/client" className="text-accent">
              Client sign in
            </Link>
            {" · "}
            <Link to="/register" className="text-accent">
              Register
            </Link>
          </span>
        </p>
      }
    />
  );
}
