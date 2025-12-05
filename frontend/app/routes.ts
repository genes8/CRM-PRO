import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("components/layout/AppLayout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("contacts", "routes/contacts.tsx"),
    route("deals", "routes/deals.tsx"),
    route("tasks", "routes/tasks.tsx"),
    route("analytics", "routes/analytics.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
