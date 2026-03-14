// ============================================
// TYPES.TS - Типы и интерфейсы
// ============================================

// Core type definitions
export type MaterialId = string
export type DesignId = string
export type ModelId = string
export type DesignStatus = 'draft' | 'published' | 'archived'
export type ImageFormat = 'jpg' | 'png' | 'webp'
export type HDRFormat = 'hdr' | 'exr'
export type BackgroundType = 'color' | 'gradient' | 'image' | 'hdri'
export type GradientDirection = 'vertical' | 'horizontal'

// Background render data (for API serialization)
export interface BackgroundRenderData {
  type: BackgroundType
  color?: string
  gradient?: {
    from: string
    to: string
    direction: GradientDirection
  }
  url?: string
}

// Design type from domain (type-only re-export to avoid circular runtime dependency)
import type { Design } from './domain'

// Design Repository Interface
export interface IDesignRepository {
  getById(id: DesignId): Promise<Design | null>
  getByModelId(modelId: ModelId): Promise<Design[]>
  getAll(): Promise<Design[]>
  create(design: Design): Promise<Design>
  update(design: Design): Promise<Design>
  delete(id: DesignId): Promise<void>
}

// Material Renderer Interface
export interface IMaterialRenderer {
  readonly type: string
  render(material: any, target: any): void | Promise<void>
}

// Custom Errors
export class CannotPublishError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CannotPublishError'
  }
}

// Re-export Design for consumers (type-only to avoid circular runtime dependency)
export type { Design } from './domain'
