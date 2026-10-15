import { createFileRoute } from "@tanstack/react-router";
import { AssistantPage } from "@/pages/assistant/AssistantPage";

export const Route = createFileRoute("/app/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente — Delux" },
      { name: "description", content: "Seu mentor executivo com IA para destravar metas e rotinas." },
      { property: "og:title", content: "Assistente — Delux" },
      { property: "og:description", content: "Seu mentor executivo com IA para destravar metas e rotinas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantPage,
});
