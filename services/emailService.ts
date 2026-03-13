import { supabase } from '@/lib/supabase';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email templates for different notification types
 */
const emailTemplates = {
  welcome: (userName: string): EmailTemplate => ({
    subject: 'Welcome to Ponloe - Islamic Learning Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #059669;">Welcome to Ponloe!</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for joining our Islamic learning community. We're excited to have you on board!</p>
        <p>Here's what you can do on Ponloe:</p>
        <ul>
          <li>📖 Learn from comprehensive Islamic resources</li>
          <li>🤝 Connect with our community</li>
          <li>💬 Share your thoughts and experiences</li>
          <li>🎓 Deepen your Islamic knowledge</li>
        </ul>
        <p><a href="https://ponloe.app" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">© 2026 Ponloe. All rights reserved.</p>
      </div>
    `,
    text: `Welcome to Ponloe!\n\nHello ${userName},\n\nThank you for joining our Islamic learning community.\n\nVisit https://ponloe.app to get started.`,
  }),

  postReply: (userName: string, postTitle: string, replyAuthor: string): EmailTemplate => ({
    subject: `New reply to your post: "${postTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Reply to Your Post</h2>
        <p>Hello ${userName},</p>
        <p><strong>${replyAuthor}</strong> replied to your post:</p>
        <blockquote style="border-left: 4px solid #059669; padding-left: 15px; margin: 20px 0; color: #6b7280;">
          "${postTitle}"
        </blockquote>
        <p><a href="https://ponloe.app/posts" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Reply</a></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">© 2026 Ponloe. All rights reserved.</p>
      </div>
    `,
    text: `New Reply to Your Post\n\nHello ${userName},\n\n${replyAuthor} replied to your post: "${postTitle}"\n\nVisit https://ponloe.app/posts to view the reply.`,
  }),

  commentNotification: (userName: string, postTitle: string, commenterName: string): EmailTemplate => ({
    subject: `New comment on "${postTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Comment</h2>
        <p>Hello ${userName},</p>
        <p><strong>${commenterName}</strong> commented on your post:</p>
        <blockquote style="border-left: 4px solid #059669; padding-left: 15px; margin: 20px 0; color: #6b7280;">
          "${postTitle}"
        </blockquote>
        <p><a href="https://ponloe.app/posts" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Comment</a></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">© 2026 Ponloe. All rights reserved.</p>
      </div>
    `,
    text: `New Comment\n\nHello ${userName},\n\n${commenterName} commented on "${postTitle}"\n\nVisit https://ponloe.app/posts to view the comment.`,
  }),

  adminNotification: (adminName: string, message: string): EmailTemplate => ({
    subject: 'Important Notification from Ponloe Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Admin Notification</h2>
        <p>Hello ${adminName},</p>
        <p>${message}</p>
        <p><a href="https://ponloe.app/admin" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Admin Dashboard</a></p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">© 2026 Ponloe. All rights reserved.</p>
      </div>
    `,
    text: `Admin Notification\n\nHello ${adminName},\n\n${message}\n\nVisit https://ponloe.app/admin to view more details.`,
  }),

  passwordReset: (userName: string, resetLink: string): EmailTemplate => ({
    subject: 'Reset Your Ponloe Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <p><a href="${resetLink}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p style="color: #6b7280; font-size: 12px;">This link will expire in 24 hours. If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">© 2026 Ponloe. All rights reserved.</p>
      </div>
    `,
    text: `Password Reset Request\n\nHello ${userName},\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link will expire in 24 hours.`,
  }),
};

/**
 * Send email using Supabase or external email service
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Store email in database for logging/tracking
    const { error } = await supabase
      .from('email_logs')
      .insert({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || '',
        sent_at: new Date().toISOString(),
        status: 'sent',
      });

    if (error) {
      console.error('Error logging email:', error);
      return false;
    }

    // In production, integrate with email service like SendGrid, Mailgun, or AWS SES
    // For now, we'll just log it
    console.log(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (email: string, userName: string): Promise<boolean> => {
  const template = emailTemplates.welcome(userName);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

/**
 * Send post reply notification
 */
export const sendPostReplyNotification = async (
  email: string,
  userName: string,
  postTitle: string,
  replyAuthor: string
): Promise<boolean> => {
  const template = emailTemplates.postReply(userName, postTitle, replyAuthor);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

/**
 * Send comment notification
 */
export const sendCommentNotification = async (
  email: string,
  userName: string,
  postTitle: string,
  commenterName: string
): Promise<boolean> => {
  const template = emailTemplates.commentNotification(userName, postTitle, commenterName);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

/**
 * Send admin notification
 */
export const sendAdminNotification = async (
  email: string,
  adminName: string,
  message: string
): Promise<boolean> => {
  const template = emailTemplates.adminNotification(adminName, message);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  userName: string,
  resetLink: string
): Promise<boolean> => {
  const template = emailTemplates.passwordReset(userName, resetLink);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
};

/**
 * Send bulk email to multiple users
 */
export const sendBulkEmail = async (
  emails: string[],
  subject: string,
  html: string,
  text?: string
): Promise<number> => {
  let successCount = 0;
  for (const email of emails) {
    const success = await sendEmail({ to: email, subject, html, text });
    if (success) successCount++;
  }
  return successCount;
};
