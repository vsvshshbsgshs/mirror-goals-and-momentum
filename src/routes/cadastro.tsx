import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { PublicRoute } from "@/lib/auth-guard";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — Delux" },
      { name: "description", content: "Crie sua conta Delux e transforme objetivos em planos práticos." },
      { property: "og:title", content: "Criar conta — Delux" },
      { property: "og:description", content: "Crie sua conta Delux e transforme objetivos em planos práticos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PublicRoute>
      <RegisterPage />
    </PublicRoute>
  ),
});
