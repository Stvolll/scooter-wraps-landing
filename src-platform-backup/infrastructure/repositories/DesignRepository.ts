import type { IDesignRepository } from '@/domain'
import { Design } from '@/domain'
import type { DesignId, ModelId } from '@/shared-core'
import { FileStorage } from '@/infrastructure/storage/FileStorage'

// CRITICAL: Global singleton - must be at module level, not class level
// This ensures the same instance is used across all imports
const globalDesignStore = new Map<DesignId, Design>()

// Load designs from file storage - use lazy loading to prevent blocking
// Designs will be loaded on first access via getAll() or getById()
let designsLoading = false
let designsLoaded = false

async function loadDesignsAsync() {
  if (designsLoaded || designsLoading) return
  designsLoading = true
  
  try {
    console.log('[DesignRepository] Starting to load designs from file storage...')
    const savedDesigns = FileStorage.loadDesigns()
    console.log(`[DesignRepository] FileStorage returned ${savedDesigns.length} designs`)
    
    if (savedDesigns.length > 0) {
      // Import required classes dynamically
      const domain = await import('@/domain')
      const { TextureMaterial, PhotoMaterial, VideoMaterial, BackgroundMaterial, SupportMaterials, DesignVersion, Design: DesignClass } = domain
      
      savedDesigns.forEach((designData: any, index: number) => {
        try {
          // Reconstruct mainTexture
          const mainTexture = new TextureMaterial(
            designData.mainTexture.id,
            designData.mainTexture.payload
          )
          
          // Reconstruct supportMaterials
          const photos = (designData.supportMaterials?.photos || []).map((p: any) => {
            return new PhotoMaterial(p.id, p.payload)
          })
          
          const videos = (designData.supportMaterials?.videos || []).map((v: any) => {
            return new VideoMaterial(v.id, v.payload)
          })
          
          let background = undefined
          if (designData.supportMaterials?.sceneBackground) {
            background = new BackgroundMaterial(
              designData.supportMaterials.sceneBackground.id,
              designData.supportMaterials.sceneBackground.payload
            )
          }
          
          const supportMaterials = new SupportMaterials(photos, videos, background)
          
          // Reconstruct version
          const version = new DesignVersion(
            designData.version.major,
            designData.version.minor,
            designData.version.patch,
            designData.version.status
          )
          
          const design = new DesignClass(
            designData.id,
            designData.modelId,
            designData.name,
            mainTexture,
            supportMaterials,
            version,
            designData.status,
            designData.previewImageUrl,
            new Date(designData.createdAt),
            new Date(designData.updatedAt)
          )
          
          globalDesignStore.set(design.id, design)
        } catch (itemError: any) {
          console.error(`[DesignRepository] Error loading design ${index}:`, itemError.message)
          // Continue loading other designs even if one fails
        }
      })
    }
    
    designsLoaded = true
    console.log(`[DesignRepository] Successfully loaded ${globalDesignStore.size} designs from file storage`)
  } catch (error: any) {
    console.error('[DesignRepository] Error loading designs from file storage:', error.message)
    if (error.stack) {
      console.error('[DesignRepository] Error stack:', error.stack)
    }
    // Don't throw - allow module to load even if file storage fails
  } finally {
    designsLoading = false
  }
}

// Start loading asynchronously on server side (non-blocking)
if (typeof window === 'undefined') {
  loadDesignsAsync().catch((err) => {
    console.error('[DesignRepository] Failed to load designs asynchronously:', err)
  })
}

// Singleton pattern for in-memory storage
// In production, replace with database persistence
class DesignStore {
  private static instance: DesignStore
  private designs = globalDesignStore // Use global Map to ensure persistence

  static getInstance(): DesignStore {
    if (!DesignStore.instance) {
      console.log('[DesignStore] Creating new singleton instance')
      DesignStore.instance = new DesignStore()
    } else {
      console.log('[DesignStore] Using existing singleton instance')
    }
    return DesignStore.instance
  }

  getDesigns(): Map<DesignId, Design> {
    console.log(`[DesignStore] getDesigns(): Returning ${this.designs.size} designs`)
    if (this.designs.size > 0) {
      console.log(`[DesignStore] Design IDs:`, Array.from(this.designs.keys()))
    }
    return this.designs
  }
}

export class DesignRepository implements IDesignRepository {
  private store = DesignStore.getInstance()

  async getById(id: DesignId): Promise<Design | null> {
    // Ensure designs are loaded before returning
    if (!designsLoaded && typeof window === 'undefined') {
      await loadDesignsAsync()
    }
    
    const designs = this.store.getDesigns()
    console.log(`[DesignRepository] getById(${id}): Total designs in store: ${designs.size}`)
    const design = designs.get(id)
    if (design) {
      console.log(`[DesignRepository] Found design: ${design.id} - ${design.name}`)
    } else {
      console.log(`[DesignRepository] Design not found: ${id}`)
      console.log(`[DesignRepository] Available IDs:`, Array.from(designs.keys()))
    }
    return design || null
  }

  async getByModelId(modelId: ModelId): Promise<Design[]> {
    // Ensure designs are loaded before returning
    if (!designsLoaded && typeof window === 'undefined') {
      await loadDesignsAsync()
    }
    
    const designs = this.store.getDesigns()
    const filtered = Array.from(designs.values()).filter((d) => d.modelId === modelId)
    console.log(`[DesignRepository] getByModelId(${modelId}): Found ${filtered.length} designs`)
    return filtered
  }

  async getAll(): Promise<Design[]> {
    // Ensure designs are loaded before returning
    if (!designsLoaded && typeof window === 'undefined') {
      await loadDesignsAsync()
    }
    
    const designs = this.store.getDesigns()
    console.log(`[DesignRepository] getAll(): Total designs in store: ${designs.size}`)
    if (designs.size > 0) {
      console.log(`[DesignRepository] getAll(): Design IDs:`, Array.from(designs.keys()))
      designs.forEach((design, id) => {
        console.log(`  - ${id}: ${design.name} (${design.status})`)
      })
    }
    return Array.from(designs.values())
  }

  async create(design: Design): Promise<Design> {
    const designs = this.store.getDesigns()
    designs.set(design.id, design)
    console.log(`[DesignRepository] Created design: ${design.id} - ${design.name}`)
    console.log(`[DesignRepository] Total designs after create: ${designs.size}`)
    
    // Save to file storage for persistence
    const allDesigns = Array.from(designs.values())
    const serializedDesigns = allDesigns.map((d: Design) => ({
      id: d.id,
      modelId: d.modelId,
      name: d.name,
      mainTexture: {
        id: d.mainTexture.id,
        payload: d.mainTexture.payload,
      },
      supportMaterials: {
        photos: d.supportMaterials.photos.map((p) => ({
          id: p.id,
          payload: p.payload,
        })),
        videos: d.supportMaterials.videos.map((v) => ({
          id: v.id,
          payload: v.payload,
        })),
        sceneBackground: d.supportMaterials.sceneBackground
          ? {
              id: d.supportMaterials.sceneBackground.id,
              payload: d.supportMaterials.sceneBackground.payload,
            }
          : undefined,
      },
      version: {
        major: d.version.major,
        minor: d.version.minor,
        patch: d.version.patch,
        status: d.version.status,
      },
      status: d.status,
      previewImageUrl: d.previewImageUrl,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
      updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
    }))
    FileStorage.saveDesigns(serializedDesigns)
    
    return design
  }

  async update(design: Design): Promise<Design> {
    const designs = this.store.getDesigns()
    designs.set(design.id, design)
    
    // Save to file storage
    const allDesigns = Array.from(designs.values())
    const serializedDesigns = allDesigns.map((d: Design) => ({
      id: d.id,
      modelId: d.modelId,
      name: d.name,
      mainTexture: {
        id: d.mainTexture.id,
        payload: d.mainTexture.payload,
      },
      supportMaterials: {
        photos: d.supportMaterials.photos.map((p) => ({
          id: p.id,
          payload: p.payload,
        })),
        videos: d.supportMaterials.videos.map((v) => ({
          id: v.id,
          payload: v.payload,
        })),
        sceneBackground: d.supportMaterials.sceneBackground
          ? {
              id: d.supportMaterials.sceneBackground.id,
              payload: d.supportMaterials.sceneBackground.payload,
            }
          : undefined,
      },
      version: {
        major: d.version.major,
        minor: d.version.minor,
        patch: d.version.patch,
        status: d.version.status,
      },
      status: d.status,
      previewImageUrl: d.previewImageUrl,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
      updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
    }))
    FileStorage.saveDesigns(serializedDesigns)
    
    return design
  }

  async delete(id: DesignId): Promise<void> {
    const designs = this.store.getDesigns()
    designs.delete(id)
    
    // Save to file storage
    const allDesigns = Array.from(designs.values())
    const serializedDesigns = allDesigns.map((d: Design) => ({
      id: d.id,
      modelId: d.modelId,
      name: d.name,
      mainTexture: {
        id: d.mainTexture.id,
        payload: d.mainTexture.payload,
      },
      supportMaterials: {
        photos: d.supportMaterials.photos.map((p) => ({
          id: p.id,
          payload: p.payload,
        })),
        videos: d.supportMaterials.videos.map((v) => ({
          id: v.id,
          payload: v.payload,
        })),
        sceneBackground: d.supportMaterials.sceneBackground
          ? {
              id: d.supportMaterials.sceneBackground.id,
              payload: d.supportMaterials.sceneBackground.payload,
            }
          : undefined,
      },
      version: {
        major: d.version.major,
        minor: d.version.minor,
        patch: d.version.patch,
        status: d.version.status,
      },
      status: d.status,
      previewImageUrl: d.previewImageUrl,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
      updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : d.updatedAt,
    }))
    FileStorage.saveDesigns(serializedDesigns)
  }
}
