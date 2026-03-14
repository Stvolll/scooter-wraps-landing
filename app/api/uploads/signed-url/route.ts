// app/api/uploads/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client lazily (only when needed)
// This prevents errors if S3 is not configured
let s3Client: S3Client | null = null

function getS3Client(): S3Client | null {
  if (s3Client) return s3Client
  
  const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET_NAME
  const accessKey = process.env.S3_KEY || process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY
  
  // Check if S3 is configured (not placeholder values)
  if (!bucket || !accessKey || !secretKey || 
      bucket === 'your-bucket-name' || 
      accessKey === 'your-access-key-id' || 
      accessKey === '') {
    return null // S3 not configured
  }
  
  s3Client = new S3Client({
    region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  })
  
  return s3Client
}

// Removed file size limit - no restrictions for admin panel
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'application/octet-stream']

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType, fileSize } = await req.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename and contentType are required' }, { status: 400 })
    }

    // Validate content type
    const isImage = ALLOWED_IMAGE_TYPES.includes(contentType)
    const isModel = ALLOWED_MODEL_TYPES.includes(contentType) || filename.endsWith('.glb') || filename.endsWith('.gltf')
    const isVideo = contentType.startsWith('video/') || filename.endsWith('.mp4')

    if (!isImage && !isModel && !isVideo) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images, videos and 3D models are allowed.' },
        { status: 400 }
      )
    }

    // Check if S3 is configured
    const client = getS3Client()
    if (!client) {
      console.error('S3 not configured. Check environment variables: S3_BUCKET, S3_KEY, S3_SECRET')
      return NextResponse.json(
        { 
          error: 'S3 not configured. Please configure S3 credentials in environment variables.',
          details: 'S3 storage is required for file uploads. Contact administrator to configure S3 credentials.',
          configured: false
        }, 
        { status: 500 }
      )
    }

    const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json(
        { 
          error: 'S3 bucket not configured.',
          configured: false
        }, 
        { status: 500 }
      )
    }

    // Generate unique key using FileTypeDetector for proper folder structure
    const timestamp = Date.now()
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    
    // Use FileTypeDetector to determine folder based on filename
    const { FileTypeDetector } = await import('@/lib/utils/FileTypeDetector')
    const detectedType = FileTypeDetector.detect(filename)
    const folder = FileTypeDetector.getFolderForType(detectedType)
    
    // Construct key with proper folder structure
    const key = `designs/${folder}/${timestamp}-${sanitizedFilename}`

    // Create signed URL with longer expiration for large files
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
    })

    // Longer expiration for large files (5 minutes)
    const url = await getSignedUrl(client, command, { expiresIn: 300 })

    // Construct public URL
    const region = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1'
    const cloudFrontDomain = process.env.NEXT_PUBLIC_IMAGE_CDN_DOMAIN
    let publicUrl = ''
    
    if (cloudFrontDomain) {
      publicUrl = `https://${cloudFrontDomain}/${key}`
    } else {
      publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    }

    return NextResponse.json({
      url,
      key,
      publicUrl,
      expiresIn: 300,
    })
  } catch (error: any) {
    console.error('Signed URL error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}






