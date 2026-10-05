import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — AI Content Creator" },
      { name: "description", content: "Create a free AI Content Creator account." },
      { property: "og:title", content: "Sign Up — AI Content Creator" },
      { property: "og:description", content: "Create an account and start generating content with AI." },
    ],
  }),
  component: () => <AuthForm mode="signup" />,
});
