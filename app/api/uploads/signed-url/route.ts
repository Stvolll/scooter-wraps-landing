// app/api/uploads/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_KEY || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const MAX_UPLOAD_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES || '10485760') // 10MB default
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'application/octet-stream']

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, fileSize } = await req.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 })
    }

    // Validate file size
    if (fileSize && fileSize > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `File size exceeds maximum of ${MAX_UPLOAD_BYTES / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Validate content type
    const isImage = ALLOWED_IMAGE_TYPES.includes(contentType)
    const isModel = ALLOWED_MODEL_TYPES.includes(contentType) || filename.endsWith('.glb')

    if (!isImage && !isModel) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and 3D models are allowed.' },
        { status: 400 }
      )
    }

    const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 })
    }

    // Generate unique key
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const folder = isImage ? 'images' : 'models'
    const key = `designs/${folder}/${timestamp}-${sanitizedFilename}`

    // Create signed URL
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 })

    return NextResponse.json({
      url,
      key,
      expiresIn: 60,
    })
  } catch (error: any) {
    console.error('Signed URL error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}

