import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

initializeApp();

const db = getFirestore();
const auth = getAuth();

interface ReplyData {
  authorUid?: string;
  authorDisplayName?: string;
  message?: string;
}

interface PostData {
  title?: string;
  projectName?: string;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

export const queueSubscriptionEmailOnReply = onDocumentCreated(
  'posts/{postId}/replies/{replyId}',
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      logger.warn('Reply trigger received without snapshot data.');
      return;
    }

    const postId = String(event.params.postId ?? '');
    const replyId = String(event.params.replyId ?? '');
    const reply = snapshot.data() as ReplyData;

    if (!postId || !replyId) {
      logger.warn('Missing postId/replyId in trigger params.', { postId, replyId });
      return;
    }

    const mailDocId = `reply_${postId}_${replyId}`;
    const mailReference = db.collection('mail').doc(mailDocId);
    const existingMail = await mailReference.get();

    // Firestore events are at-least-once; this avoids duplicate mail queue writes.
    if (existingMail.exists) {
      logger.info('Mail already queued for this reply.', { postId, replyId, mailDocId });
      return;
    }

    const postSnapshot = await db.doc(`posts/${postId}`).get();

    if (!postSnapshot.exists) {
      logger.warn('Post not found while processing reply notification.', { postId, replyId });
      return;
    }

    const post = postSnapshot.data() as PostData;
    const subscriptions = await db.collection(`posts/${postId}/subscriptions`).get();

    if (subscriptions.empty) {
      logger.info('No subscribers for post; skipping email queue.', { postId, replyId });
      return;
    }

    const recipientUids = [...new Set(subscriptions.docs.map((doc) => doc.id))].filter(
      (uid) => uid !== reply.authorUid,
    );

    if (recipientUids.length === 0) {
      logger.info('Only replier subscribed; skipping email queue.', { postId, replyId });
      return;
    }

    const resolvedEmails = await Promise.all(
      recipientUids.map(async (uid) => {
        try {
          const userRecord = await auth.getUser(uid);
          return userRecord.email ?? null;
        } catch {
          logger.warn('Unable to resolve auth user for subscription UID.', {
            postId,
            replyId,
            uid,
          });
          return null;
        }
      }),
    );

    const recipientEmails = [
      ...new Set(resolvedEmails.filter((email): email is string => Boolean(email))),
    ];

    if (recipientEmails.length === 0) {
      logger.info('No email addresses resolved for subscribers.', { postId, replyId });
      return;
    }

    const postTitle = post.title?.trim() || 'Post update';
    const projectLabel = post.projectName?.trim() || 'General';
    const authorLabel = reply.authorDisplayName?.trim() || 'A user';
    const replyText = truncate(reply.message?.trim() || '', 300);

    await mailReference.set({
      to: recipientEmails,
      message: {
        subject: `[Projects Forum] New reply on: ${postTitle}`,
        text: [
          `${authorLabel} added a new reply to a post you subscribed to.`,
          '',
          `Project: ${projectLabel}`,
          `Title: ${postTitle}`,
          '',
          replyText || '(No message content provided)',
          '',
          `Open the post: /post/${postId}`,
        ].join('\n'),
        html: [
          `<p><strong>${authorLabel}</strong> added a new reply to a post you subscribed to.</p>`,
          `<p><strong>Project:</strong> ${projectLabel}<br /><strong>Title:</strong> ${postTitle}</p>`,
          `<p>${replyText || '(No message content provided)'}</p>`,
          `<p>Open the post: <a href=\"/post/${postId}\">/post/${postId}</a></p>`,
        ].join(''),
      },
      meta: {
        source: 'queueSubscriptionEmailOnReply',
        postId,
        replyId,
      },
      queuedAt: new Date().toISOString(),
    });

    logger.info('Queued subscription email document.', {
      postId,
      replyId,
      recipients: recipientEmails.length,
    });
  },
);
