/** Where to send unauthenticated users based on the route they tried to open. */
export function loginPathForProtectedRoute(pathname: string): string {
  if (pathname.startsWith("/portal")) return "/login/client";
  if (pathname.startsWith("/app")) return "/login/employee";
  if (pathname.startsWith("/dashboard")) return "/login/employee";
  return "/login";
}
