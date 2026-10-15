import { createFileRoute } from "@tanstack/react-router";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { ProtectedRoute } from "@/lib/auth-guard";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Comece sua jornada — Delux" },
      { name: "description", content: "Configure sua rotina e seu primeiro objetivo no Delux." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  ),
});
