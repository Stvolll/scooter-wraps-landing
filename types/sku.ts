// SKU System Types

export type SKUStatus = 'draft' | 'active' | 'archived'

export interface MediaFile {
  url: string
  filename: string
  mimetype?: string
  size?: number
  uploadedAt?: string
}

export interface SKUMedia {
  images: MediaFile[]
  videos: MediaFile[]
  description_file?: MediaFile
  thumbnail?: MediaFile
}

export interface SKU {
  id: string
  code: string
  title: string
  description: string
  price: number
  metadata: Record<string, any>
  category_id: string | null
  slug: string
  status: SKUStatus
  media: SKUMedia
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateSKUDto {
  code: string
  title: string
  description: string
  price: number
  metadata?: Record<string, any>
  category_id?: string | null
  slug?: string
  status?: SKUStatus
}

export interface UpdateSKUDto {
  code?: string
  title?: string
  description?: string
  price?: number
  metadata?: Record<string, any>
  category_id?: string | null
  slug?: string
  status?: SKUStatus
}

export interface CreateCategoryDto {
  name: string
  slug?: string
  parent_id?: string | null
}

export interface UpdateCategoryDto {
  name?: string
  slug?: string
  parent_id?: string | null
}

export interface SKUFilterParams {
  category_id?: string
  status?: SKUStatus
  min_price?: number
  max_price?: number
  search?: string
}
