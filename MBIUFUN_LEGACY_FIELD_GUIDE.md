## Mbiufun Legacy — Field Guide for Explorers

> Angular 13. NgModules. A service-rich savannah where providers roam and pages migrate in herds.

---

### 1) Biome Overview

- Architecture: Angular v13, module‑based.
- Navigation: `app-routing.module.ts` + `pages.module.ts`.
- Services: `_services/` (authentication, feed, posts, games, notifications…)
- Helpers: `_helpers/` (auth guard, token interceptor, validators).

---

### 2) Service Ecosystem

- `authentication.ts` — Login/registration, token storage, user profile.
- `api.service.ts` — Thin wrapper over HttpClient; appends `mbiu-token`, builds query params, handles 401/403.
- `feed-provider.ts` — Unified feed orchestration.
```1:19:/home/cyprian/Desktop/mbiufun/mbiufun-legacy/src/app/_services/feed-provider.ts
export class FeedProvider {
  public postList:any[] = [];
  public page = 1; public per_page = 25; private request:any; public args:any;
  fetchPosts(){
    let url = 'api/v1/posts/unified_feed/?'+this.serialize(this.args);
    this.request = this.apiService.get(url);
    this.request.subscribe((data:any)=>{ if(data.data){ this.postList = data.data; } });
  }
}
```
- `post-provider.ts` — Room‑specific vs unified feeds, post detail.
- `comments_provider.ts`, `notifications_provider.ts`, `groups.service.ts` — Ancillary features.
- `streak.service.ts` — Streak and rewards calls.

---

### 3) Pages and Modules

- `pages/` packed via `pages.module.ts`, lazy‑routed; components draw from the providers above.
- `components/` module consolidates shared UI elements.
- Styles palette under `styles/` with tribe themes (ayande, kurwu, tagu, zatura).

---

### 4) Data Flows (Typical)

1. Guarded navigation enters a page component.
2. Component calls provider → `api.service.ts` GET/POST with `mbiu-token`.
3. Data returned as `{ data: … }` → bound to templates.
4. Interceptor/guard redirects to login on 401/403.

---

### 5) Parity Anchors for Migration

- Keep endpoint shapes exactly (e.g. registration payload `{ user: {...} }`).
- Maintain dual headers when possible (`Authorization` + `mbiu-token`).
- Preserve unified feed semantics (args, pagination) and streak dialogs.

---

### 6) Notable Paths

- Services: `src/app/_services/…`
- Helpers:  `src/app/_helpers/…`
- Models:   `src/app/_models/…`
- Posts:    `src/app/_services/post-provider.ts`
- Feed:     `src/app/_services/feed-provider.ts`

---

### 7) Migration Footnotes

- The legacy feed/services are straight maps to `/api/v1/...`; porting is largely renaming and adopting RxJS best practices.
- Token handling and query param serialization patterns are preserved in the new codebase.

---

### Postscript

This codebase is a reliable compass: its providers encode the platform’s API grammar. We honor it by keeping payloads, routes, and behaviors intact while modernizing the chassis.








