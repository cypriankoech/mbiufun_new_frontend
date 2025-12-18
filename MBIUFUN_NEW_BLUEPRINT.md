## Mbiufun New Frontend — The Builder’s Blueprint

> Angular 20, Standalone components, Tailwind finesse, and a respectful bow to the legacy API.

---

### 1) Architectural Overview

- Standalone components with a single route tree: `src/app/app.routes.ts`.
- `AuthGuard` protects `/app` subtree; `/login` and `/register` are public.
- PWA + Service Worker enabled; Firebase hosting targeted for builds.
- Styling via Tailwind; high‑contrast accessible UI.

---

### 2) Routing Topology

```15:46:/home/cyprian/Desktop/mbiufun/mbiufun-new-frontend/mbiufun-new-frontend/src/app/app.routes.ts
{ path: '', redirectTo: '/app', pathMatch: 'full' },
{ path: 'login', component: LoginComponent },
{ path: 'register', component: RegisterComponent },
{ path: 'app', component: TemplateComponent, canActivate: [AuthGuard], children: [
  { path: '', component: LandingComponent },
  { path: 'daily-dare', component: DailyDareComponent },
  { path: 'activities', component: ActivitiesComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'tutorial', component: TutorialComponent },
  { path: 'profile/:user_id', component: ProfileComponent },
  { path: 'profile/:user_id/history', component: ProfileHistoryComponent },
]}
```

---

### 3) Services & Cross‑Cutting

- `authentication.service.ts` — login/register; emits current user; stores token.
- Interceptors append tokens and handle 401/403 logout.
- `streak.service.ts` + `StreakDialogComponent` — post‑success rewards experience integrated in login/register flows.
- `feed.service.ts` — ports legacy unified feed.

---

### 4) Pages

- `LandingComponent`
  - Feature cards + unified feed preview (`FeedService` → `/api/v1/posts/unified_feed/`).
  - Vibes check (warn user to select vibes if empty).

- `LoginComponent` / `RegisterComponent`
  - Reactive forms with clear validation.
  - After success: show success feedback → streak dialog → route (login/register interop).

- Future build-outs (in progress/next):
  - Full feed page with pagination, like/unlike, comment counts.
  - Notifications, Groups, Daily Dare flows.

---

### 5) Patterns to Keep Sacred

- Payload shapes exactly match legacy (e.g., `{ user: { … } }` during registration).
- Dual headers when calling backend: `Authorization` + `mbiu-token`.
- All lists paginated with `page`, `per_page`; resilient empty/error states.

---

### 6) Developer Map

- Routes: `src/app/app.routes.ts`
- Auth:   `src/app/auth/*.ts`
- Dialogs: `src/app/components/dialogs/streak-dialog.component.ts`
- Services: `src/app/services/*.ts` (auth, streak, feed, api)
- Landing:  `src/app/pages/landing/landing.component.ts`

---

### 7) Next Construction Phases

1) Full Feed
   - Infinite scroll; like/unlike; comments badge; optimistic updates.
2) Notifications
   - List + mark read; small poll with backoff.
3) Daily Dare
   - Quiz retrieval/submit; friendly error/retry; summary screens.
4) Profiles
   - User page with history; settings & vibes management.

---

### Closing Note

This blueprint keeps the soul of the original experience while embracing Angular 20’s clarity. Strong seams, humane feedback, and respectful compatibility — a foundation ready for delightful features.








