import { format } from "date-fns";

interface EmailTemplateProps {
  userName: string;
  userEmail: string;
}

interface SessionBookingEmailProps extends EmailTemplateProps {
  sessionTitle: string;
  sessionDate: Date;
  sessionTime: string;
  amountPaid: number;
  paymentId: string;
}

interface AppointmentBookingEmailProps extends EmailTemplateProps {
  doctorName: string;
  appointmentDate: Date;
  appointmentTime: string;
  planName: string;
  serviceType: string;
  meetingLink?: string;
}

interface AppointmentRescheduleEmailProps extends EmailTemplateProps {
  doctorName: string;
  oldDate: Date;
  newDate: Date;
  oldTime: string;
  newTime: string;
  planName: string;
}

interface AppointmentCancelEmailProps extends EmailTemplateProps {
  doctorName: string;
  appointmentDate: Date;
  appointmentTime: string;
  planName: string;
  refundAmount?: number;
  hasRefund: boolean;
}

// Base template with Shewell branding
const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shewell</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: 2px;
    }
    .tagline {
      color: #ffffff;
      font-size: 14px;
      margin-top: 10px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    .info-box {
      background-color: #f8f9ff;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #666666;
    }
    .info-value {
      color: #1a1a1a;
      font-weight: 500;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #1a1a1a;
      color: #ffffff;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-link {
      color: #667eea;
      text-decoration: none;
      margin: 0 10px;
    }
    .social-links {
      margin: 20px 0;
    }
    .highlight {
      color: #667eea;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SHEWELL</div>
      <div class="tagline">Your Wellness Partner</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>Shewell</strong> - Empowering Your Health & Wellness Journey</p>
      <div class="footer-links">
        <a href="${process.env.NEXTAUTH_URL}" class="footer-link">Home</a>
        <a href="${process.env.NEXTAUTH_URL}/counselling" class="footer-link">Book Expert</a>
        <a href="${process.env.NEXTAUTH_URL}/profile/appointments" class="footer-link">My Appointments</a>
      </div>
      <p style="font-size: 12px; color: #888888; margin-top: 20px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
`;

export const getSessionBookingEmailTemplate = ({
  userName,
  sessionTitle,
  sessionDate,
  sessionTime,
  amountPaid,
  paymentId,
}: SessionBookingEmailProps) => {
  const content = `
    <div class="greeting">Hi ${userName}! 🎉</div>
    <p>Great news! Your session has been successfully booked. We're excited to have you join us!</p>
    
    <div class="info-box">
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #667eea;">
        Session Details
      </div>
      <div class="info-row">
        <span class="info-label">Session:</span>
        <span class="info-value">${sessionTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${format(sessionDate, "MMMM dd, yyyy")}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${sessionTime}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount Paid:</span>
        <span class="info-value">₹${(amountPaid / 100).toFixed(2)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment ID:</span>
        <span class="info-value">${paymentId}</span>
      </div>
    </div>

    <p>Your session confirmation has been recorded. You can view all your bookings in your account dashboard.</p>
    
    <div style="text-align: center;">
      <a href="${process.env.NEXTAUTH_URL}/profile/sessions" class="button">View My Sessions</a>
    </div>

    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #666666;">
      <strong>Important:</strong> Please arrive 5 minutes early for online sessions to ensure a smooth start.
    </p>
    
    <p>If you have any questions, feel free to contact our support team.</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong class="highlight">Team Shewell</strong>
    </p>
  `;

  return {
    html: getBaseTemplate(content),
    subject: `✅ Session Booking Confirmed - ${sessionTitle}`,
  };
};

export const getAppointmentBookingEmailTemplate = ({
  userName,
  doctorName,
  appointmentDate,
  appointmentTime,
  planName,
  serviceType,
  meetingLink,
}: AppointmentBookingEmailProps) => {
  const content = `
    <div class="greeting">Hi ${userName}! 🎉</div>
    <p>Your appointment has been successfully booked. We look forward to helping you on your wellness journey!</p>
    
    <div class="info-box">
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #667eea;">
        Appointment Details
      </div>
      <div class="info-row">
        <span class="info-label">Expert:</span>
        <span class="info-value">${doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Plan:</span>
        <span class="info-value">${planName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Service Type:</span>
        <span class="info-value">${serviceType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${format(appointmentDate, "MMMM dd, yyyy")}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${appointmentTime}</span>
      </div>
      ${meetingLink ? `
      <div class="info-row">
        <span class="info-label">Meeting Link:</span>
        <span class="info-value"><a href="${meetingLink}" style="color: #667eea;">Join Meeting</a></span>
      </div>
      ` : ''}
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXTAUTH_URL}/profile/appointments" class="button">View My Appointments</a>
    </div>

    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #666666;">
      <strong>Reminder:</strong> Please be available at the scheduled time. If you need to reschedule, you can do so from your appointments dashboard at least 2 hours before the scheduled time.
    </p>
    
    <p>We're here to support you every step of the way!</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong class="highlight">Team Shewell</strong>
    </p>
  `;

  return {
    html: getBaseTemplate(content),
    subject: `✅ Appointment Confirmed with ${doctorName}`,
  };
};

export const getAppointmentRescheduleEmailTemplate = ({
  userName,
  doctorName,
  oldDate,
  newDate,
  oldTime,
  newTime,
  planName,
}: AppointmentRescheduleEmailProps) => {
  const content = `
    <div class="greeting">Hi ${userName}! 📅</div>
    <p>Your appointment has been successfully rescheduled.</p>
    
    <div class="info-box">
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #667eea;">
        Updated Appointment Details
      </div>
      <div class="info-row">
        <span class="info-label">Expert:</span>
        <span class="info-value">${doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Plan:</span>
        <span class="info-value">${planName}</span>
      </div>
    </div>

    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <div style="font-weight: 600; margin-bottom: 10px;">Previous Schedule:</div>
      <div style="text-decoration: line-through; color: #666;">
        ${format(oldDate, "MMMM dd, yyyy")} at ${oldTime}
      </div>
      
      <div style="font-weight: 600; margin-top: 15px; margin-bottom: 10px; color: #28a745;">New Schedule:</div>
      <div style="font-size: 16px; font-weight: 700; color: #28a745;">
        ${format(newDate, "MMMM dd, yyyy")} at ${newTime}
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXTAUTH_URL}/profile/appointments" class="button">View Appointment</a>
    </div>

    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #666666;">
      A calendar update has been sent if you had enabled calendar sync. Please update your personal calendar accordingly.
    </p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong class="highlight">Team Shewell</strong>
    </p>
  `;

  return {
    html: getBaseTemplate(content),
    subject: `📅 Appointment Rescheduled - ${doctorName}`,
  };
};

export const getAppointmentCancelEmailTemplate = ({
  userName,
  doctorName,
  appointmentDate,
  appointmentTime,
  planName,
  refundAmount,
  hasRefund,
}: AppointmentCancelEmailProps) => {
  const content = `
    <div class="greeting">Hi ${userName},</div>
    <p>Your appointment has been cancelled as requested.</p>
    
    <div class="info-box">
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #667eea;">
        Cancelled Appointment Details
      </div>
      <div class="info-row">
        <span class="info-label">Expert:</span>
        <span class="info-value">${doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Plan:</span>
        <span class="info-value">${planName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${format(appointmentDate, "MMMM dd, yyyy")}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${appointmentTime}</span>
      </div>
    </div>

    ${hasRefund ? `
    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <div style="font-weight: 600; color: #155724; margin-bottom: 10px;">💰 Refund Information</div>
      <p style="margin: 0; color: #155724;">
        A refund of <strong>₹${((refundAmount || 0) / 100).toFixed(2)}</strong> will be processed to your original payment method within 5-7 business days.
      </p>
    </div>
    ` : `
    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <div style="font-weight: 600; color: #721c24; margin-bottom: 10px;">⚠️ No Refund Available</div>
      <p style="margin: 0; color: #721c24;">
        As per our cancellation policy, this appointment was cancelled within 2 hours of the scheduled time and is not eligible for a refund.
      </p>
    </div>
    `}

    <p>We're sorry to see you cancel. If there's anything we can do to improve your experience, please don't hesitate to reach out.</p>

    <div style="text-align: center;">
      <a href="${process.env.NEXTAUTH_URL}/counselling" class="button">Book Another Appointment</a>
    </div>

    <div class="divider"></div>
    
    <p style="font-size: 14px; color: #666666;">
      You can view your appointment history in your dashboard at any time.
    </p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong class="highlight">Team Shewell</strong>
    </p>
  `;

  return {
    html: getBaseTemplate(content),
    subject: `❌ Appointment Cancelled - ${doctorName}`,
  };
};

// Doctor notification templates
export const getDoctorAppointmentBookingEmailTemplate = ({
  doctorName,
  patientName,
  appointmentDate,
  appointmentTime,
  planName,
  serviceType,
  meetingLink,
}: {
  doctorName: string;
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
  planName: string;
  serviceType: string;
  meetingLink?: string;
}) => {
  const content = `
    <div class="greeting">Hi Dr. ${doctorName}! 👨‍⚕️</div>
    <p>You have a new appointment booking.</p>
    
    <div class="info-box">
      <div style="font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #667eea;">
        Appointment Details
      </div>
      <div class="info-row">
        <span class="info-label">Patient:</span>
        <span class="info-value">${patientName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Plan:</span>
        <span class="info-value">${planName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Service Type:</span>
        <span class="info-value">${serviceType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${format(appointmentDate, "MMMM dd, yyyy")}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${appointmentTime}</span>
      </div>
      ${meetingLink ? `
      <div class="info-row">
        <span class="info-label">Meeting Link:</span>
        <span class="info-value"><a href="${meetingLink}" style="color: #667eea;">Join Meeting</a></span>
      </div>
      ` : ''}
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_PROFESSIONAL}/appointments" class="button">View Dashboard</a>
    </div>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong class="highlight">Team Shewell</strong>
    </p>
  `;

  return {
    html: getBaseTemplate(content),
    subject: `🔔 New Appointment - ${patientName}`,
  };
};
