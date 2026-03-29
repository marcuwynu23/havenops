import { Link } from "react-router-dom";
import { SignInForm } from "./SignInForm";

export default function ClientLoginPage() {
  return (
    <SignInForm
      title="Client sign in"
      description="Access your bookings and job updates."
      footer={
        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/register" className="text-accent">
            Create a client account
          </Link>
          {" · "}
          <Link to="/forgot-password" className="text-accent">
            Forgot password?
          </Link>
          <span className="mt-3 block">
            Staff or manager?{" "}
            <Link to="/login/employee" className="text-accent">
              Staff sign in
            </Link>
          </span>
        </p>
      }
    />
  );
}
