# 🌈 Mbiufun: The Complete In-App Journey

*A branching, living experience—screen by screen, tap by tap.*

---

## 0) First Impressions — **Splash & Welcome**

When the user opens Mbiufun for the very first time, they encounter a polished **splash screen**. It instantly establishes brand identity and sets the mood (color palette, logo, subtle animation).

**Options presented:**
- **Create Account** (primary CTA)
- **Sign In** (secondary CTA)
- **Learn More** (about Mbiufun – modal or carousel)
- **Language Selector** (if localized)

**Branching choices:**
- ➡️ Tap **Create Account** → proceed to **Sign Up** flow.
- ➡️ Tap **Sign In** → proceed to **Login** flow.
- ➡️ Tap **Learn More** → open a brief intro carousel of features.
- ➡️ Switch **Language** → persist choice for entire app.

---

## 1) Account Creation — **Sign Up Flow**

**Purpose:** Allow the user to set up an account seamlessly and enter Mbiufun with clarity and security.

### Step-by-step:
1. **Choose method:** Phone (OTP), Email (verification), or Social (Google/Apple).
   - Terms & Conditions + Privacy consent checkbox (required).
2. **Verify identity:**
   - Phone: enter OTP (auto-read if possible).
   - Email: magic link or code entry.
   - Social: accept token and show confirmation.
3. **Profile basics:**
   - Name, @handle (availability check), avatar (optional at this stage).
   - Short bio (≤ 120 characters, optional).
4. **Location & timezone (optional):**
   - Used to tailor events & nudges.
   - Skip option available.
5. **Permissions primer:** Explain why notifications, camera, and location are requested. Permissions are asked contextually later.
6. **Hobbies onboarding:** User picks up to **5 hobbies**. Chips with search capability. Micro-previews show feed personalization.
7. **Friend graph (optional):**
   - Search by handle, import contacts (if supported).
   - Share profile link/QR.
   - Option to skip.

**Branching choices:**
- ✅ Complete setup → Home (Activities Tab).
- ⏭ Skip hobbies → Default feed shown, plus prompt to add hobbies.
- ❌ Decline permissions → App still usable, with limited functionality.

---

## 2) Returning Users — **Login Flow**

**Methods:**
- Phone OTP, Email + password/magic link, Google/Apple.
- "Forgot password?" → two steps max.

**Edge handling:**
- New device → confirm with secondary factor if suspicious.
- Multiple sessions → allowed, with session management in Settings.

**Outcome:** User lands on **Home → Activities Tab**, with preserved scroll position.

---

## 3) Global Navigation Frame

**Top App Bar:**
- **Hamburger Menu (☰)** → side drawer.
- Title: *Mbiufun* or current section.
- **Search** (global posts/people/events).
- **Notifications bell** (badge).

**Side Drawer:**
- Profile.
- Notifications.
- Help & Support (moved here, redesigned to match menu).
- About.
- Settings.
- Log out.

**Bottom Navigation:**
- Home (Activities).
- Compass.
- Bubble (compose shortcut).
- Kumbu (history/archive).

---

## 4) Home — **Activities Tab: Hobby + Friends Feed**

**Feed structure:**
- Posts from chosen hobbies **AND** all posts from friends (friend override).
- Each card: avatar, name, timestamp, hobby chip, caption, image (optional), action menu.

**Composer:**
- Inline bar or floating action button.
- Caption + image + hobby selector.
- **AI caption suggestions** (2–3 fun options).
- Hard cap of **5 active posts** per user.

**Filters & chips:**
- *All* (default).
- Hobby chips (narrow down to one hobby).
- Friend posts outside filter still surface with a **"Friend Post" pill.**

**Loading & pagination:**
- Infinite scroll, cursor-based pagination.
- "You’re all caught up" footer.
- "New posts available" snackbar.

**Empty states:**
- No hobbies chosen → prompt to pick hobbies.
- No posts → "Be the first to post!"

**Branching options:**
- ➡️ Compose post with AI help.
- ➡️ Filter feed by hobby.
- ➡️ Engage with posts.
- ➡️ Discover scraped event cards (see Section 6).

---

## 5) Compass — **The Friendship Horn Experience**

### 5.1 Horn Blast
- User taps Loud 🔊, Medium 📯, or Soft 🌫️.
- Animation + sound feedback.
- Debounced buttons (no double taps).

### 5.2 AI Readings + Suggestions
- After blast, a card appears with:
  - **Reading text** (AI-generated).
  - **Suggestions/CTAs**: e.g., Start Dare, Plan Vibe, Write Note.
  - Optional **badge chip** if milestone achieved.
- Confetti or animation for Loud blasts.

### 5.3 Nudges
- Banner appears if:
  - A week has passed since last check-in.
  - No recent activity with a friend.
  - After a Dare/Vibe/League completion.
- CTA deep-links to Compass(friend_id).

### 5.4 Bond Path Timeline
- Scrollable colored timeline.
- Shows horn intensity history.
- Filters: 1/3/6 months.
- Mini metrics: Avg vibe, streaks.

**Branching options:**
- ➡️ Blow the horn.
- ➡️ Follow a suggestion CTA.
- ➡️ Review timeline.
- ➡️ Respond or dismiss nudges.

**Privacy:**
- Only friendship participants can see Compass data.
- Unauthorized access → neutral message: "This page isn’t available."

---

## 6) Web Scraping Integration — **Real-World Bridge**

**Purpose:** Connect hobbies to real events.

**Examples:**
- Movies → cinema showtimes.
- Sports → local games.
- Hiking → meetup trails.
- Photography → photo walks.
- Coding → hackathons.

**UI behaviors:**
- Event cards show date, time, and link.
- "See Details" opens external link.
- Fallback copy if scraping fails (e.g., "Pick a film from your watchlist?").

**Branching options:**
- ➡️ Tap event → details.
- ➡️ Save event → personal plan.
- ➡️ Share event with friends.

---

## 7) AI in Bubbles & Captions

**Composer (Activities):**
- "✨ Suggest caption" button.
- 2–3 AI suggestions appear inline.
- User can edit or accept.

**Conversation Starters:**
- Above composer, starter chips appear.
- Suggestions personalized to hobbies.
- Actions: tap → prefill, long-press → pin, shuffle → refresh.

**Branching options:**
- ➡️ Accept suggestion.
- ➡️ Pin favorite.
- ➡️ Shuffle for more.

---

## 8) Notifications

**Types:**
- Post interactions.
- Friend highlights.
- Compass nudges & badges.
- Event updates.

**Controls:**
- Per-category toggle.
- Digest mode.
- Quiet hours respected.

**Branching options:**
- Tap → deep-link into exact view (post, friend Compass, event).

---

## 9) Profile & History

**Profile:**
- Avatar, handle, bio.
- Display hobbies, earned badges.
- Quick edit buttons.
- Link to **Kumbu** (history/archive).

**History/Kumbu:**
- Archive of posts, Compass actions, dares.
- Personal record of growth & connection.

---

## 10) Settings & Support

**Settings:**
- Account: email/phone, sessions.
- Privacy: block/mute, post visibility.
- Notifications: categories, quiet hours.
- Data: export, delete account.
- Language.

**Help & Support (hamburger):**
- Article library.
- Badge indicator if new help items.
- Contact support form.

---

## 11) Search & Discovery

**Global search:**
- Query across posts, people, hobbies, events.
- Filters: hobby, friend, time.
- Results link directly into detail views.

---

## 12) Error States, Offline & Accessibility

**Error/Empty:**
- Friendly language: "Something went wrong. Try again."
- Clear retry paths.

**Offline:**
- Drafts saved locally.
- Feed shows cached items with an "Offline" banner.
- Actions queue where safe.

**Accessibility:**
- Keyboard navigation.
- Text scaling, high contrast.
- Reduced-motion support (disables confetti).
- Aria labels on icons.

---

## 13) Security & Privacy

- Manage sessions (view & revoke).
- Data minimization: only necessary data exposed.
- Clear copy: "Why we ask" for permissions.
- Delete/export account option.

---

## 14) The Ongoing Loop

Every return follows this rhythm:
1. Open Mbiufun → Activities Tab feels fresh.
2. Compose post (AI assist optional).
3. Jump into Compass → blow horn, get reading.
4. Respond to nudges, earn badges.
5. Explore hobby-linked real-world events.
6. Collect memories (posts, readings, badges) → visible in Profile & Kumbu.
7. Repeat—the journey continues, always branching.

---

## 15) Checkpoints & Branching Map

- **Onboarding:** Sign up → Pick hobbies → Invite friends → Enable notifications.
- **Home:** Scroll feed → Filter hobby → Compose post → Open event card.
- **Compass:** Horn (Loud/Medium/Soft) → Reading CTA → Timeline → Badge.
- **Events:** Tap event → Save plan → Share.
- **AI Starters:** Prefill → Pin → Shuffle.
- **Profile:** Edit hobbies → Review Kumbu → Show badges.
- **Help:** Search articles → Contact support.
- **Settings:** Privacy → Notifications → Data control.

---

## ✨ Personality & Promise

- **Tone:** Light, playful, encouraging.
- **Delight:** Confetti, emoji, fun empty states.
- **Transparency:** Clear labels, user control.
- **Respect:** Privacy safeguards, accessibility, quiet hours.

**Mbiufun isn’t just another app.** It’s a **living digital path**—every tap a step, every horn a heartbeat, every caption a spark.

---

