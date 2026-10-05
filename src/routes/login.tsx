import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — AI Content Creator" },
      { name: "description", content: "Log in to AI Content Creator." },
      { property: "og:title", content: "Login — AI Content Creator" },
      { property: "og:description", content: "Log in to continue creating content with AI." },
    ],
  }),
  component: () => <AuthForm mode="login" />,
});
