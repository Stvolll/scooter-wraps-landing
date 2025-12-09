import { NextRequest, NextResponse } from 'next/server'
import { validateFile, generateSignedUploadUrl, getPublicUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

// POST /api/upload - Validate file and return signed URL for direct upload to S3
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'general' // images, videos, documents

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    // Validate file (size, extension, MIME type)
    const validation = validateFile(file, type)
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${originalName}`
    const key = `uploads/${type}/${filename}`

    // Generate signed URL for direct upload to S3
    const signedUrl = await generateSignedUploadUrl(filename, file.type, type)

    // Return signed URL and file metadata
    // Client will upload directly to S3 using this signed URL
    return NextResponse.json({
      success: true,
      data: {
        signedUrl,
        key, // S3 key for reference
        filename,
        mimetype: file.type,
        size: file.size,
        // Public URL will be constructed after upload
        // Client should call GET /api/upload/url?key=... to get public URL after upload
      },
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}

// GET /api/upload/url?key=... - Get public URL for uploaded file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Key parameter is required' },
        { status: 400 }
      )
    }

    const publicUrl = getPublicUrl(key)

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        key,
      },
    })
  } catch (error: any) {
    console.error('Get URL error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get file URL' },
      { status: 500 }
    )
  }
}
