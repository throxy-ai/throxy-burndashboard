import { ArrowUpRight, Inbox, Layers, Shield, Users } from "lucide-react";

const metrics = [
  {
    title: "Active campaigns",
    value: "12",
    delta: "+3 this week",
    icon: Layers,
  },
  {
    title: "People reached",
    value: "1,248",
    delta: "+18.4% reply rate",
    icon: Users,
  },
  {
    title: "Inbox follow-ups",
    value: "34",
    delta: "7 due today",
    icon: Inbox,
  },
];

const recent_activity = [
  "New workspace onboarding checklist completed",
  "Follow-up inbox now includes snooze + owner filters",
  "Client routing defaults updated for outbound campaigns",
];

interface DashboardHomeProps {
  userName?: string;
  userEmail?: string;
  role?: "user" | "admin";
  isAdmin?: boolean;
}

export function DashboardHome({
  userName = "Admin",
  userEmail = "admin@throxy.com",
  role = "admin",
  isAdmin = true,
}: DashboardHomeProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="rounded-none border bg-card p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Overview</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Team dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          This starter ships with the same navigation primitives used across Throxy projects: grouped sidebar
          navigation, collapsible nav items, workspace and client context switchers, account menu, and sidebar
          notifications.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-none border bg-background px-3 py-2 text-xs text-muted-foreground">
          <Shield className="size-3.5" />
          <span>{userName}</span>
          <span>({userEmail})</span>
          <span className="font-medium text-foreground">{role}</span>
          {isAdmin ? <span className="text-primary">admin access</span> : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.title} className="rounded-none border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <metric.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.delta}</p>
          </article>
        ))}
      </section>

      <section className="rounded-none border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent updates</h2>
          <button className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            View inbox
            <ArrowUpRight className="size-3" />
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {recent_activity.map((item) => (
            <li key={item} className="rounded-none border bg-background px-3 py-2 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
