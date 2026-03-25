/**
 * Login OTP via AWS SNS SMS (Publish to phone number).
 * Configure in .env: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.
 * Optional: AWS_SESSION_TOKEN, AWS_SNS_SMS_TYPE (Transactional|Promotional), AWS_SNS_SMS_SENDER_ID.
 * @see https://docs.aws.amazon.com/sns/latest/dg/sms_publish-to-phone.html
 */

import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export type SnsSmsResult = {
  sent: boolean;
  error?: string;
  messageId?: string;
};

function smsType(): "Transactional" | "Promotional" {
  const v = process.env.AWS_SNS_SMS_TYPE?.trim().toLowerCase();
  return v === "promotional" ? "Promotional" : "Transactional";
}

export function isAwsSnsSmsConfigured(): boolean {
  const region = process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim();
  const key = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secret = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  return Boolean(region && key && secret);
}

/**
 * Send a plain SMS to an E.164 number (e.g. +919876543210).
 */
export async function sendSmsViaSns(e164: string, message: string): Promise<SnsSmsResult> {
  const region = process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const sessionToken = process.env.AWS_SESSION_TOKEN?.trim();

  if (!region || !accessKeyId || !secretAccessKey) {
    return { sent: false };
  }

  const client = new SNSClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      ...(sessionToken ? { sessionToken } : {}),
    },
  });

  const senderId = process.env.AWS_SNS_SMS_SENDER_ID?.trim();
  const messageAttributes: Record<
    string,
    { DataType: "String"; StringValue: string }
  > = {
    "AWS.SNS.SMS.SMSType": {
      DataType: "String",
      StringValue: smsType(),
    },
  };
  if (senderId) {
    messageAttributes["AWS.SNS.SMS.SenderID"] = {
      DataType: "String",
      StringValue: senderId.slice(0, 11),
    };
  }

  try {
    const out = await client.send(
      new PublishCommand({
        PhoneNumber: e164,
        Message: message,
        MessageAttributes: messageAttributes,
      })
    );
    return {
      sent: true,
      messageId: typeof out.MessageId === "string" ? out.MessageId : undefined,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { sent: false, error: msg };
  }
}
