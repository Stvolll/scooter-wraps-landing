# Security Documentation

## Overview

This document describes the security measures implemented in the TXD Scooter Wraps application, with special focus on financial transactions and cryptocurrency payments via Bybit API.

## Security Features

### 1. Security Headers

All responses include comprehensive security headers:

- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables XSS filtering
- **Content-Security-Policy (CSP)**: Restricts resource loading
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### 2. Rate Limiting

API endpoints are protected by rate limiting to prevent abuse:

- **General API**: 10 requests per 10 seconds
- **Payment/Booking endpoints**: 5 requests per minute
- **Admin endpoints**: 20 requests per 10 seconds
- **File uploads**: 10 requests per minute

Rate limiting uses:

- **Upstash Redis** (if configured) for distributed rate limiting
- **In-memory fallback** if Redis is not available

### 3. Input Validation & Sanitization

All user inputs are validated and sanitized using Zod schemas:

- Email validation
- Phone number validation (international format)
- String sanitization (removes HTML tags, scripts, etc.)
- Type-safe validation with TypeScript

### 4. CSRF Protection

CSRF tokens are generated and validated for state-changing operations.

### 5. Bybit API Security

#### HMAC Signature Verification

All Bybit API requests are signed using HMAC-SHA256:

```typescript
import { createBybitHeaders } from '@/lib/bybit-security'

const headers = createBybitHeaders({
  orderId: 'ORD-123',
  amount: 100,
  currency: 'USDT',
})
```

#### Webhook Verification

Bybit webhooks are verified using HMAC signatures:

```typescript
import { verifyBybitWebhook } from '@/lib/bybit-security'

if (!verifyBybitWebhook(request)) {
  return securityErrorResponse('Invalid signature', 401)
}
```

### 6. Database Security

- **Prisma ORM**: Protects against SQL injection
- **Parameterized queries**: All database queries use parameterized inputs
- **Connection encryption**: Database connections use SSL/TLS

### 7. Environment Variables

Sensitive data is stored in environment variables:

- API keys and secrets
- Database credentials
- Third-party service tokens

**Never commit `.env.local` to version control!**

## Security Best Practices

### For Developers

1. **Never log sensitive data**: Don't log API keys, passwords, or payment information
2. **Use HTTPS**: Always use HTTPS in production
3. **Validate all inputs**: Never trust user input
4. **Keep dependencies updated**: Regularly update npm packages
5. **Use strong secrets**: Generate strong random secrets for CSRF and encryption

### For Deployment

1. **Enable HTTPS**: Configure SSL/TLS certificates
2. **Set environment variables**: Configure all required environment variables
3. **Enable rate limiting**: Configure Upstash Redis for distributed rate limiting
4. **Monitor logs**: Set up monitoring for security events
5. **Regular backups**: Backup database regularly

## API Security

### Authentication

Admin endpoints require authentication (to be implemented):

```typescript
// Example: Admin API protection
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!isValidAdminToken(authHeader)) {
    return securityErrorResponse('Unauthorized', 401)
  }
  // ... rest of handler
}
```

### Payment Endpoints

Payment endpoints have additional security:

- Stricter rate limiting (5 req/min)
- Input validation with Zod
- Secure response headers
- Error logging without exposing sensitive data

## Bybit Integration Security

### API Key Management

1. Store `BYBIT_API_KEY` and `BYBIT_API_SECRET` in environment variables
2. Use separate `BYBIT_WEBHOOK_SECRET` for webhook verification
3. Rotate keys regularly
4. Use testnet for development

### Webhook Security

1. Always verify webhook signatures
2. Validate webhook payloads
3. Use idempotency keys to prevent duplicate processing
4. Log all webhook events

### Example: Secure Bybit Payment

```typescript
import { createBybitHeaders } from '@/lib/bybit-security'

const response = await fetch('https://api.bybit.com/v5/payment/create', {
  method: 'POST',
  headers: createBybitHeaders({
    orderId: 'ORD-123',
    amount: 100,
    currency: 'USDT',
  }),
  body: JSON.stringify({
    orderId: 'ORD-123',
    amount: 100,
    currency: 'USDT',
  }),
})
```

## Monitoring & Logging

Security events are logged:

- Failed authentication attempts
- Rate limit violations
- Invalid webhook signatures
- Validation errors

**Note**: In production, integrate with a monitoring service (e.g., Sentry, LogRocket).

## Compliance

### PCI DSS

For card payments, ensure:

- No card data stored on servers
- Use PCI-compliant payment processors
- Encrypt all payment data in transit

### GDPR

- Implement data encryption
- Provide data deletion capabilities
- Obtain user consent for data processing

## Security Checklist

- [x] Security headers configured
- [x] Rate limiting implemented
- [x] Input validation with Zod
- [x] CSRF protection
- [x] Bybit HMAC verification
- [x] Secure environment variables
- [ ] Admin authentication (to be implemented)
- [ ] Session management (to be implemented)
- [ ] Two-factor authentication (optional)
- [ ] Security monitoring dashboard (optional)

## Reporting Security Issues

If you discover a security vulnerability, please report it to: security@txd.bike

**Do not** create a public GitHub issue for security vulnerabilities.




