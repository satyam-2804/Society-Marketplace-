import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from './firebase';

let cachedGmailAccessToken: string | null = null;
let connectedUserEmail: string | null = null;

/**
 * Connect user's Gmail account using Google OAuth popup via Firebase Auth.
 */
export async function connectGmailAccount(): Promise<{ user: User; accessToken: string }> {
  const provider = new GoogleAuthProvider();
  // Request full Gmail & send scopes
  provider.addScope('https://mail.google.com/');
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  provider.addScope('https://www.googleapis.com/auth/gmail.compose');

  // Prompt user to select account
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('Could not obtain Gmail OAuth access token from Google Sign-In.');
    }

    cachedGmailAccessToken = accessToken;
    connectedUserEmail = result.user.email || null;

    console.log('✅ Gmail account connected successfully for:', connectedUserEmail);
    return { user: result.user, accessToken };
  } catch (error: any) {
    console.error('❌ Error linking Gmail account:', error);
    throw error;
  }
}

/**
 * Get current in-memory Gmail access token if connected.
 */
export function getGmailAccessToken(): string | null {
  return cachedGmailAccessToken;
}

/**
 * Check if Gmail is linked in the current session.
 */
export function isGmailConnected(): boolean {
  return Boolean(cachedGmailAccessToken);
}

/**
 * Get email address of connected Gmail account.
 */
export function getConnectedGmailEmail(): string | null {
  return connectedUserEmail;
}

/**
 * Disconnect Gmail in current session.
 */
export function disconnectGmail(): void {
  cachedGmailAccessToken = null;
  connectedUserEmail = null;
}

/**
 * Helper to encode UTF-8 string to base64url for Gmail raw API payload.
 */
function encodeRawEmail(emailText: string): string {
  // Convert UTF-8 to Base64
  const base64 = btoa(
    encodeURIComponent(emailText).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );

  // Convert Base64 to Base64URL
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email directly using Gmail API on behalf of the signed-in user.
 */
export async function sendEmailViaGmail({
  to,
  subject,
  htmlBody,
  accessToken = cachedGmailAccessToken,
}: {
  to: string;
  subject: string;
  htmlBody: string;
  accessToken?: string | null;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const token = accessToken || cachedGmailAccessToken;

  if (!token) {
    return {
      success: false,
      error: 'Gmail is not connected. Please connect your Gmail account first.',
    };
  }

  try {
    const fromHeader = connectedUserEmail ? `From: ${connectedUserEmail}` : null;
    const utf8SubjectBase64 = btoa(unescape(encodeURIComponent(subject)));
    
    const headers = [
      `To: ${to}`,
      fromHeader,
      `Subject: =?UTF-8?B?${utf8SubjectBase64}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
    ].filter(Boolean);

    const rawRfc2822 = headers.join('\r\n') + '\r\n\r\n' + htmlBody;

    const encodedRaw = encodeRawEmail(rawRfc2822);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedRaw,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gmail API Error Response:', errData);
      throw new Error(errData?.error?.message || `Gmail API error HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Email successfully sent via Gmail API! Message ID:', data.id);
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('Failed to send email via Gmail API:', err);
    return { success: false, error: err.message || 'Unknown Gmail API error' };
  }
}
