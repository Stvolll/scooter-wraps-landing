/**
 * Скрипт для импорта модели и дизайнов из папки MODEL
 * Согласно MODEL_DESIGN_SYSTEM_AUTONOMOUS.md и ADMIN_PANEL_MODEL_DESIGN_SYSTEM.md
 */

import { readFile, readdir, stat } from 'fs/promises'
import { join } from 'path'
import { FileTypeDetector } from '../lib/utils/FileTypeDetector'

const MODEL_FOLDER = join(process.cwd(), 'public', 'models', 'MODEL')

interface ModelInfo {
  name: string
  glbPath: string
  glbUrl: string
  panoramaUrl?: string
}

interface DesignInfo {
  name: string
  folder: string
  mainTexture: {
    path: string
    url: string
  }
  photos: Array<{
    path: string
    url: string
  }>
  videos: Array<{
    path: string
    url: string
  }>
  background?: {
    path: string
    url: string
  }
}

async function findModelFile(): Promise<string | null> {
  try {
    const files = await readdir(MODEL_FOLDER)
    const glbFile = files.find(f => f.endsWith('.glb') && f.startsWith('MODEL-'))
    return glbFile ? join(MODEL_FOLDER, glbFile) : null
  } catch (error) {
    console.error('Error finding model file:', error)
    return null
  }
}

async function uploadFileToServer(filePath: string, folder?: string): Promise<string> {
  const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'file'
  const fileBuffer = await readFile(filePath)
  const file = new File([fileBuffer], fileName, { type: 'application/octet-stream' })
  
  const formData = new FormData()
  formData.append('file', file)
  if (folder) {
    formData.append('folder', folder)
  }
  
  // Определяем тип файла и используем правильный endpoint
  const detectedType = FileTypeDetector.detect(fileName)
  const uploadFolder = folder || FileTypeDetector.getFolderForType(detectedType)
  
  // Используем /api/uploads/local для загрузки
  const response = await fetch('http://localhost:3000/api/uploads/local', {
    method: 'POST',
    body: formData,
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload ${fileName}: ${error}`)
  }
  
  const result = await response.json()
  return result.url
}

async function importModel(): Promise<ModelInfo | null> {
  console.log('🔍 Поиск модели...')
  
  const modelPath = await findModelFile()
  if (!modelPath) {
    console.error('❌ Модель не найдена в папке MODEL')
    return null
  }
  
  const fileName = modelPath.split('/').pop() || modelPath.split('\\').pop() || ''
  const modelName = fileName.replace('MODEL-', '').replace('.glb', '').replace(/-/g, ' ')
  
  console.log(`📦 Найдена модель: ${modelName}`)
  console.log(`📁 Путь: ${modelPath}`)
  
  // Загружаем модель на сервер
  console.log('📤 Загрузка модели на сервер...')
  const modelUrl = await uploadFileToServer(modelPath, 'models')
  console.log(`✅ Модель загружена: ${modelUrl}`)
  
  // Проверяем наличие панорамы
  let panoramaUrl: string | undefined
  try {
    const panoramaPath = join(MODEL_FOLDER, 'Panoramic-404.webp')
    const panoramaStat = await stat(panoramaPath)
    if (panoramaStat.isFile()) {
      console.log('📤 Загрузка панорамы...')
      panoramaUrl = await uploadFileToServer(panoramaPath, 'images')
      console.log(`✅ Панорама загружена: ${panoramaUrl}`)
    }
  } catch {
    console.log('ℹ️ Панорама не найдена, пропускаем')
  }
  
  // Создаем модель в админке
  console.log('📝 Создание модели в админке...')
  const modelId = modelName.toLowerCase().replace(/\s+/g, '-')
  
  const createResponse = await fetch('http://localhost:3000/api/admin/models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: modelName,
      id: modelId,
      model: modelUrl,
      panorama: panoramaUrl,
    }),
  })
  
  if (!createResponse.ok) {
    const error = await createResponse.json()
    if (error.error?.includes('already exists')) {
      console.log(`ℹ️ Модель "${modelId}" уже существует, пропускаем создание`)
    } else {
      throw new Error(`Failed to create model: ${error.error || JSON.stringify(error)}`)
    }
  } else {
    const result = await createResponse.json()
    console.log(`✅ Модель создана: ${result.model?.id || modelId}`)
  }
  
  return {
    name: modelName,
    glbPath: modelPath,
    glbUrl: modelUrl,
    panoramaUrl,
  }
}

async function importDesigns(modelId: string): Promise<DesignInfo[]> {
  console.log('🔍 Поиск дизайнов...')
  
  const designsFolder = join(MODEL_FOLDER, 'DESIGNS')
  const designFolders = await readdir(designsFolder)
  
  const designs: DesignInfo[] = []
  
  for (const designFolder of designFolders) {
    const designPath = join(designsFolder, designFolder)
    const designStat = await stat(designPath)
    
    if (!designStat.isDirectory()) continue
    
    console.log(`\n📁 Обработка дизайна: ${designFolder}`)
    
    const files = await readdir(designPath)
    
    // Находим основную текстуру (UV-*.jpg)
    const uvFile = files.find(f => f.startsWith('UV-') && (f.endsWith('.jpg') || f.endsWith('.png')))
    if (!uvFile) {
      console.error(`❌ UV текстура не найдена в ${designFolder}, пропускаем`)
      continue
    }
    
    // Находим фото (PHOTO-*.png)
    const photoFiles = files.filter(f => f.startsWith('PHOTO-'))
    
    // Находим видео (Video-*.mp4)
    const videoFiles = files.filter(f => f.startsWith('Video-'))
    
    // Находим фон (panoram-*.webp)
    const bgFile = files.find(f => f.startsWith('panoram-'))
    
    console.log(`  📄 UV текстура: ${uvFile}`)
    console.log(`  📸 Фото: ${photoFiles.length}`)
    console.log(`  🎬 Видео: ${videoFiles.length}`)
    console.log(`  🌅 Фон: ${bgFile || 'нет'}`)
    
    // Загружаем файлы
    const mainTexturePath = join(designPath, uvFile)
    console.log(`  📤 Загрузка текстуры...`)
    const textureUrl = await uploadFileToServer(mainTexturePath, 'images')
    
    const photos: Array<{ path: string; url: string }> = []
    for (const photoFile of photoFiles) {
      const photoPath = join(designPath, photoFile)
      console.log(`  📤 Загрузка фото: ${photoFile}`)
      const photoUrl = await uploadFileToServer(photoPath, 'images')
      photos.push({ path: photoPath, url: photoUrl })
    }
    
    const videos: Array<{ path: string; url: string }> = []
    for (const videoFile of videoFiles) {
      const videoPath = join(designPath, videoFile)
      console.log(`  📤 Загрузка видео: ${videoFile}`)
      const videoUrl = await uploadFileToServer(videoPath, 'videos')
      videos.push({ path: videoPath, url: videoUrl })
    }
    
    let background: { path: string; url: string } | undefined
    if (bgFile) {
      const bgPath = join(designPath, bgFile)
      console.log(`  📤 Загрузка фона: ${bgFile}`)
      const bgUrl = await uploadFileToServer(bgPath, 'images')
      background = { path: bgPath, url: bgUrl }
    }
    
    designs.push({
      name: designFolder,
      folder: designFolder,
      mainTexture: {
        path: mainTexturePath,
        url: textureUrl,
      },
      photos,
      videos,
      background,
    })
  }
  
  return designs
}

async function createDesign(modelId: string, design: DesignInfo): Promise<void> {
  console.log(`\n📝 Создание дизайна: ${design.name}`)
  
  const designSlug = design.name.toLowerCase().replace(/\s+/g, '-')
  
  const designData = {
    title: design.name,
    slug: designSlug,
    scooterModel: modelId,
    textureUrl: design.mainTexture.url,
    galleryImages: design.photos.map(p => p.url),
    videoPreview: design.videos.length > 0 ? design.videos[0].url : undefined,
    panorama: design.background?.url,
  }
  
  const response = await fetch('http://localhost:3000/api/admin/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(designData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    if (error.error?.includes('already exists')) {
      console.log(`  ℹ️ Дизайн "${designSlug}" уже существует, пропускаем`)
    } else {
      throw new Error(`Failed to create design: ${error.error || JSON.stringify(error)}`)
    }
  } else {
    const result = await response.json()
    console.log(`  ✅ Дизайн создан: ${result.design?.slug || designSlug}`)
  }
}

async function main() {
  console.log('🚀 Начало импорта модели и дизайнов из папки MODEL\n')
  
  try {
    // Импортируем модель
    const model = await importModel()
    if (!model) {
      console.error('❌ Не удалось импортировать модель')
      process.exit(1)
    }
    
    const modelId = model.name.toLowerCase().replace(/\s+/g, '-')
    
    // Импортируем дизайны
    const designs = await importDesigns(modelId)
    console.log(`\n✅ Найдено дизайнов: ${designs.length}`)
    
    // Создаем дизайны в админке
    for (const design of designs) {
      await createDesign(modelId, design)
    }
    
    console.log('\n🎉 Импорт завершен успешно!')
    console.log(`\n📊 Итого:`)
    console.log(`  - Модель: ${model.name}`)
    console.log(`  - Дизайнов: ${designs.length}`)
    
  } catch (error) {
    console.error('\n❌ Ошибка импорта:', error)
    process.exit(1)
  }
}

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
  main()
}

export { importModel, importDesigns, createDesign }




