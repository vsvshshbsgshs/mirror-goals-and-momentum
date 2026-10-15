import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Delux — Desenvolvimento Pessoal & Execução de Metas" },
      {
        name: "description",
        content:
          "Transforme qualquer objetivo em um sistema de caminhos práticos passo a passo com planejamento inteligente e assistente de IA.",
      },
      { property: "og:title", content: "Delux — Desenvolvimento Pessoal & Execução de Metas" },
      {
        property: "og:description",
        content:
          "Transforme qualquer objetivo em um sistema de caminhos práticos passo a passo com planejamento inteligente e assistente de IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/app/inicio" });
  },
});
