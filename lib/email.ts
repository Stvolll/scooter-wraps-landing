/**
 * Email notification service
 * Supports multiple email providers (Resend, SendGrid, SMTP)
 */

export interface EmailOptions {
  to: string
  subject: string
  html?: string
  text?: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Try Resend first (recommended)
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(options)
    }

    // Fallback to SendGrid
    if (process.env.SENDGRID_API_KEY) {
      return await sendViaSendGrid(options)
    }

    // Fallback to SMTP
    if (process.env.SMTP_HOST) {
      return await sendViaSMTP(options)
    }

    // If no email provider configured, log and return false
    console.warn('[EMAIL] No email provider configured. Email not sent:', options.subject)
    return false
  } catch (error: any) {
    console.error('[EMAIL] Error sending email:', error)
    return false
  }
}

async function sendViaResend(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: options.from || process.env.RESEND_FROM_EMAIL || 'noreply@txd.bike',
        to: options.to,
        subject: options.subject,
        html: options.html || options.text,
        text: options.text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Resend API error: ${JSON.stringify(error)}`)
    }

    return true
  } catch (error: any) {
    console.error('[EMAIL] Resend error:', error)
    throw error
  }
}

async function sendViaSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to }],
            subject: options.subject,
          },
        ],
        from: { email: options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@txd.bike' },
        content: [
          {
            type: options.html ? 'text/html' : 'text/plain',
            value: options.html || options.text || '',
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`SendGrid API error: ${error}`)
    }

    return true
  } catch (error: any) {
    console.error('[EMAIL] SendGrid error:', error)
    throw error
  }
}

async function sendViaSMTP(options: EmailOptions): Promise<boolean> {
  // SMTP implementation would require nodemailer
  // For now, just log that SMTP is configured
  console.log('[EMAIL] SMTP configured but not implemented. Use Resend or SendGrid.')
  return false
}

/**
 * Email templates
 */
export const emailTemplates = {
  orderConfirmation: (order: {
    orderId: string
    buyerName: string
    designTitle: string
    totalPrice: number
    paymentMethod: string
  }) => ({
    subject: `Order Confirmation - ${order.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%); padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">Order Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${order.buyerName},</p>
              <p>Thank you for your order! We've received your order and will process it shortly.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Design:</strong> ${order.designTitle}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Total:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}</p>
              </div>
              
              <p>We'll send you another email once your order is confirmed and ready for processing.</p>
              <p>If you have any questions, please contact us.</p>
            </div>
            <div class="footer">
              <p>TXD Scooter Wraps</p>
              <p>Premium Vinyl Wraps for Scooters</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Order Confirmation - ${order.orderId}

Dear ${order.buyerName},

Thank you for your order! We've received your order and will process it shortly.

Order Details:
- Order ID: ${order.orderId}
- Design: ${order.designTitle}
- Payment Method: ${order.paymentMethod}
- Total: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}

We'll send you another email once your order is confirmed and ready for processing.

TXD Scooter Wraps
    `,
  }),

  paymentConfirmed: (order: {
    orderId: string
    buyerName: string
    designTitle: string
  }) => ({
    subject: `Payment Confirmed - ${order.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%); padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">Payment Confirmed</h1>
            </div>
            <div class="content">
              <p>Dear ${order.buyerName},</p>
              <div class="success">
                <p><strong>✅ Payment Confirmed!</strong></p>
                <p>Your payment for order ${order.orderId} has been successfully processed.</p>
              </div>
              <p>We're now preparing your order "${order.designTitle}" for production.</p>
              <p>You'll receive updates as your order progresses through our production stages.</p>
            </div>
            <div class="footer">
              <p>TXD Scooter Wraps</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Payment Confirmed - ${order.orderId}

Dear ${order.buyerName},

✅ Payment Confirmed!

Your payment for order ${order.orderId} has been successfully processed.

We're now preparing your order "${order.designTitle}" for production.

You'll receive updates as your order progresses through our production stages.

TXD Scooter Wraps
    `,
  }),

  orderShipped: (order: {
    orderId: string
    buyerName: string
    trackingNumber?: string
  }) => ({
    subject: `Order Shipped - ${order.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%); padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .info { background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">Order Shipped</h1>
            </div>
            <div class="content">
              <p>Dear ${order.buyerName},</p>
              <div class="info">
                <p><strong>🚚 Your order is on the way!</strong></p>
                <p>Order ID: ${order.orderId}</p>
                ${order.trackingNumber ? `<p>Tracking Number: ${order.trackingNumber}</p>` : ''}
              </div>
              <p>Your order has been shipped and should arrive soon.</p>
            </div>
            <div class="footer">
              <p>TXD Scooter Wraps</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Order Shipped - ${order.orderId}

Dear ${order.buyerName},

🚚 Your order is on the way!

Order ID: ${order.orderId}
${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : ''}

Your order has been shipped and should arrive soon.

TXD Scooter Wraps
    `,
  }),
}
