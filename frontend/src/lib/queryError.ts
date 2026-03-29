export function queryErrorMessage(...errors: unknown[]): string | null {
  for (const e of errors) {
    if (e instanceof Error) return e.message;
  }
  return null;
}
