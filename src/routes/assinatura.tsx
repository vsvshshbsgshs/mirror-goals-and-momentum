import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionPage } from "@/pages/subscription/SubscriptionPage";
import { ProtectedRoute } from "@/lib/auth-guard";

export const Route = createFileRoute("/assinatura")({
  head: () => ({
    meta: [
      { title: "Assinatura — Delux" },
      { name: "description", content: "Gerencie seu plano Delux." },
      { property: "og:title", content: "Assinatura — Delux" },
      { property: "og:description", content: "Gerencie seu plano Delux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <SubscriptionPage />
    </ProtectedRoute>
  ),
});
