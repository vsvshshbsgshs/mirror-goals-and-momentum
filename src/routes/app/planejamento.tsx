import { createFileRoute } from "@tanstack/react-router";
import { PlannerPage } from "@/pages/planner/PlannerPage";

export const Route = createFileRoute("/app/planejamento")({
  head: () => ({
    meta: [
      { title: "Planejamento — Delux" },
      { name: "description", content: "Sua semana organizada com missões distribuídas com equilíbrio." },
      { property: "og:title", content: "Planejamento — Delux" },
      { property: "og:description", content: "Sua semana organizada com missões distribuídas com equilíbrio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});
