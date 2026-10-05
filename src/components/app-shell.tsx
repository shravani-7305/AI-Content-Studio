import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Home,
  PenLine,
  Search,
  History,
  LayoutDashboard,
  Info,
  LogIn,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { authStore, useUser } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/generator", label: "Content Generator", icon: PenLine },
  { to: "/seo", label: "SEO Assistant", icon: Search },
  { to: "/history", label: "History", icon: History },
  { to: "/about", label: "About", icon: Info },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-ai text-primary-foreground shadow-glow">
        <Sparkles className="size-5" />
      </span>
      <span className="font-display text-lg font-bold leading-none">AI Content Creator</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-primary! text-sidebar-primary-foreground!" }}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function UserBox() {
  const user = useUser();
  const navigate = useNavigate();
  if (!user)
    return (
      <Link
        to="/login"
        className="flex items-center justify-center gap-2 rounded-xl bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-sidebar-accent-foreground"
      >
        <LogIn className="size-4" /> Login / Sign Up
      </Link>
    );
  return (
    <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
      <span className="grid size-9 place-items-center rounded-full bg-gradient-ai font-semibold text-primary-foreground">
        {user.name[0]?.toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-sidebar-accent-foreground">{user.name}</p>
        <p className="truncate text-xs text-sidebar-foreground">{user.email}</p>
      </div>
      <button
        aria-label="Log out"
        onClick={() => {
          authStore.signOut();
          navigate({ to: "/" });
        }}
        className="text-sidebar-foreground hover:text-sidebar-accent-foreground"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 bg-sidebar p-4 lg:flex">
        <div className="[&_span.font-display]:text-sidebar-accent-foreground">
          <Logo />
        </div>
        <NavLinks />
        <div className="mt-auto">
          <UserBox />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-muted">
          <Menu className="size-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-sidebar p-4">
            <div className="flex items-center justify-between [&_span.font-display]:text-sidebar-accent-foreground">
              <Logo />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="text-sidebar-foreground">
                <X className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <UserBox />
            </div>
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon?: typeof Home }) {
  return (
    <div className="mb-8 flex items-start gap-4">
      {Icon && (
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-soft text-primary">
          <Icon className="size-6" />
        </span>
      )}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border bg-card p-5 shadow-card sm:p-6", className)}>{children}</div>;
}
