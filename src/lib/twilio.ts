import twilio from "twilio";
import { hasTwilioConfig, isDemoMode } from "./env";

export function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendSms(to: string, body: string): Promise<{
  sid: string | null;
  skipped: boolean;
}> {
  if (isDemoMode() || !hasTwilioConfig()) {
    return { sid: null, skipped: true };
  }
  const client = getTwilioClient();
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!client || !from) return { sid: null, skipped: true };
  const message = await client.messages.create({ from, to, body });
  return { sid: message.sid, skipped: false };
}

export function formParams(form: FormData): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") params[key] = value;
  }
  return params;
}

export function inferRequestUrl(req: Request): string {
  if (process.env.TWILIO_WEBHOOK_URL) return process.env.TWILIO_WEBHOOK_URL;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}/api/twilio/inbound`;
  return new URL(req.url).toString();
}

/** Returns true when the request is allowed to be processed. */
export function verifyTwilioSignature(
  req: Request,
  params: Record<string, string>,
): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return isDemoMode();
  const signature = req.headers.get("x-twilio-signature");
  if (!signature) return false;
  return twilio.validateRequest(token, signature, inferRequestUrl(req), params);
}

export function emptyTwiml(): string {
  return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
}
