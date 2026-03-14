// app/api/uploads/simple/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Simple upload request received')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log(`📦 File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    // Создаем директорию
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Уникальное имя
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${uuidv4()}-${sanitizedName}`
    const filePath = path.join(uploadDir, fileName)

    // Сохраняем
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${fileName}`

    console.log(`✅ File saved: ${fileUrl}`)

    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        name: file.name,
        fileName: fileName,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('❌ Simple upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}




