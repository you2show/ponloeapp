# Ponloe Admin Dashboard Guide

## Overview

The Admin Dashboard is a comprehensive management interface for administrators to control and monitor the Ponloe Islamic platform. It provides tools for content management, user administration, analytics, and system settings.

## Access

To access the Admin Dashboard:
1. Navigate to `/admin` in your browser
2. You must be logged in with an admin account
3. Non-admin users will be automatically redirected to the home page

**URL:** `https://ponloe.app/admin`

## Dashboard Features

### 1. Dashboard Overview
The main dashboard provides at-a-glance metrics:
- **Total Users:** Complete count of registered users
- **Total Posts:** All content published on the platform
- **Active Users:** Users who have been active in the last 30 days
- **Engagement Rate:** Percentage of active users engaging with content

**Quick Actions:**
- Create New Post
- Manage Users
- View Analytics
- System Settings

### 2. Content Management (`/admin/content`)

Manage all posts, articles, and content on the platform.

#### Features:
- **Search:** Find posts by title
- **Filter by Status:**
  - Published: Live content
  - Draft: Work in progress
  - Archived: Old or hidden content

#### Actions per Post:
- **View:** Preview the post
- **Edit:** Modify post content and metadata
- **Delete:** Remove post from platform

#### Bulk Operations:
- Select multiple posts
- Change status (publish, draft, archive)
- Delete multiple posts at once

### 3. User Management (`/admin/users`)

Control user accounts, roles, and permissions.

#### Features:
- **Search:** Find users by email or name
- **Filter by Role:**
  - User: Regular platform users
  - Moderator: Can moderate content and comments
  - Admin: Full platform access

#### User Actions:
- **View Profile:** See user details and activity
- **Promote:** Upgrade user to moderator or admin
- **Ban:** Restrict user access
- **Delete:** Remove user account and content

#### User Information:
- Full name and email
- Account status (Active/Inactive/Banned)
- Number of posts created
- Last active date
- Join date

### 4. Analytics (`/admin/analytics`)

Monitor platform performance and user engagement.

#### Metrics Available:
- **User Growth:** Track new user registrations over time
- **Post Activity:** Monitor content creation trends
- **Engagement Rate:** Measure user interaction with content
- **Top Performing Posts:** See which content resonates most

#### Time Ranges:
- 7 Days
- 30 Days
- 90 Days
- 1 Year

#### Export:
- Download analytics reports
- Export data for external analysis

## User Roles & Permissions

### Admin
- Full access to all features
- Can manage users and content
- Can access analytics
- Can modify system settings
- Can promote/demote other users

### Moderator
- Can manage content (edit, delete, archive)
- Can moderate comments
- Can view analytics
- Cannot manage users
- Cannot access system settings

### User
- Can create posts
- Can comment on content
- Can view own analytics
- Cannot manage other users' content
- Cannot access admin features

## Best Practices

### Content Management
1. **Regular Review:** Check new posts regularly for quality and compliance
2. **Moderation:** Archive or delete inappropriate content promptly
3. **Organization:** Use tags and categories to organize content
4. **Backup:** Export important content regularly

### User Management
1. **Monitor Activity:** Check for inactive or suspicious accounts
2. **Respond to Reports:** Address user complaints promptly
3. **Promote Responsibly:** Only promote trusted, active users to moderator
4. **Security:** Regularly review admin account access

### Analytics
1. **Weekly Review:** Check metrics every week
2. **Identify Trends:** Look for patterns in user behavior
3. **Content Strategy:** Use top-performing posts to guide content creation
4. **Growth Tracking:** Monitor user growth and engagement trends

## Common Tasks

### Create a New Post
1. Go to Content Management
2. Click "Create New Post"
3. Fill in title, content, and metadata
4. Set status to "Draft" for review or "Published" to go live
5. Click "Save"

### Promote a User to Moderator
1. Go to User Management
2. Find the user in the list
3. Click the shield icon to promote
4. Confirm the action

### Ban a User
1. Go to User Management
2. Find the user
3. Click the trash icon
4. Select "Ban" from options
5. Provide reason (optional)
6. Confirm

### Export Analytics
1. Go to Analytics
2. Select desired time range
3. Click "Download" button
4. Choose format (CSV, PDF)
5. File will download automatically

## Troubleshooting

### Can't Access Admin Dashboard
- Verify you're logged in
- Check that your account has admin role
- Clear browser cache and try again
- Contact system administrator

### Content Not Appearing
- Check content status (should be "Published")
- Verify content is not archived
- Check moderation queue
- Ensure content meets guidelines

### User Issues
- Check user account status
- Verify email address
- Check last active date
- Review user activity logs

## Security Tips

1. **Strong Passwords:** Use complex passwords for admin accounts
2. **Regular Backups:** Backup database and content regularly
3. **Monitor Access:** Review admin access logs
4. **Update Software:** Keep platform updated with latest security patches
5. **API Keys:** Rotate API keys regularly
6. **Two-Factor Auth:** Enable 2FA on admin accounts

## Support

For issues or questions:
- Contact: admin@ponloe.app
- Documentation: https://docs.ponloe.app
- Community: https://community.ponloe.app

## Version History

- **v1.0.0** (2026-03-12): Initial Admin Dashboard release
  - Dashboard overview
  - Content management
  - User management
  - Analytics
  - Settings

---

**Last Updated:** March 12, 2026
**Version:** 1.0.0
