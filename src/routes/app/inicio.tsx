import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";

export const Route = createFileRoute("/app/inicio")({
  head: () => ({
    meta: [
      { title: "Início — Delux" },
      { name: "description", content: "Seu painel de execução: missões do dia, progresso e próximos passos." },
      { property: "og:title", content: "Início — Delux" },
      { property: "og:description", content: "Seu painel de execução: missões do dia, progresso e próximos passos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPage,
});
