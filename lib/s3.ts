import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''

// Allowed file types and their max sizes
const ALLOWED_TYPES = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  videos: {
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    maxSize: 100 * 1024 * 1024, // 100MB
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.txt'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  general: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
}

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateFile(file: File, type: string = 'general'): FileValidationResult {
  const config = ALLOWED_TYPES[type as keyof typeof ALLOWED_TYPES] || ALLOWED_TYPES.general

  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${config.maxSize / (1024 * 1024)}MB limit`,
    }
  }

  // Check file extension
  const fileName = file.name.toLowerCase()
  const extension = fileName.substring(fileName.lastIndexOf('.'))
  if (!config.extensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed. Allowed: ${config.extensions.join(', ')}`,
    }
  }

  // Check MIME type
  if (file.type && !config.mimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed: ${config.mimeTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

export async function generateSignedUploadUrl(
  filename: string,
  contentType: string,
  type: string = 'general'
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured')
  }

  // Generate unique file path
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const key = `uploads/${type}/${timestamp}-${sanitizedFilename}`

  // Create PutObject command
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    // Optional: Add metadata
    Metadata: {
      uploadedAt: new Date().toISOString(),
      originalFilename: filename,
    },
  })

  // Generate signed URL (valid for 5 minutes)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

  return signedUrl
}

export function getPublicUrl(key: string): string {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not configured')
  }

  // Construct public URL (assuming bucket is public or using CloudFront)
  const region = process.env.AWS_REGION || 'us-east-1'
  const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN

  if (cloudFrontDomain) {
    // Remove leading slash if present
    const cleanKey = key.startsWith('/') ? key.slice(1) : key
    return `https://${cloudFrontDomain}/${cleanKey}`
  }

  // Remove leading slash if present
  const cleanKey = key.startsWith('/') ? key.slice(1) : key
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${cleanKey}`
}

export function extractKeyFromUrl(url: string): string {
  // Extract key from S3 URL or CloudFront URL
  const s3Match = url.match(/s3[.-]([^.]+)\.amazonaws\.com\/(.+)$/)
  const cloudFrontMatch = url.match(/https?:\/\/[^/]+\/(.+)$/)

  if (cloudFrontMatch) {
    return cloudFrontMatch[1]
  }

  if (s3Match) {
    return s3Match[2]
  }

  // If it's already a key (starts with uploads/)
  if (url.startsWith('uploads/')) {
    return url
  }

  throw new Error('Invalid S3 URL format')
}
