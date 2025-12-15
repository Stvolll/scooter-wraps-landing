/**
 * Batch Asset Upload API
 * Пакетная загрузка всех файлов для одного дизайна
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const dynamic = 'force-dynamic'

const s3Client = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_KEY || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET || process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const MAX_FILE_SIZES = {
  image: 5 * 1024 * 1024, // 5MB
  model: 50 * 1024 * 1024, // 50MB
  video: 100 * 1024 * 1024, // 100MB
  vector: 10 * 1024 * 1024, // 10MB
}

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  model: ['model/gltf-binary', 'application/octet-stream'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  vector: ['image/svg+xml', 'application/pdf'],
}

/**
 * POST /api/designs/[id]/assets/batch
 * Пакетная загрузка файлов для дизайна
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designId = params.id

    // Проверка существования дизайна
    const design = await prisma.design.findUnique({
      where: { id: designId },
    })

    if (!design) {
      return NextResponse.json({ success: false, error: 'Design not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const modelPropertiesJson = formData.get('modelProperties') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
    }

    const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 })
    }

    const uploadResults: Array<{
      type: string
      url: string
      key: string
      metadata?: any
    }> = []

    // Обработка каждого файла
    for (const file of files) {
      const fileType = formData.get(`type_${file.name}`) as string || 'unknown'
      const metadataJson = formData.get(`metadata_${file.name}`) as string | null

      // Определение категории файла
      let category: 'image' | 'model' | 'video' | 'vector' = 'image'
      if (file.type.startsWith('video/')) category = 'video'
      else if (file.type === 'model/gltf-binary' || file.name.endsWith('.glb')) category = 'model'
      else if (file.type === 'image/svg+xml' || file.name.endsWith('.svg') || file.name.endsWith('.pdf')) category = 'vector'
      else category = 'image'

      // Валидация размера
      const maxSize = MAX_FILE_SIZES[category]
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: `File ${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`,
          },
          { status: 400 }
        )
      }

      // Валидация типа
      const allowedTypes = ALLOWED_TYPES[category]
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.glb')) {
        return NextResponse.json(
          { success: false, error: `Invalid file type for ${file.name}: ${file.type}` },
          { status: 400 }
        )
      }

      // Генерация ключа для S3
      const timestamp = Date.now()
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const folder = category === 'image' ? 'images' : category === 'model' ? 'models' : category === 'video' ? 'videos' : 'vectors'
      const key = `designs/${design.slug}/${folder}/${timestamp}-${sanitizedFilename}`

      // Создание signed URL
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: file.type,
        ACL: 'public-read',
      })

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })

      // Загрузка файла в S3
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload ${file.name} to S3`)
      }

      // Формирование публичного URL
      const region = process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1'
      const cloudFrontDomain = process.env.NEXT_PUBLIC_IMAGE_CDN_DOMAIN
      const publicUrl = cloudFrontDomain
        ? `https://${cloudFrontDomain}/${key}`
        : `https://${bucket}.s3.${region}.amazonaws.com/${key}`

      uploadResults.push({
        type: fileType,
        url: publicUrl,
        key,
        metadata: metadataJson ? JSON.parse(metadataJson) : undefined,
      })
    }

    // Обновление дизайна с загруженными файлами
    const updateData: any = {}
    const texturesToCreate: Array<{
      url: string
      type: string
      format: string
      resolution?: string
      layer: number
    }> = []

    for (const result of uploadResults) {
      switch (result.type) {
        case 'cover':
          updateData.coverImage = result.url
          break
        case 'gallery':
          // Добавляем к существующим gallery images
          const currentGallery = design.galleryImages || []
          updateData.galleryImages = [...currentGallery, result.url]
          break
        case 'glb':
          updateData.glbModelUrl = result.url
          break
        case 'glb-compressed':
          updateData.glbModelCompressed = result.url
          break
        case 'glb-mobile':
          updateData.glbModelMobile = result.url
          break
        case 'texture':
          texturesToCreate.push({
            url: result.url,
            type: result.metadata?.textureType || 'diffuse',
            format: result.metadata?.format || 'png',
            resolution: result.metadata?.resolution,
            layer: result.metadata?.layer || 0,
          })
          break
        case 'video-preview':
          updateData.videoPreview = result.url
          break
        case 'video-full':
          updateData.videoFull = result.url
          break
        case 'video-tutorial':
          updateData.videoTutorial = result.url
          break
        case 'blueprint-svg':
          updateData.blueprintSvg = result.url
          break
        case 'blueprint-pdf':
          updateData.blueprintPdf = result.url
          break
        case 'thumbnail':
          updateData.thumbnail = result.url
          break
        case 'social-preview':
          updateData.socialPreview = result.url
          break
      }
    }

    // Сохранение в БД
    await prisma.$transaction(async (tx) => {
      // Обновление дизайна
      if (Object.keys(updateData).length > 0) {
        await tx.design.update({
          where: { id: designId },
          data: updateData,
        })
      }

      // Создание текстур
      if (texturesToCreate.length > 0) {
        await Promise.all(
          texturesToCreate.map(texture =>
            tx.designTexture.create({
              data: {
                designId,
                ...texture,
              },
            })
          )
        )
      }

      // Сохранение свойств модели
      if (modelPropertiesJson) {
        const modelProperties = JSON.parse(modelPropertiesJson)
        await tx.designModelProperties.upsert({
          where: { designId },
          update: modelProperties,
          create: {
            designId,
            ...modelProperties,
          },
        })
      }
    })

    return NextResponse.json({
      success: true,
      uploaded: uploadResults.length,
      results: uploadResults,
    })
  } catch (error: any) {
    console.error('Batch upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload files' },
      { status: 500 }
    )
  }
}





