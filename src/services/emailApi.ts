/**
 * Email API service for sending mentor invitations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export interface SendInviteEmailRequest {
  invite_id: string;
  student_id: string;
  mentor_id: string;
  match_score: number;
  reasons: string[];
  student_data: {
    first_name: string;
    last_name: string;
    email: string;
    education_level: string;
    school?: string;
    city?: string;
    interests: string[];
    languages: string[];
    goals?: string;
    meeting_pref: string;
  };
  mentor_data: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface SendInviteEmailResponse {
  success: boolean;
  token?: string;
  expires_at?: string;
  error?: string;
}

/**
 * Send invitation email to mentor
 */
export async function sendInviteEmail(
  request: SendInviteEmailRequest
): Promise<SendInviteEmailResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-invite-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending invite email:', error);
    throw error;
  }
}
