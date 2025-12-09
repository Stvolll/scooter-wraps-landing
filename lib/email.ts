import nodemailer from 'nodemailer'

/**
 * Create email transporter
 * In production, configure with real SMTP settings
 */
function createTransporter() {
  // For development, use console logging
  // In production, configure with real SMTP (Gmail, SendGrid, etc.)
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  // Development: log emails to console
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  })
}

/**
 * Send 2FA code via email
 */
export async function send2FACode(email: string, code: string): Promise<void> {
  const transporter = createTransporter()

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@txd.bike',
    to: email,
    subject: 'Your 2FA Code - TXD Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00FFA9;">Two-Factor Authentication</h2>
        <p>Your verification code is:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    text: `Your 2FA code is: ${code}. This code will expire in 10 minutes.`,
  }

  try {
    if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
      await transporter.sendMail(mailOptions)
    } else {
      // Development: log to console
      console.log('📧 [DEV] 2FA Email would be sent:')
      console.log('   To:', email)
      console.log('   Code:', code)
      console.log('   In production, configure SMTP settings in .env')
    }
  } catch (error) {
    console.error('Failed to send 2FA email:', error)
    throw new Error('Failed to send 2FA code')
  }
}
