/**
 * ZaloPay Payment Gateway Integration
 * Documentation: https://developers.zalopay.vn/
 */

export interface ZaloPayConfig {
  appId: string
  key1: string
  key2: string
  environment: 'sandbox' | 'production'
}

export interface ZaloPayPaymentRequest {
  appUser: string // User identifier
  amount: number // Amount in VND
  appTransId: string // Format: YYMMDD_<app_id>_<timestamp>
  appTime: number // Unix timestamp in milliseconds
  item: string // JSON string of items
  description: string
  embedData?: string // JSON string
  bankCode?: string // For bank transfer
  callbackUrl: string
}

export interface ZaloPayPaymentResponse {
  returnCode: number
  returnMessage: string
  subReturnCode?: number
  subReturnMessage?: string
  orderUrl?: string
  zpTransToken?: string
  qrCode?: string
}

const ZALOPAY_API_URL = {
  sandbox: 'https://sb-openapi.zalopay.vn/v2/create',
  production: 'https://openapi.zalopay.vn/v2/create',
}

export async function createZaloPayPayment(
  config: ZaloPayConfig,
  request: ZaloPayPaymentRequest
): Promise<ZaloPayPaymentResponse> {
  const apiUrl = ZALOPAY_API_URL[config.environment]

  // Prepare data for signature
  const data = `${config.appId}|${request.appTransId}|${request.appUser}|${request.amount}|${request.appTime}|${request.embedData || ''}|${request.item}`

  // Generate MAC (HMAC SHA256)
  const crypto = await import('crypto')
  const mac = crypto
    .createHmac('sha256', config.key1)
    .update(data)
    .digest('hex')

  // Prepare request body
  const requestBody = {
    app_id: config.appId,
    app_user: request.appUser,
    app_time: request.appTime,
    amount: request.amount,
    app_trans_id: request.appTransId,
    embed_data: request.embedData || '',
    item: request.item,
    description: request.description,
    bank_code: request.bankCode || '',
    callback_url: request.callbackUrl,
    mac,
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

    if (data.return_code === 1) {
      return {
        returnCode: 1,
        returnMessage: 'Success',
        orderUrl: data.order_url,
        zpTransToken: data.zp_trans_token,
        qrCode: data.qr_code,
      }
    } else {
      return {
        returnCode: data.return_code,
        returnMessage: data.return_message || 'Payment creation failed',
        subReturnCode: data.sub_return_code,
        subReturnMessage: data.sub_return_message,
      }
    }
  } catch (error: any) {
    console.error('ZaloPay API error:', error)
    throw new Error(`ZaloPay payment creation failed: ${error.message}`)
  }
}

export function verifyZaloPayCallback(
  config: ZaloPayConfig,
  data: Record<string, any>
): boolean {
  const { mac, ...rest } = data
  const dataString = Object.keys(rest)
    .sort()
    .map(key => `${key}=${rest[key]}`)
    .join('&')

  const crypto = require('crypto')
  const calculatedMac = crypto
    .createHmac('sha256', config.key2)
    .update(dataString)
    .digest('hex')

  return calculatedMac === mac
}





