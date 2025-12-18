## Mbiufun — System Atlas

> A living map of the platform: frontend (legacy → modern), backend (Django/DRF), and the arteries that connect them. ✨

---

### 1) Constellations at a glance

```
┌────────────────────────┐     HTTPS (Bearer + mbiu-token)      ┌───────────────────────────────┐
│  Mbiufun New Frontend  │ ─────────────────────────────────────▶│  Backend API (/api/v1/ …)     │
│  Angular 20, Standalone│                                      │  Django + DRF                 │
│  Tailwind, PWA         │◀─────────────────────────────────────┤  JWT + drf_social_oauth2      │
└────────────────────────┘            JSON responses             └───────────────────────────────┘
        ▲         
        │ evolves from
        │
┌────────────────────────┐
│  Legacy Frontend       │
│  Angular 13, NgModules │
└────────────────────────┘
```

---

### 2) Frontend evolution (legacy → modern)

- **Legacy (Angular 13)**
  - NgModule architecture: `app.module.ts`, `pages.module.ts`, routing via `app-routing.module.ts`.
  - Rich service layer under `_services/` (e.g., `authentication.ts`, `feed-provider.ts`, `streak.service.ts`).
  - Provides unified feed, posts, likes, comments, notifications.

- **Modern (Angular 20, Standalone)**
  - Standalone components and a single `app.routes.ts` tree with `AuthGuard` on `/app`.
  - Polished auth flow (login/register), post-success streak dialog, and high-contrast UI.
  - PWA enabled, Tailwind styling, modular services. New `FeedService` ports the legacy unified feed.

Key route map (current):

```
/login, /register
/app  (guarded)
  ├─ '' (Landing)
  ├─ daily-dare
  ├─ activities
  ├─ groups
  ├─ notifications
  ├─ tutorial
  └─ profile/:user_id (+ /history)
```

---

### 3) Backend anatomy (Django + DRF)

- **Root router**

  `/african_mbiu/urls.py` delegates:
  - `/api/v1/` → `frontend.urls` (the API hub)
  - `/auth/`   → `drf_social_oauth2` (social OAuth)
  - `/api/admin/` → internal admin API

- **API hub**

  `frontend/urls.py` fans out under `/api/v1/…` to domain apps:
  - `user/` `game/` `payment/` `tribe/` `market/` `point/` `questions/`
  - `posts/` `comments/` `likes/` `notifications/` `content/` `images/`
  - `leagues/` `scoreboard/` `chat/` `search/` `settings/`

- **Auth & tokens**
  - JWT endpoints: `/api/v1/token/`, `/token/refresh/`, `/token/verify/`.
  - Social OAuth under `/auth/`.
  - Production activation/password flows embed `/api/v1/user/…` links.

- **Posts & unified feed**

  `african_mbiu/posts/front/urls.py`:

  - `GET /api/v1/posts/unified_feed/` — primary timeline source
  - `GET /api/v1/posts/feed/` — room-specific feeds
  - `GET /api/v1/posts/detail/<id>` — a single post
  - `POST /api/v1/posts/post/` — create/retrieve detail (depending on view logic)

- **Games & Dares**
  - Swagger and Postman docs are shipped in-repo (`games/complete_api_swagger.yaml`, `Complete_Mbiu_API.postman_collection.json`), all rooted at `/api/v1/game/…`.

---

### 4) The request lifecycle

1. Angular makes a call to `/api/v1/<module>/…` with headers:
   - `Authorization: Bearer <jwt>`
   - `mbiu-token: <jwt>` (maintained for legacy compatibility)
2. Django routes via `african_mbiu.urls` → `frontend.urls` → the specific `front/urls.py`.
3. DRF view handles logic, serializers hydrate data → JSON response (commonly `{ data: … }`).
4. Interceptors on the frontend handle 401/403 to logout/recover.

---

### 5) Feature parity tracker (you are here)

- ✅ Auth: login/register; post-success streak dialog; guard on `/app`.
- ✅ Feed preview in Landing: ports `unified_feed` and displays initial items.
- ◻️ Full feed page: infinite scroll, like/unlike, comment counts, share.
- ◻️ Notifications page: port endpoints and real-time-style polling.
- ◻️ Groups: list/join/view flows.
- ◻️ Daily Dare: read/submit flows + quiz endpoints.
- ◻️ Profiles & settings: user page parity (history, vibes, etc.).

---

### 6) Developer shortcuts

- Base URLs

  - Production API: `https://am.mbiufun.com/api/v1/`
  - Dev (local):    `http://localhost:8000/api/v1/`

- Tokens

  - Obtain: `POST /api/v1/token/ { username, password }`
  - Refresh: `POST /api/v1/token/refresh/ { refresh }`

- Feed

  - `GET /api/v1/posts/unified_feed/?page=1&per_page=10`
  - Response shape: `{ data: [...], room?: {...} }`

---

### 7) Next moves (high impact → quick wins)

1) Elevate Feed Preview → Full Feed
   - Paginate/infinite scroll (append `page`, `per_page`).
   - Actions: like/unlike (wire `likes/`), optimistic UI updates, toasts.
   - Basic comments badge using `comments/` counts.

2) Notifications
   - Port `notifications/front/urls.py` endpoints, list/filter/unread → read.
   - Small polling (or manual refresh) with subtle UX.

3) Daily Dare
   - Hook `game/daily-dare` quiz flows from the shipped Swagger/Postman.

4) Profile & Settings
   - User profile details, history, vibes; reuse streak and points information.

---

### 8) Design language — the “feel” we’re keeping

- Crisp, high-contrast surfaces on teal gradients (brand color `#70AEB9`).
- Motion used sparingly: dialogs, micro toasts, gentle hover/focus.
- Accessibility first: readable text, visible focus, touch-friendly targets.

---

### Appendix — Where things live

- Frontend (modern): `mbiufun-new-frontend/mbiufun-new-frontend/`
  - Routing: `src/app/app.routes.ts`
  - Feed service: `src/app/services/feed.service.ts`
  - Landing (feed preview): `src/app/pages/landing/landing.component.ts`

- Backend (API): `am-back/`
  - Root router: `african_mbiu/urls.py`
  - API hub: `frontend/urls.py`
  - Posts: `african_mbiu/posts/front/urls.py`
  - Swagger/Postman: `games/complete_api_swagger.yaml`, `games/Complete_Mbiu_API.postman_collection.json`

---

> If the platform were a city: Django is the street grid, DRF the bus lines, Angular the lively storefronts, and Tailwind the paint on the walls. We’re renovating block‑by‑block, keeping the old soul while adding modern light. 🌆








