# Activities Feed - The Home Heartbeat

## Overview

The **Activities Feed** is now the living heart of Mbiufun's home surface. It blends together posts from your chosen hobbies with every post authored by your friends, creating a continuous, welcoming stream of content.

## Features Implemented

### ✅ Core Feed Experience

- **Unified Feed**: Combines hobby-based posts and friend posts in one stream
- **Infinite Scroll**: Automatically loads more content as you scroll
- **Smart Filtering**: Filter by hobby while still showing friend posts (labeled with "Friend Post" pill)
- **Real-time Updates**: Whisper notification when new posts arrive
- **Offline Support**: Cached feed with visible banner when offline

### ✅ Post Composer

- **Caption Input**: Up to 500 characters with character count
- **AI Caption Suggestions**: Three AI-generated suggestions for inspiration
- **Hobby Selection**: Choose which hobby the post belongs to
- **Image Upload**: Add images (max 5MB) with preview
- **Post Limit**: Hard ceiling of 5 active posts per user with friendly feedback

### ✅ Feed Cards

- **Rich Post Display**: Avatar, name, timestamp, hobby chip, caption, and image
- **Engagement Actions**: Like, comment, and share buttons
- **Friend Post Indicator**: Pink "Friend Post" pill for cross-hobby posts
- **Event Discovery**: Special cards for movies, games, trails with external links
- **Optimistic UI**: Instant feedback on likes with server reconciliation

### ✅ Empty States

1. **No Hobbies Selected**: Nudges user to select hobbies
2. **No Posts**: Invites user to create the first post

### ✅ Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labeling for screen readers
- **Role Attributes**: Feed, status, and alert roles for assistive tech
- **Reduced Motion**: CSS animations respect `prefers-reduced-motion`
- **Color Contrast**: WCAG AA compliant color ratios

## API Integration

### Endpoints Used

```typescript
// Get unified feed
GET /api/v1/posts/unified_feed/?page=<page>&per_page=<limit>&hobby_id=<hobby_id>

// Create post
POST /api/v1/posts/create/
Body: FormData { caption, hobby_id?, image? }

// Like/Unlike post
POST /api/v1/posts/<id>/like/
POST /api/v1/posts/<id>/unlike/

// Comment on post
POST /api/v1/posts/<id>/comment/
Body: { text }

// Delete post
DELETE /api/v1/posts/<id>/delete/

// Get user hobbies
GET /api/v1/user/hobbies/

// Get active post count
GET /api/v1/posts/my_active_count/

// AI caption suggestions
POST /api/v1/posts/ai_captions/
Body: { context? }
```

### Authentication

All requests include:
- **Authorization Header**: `Bearer <JWT>`
- **mbiu-token Header**: `<token from localStorage>`

## Component Architecture

```
activities.component.ts (Main Feed Container)
├── post-composer.component.ts (Create Posts)
└── feed-card.component.ts (Individual Post Display)

feed.service.ts (API Service)
```

## File Locations

```
src/app/
├── services/
│   └── feed.service.ts                     # Feed API service
├── components/
│   ├── post-composer/
│   │   └── post-composer.component.ts      # Post creation
│   └── feed-card/
│       └── feed-card.component.ts          # Post display
├── pages/
│   └── activities/
│       └── activities.component.ts         # Main feed page
└── app.routes.ts                           # Routes (Activities is now home)
```

## Routing

The Activities feed is now the **default home route**:

```typescript
/app → ActivitiesComponent (Feed)
/app/landing → LandingComponent (Old landing)
/app/daily-dare → Daily Dares
/app/groups → Groups
/app/notifications → Notifications
```

## Bottom Navigation

Updated to reflect the new home:

```
Feed → /app
Dares → /app/daily-dare
Groups → /app/groups
History → /app/profile/<id>/history
```

## UI/UX Guidelines

### Playful Tone

- Success messages: "🎉 Post shared successfully!"
- Post limit: "You've reached your limit of 5 active posts. Delete an old post to share something new! 💫"
- End of feed: "You're all caught up! 🎉"
- Back online: "Back online! 🎉"

### Visual Design

- **Primary Color**: `#70AEB9` (Mbiufun teal)
- **Secondary Color**: `#4ECDC4` (Turquoise)
- **Gradients**: Soft gradients for buttons and chips
- **Shadows**: Subtle elevation with hover states
- **Rounded Corners**: `rounded-xl` (12px) for cards, `rounded-full` for pills
- **Transitions**: Smooth 200ms transitions on interactive elements

### Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm-lg)
- **Desktop**: > 1024px (lg)

## Future Enhancements

### Phase 2 (Backend Required)

- [ ] Full comment system with dialog
- [ ] Notification system for post interactions
- [ ] Post reporting/flagging
- [ ] Save posts for later
- [ ] Tag friends in posts
- [ ] Rich text formatting
- [ ] Video upload support
- [ ] Story-style ephemeral posts

### Phase 3 (Advanced)

- [ ] Algorithmic feed ranking
- [ ] Content recommendation engine
- [ ] Live activity feed
- [ ] Push notifications
- [ ] Deep linking to specific posts
- [ ] Advanced moderation tools
- [ ] Analytics dashboard

## Testing Notes

### Manual Testing Checklist

- [ ] Create post with caption only
- [ ] Create post with caption + hobby
- [ ] Create post with caption + image
- [ ] Create post with all fields
- [ ] Attempt 6th post (should be blocked)
- [ ] Apply AI caption suggestions
- [ ] Like/unlike posts
- [ ] Delete own posts
- [ ] Filter by hobby
- [ ] Scroll to trigger infinite load
- [ ] Test offline mode
- [ ] Test "new posts" notification
- [ ] Navigate via bottom bar
- [ ] Test empty states
- [ ] Test on mobile viewport
- [ ] Test keyboard navigation
- [ ] Test with screen reader

## Known Limitations

1. **Backend Endpoints**: Some endpoints may not exist yet and will need to be implemented in Django
2. **AI Captions**: Currently returns fallback suggestions; needs OpenAI integration
3. **Comments**: Opens a toast instead of full comment UI
4. **Event Discovery**: Needs backend integration to inject event cards
5. **Notifications**: System exists but needs backend notification service

## Migration Notes

- The old `LandingComponent` is now accessible at `/app/landing`
- Bottom nav now shows "Feed" instead of "Home"
- All existing routes remain functional
- No breaking changes to authentication or guards

## Performance Considerations

- **Lazy Loading**: Images use `loading="lazy"` attribute
- **Virtual Scrolling**: Consider implementing for feeds > 100 posts
- **Caching**: Posts cached in localStorage for offline access
- **Debouncing**: Scroll events could benefit from debouncing
- **Image Optimization**: Consider implementing image compression before upload

---

**Built with ❤️ for Mbiufun** | September 2025
