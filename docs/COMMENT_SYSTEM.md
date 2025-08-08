# Blog Comment System Documentation

## Overview
A robust, modern comment system has been implemented for the church website's blog section. The system allows authenticated users to comment on blog posts with features including nested replies, likes, moderation, and admin management.

## Features

### User Features
- **Authentication Required**: Only logged-in users can comment
- **Rich Text Comments**: Support for multi-line comments with proper formatting
- **Nested Replies**: Single-level reply system for threaded discussions
- **Comment Likes**: Users can like/unlike comments
- **Edit & Delete**: Users can edit or delete their own comments
- **Report System**: Users can report inappropriate comments
- **Real-time Updates**: Comments update without page refresh

### Admin Features
- **Comment Moderation**: Approve, reject, or flag comments
- **Pin Comments**: Highlight important comments at the top
- **Bulk Management**: View and manage all comments from admin panel
- **Report Management**: Review and act on user reports
- **Statistics Dashboard**: Track comment metrics
- **Search & Filter**: Find comments by content, author, or status

## Database Schema

### New Tables Added
```prisma
model BlogComment {
  id         String        @id @default(cuid())
  content    String        
  blogPostId String        
  userId     String        
  parentId   String?       // For nested replies
  status     CommentStatus @default(APPROVED)
  isEdited   Boolean       @default(false)
  editedAt   DateTime?
  likes      Int           @default(0)
  isPinned   Boolean       @default(false)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}

model CommentLike {
  id         String      @id @default(cuid())
  commentId  String
  userId     String
  createdAt  DateTime    @default(now())
}

model CommentReport {
  id          String      @id @default(cuid())
  commentId   String
  userId      String      
  reason      String      
  description String?     
  status      String      @default("PENDING")
  resolvedAt  DateTime?
  resolvedBy  String?     
  createdAt   DateTime    @default(now())
}
```

## File Structure

```
/lib/
  comment-actions.ts         # Server actions for comment operations

/components/blog/
  comment-section.tsx        # Main comment component for blog posts

/app/(admin)/admin/comments/
  page.tsx                   # Admin comments page
  comments-management.tsx    # Admin management interface
```

## Usage

### Adding Comments to Blog Posts
The comment section is automatically included in blog posts:

```tsx
import { CommentSection } from "@/components/blog/comment-section"

<CommentSection 
  blogPostId={post.id} 
  blogPostSlug={post.slug} 
/>
```

### Admin Management
Access the admin panel at `/admin/comments` to:
- View all comments across the site
- Filter by status (pending, approved, rejected, flagged)
- Search comments by content or author
- Moderate comments with quick actions
- View detailed reports and statistics

## Security Features

1. **Authentication Required**: All comment actions require user authentication
2. **Rate Limiting**: Built-in protection against spam
3. **Content Validation**: Comments are validated for length and content
4. **XSS Protection**: All user input is sanitized
5. **Role-Based Access**: Admin-only features are protected
6. **Cascade Deletion**: Proper cleanup when posts are deleted

## Moderation Workflow

1. **Auto-Approval**: Comments are automatically approved by default
2. **Report Threshold**: Comments with 3+ reports are auto-flagged
3. **Admin Review**: Admins can manually moderate any comment
4. **Status Options**:
   - PENDING: Awaiting review
   - APPROVED: Visible to all users
   - REJECTED: Hidden from public view
   - FLAGGED: Marked for admin attention

## UI/UX Features

- **Modern Design**: Clean, card-based layout with shadcn/ui components
- **Responsive**: Works seamlessly on mobile and desktop
- **Loading States**: Skeleton loaders during data fetching
- **Error Handling**: Graceful error messages with toast notifications
- **Animations**: Smooth transitions using Framer Motion
- **Dark Mode Support**: Fully compatible with theme switching

## Performance Optimizations

- **Lazy Loading**: Comments load on demand
- **Optimistic Updates**: UI updates immediately for better UX
- **Efficient Queries**: Indexed database fields for fast retrieval
- **Caching**: Server-side caching with revalidation

## Future Enhancements

Potential improvements for the comment system:

1. **Rich Text Editor**: Add markdown or WYSIWYG editor
2. **Mentions**: @mention system for user notifications
3. **Email Notifications**: Notify users of replies
4. **Spam Detection**: AI-powered spam filtering
5. **Reactions**: Add emoji reactions beyond likes
6. **Threading Depth**: Support multiple levels of nested replies
7. **Pagination**: Load comments in batches for long discussions
8. **Export Options**: Allow admins to export comment data

## Testing the System

1. **Create a user account** or login to existing account
2. **Navigate to any blog post**
3. **Scroll to the comments section**
4. **Post a comment** and interact with existing ones
5. **Login as admin** to access management features

## Maintenance

- Monitor the `BlogComment` table size regularly
- Review flagged comments promptly
- Clear old rejected comments periodically
- Update moderation rules as needed

## Support

For issues or questions about the comment system:
1. Check the error logs in the admin panel
2. Review the comment statistics dashboard
3. Contact technical support if needed

---

**Note**: All existing data remains safe and unaffected. The comment system is purely additive and does not modify any existing tables or data.
