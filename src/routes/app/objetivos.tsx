import { createFileRoute } from "@tanstack/react-router";
import { GoalsListPage } from "@/pages/goals/GoalsListPage";

export const Route = createFileRoute("/app/objetivos")({
  head: () => ({
    meta: [
      { title: "Objetivos — Delux" },
      { name: "description", content: "Todos os seus objetivos com etapas e missões detalhadas." },
      { property: "og:title", content: "Objetivos — Delux" },
      { property: "og:description", content: "Todos os seus objetivos com etapas e missões detalhadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GoalsListPage,
});
