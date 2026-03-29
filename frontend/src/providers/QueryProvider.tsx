import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { createAppQueryClient } from "../lib/createQueryClient";

type Props = { children: ReactNode };

export function QueryProvider({ children }: Props) {
  const [client] = useState(() => createAppQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
