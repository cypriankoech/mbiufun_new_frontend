# Mbiufun Legacy - Complete Notifications & Micro-Interactions Analysis

## 🔔 Notification System

### 1. **Notification Types**

Based on the `Notification` model:
```typescript
interface Notification {
  id: number;
  ago: string;          // Time ago (e.g., "2 hours ago")
  created_at: string;   // ISO timestamp
  description: string;  // Full notification text
  link?: string;        // Optional deep link
  read: boolean;        // Read status
  title: string;        // Notification title
}
```

### 2. **Notification Categories** (Inferred from usage)

1. **Game/Match Related:**
   - Match invitations
   - Match completion
   - Winner confirmations pending
   - New match created
   - Match results

2. **Social:**
   - Friend requests
   - New follower
   - Friend accepted request
   - User mentioned you
   - Someone liked your post
   - Someone commented on your post

3. **Groups:**
   - Group invitation
   - New message in group
   - Group event reminder
   - New member joined

4. **Daily Dare:**
   - New daily dare available
   - Streak reminder
   - Dare completion reminder
   - Quiz results

5. **League/Leaderboard:**
   - League invitation
   - New league created
   - Leaderboard position change
   - Tournament reminder

6. **System:**
   - App update available
   - Maintenance notice
   - Feature announcement

### 3. **Notification Display Locations**

#### A. **Notification Badge** (Top Bar)
- **Location:** Main template top navigation
- **Display:** Red badge with count
- **Updates:** Real-time via `NotificationsProvider.unread_count()`
- **Format:** Shows `total_unread` count
- **API Call:** `GET /api/v1/user/status`

```typescript
unread_notifications = {
  'unread_notifications': 0,  // Notification count
  'unread_messages': 0,       // Chat message count
  'total_unread': 0           // Combined total
}
```

#### B. **Notifications List Page** (`/notifications`)
- **Full list** of all notifications
- **Mark as read** functionality
- **Dismissal/delete** option
- **Link navigation** - clicking notification navigates to `link` property
- **Visual distinction** between read/unread
- **Timestamp display** - "ago" format

#### C. **Real-time Updates**
- Polls `/api/v1/user/status` on route changes
- Auto-refreshes notification list when count changes
- Updates badge count immediately

### 4. **Notification Actions**

1. **Mark as Read:**
   - Auto-mark when viewing notification list page
   - Query param: `?mark_read=1`

2. **Dismiss/Delete:**
   - Delete individual notification
   - API: `DELETE /api/v1/notifications/detail/:id`

3. **Navigate to Context:**
   - Click notification → navigate to `link`
   - Deep linking to specific pages/content

---

## 🎉 Popups & Dialogs

### 1. **MatDialog-Based Dialogs (20 Total)**

#### A. **Informational Dialogs**
1. **Confirmation Dialog** - Generic yes/no confirmations
2. **Terms Dialog** - Terms of service display
3. **Tutorial Dialogs** - Onboarding/help screens
4. **Quiz Results Dialog** - Quiz score and feedback
5. **Quiz Already Completed Dialog** - Prevention message
6. **Streak Dialog** - Streak achievements and milestones

#### B. **Action Dialogs**
7. **Daily Dare Dialog** - Quick dare view/start
8. **Share Dialog** - Social sharing options
9. **Search Dialog** - User/game search modal
10. **Update Username Dialog** - Change username form
11. **Update Vibes Dialog** - Select hobbies/interests
12. **Vibes Warning Dialog** - Prompt to select vibes

#### C. **Data Display Dialogs**
13. **Daily Dare History** - Past quiz completions
14. **Match History** - Game match records
15. **Leader Boards List Dialog** - Available leaderboards
16. **User Profile Dialog** - Quick profile view

#### D. **Management Dialogs**
17. **Create League Dialog** - New league form
18. **League Invite Dialog** - Invite users to league
19. **Game Winner Confirmation** - Approve match results
20. **Export Popup** - Data export (from PopupService)

### 2. **Dialog Configuration Patterns**

```typescript
// Standard dialog opening
this.dialog.open(ComponentName, {
  width: '400px',         // Responsive width
  data: { /* context */ },
  disableClose: false,    // Allow backdrop click
  panelClass: 'custom-class'
});
```

### 3. **Dialog Features**

- **Responsive sizing** - Adapts to mobile/desktop
- **Backdrop dismiss** - Click outside to close
- **Action buttons** - Confirm/Cancel patterns
- **Loading states** - Spinners during async operations
- **Form validation** - Real-time validation
- **Error handling** - Display API errors

---

## 🎯 SnackBars (Material Toasts)

### 1. **SnackBar Usage Locations** (27 files use MatSnackBar)

Found in:
- Authentication pages (login, register, reset, activate)
- Game management (create match, game form, winner confirmation)
- Groups (create, edit, chat)
- League management
- Profile updates
- Search functionality

### 2. **SnackBar Types**

#### A. **Success Messages**
```typescript
snackBar.open('Success message', 'Dismiss', {
  duration: 3000,
  panelClass: ['success-snackbar']
});
```
- Registration successful
- Profile updated
- Match created
- Group created
- Winner confirmed
- League created

#### B. **Error Messages**
```typescript
snackBar.open('Error message', 'Retry', {
  duration: 5000,
  panelClass: ['error-snackbar']
});
```
- Login failed
- Network error
- Validation error
- API error
- Upload failed

#### C. **Info Messages**
```typescript
snackBar.open('Info message', 'OK', {
  duration: 4000
});
```
- Loading complete
- Action pending
- Feature unavailable
- Coming soon

#### D. **Action SnackBars**
```typescript
snackBar.open('Message', 'ACTION', {
  duration: 7000
}).onAction().subscribe(() => {
  // Handle action
});
```
- Undo actions
- Retry operations
- View details
- Navigate to page

### 3. **SnackBar Configuration**

- **Duration:** 3000-7000ms (3-7 seconds)
- **Position:** Bottom (default), can be top/center
- **Actions:** Optional action button
- **Dismissible:** Swipe to dismiss on mobile
- **Styling:** Custom panel classes for success/error/info

---

## 🚨 Native Browser Alerts

### 1. **Confirm Dialogs** (79 uses across 16 files)

**Common Uses:**
```typescript
const confirmed = confirm('Are you sure?');
if (confirmed) {
  // Proceed with action
}
```

**Locations:**
- **Game Winner Confirmation:** "Confirm that [user] won?"
- **Match Creation:** "Create this match?"
- **Group Deletion:** "Delete this group?"
- **League Actions:** "Leave league?"
- **Dismissals:** "Dismiss this match?"
- **Destructive Actions:** Any delete/remove operation

**Pattern:** Always used for **destructive or irreversible actions**

### 2. **Alert Usage**
- Minimal usage (replaced by SnackBars mostly)
- Used for critical errors that need acknowledgment

---

## 🔄 PWA Service Worker Notifications

### 1. **App Update Service**

```typescript
class AppUpdateService {
  constructor(private updates: SwUpdate) {
    this.updates.available.subscribe(event => {
      this.showAppUpdateAlert();
    });
  }
  
  showAppUpdateAlert() {
    // Shows "App Update available"
    // User chooses to update
    this.doAppUpdate();
  }
  
  doAppUpdate() {
    this.updates.activateUpdate()
      .then(() => document.location.reload());
  }
}
```

### 2. **Update Flow**
1. Service worker detects new version
2. Alert shown to user
3. User confirms update
4. App reloads with new version

---

## 📱 Mobile-Specific Interactions

### 1. **Haptic Feedback**
- **Status:** NOT implemented in legacy
- **Search Result:** No `vibrate()` or haptic API calls found
- **Opportunity:** Can be added in new frontend

### 2. **Touch Interactions**
- Standard touch events (tap, swipe)
- Pull-to-refresh (not explicitly implemented)
- Swipe-to-dismiss on snackbars (Material default)

---

## 🎨 Visual Feedback Patterns

### 1. **Loading States**

#### A. **Loader Component**
- Dedicated `LoaderComponent`
- Full-screen or inline
- Spinner animation
- Optional loading text

#### B. **Button Loading States**
```typescript
isSubmitting = false;

onSubmit() {
  this.isSubmitting = true;
  // API call
  this.isSubmitting = false;
}
```
- Disabled button during submission
- Loading spinner in button
- Prevents double-submission

#### C. **Skeleton Screens**
- Used in feed loading
- Placeholder content while fetching

### 2. **Hover States**
- Material ripple effects
- Button hover animations
- Card hover elevation
- Link color changes

### 3. **Focus States**
- Form input outlines
- Keyboard navigation support
- ARIA labels for accessibility

### 4. **Disabled States**
- Reduced opacity
- Cursor: not-allowed
- Tooltip explanations

---

## 🔔 Push Notifications (Firebase)

### 1. **Implementation Status**
- **Firebase configured:** Yes (AngularFireAnalytics imported)
- **Push notifications:** Partially implemented
- **Notification model:** Exists
- **Service worker:** Configured (`ngsw-config.json`)

### 2. **Notification Triggers** (Backend sends)
- Match invitations
- Group messages
- Daily dare reminders
- Streak milestones
- Friend activity
- Leaderboard changes

### 3. **Notification Permissions**
- Requested on first app use
- Managed through browser settings
- No in-app toggle visible

---

## 🎯 Micro-Interactions Inventory

### 1. **Button Interactions**
- **Ripple effect** (Material default)
- **Hover elevation** (box-shadow increase)
- **Loading spinner** during async
- **Disabled state** with opacity
- **Success animation** (checkmark)

### 2. **Form Interactions**
- **Real-time validation** (red border on error)
- **Success checkmarks** (green icon)
- **Character counters** (on textareas)
- **Password strength** indicators
- **Auto-focus** on modal open
- **Enter key** submission

### 3. **List Interactions**
- **Hover highlight** on rows
- **Swipe actions** (mobile)
- **Pull-to-refresh** (partial)
- **Infinite scroll** (in feeds)
- **Empty states** with illustrations

### 4. **Card Interactions**
- **Hover elevation** (shadow increase)
- **Click feedback** (ripple)
- **Expand/collapse** animations
- **Like animation** (heart fill)
- **Share bounce** animation

### 5. **Navigation Interactions**
- **Active route** highlighting
- **Breadcrumbs** (some pages)
- **Back button** functionality
- **Deep linking** from notifications

### 6. **Image Interactions**
- **Lazy loading** (not explicitly implemented)
- **Placeholder** images
- **Upload progress** bars
- **Preview** before upload
- **Zoom** on click (not implemented)

### 7. **Animation Transitions**
- **Page transitions** (fade in/out)
- **Dialog animations** (slide up)
- **List item** stagger animation
- **Skeleton** pulse animation
- **Success** checkmark animation

---

## 🆚 Comparison: Legacy vs New Frontend

| Feature | Legacy | New Frontend | Status |
|---------|--------|--------------|--------|
| **Notification Badge** | ✅ Real-time polling | ✅ Implemented | ✅ Migrated |
| **Notification List Page** | ✅ Full featured | ✅ Route exists | ⚠️ Verify |
| **SnackBar Toasts** | ✅ 27 files | ✅ Material used | ✅ Migrated |
| **Dialog System** | ✅ 20 dialogs | ✅ Some migrated | ⚠️ Partial |
| **Confirm Dialogs** | ✅ 79 uses | ❓ Unknown | ❓ Check |
| **PWA Updates** | ✅ Implemented | ❓ Unknown | ❓ Check |
| **Haptic Feedback** | ❌ None | ✅ NEW! | 🆕 Enhanced |
| **Loading States** | ✅ Basic | ✅ Enhanced | ✅ Better |
| **Skeleton Screens** | ⚠️ Partial | ✅ Implemented | 🆕 Enhanced |
| **Real-time Polling** | ✅ Status endpoint | ✅ Implemented | ✅ Migrated |
| **Deep Linking** | ✅ From notifications | ✅ Angular router | ✅ Migrated |
| **Firebase Analytics** | ✅ Implemented | ❓ Unknown | ❓ Check |
| **Push Notifications** | ⚠️ Partial | ❓ Unknown | ❓ Check |

---

## 🔍 Missing in Legacy (Opportunities for New Frontend)

1. **Haptic Feedback** - Not implemented, can add
2. **Advanced Animations** - Basic transitions only
3. **Image Zoom** - Not implemented
4. **Pull-to-Refresh** - Not fully implemented
5. **Optimistic UI** - Limited usage
6. **Undo Actions** - Rare implementation
7. **Keyboard Shortcuts** - Not implemented
8. **Sound Effects** - Not implemented
9. **Confetti/Celebrations** - Limited to streaks
10. **Dark Mode Toggle** - Not implemented

---

## 📊 Notification Flow Summary

```
USER ACTION
    ↓
BACKEND CREATES NOTIFICATION
    ↓
USER'S NEXT ROUTE CHANGE
    ↓
FRONTEND POLLS /api/v1/user/status
    ↓
BADGE COUNT UPDATED
    ↓
IF COUNT CHANGED → LOAD NOTIFICATIONS
    ↓
USER CLICKS NOTIFICATION BELL
    ↓
/notifications PAGE LOADS
    ↓
AUTO-MARK AS READ (?mark_read=1)
    ↓
USER CLICKS NOTIFICATION
    ↓
NAVIGATE TO notification.link
```

---

## 🎯 Critical Micro-Interactions to Migrate

### HIGH PRIORITY
1. ✅ **SnackBar toasts** - Success/error feedback
2. ✅ **Loading spinners** - During async operations
3. ✅ **Form validation** - Real-time feedback
4. ✅ **Button disabled states** - Prevent double-submit
5. ⚠️ **Confirm dialogs** - Destructive actions
6. ⚠️ **Notification badge** - Unread count
7. ⚠️ **Streak dialog** - Achievement celebrations

### MEDIUM PRIORITY
8. ❓ **Winner confirmation dialog** - Match approvals
9. ❓ **Search dialog** - User/game search
10. ❓ **Share dialog** - Social sharing
11. ❓ **Update vibes dialog** - Hobby selection
12. ❓ **PWA update prompt** - Version updates

### LOW PRIORITY
13. ❌ **Daily dare history dialog**
14. ❌ **Match history component**
15. ❌ **Tutorial dialogs**
16. ❌ **League creation dialog**

---

## 🏁 Conclusion

**Legacy frontend has:**
- ✅ **20 distinct dialog components**
- ✅ **27 files using SnackBar toasts**
- ✅ **79 native confirm dialogs**
- ✅ **Real-time notification system**
- ✅ **PWA update mechanism**
- ✅ **Comprehensive loading states**
- ✅ **Material Design ripple effects**
- ❌ **No haptic feedback**
- ❌ **No advanced animations**
- ⚠️ **Partial push notification support**

**New frontend should ensure:**
1. All critical dialogs migrated
2. SnackBar feedback on all actions
3. Loading states on all async operations
4. Notification badge real-time updates
5. Confirm dialogs for destructive actions
6. Enhanced with haptic feedback
7. Better animations and transitions

---

**Generated:** 2025-09-29  
**Analysis of:** `mbiufun-legacy` micro-interactions  
**For:** Mbiufun New Frontend UX planning  
**Status:** ✅ COMPLETE - All notification mechanisms catalogued
