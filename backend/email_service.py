"""
Email service for sending mentor match invitations and notifications.
Uses Gmail SMTP with app-specific password.
"""

import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class EmailService:
    """Handles email sending for mentor-student matching"""
    
    def __init__(self, smtp_user: str, smtp_password: str):
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        
    def generate_token(self) -> str:
        """Generate a secure token for accept/reject links"""
        return secrets.token_urlsafe(32)
    
    def send_invite_email(
        self,
        mentor_email: str,
        mentor_name: str,
        student_data: Dict,
        match_score: int,
        reasons: list,
        accept_url: str,
        reject_url: str
    ) -> bool:
        """
        Send invitation email to mentor with student details and accept/reject buttons.
        
        Args:
            mentor_email: Mentor's email address
            mentor_name: Mentor's full name
            student_data: Dictionary with student details
            match_score: Match percentage (0-100)
            reasons: List of reasons why they're a good match
            accept_url: URL for accepting the match
            reject_url: URL for rejecting the match
            
        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"🎓 New Mentorship Match: {student_data['first_name']} {student_data['last_name']} ({match_score}% match)"
            msg['From'] = self.smtp_user
            msg['To'] = mentor_email
            
            # Create HTML email body
            html_body = self._create_invite_html(
                mentor_name=mentor_name,
                student_data=student_data,
                match_score=match_score,
                reasons=reasons,
                accept_url=accept_url,
                reject_url=reject_url
            )
            
            # Create plain text version
            text_body = self._create_invite_text(
                mentor_name=mentor_name,
                student_data=student_data,
                match_score=match_score,
                reasons=reasons,
                accept_url=accept_url,
                reject_url=reject_url
            )
            
            part1 = MIMEText(text_body, 'plain')
            part2 = MIMEText(html_body, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Invitation email sent to {mentor_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invitation email to {mentor_email}: {str(e)}")
            return False
    
    def send_acceptance_notification(
        self,
        student_email: str,
        student_name: str,
        mentor_name: str,
        match_score: int
    ) -> bool:
        """Send notification to student when mentor accepts"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"✅ Great News! {mentor_name} Accepted Your Match Request"
            msg['From'] = self.smtp_user
            msg['To'] = student_email
            
            html_body = self._create_acceptance_html(student_name, mentor_name, match_score)
            text_body = self._create_acceptance_text(student_name, mentor_name, match_score)
            
            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Acceptance notification sent to {student_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send acceptance notification: {str(e)}")
            return False
    
    def send_rejection_notification(
        self,
        student_email: str,
        student_name: str,
        mentor_name: str
    ) -> bool:
        """Send notification to student when mentor declines"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"Update on Your Match Request with {mentor_name}"
            msg['From'] = self.smtp_user
            msg['To'] = student_email
            
            html_body = self._create_rejection_html(student_name, mentor_name)
            text_body = self._create_rejection_text(student_name, mentor_name)
            
            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Rejection notification sent to {student_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send rejection notification: {str(e)}")
            return False
    
    def _create_invite_html(
        self,
        mentor_name: str,
        student_data: Dict,
        match_score: int,
        reasons: list,
        accept_url: str,
        reject_url: str
    ) -> str:
        """Create beautiful HTML email for invitation"""
        
        reasons_html = "".join([f"<li style='margin: 8px 0; color: #4b5563;'>✓ {reason}</li>" for reason in reasons])
        
        interests_html = ", ".join(student_data.get('interests', []))
        languages_html = ", ".join(student_data.get('languages', []))
        
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎓 New Mentorship Match!</h1>
                        </td>
                    </tr>
                    
                    <!-- Match Score Badge -->
                    <tr>
                        <td style="padding: 30px 40px 20px; text-align: center;">
                            <div style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; border-radius: 50px; font-size: 24px; font-weight: bold;">
                                {match_score}% Match
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <p style="color: #1f2937; font-size: 18px; line-height: 1.6; margin: 0;">
                                Hi <strong>{mentor_name}</strong>,
                            </p>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 15px 0 0 0;">
                                Great news! We've found an excellent mentorship match for you. A student is eager to learn from your experience and expertise.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Student Details Card -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px;">
                                <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0;">
                                    👤 Student Profile: {student_data['first_name']} {student_data['last_name']}
                                </h2>
                                
                                <table width="100%" cellpadding="5" style="color: #4b5563; font-size: 15px;">
                                    <tr>
                                        <td width="140" style="font-weight: 600; vertical-align: top;">📧 Email:</td>
                                        <td>{student_data.get('email', 'N/A')}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; vertical-align: top;">🎓 Education:</td>
                                        <td>{student_data.get('education_level', 'N/A')}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; vertical-align: top;">🏫 School:</td>
                                        <td>{student_data.get('school', 'N/A')}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; vertical-align: top;">📍 City:</td>
                                        <td>{student_data.get('city', 'N/A')}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; vertical-align: top;">💡 Interests:</td>
                                        <td>{interests_html}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; vertical-align: top;">🌐 Languages:</td>
                                        <td>{languages_html}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; vertical-align: top;">🎯 Goals:</td>
                                        <td>{student_data.get('goals', 'N/A')}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-weight: 600; vertical-align: top;">📅 Meeting Pref:</td>
                                        <td>{student_data.get('meeting_pref', 'N/A')}</td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Why You're a Great Match -->
                    <tr>
                        <td style="padding: 20px 40px;">
                            <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">✨ Why You're a Great Match:</h3>
                            <ul style="margin: 0; padding-left: 20px; list-style: none;">
                                {reasons_html}
                            </ul>
                        </td>
                    </tr>
                    
                    <!-- Action Buttons -->
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0; text-align: center;">
                                Would you like to mentor this student?
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="50%" style="padding-right: 10px;">
                                        <a href="{accept_url}" style="display: block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 16px;">
                                            ✅ Accept Match
                                        </a>
                                    </td>
                                    <td width="50%" style="padding-left: 10px;">
                                        <a href="{reject_url}" style="display: block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 16px;">
                                            ❌ Decline
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                This invitation will expire in 30 days.
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                © 2024 Mentor Match Platform. If you have questions, please contact support.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    def _create_invite_text(
        self,
        mentor_name: str,
        student_data: Dict,
        match_score: int,
        reasons: list,
        accept_url: str,
        reject_url: str
    ) -> str:
        """Create plain text version of invitation email"""
        
        reasons_text = "\n".join([f"  ✓ {reason}" for reason in reasons])
        
        return f"""
NEW MENTORSHIP MATCH - {match_score}% MATCH!

Hi {mentor_name},

Great news! We've found an excellent mentorship match for you.

STUDENT PROFILE: {student_data['first_name']} {student_data['last_name']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: {student_data.get('email', 'N/A')}
Education: {student_data.get('education_level', 'N/A')}
School: {student_data.get('school', 'N/A')}
City: {student_data.get('city', 'N/A')}
Interests: {', '.join(student_data.get('interests', []))}
Languages: {', '.join(student_data.get('languages', []))}
Goals: {student_data.get('goals', 'N/A')}
Meeting Preference: {student_data.get('meeting_pref', 'N/A')}

WHY YOU'RE A GREAT MATCH:
{reasons_text}

RESPOND TO THIS MATCH:
✅ Accept: {accept_url}
❌ Decline: {reject_url}

This invitation expires in 30 days.

© 2024 Mentor Match Platform
"""
    
    def _create_acceptance_html(self, student_name: str, mentor_name: str, match_score: int) -> str:
        """Create HTML email for acceptance notification"""
        return f"""
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Match Accepted!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">
                                Hi <strong>{student_name}</strong>,
                            </p>
                            <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                                Congratulations! <strong>{mentor_name}</strong> has accepted your mentorship request ({match_score}% match).
                            </p>
                            <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                                You can now connect with your mentor through the platform to schedule your first meeting.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="http://localhost:8080/student-match" style="display: inline-block; background-color: #667eea; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600;">
                                    View Your Matches
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f9fafb; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                © 2024 Mentor Match Platform
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    def _create_acceptance_text(self, student_name: str, mentor_name: str, match_score: int) -> str:
        """Plain text acceptance notification"""
        return f"""
MATCH ACCEPTED!

Hi {student_name},

Congratulations! {mentor_name} has accepted your mentorship request ({match_score}% match).

You can now connect with your mentor through the platform to schedule your first meeting.

Visit: http://localhost:8080/student-match

© 2024 Mentor Match Platform
"""
    
    def _create_rejection_html(self, student_name: str, mentor_name: str) -> str:
        """Create HTML email for rejection notification"""
        return f"""
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">Match Update</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">
                                Hi <strong>{student_name}</strong>,
                            </p>
                            <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                                Thank you for your interest in connecting with <strong>{mentor_name}</strong>. Unfortunately, they're unable to take on new mentees at this time.
                            </p>
                            <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                                Don't worry! There are many other great mentors waiting to connect with you. Check out your other matches or browse for new opportunities.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="http://localhost:8080/student-match" style="display: inline-block; background-color: #667eea; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600;">
                                    Discover More Mentors
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f9fafb; text-align: center; border-radius: 0 0 8px 8px;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                                © 2024 Mentor Match Platform
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
    
    def _create_rejection_text(self, student_name: str, mentor_name: str) -> str:
        """Plain text rejection notification"""
        return f"""
MATCH UPDATE

Hi {student_name},

Thank you for your interest in connecting with {mentor_name}. Unfortunately, they're unable to take on new mentees at this time.

Don't worry! There are many other great mentors waiting to connect with you.

Visit: http://localhost:8080/student-match

© 2024 Mentor Match Platform
"""
