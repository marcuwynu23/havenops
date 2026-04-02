import { Badge, Card, CardTitle, PageHeader } from "../../components/ui";
import { useAuthStore } from "../../store/authStore";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const roleLabel = user.role[0].toUpperCase() + user.role.slice(1);

  return (
    <>
      <PageHeader
        title="My account"
        description="Review your user details and linked account information."
      />

      <Card>
        <CardTitle>Account details</CardTitle>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="mb-1 text-xs uppercase tracking-wide text-muted">
              Email
            </dt>
            <dd className="break-all text-foreground">{user.email}</dd>
          </div>

          <div>
            <dt className="mb-1 text-xs uppercase tracking-wide text-muted">
              Role
            </dt>
            <dd>
              <Badge>{roleLabel}</Badge>
            </dd>
          </div>

          <div>
            <dt className="mb-1 text-xs uppercase tracking-wide text-muted">
              User ID
            </dt>
            <dd className="break-all text-foreground">{user.id}</dd>
          </div>

          <div>
            <dt className="mb-1 text-xs uppercase tracking-wide text-muted">
              Member since
            </dt>
            <dd className="text-foreground">{formatDateTime(user.created_at)}</dd>
          </div>
        </dl>
      </Card>

      {user.client_id || user.employee_id ? (
        <Card>
          <CardTitle>Linked profile</CardTitle>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {user.client_id ? (
              <div>
                <dt className="mb-1 text-xs uppercase tracking-wide text-muted">
                  Client profile ID
                </dt>
                <dd className="break-all text-foreground">{user.client_id}</dd>
              </div>
            ) : null}
            {user.employee_id ? (
              <div>
                <dt className="mb-1 text-xs uppercase tracking-wide text-muted">
                  Employee profile ID
                </dt>
                <dd className="break-all text-foreground">{user.employee_id}</dd>
              </div>
            ) : null}
          </dl>
        </Card>
      ) : null}
    </>
  );
}
