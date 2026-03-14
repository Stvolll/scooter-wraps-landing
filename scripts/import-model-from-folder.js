/**
 * Скрипт для импорта модели и дизайнов из папки MODEL
 * Использование: node scripts/import-model-from-folder.js
 */

const fs = require('fs')
const fsPromises = fs.promises
const path = require('path')
const FormData = require('form-data')
const fetch = require('node-fetch')

const MODEL_FOLDER = path.join(process.cwd(), 'public', 'models', 'MODEL')
const API_BASE = process.env.API_BASE || 'http://localhost:3000'

async function uploadFileToServer(filePath, folder) {
  const fileName = path.basename(filePath)
  const fileStat = await fsPromises.stat(filePath)
  const fileSizeMB = Math.round(fileStat.size / 1024 / 1024)
  
  // Используем правильный способ создания FormData для node-fetch
  const formData = new FormData()
  
  // Для больших файлов используем stream
  const fileStream = fs.createReadStream(filePath)
  formData.append('file', fileStream, {
    filename: fileName,
    contentType: fileName.endsWith('.glb') ? 'model/gltf-binary' : 
                 fileName.endsWith('.webp') ? 'image/webp' :
                 fileName.endsWith('.png') ? 'image/png' :
                 fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ? 'image/jpeg' :
                 fileName.endsWith('.mp4') ? 'video/mp4' : undefined,
  })
  
  if (folder) {
    formData.append('folder', folder)
  }
  
  // Для моделей с префиксом MODEL- используем customFilename
  if (fileName.startsWith('MODEL-')) {
    formData.append('customFilename', fileName)
  }
  
  console.log(`  📤 Загрузка ${fileName} (${fileSizeMB}MB)...`)
  
  const response = await fetch(`${API_BASE}/api/uploads/local`, {
    method: 'POST',
    body: formData,
    // Не устанавливаем Content-Type - FormData сам добавит boundary
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to upload ${fileName}: ${response.status} ${error}`)
  }
  
  const result = await response.json()
  console.log(`  ✅ Загружено: ${result.url}`)
  return result.url
}

async function findModelFile() {
  const files = await fsPromises.readdir(MODEL_FOLDER)
  const glbFile = files.find(f => f.endsWith('.glb') && f.startsWith('MODEL-'))
  return glbFile ? path.join(MODEL_FOLDER, glbFile) : null
}

async function importModel() {
  console.log('🔍 Поиск модели...')
  
  const modelPath = await findModelFile()
  if (!modelPath) {
    throw new Error('❌ Модель не найдена в папке MODEL')
  }
  
  const fileName = path.basename(modelPath)
  const modelName = fileName.replace('MODEL-', '').replace('.glb', '').replace(/-/g, ' ')
  const modelId = modelName.toLowerCase().replace(/\s+/g, '-')
  
  console.log(`📦 Найдена модель: ${modelName}`)
  console.log(`📁 Путь: ${modelPath}`)
  
  // Загружаем модель
  console.log('📤 Загрузка модели на сервер...')
  const modelUrl = await uploadFileToServer(modelPath, 'models')
  
  // Проверяем панораму
  let panoramaUrl = null
  try {
    const panoramaPath = path.join(MODEL_FOLDER, 'Panoramic-404.webp')
    await fsPromises.access(panoramaPath)
    panoramaUrl = await uploadFileToServer(panoramaPath, 'images')
  } catch {
    console.log('ℹ️ Панорама не найдена, пропускаем')
  }
  
  // Создаем модель в админке
  console.log('📝 Создание модели в админке...')
  const createResponse = await fetch(`${API_BASE}/api/admin/models`, {
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
    if (error.error && error.error.includes('already exists')) {
      console.log(`ℹ️ Модель "${modelId}" уже существует, пропускаем создание`)
    } else {
      throw new Error(`Failed to create model: ${error.error || JSON.stringify(error)}`)
    }
  } else {
    const result = await createResponse.json()
    console.log(`✅ Модель создана: ${result.model?.id || modelId}`)
  }
  
  return { modelId, modelName }
}

async function importDesigns(modelId) {
  console.log('\n🔍 Поиск дизайнов...')
  
  const designsFolder = path.join(MODEL_FOLDER, 'DESIGNS')
  const designFolders = await fsPromises.readdir(designsFolder)
  
  const designs = []
  
  for (const designFolder of designFolders) {
    const designPath = path.join(designsFolder, designFolder)
    const stat = await fsPromises.stat(designPath)
    
    if (!stat.isDirectory()) continue
    
    console.log(`\n📁 Обработка дизайна: ${designFolder}`)
    
    const files = await fsPromises.readdir(designPath)
    
    // Находим файлы по паттернам
    const uvFile = files.find(f => f.startsWith('UV-') && (f.endsWith('.jpg') || f.endsWith('.png')))
    if (!uvFile) {
      console.error(`  ❌ UV текстура не найдена, пропускаем`)
      continue
    }
    
    const photoFiles = files.filter(f => f.startsWith('PHOTO-'))
    const videoFiles = files.filter(f => f.startsWith('Video-'))
    const bgFile = files.find(f => f.startsWith('panoram-'))
    
    console.log(`  📄 UV текстура: ${uvFile}`)
    console.log(`  📸 Фото: ${photoFiles.length}`)
    console.log(`  🎬 Видео: ${videoFiles.length}`)
    console.log(`  🌅 Фон: ${bgFile || 'нет'}`)
    
    // Загружаем файлы
    const textureUrl = await uploadFileToServer(path.join(designPath, uvFile), 'images')
    
    const photos = []
    for (const photoFile of photoFiles) {
      const photoUrl = await uploadFileToServer(path.join(designPath, photoFile), 'images')
      photos.push(photoUrl)
    }
    
    const videos = []
    for (const videoFile of videoFiles) {
      const videoUrl = await uploadFileToServer(path.join(designPath, videoFile), 'videos')
      videos.push(videoUrl)
    }
    
    let backgroundUrl = null
    if (bgFile) {
      backgroundUrl = await uploadFileToServer(path.join(designPath, bgFile), 'images')
    }
    
    designs.push({
      name: designFolder,
      textureUrl,
      photos,
      videos,
      background: backgroundUrl,
    })
  }
  
  return designs
}

async function createDesign(modelId, design) {
  console.log(`\n📝 Создание дизайна: ${design.name}`)
  
  const designSlug = design.name.toLowerCase().replace(/\s+/g, '-')
  
  const designData = {
    title: design.name,
    slug: designSlug,
    scooterModel: modelId,
    textureUrl: design.textureUrl,
    galleryImages: design.photos,
    videoPreview: design.videos.length > 0 ? design.videos[0] : undefined,
    panorama: design.background,
  }
  
  const response = await fetch(`${API_BASE}/api/admin/designs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(designData),
  })
  
  if (!response.ok) {
    const error = await response.json()
    if (error.error && error.error.includes('already exists')) {
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
  console.log(`📂 Папка: ${MODEL_FOLDER}`)
  console.log(`🌐 API: ${API_BASE}\n`)
  
  try {
    // Проверяем существование папки
    await fsPromises.access(MODEL_FOLDER)
    
    // Импортируем модель
    const { modelId, modelName } = await importModel()
    
    // Импортируем дизайны
    const designs = await importDesigns(modelId)
    console.log(`\n✅ Найдено дизайнов: ${designs.length}`)
    
    // Создаем дизайны
    for (const design of designs) {
      await createDesign(modelId, design)
    }
    
    console.log('\n🎉 Импорт завершен успешно!')
    console.log(`\n📊 Итого:`)
    console.log(`  - Модель: ${modelName} (${modelId})`)
    console.log(`  - Дизайнов: ${designs.length}`)
    
  } catch (error) {
    console.error('\n❌ Ошибка импорта:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { importModel, importDesigns, createDesign }

