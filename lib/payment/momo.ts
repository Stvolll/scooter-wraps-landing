/**
 * MoMo Payment Gateway Integration
 * Documentation: https://developers.momo.vn/
 */

export interface MoMoConfig {
  partnerCode: string
  accessKey: string
  secretKey: string
  environment: 'sandbox' | 'production'
}

export interface MoMoPaymentRequest {
  orderId: string
  amount: number // Amount in VND
  orderInfo: string
  returnUrl: string
  notifyUrl: string
  extraData?: string
}

export interface MoMoPaymentResponse {
  requestId: string
  errorCode: number
  message: string
  payUrl?: string
  qrCodeUrl?: string
  deeplink?: string
}

const MOMO_API_URL = {
  sandbox: 'https://test-payment.momo.vn/v2/gateway/api/create',
  production: 'https://payment.momo.vn/v2/gateway/api/create',
}

export async function createMoMoPayment(
  config: MoMoConfig,
  request: MoMoPaymentRequest
): Promise<MoMoPaymentResponse> {
  const apiUrl = MOMO_API_URL[config.environment]

  // Generate request ID and request type
  const requestId = `${Date.now()}`
  const requestType = 'captureWallet'

  // Create raw signature string
  const rawSignature = `accessKey=${config.accessKey}&amount=${request.amount}&extraData=${request.extraData || ''}&ipnUrl=${request.notifyUrl}&orderId=${request.orderId}&orderInfo=${request.orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${request.returnUrl}&requestId=${requestId}&requestType=${requestType}`

  // Generate HMAC SHA256 signature
  const crypto = await import('crypto')
  const signature = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawSignature)
    .digest('hex')

  // Prepare request body
  const requestBody = {
    partnerCode: config.partnerCode,
    partnerName: 'TXD Scooter Wraps',
    storeId: config.partnerCode,
    requestId,
    amount: request.amount,
    orderId: request.orderId,
    orderInfo: request.orderInfo,
    redirectUrl: request.returnUrl,
    ipnUrl: request.notifyUrl,
    lang: 'vi',
    extraData: request.extraData || '',
    requestType,
    autoCapture: true,
    orderGroupId: '',
    signature,
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (data.resultCode === 0) {
      return {
        requestId,
        errorCode: 0,
        message: 'Success',
        payUrl: data.payUrl,
        qrCodeUrl: data.qrCodeUrl,
        deeplink: data.deeplink,
      }
    } else {
      return {
        requestId,
        errorCode: data.resultCode,
        message: data.message || 'Payment creation failed',
      }
    }
  } catch (error: any) {
    console.error('MoMo API error:', error)
    throw new Error(`MoMo payment creation failed: ${error.message}`)
  }
}

export function verifyMoMoSignature(
  config: MoMoConfig,
  data: Record<string, any>
): boolean {
  const { signature, ...rest } = data
  const rawSignature = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key]}`)
    .join('&')

  const crypto = require('crypto')
  const calculatedSignature = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawSignature)
    .digest('hex')

  return calculatedSignature === signature
}


