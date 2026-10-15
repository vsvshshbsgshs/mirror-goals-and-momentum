import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Delux" },
      { name: "description", content: "Receba um link seguro para redefinir sua senha Delux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});
