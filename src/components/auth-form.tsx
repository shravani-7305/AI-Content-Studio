import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/app-shell";
import { Field } from "@/components/form-field";
import { authStore } from "@/lib/store";

/** Demo auth: stores user locally. Replace with a real auth provider later. */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (signup && !name.trim()) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    authStore.signIn({ name: signup ? name.trim() : (email.split("@")[0] ?? email), email });
    toast.success(signup ? "Account created!" : "Welcome back!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <Panel className="p-8">
        <h1 className="text-2xl font-bold">{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {signup ? "Start creating content with AI." : "Log in to continue creating."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {signup && (
            <Field label="Full name" htmlFor="name">
              <Input id="name" className="h-11 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          )}
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" className="h-11 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" type="password" className="h-11 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && (
            <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4" /> {error}
            </p>
          )}
          <Button type="submit" variant="ai" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} {signup ? "Sign Up" : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {signup ? "Already have an account? " : "Don't have an account? "}
          <Link to={signup ? "/login" : "/signup"} className="font-medium text-primary">
            {signup ? "Login" : "Sign up"}
          </Link>
        </p>
      </Panel>
    </div>
  );
}
