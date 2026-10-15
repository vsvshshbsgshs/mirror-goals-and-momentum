import { createFileRoute } from "@tanstack/react-router";
import { NewGoalPage } from "@/pages/goals/NewGoalPage";

export const Route = createFileRoute("/app/objetivos/novo")({
  head: () => ({
    meta: [
      { title: "Novo objetivo — Delux" },
      { name: "description", content: "Crie um novo objetivo com plano gerado por IA." },
      { property: "og:title", content: "Novo objetivo — Delux" },
      { property: "og:description", content: "Crie um novo objetivo com plano gerado por IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewGoalPage,
});
