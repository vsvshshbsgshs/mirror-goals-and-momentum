import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth/LoginPage";
import { PublicRoute } from "@/lib/auth-guard";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Delux" },
      { name: "description", content: "Acesse sua conta Delux e retome sua rotina de execução de metas." },
      { property: "og:title", content: "Entrar — Delux" },
      { property: "og:description", content: "Acesse sua conta Delux e retome sua rotina de execução de metas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  ),
});
