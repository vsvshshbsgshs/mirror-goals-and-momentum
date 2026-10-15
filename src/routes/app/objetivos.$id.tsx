import { createFileRoute } from "@tanstack/react-router";
import { GoalDetailPage } from "@/pages/goals/GoalDetailPage";

export const Route = createFileRoute("/app/objetivos/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do objetivo — Delux" },
      { name: "description", content: "Etapas, missões e diagnóstico do seu objetivo." },
      { property: "og:title", content: "Detalhes do objetivo — Delux" },
      { property: "og:description", content: "Etapas, missões e diagnóstico do seu objetivo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GoalDetailPage,
});
