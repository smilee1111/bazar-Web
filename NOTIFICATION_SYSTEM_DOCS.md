# Notification System Documentation

## Overview
A complete notification system for the Bazar application that notifies users about:
- Review likes/dislikes
- Shop reviews (for sellers)
- New shop additions
- General notifications

## Architecture

### Clean Architecture Layers

#### 1. **Types Layer** (`lib/types/notification.ts`)
- Type definitions matching backend schemas
- Response interfaces for API calls

#### 2. **API Layer** (`lib/api/notification.ts`)
- Direct API communication
- HTTP error handling
- Endpoint configuration in `lib/api/endpoints.ts`

#### 3. **Actions Layer** (`lib/actions/notification-action.ts`)
- Server actions for Next.js
- Business logic wrapper
- Error normalization

#### 4. **Components Layer**

**NotificationBell** (`components/NotificationBell.tsx`)
- Dropdown notification widget
- Real-time unread count badge
- Polling for new notifications every 30 seconds
- Quick actions: mark as read, delete
- "Mark all as read" option
- Navigate to full notifications page

**NotificationsPage** (`app/user/notifications/page.tsx`)
- Full notification management page
- Three tabs: All, Unread, Read
- Bulk actions: mark all as read, delete all
- Individual actions: mark as read, delete
- Click notification to navigate to related entity

## Features Implemented

### ✅ User Features
- View all notifications with pagination
- Filter by read/unread status
- Mark single notification as read
- Mark all notifications as read
- Delete single notification
- Delete all notifications
- Real-time unread count with polling
- Click notification to navigate to related shop/review
- Visual indicators for unread notifications

### ✅ UI/UX Features
- Bell icon with badge showing unread count
- Dropdown quick view (last 10 notifications)
- Full page for comprehensive notification management
- Tabs for filtering (All/Unread/Read)
- Time formatting (relative time)
- Emoji icons for notification types
- Responsive design
- Smooth animations and transitions

### ✅ Technical Features
- Clean architecture separation
- Server-side actions for security
- Type-safe with TypeScript
- Optimistic UI updates
- Error handling throughout
- Auto-refresh every 30 seconds
- Prevents notification errors from breaking core operations

## API Endpoints Used

```
GET    /api/user/notifications              - Get all (with pagination)
GET    /api/user/notifications/unread-count - Get unread count
GET    /api/user/notifications/:id          - Get single notification
PATCH  /api/user/notifications/:id/read     - Mark as read
PATCH  /api/user/notifications/mark-multiple-read - Mark multiple as read
PATCH  /api/user/notifications/mark-all-read - Mark all as read
DELETE /api/user/notifications/:id          - Delete notification
DELETE /api/user/notifications              - Delete all
```

## Integration Points

### Dashboard Layout
- NotificationBell component added to header
- Available on all dashboard pages
- Real-time updates

### Sidebar Navigation
- "Notifications" link added to menu
- Bell icon for consistency
- Accessible from anywhere in dashboard

## Notification Types

| Type | Icon | Description | Recipient |
|------|------|-------------|-----------|
| `review_like` | 👍 | Someone liked your review | Review author |
| `review_dislike` | 👎 | Someone disliked your review | Review author |
| `shop_reviewed` | ⭐ | Your shop received a review | Shop owner |
| `new_shop` | 🏪 | New shop added to platform | All users |
| `general` | 🔔 | General notification | Specific user(s) |

## Usage Examples

### Check unread count
```typescript
const result = await handleGetUnreadCount();
console.log(result.unreadCount); // number
```

### Fetch notifications
```typescript
const result = await handleGetNotifications(page, size, isRead);
// Returns: { success, data, pagination, unreadCount }
```

### Mark as read
```typescript
await handleMarkNotificationAsRead(notificationId);
```

### Mark all as read
```typescript
await handleMarkAllAsRead();
```

### Delete notification
```typescript
await handleDeleteNotification(notificationId);
```

## Future Enhancements
- WebSocket/SSE for real-time push notifications
- Push notifications for mobile devices
- Email notifications for important events
- Notification preferences/settings
- Group notifications by type
- Notification history archive
- Sound alerts for new notifications
