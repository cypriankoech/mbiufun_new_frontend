## AM-BACK — A Cartographer’s Atlas of the Backend Realm

> Django and DRF weaving tribes, games, posts, and players into a single living tapestry. This is the guided walk.

---

### I. Compass and Cartouche

- Root: `african_mbiu/`
- Entrypoint URLs:
```12:24:/home/cyprian/Desktop/mbiufun/am-back/african_mbiu/urls.py
urlpatterns = [
    path('admin/',admin.site.urls),
    path('api/admin/', include("am_admin.urls")),
    path('api/v1/', include("frontend.urls")),
    path('auth/', include('drf_social_oauth2.urls', namespace='drf')),
]
```
- API hub: `frontend/urls.py` delegates under `/api/v1/` to domain apps (users, posts, games, tribes, markets, points, questions, likes, comments, notifications, content, images, leagues, scoreboard, chat, search, settings).

---

### II. Tokens, Identity, and the Gates

- JWT via SimpleJWT: `/api/v1/token/`, `/token/refresh/`, `/token/verify/`.
- Social OAuth dance through `/auth/` (drf_social_oauth2).
- Production email flows embed API links:
```401:405:/home/cyprian/Desktop/mbiufun/am-back/african_mbiu/settings.py
HOME_URL='https://dev.mbiufun.com/'
ACTIVATE_URL='https://am.mbiufun.com/api/v1/user/'
API_URL='https://am.mbiufun.com/api/'
```
- Clients typically send both `Authorization: Bearer <jwt>` and `mbiu-token` for legacy compatibility.

---

### III. Provinces of the Realm (Domain Apps)

1) Users — `african_mbiu/users/front/`
   - Registration, login, profile, vibes selection, password/activation flows.
   - Password reset URLs formed server-side (see `users/front/views/user.py`).

2) Posts — `african_mbiu/posts/front/`
   - Unified Feed, Post Feed, Post Detail, Post creation.
```4:11:/home/cyprian/Desktop/mbiufun/am-back/african_mbiu/posts/front/urls.py
urlpatterns = [
    path("feed/", vw.PostFeed.as_view()),
    path("detail/<int:id>", vw.edit_post.as_view()),
    path('posts/', vw.PostFeed.as_view(), name='post-feed'),
    path("post/", vw.PostDetail.as_view()),
    path("unified_feed/", vw.UnifiedFeed.as_view()),
]
```

3) Games — `african_mbiu/games/front/`
   - Daily Dares, quizzes, match flow; Swagger/Postman bundled under `/api/v1/game/...`.
   - Docs: `games/complete_api_swagger.yaml`, `games/Complete_Mbiu_API.postman_collection.json`.

4) Social graph — `likes/`, `comments/`, `notifications/`
   - Likes toggle endpoints, comment CRUD/list, notification list/unread → read.

5) Economy and Culture — `tribes/`, `points/`, `market/`
   - Tribe membership and identity; points and streak rewards; marketplace endpoints.

6) Realms and Boards — `leagues/`, `scoreboard/`
   - Competitive structures and rankings.

7) Media — `images/` at `/api/v1/i/...`
   - Image proxies/serving for posts, avatars, and assets.

---

### IV. The Canon of Requests (Lifecycle)

1. Request enters at `/api/v1/...` with Bearer JWT (+ optional `mbiu-token`).
2. `african_mbiu.urls` → `frontend.urls` → specific `front/urls.py` → DRF CBV.
3. The view orchestrates serializers, services, models; response typically `{ data: ... }`.
4. 401/403 handled by clients; backend logs/stats enriched by django middleware.

---

### V. Glossary of Especially Useful Paths

- Auth: `/api/v1/token/`, `/api/v1/user/oauth2redirect`, `/auth/`.
- Feed: `/api/v1/posts/unified_feed/?page=1&per_page=25`.
- Post detail: `/api/v1/posts/detail/<id>`.
- Likes: `/api/v1/likes/...` (toggle, list by post).
- Comments: `/api/v1/comments/...` (list/create for post).
- Notifications: `/api/v1/notifications/...` (list, mark read).
- Daily Dare: `/api/v1/game/daily-dare/...` (quiz fetch/submit).
- Images: `/api/v1/i/image/<encoded>`.

---

### VI. Operators’ Notes (Production Behavior)

- Outgoing emails embed `ACTIVATE_URL` and password reset links (production URLs).
- Static docs available within `games/` for human‑readable API exploration.
- Local DB (`db.sqlite3`) exists for dev; deployed services point to remote DBs.

---

### VII. Integration Patterns (Frontend)

- Include both headers for safety:
  - `Authorization: Bearer <token>`
  - `mbiu-token: <token>`
- Paginate lists (`page`, `per_page`).
- Expect `data` arrays; some endpoints enrich with `room` objects.
- Handle 401/403 by redirecting to `/login`.

---

### Epilogue

This backend is a federation of focused apps, tightly braided by DRF. Think of it as a city whose districts are users, posts, games, and tribes; avenues are URLs; traffic rules are serializers and permissions. The rest is culture.








