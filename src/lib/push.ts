import { prisma } from "@/lib/prisma";
import webpush from "web-push";

const vapidConfigured =
  !!process.env.VAPID_SUBJECT &&
  !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  !!process.env.VAPID_PRIVATE_KEY;

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!vapidConfigured) return { sent: 0, failed: 0 };

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title: payload.title, body: payload.body, url: payload.url ?? "/" })
      )
    )
  );

  // Prune subscriptions the push service says are gone (410/404).
  const deadEndpoints = subscriptions.filter((sub, i) => {
    const r = results[i];
    return r.status === "rejected" && [404, 410].includes((r.reason as any)?.statusCode);
  });
  if (deadEndpoints.length) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: deadEndpoints.map((s) => s.endpoint) } },
    });
  }

  const failed = results.filter((r) => r.status === "rejected");
  return { sent: results.length - failed.length, failed: failed.length };
}
