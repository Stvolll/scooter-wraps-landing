/**
 * File-based storage for models and designs
 * Provides persistence across server restarts
 */

import fs from 'fs'
import path from 'path'

const STORAGE_DIR = path.join(process.cwd(), '.data')
const MODELS_FILE = path.join(STORAGE_DIR, 'models.json')
const DESIGNS_FILE = path.join(STORAGE_DIR, 'designs.json')

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true })
}

export class FileStorage {
  static loadModels(): any[] {
    try {
      if (fs.existsSync(MODELS_FILE)) {
        const data = fs.readFileSync(MODELS_FILE, 'utf-8')
        const models = JSON.parse(data)
        console.log(`[FileStorage] Loaded ${models.length} models from disk`)
        return models
      }
    } catch (error: any) {
      console.error('[FileStorage] Error loading models:', error.message)
    }
    return []
  }

  static saveModels(models: any[]): void {
    try {
      fs.writeFileSync(MODELS_FILE, JSON.stringify(models, null, 2))
      console.log(`[FileStorage] Saved ${models.length} models to disk`)
    } catch (error: any) {
      console.error('[FileStorage] Error saving models:', error.message)
    }
  }

  static loadDesigns(): any[] {
    try {
      if (fs.existsSync(DESIGNS_FILE)) {
        const data = fs.readFileSync(DESIGNS_FILE, 'utf-8')
        const designs = JSON.parse(data)
        console.log(`[FileStorage] Loaded ${designs.length} designs from disk`)
        return designs
      }
    } catch (error: any) {
      console.error('[FileStorage] Error loading designs:', error.message)
    }
    return []
  }

  static saveDesigns(designs: any[]): void {
    try {
      fs.writeFileSync(DESIGNS_FILE, JSON.stringify(designs, null, 2))
      console.log(`[FileStorage] Saved ${designs.length} designs to disk`)
    } catch (error: any) {
      console.error('[FileStorage] Error saving designs:', error.message)
    }
  }
}


