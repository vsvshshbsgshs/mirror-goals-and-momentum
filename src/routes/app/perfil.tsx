import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/pages/profile/ProfilePage";

export const Route = createFileRoute("/app/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil e configurações — Delux" },
      { name: "description", content: "Preferências de rotina, notificações e estilo do assistente." },
      { property: "og:title", content: "Perfil e configurações — Delux" },
      { property: "og:description", content: "Preferências de rotina, notificações e estilo do assistente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});
