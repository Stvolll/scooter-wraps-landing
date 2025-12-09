// In-memory SKU storage (MVP - расширяемое до БД)

import {
  SKU,
  Category,
  CreateSKUDto,
  UpdateSKUDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  SKUFilterParams,
  SKUStatus,
} from '@/types/sku'

// In-memory storage
let skus: SKU[] = []
let categories: Category[] = []

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function now(): string {
  return new Date().toISOString()
}

// SKU Operations
export const skuStore = {
  // Create
  create(data: CreateSKUDto): SKU {
    const id = generateId()
    const slug = data.slug || generateSlug(data.title)

    // Check for duplicate code
    if (skus.some(s => s.code === data.code)) {
      throw new Error(`SKU with code "${data.code}" already exists`)
    }

    // Check for duplicate slug
    if (skus.some(s => s.slug === slug)) {
      throw new Error(`SKU with slug "${slug}" already exists`)
    }

    const sku: SKU = {
      id,
      code: data.code,
      title: data.title,
      description: data.description,
      price: data.price,
      metadata: data.metadata || {},
      category_id: data.category_id || null,
      slug,
      status: data.status || 'draft',
      media: {
        images: [],
        videos: [],
      },
      created_at: now(),
      updated_at: now(),
    }

    skus.push(sku)
    return sku
  },

  // Read
  findById(id: string): SKU | null {
    return skus.find(s => s.id === id) || null
  },

  findByCode(code: string): SKU | null {
    return skus.find(s => s.code === code) || null
  },

  findBySlug(slug: string): SKU | null {
    return skus.find(s => s.slug === slug) || null
  },

  findAll(filters?: SKUFilterParams): SKU[] {
    let result = [...skus]

    if (filters) {
      if (filters.category_id) {
        result = result.filter(s => s.category_id === filters.category_id)
      }

      if (filters.status) {
        result = result.filter(s => s.status === filters.status)
      }

      if (filters.min_price !== undefined) {
        result = result.filter(s => s.price >= filters.min_price!)
      }

      if (filters.max_price !== undefined) {
        result = result.filter(s => s.price <= filters.max_price!)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(
          s =>
            s.title.toLowerCase().includes(searchLower) ||
            s.description.toLowerCase().includes(searchLower) ||
            s.code.toLowerCase().includes(searchLower)
        )
      }
    }

    return result.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  },

  // Update
  update(id: string, data: UpdateSKUDto): SKU | null {
    const index = skus.findIndex(s => s.id === id)
    if (index === -1) return null

    const existing = skus[index]

    // Check for duplicate code (if changing)
    if (data.code && data.code !== existing.code) {
      if (skus.some(s => s.code === data.code && s.id !== id)) {
        throw new Error(`SKU with code "${data.code}" already exists`)
      }
    }

    // Check for duplicate slug (if changing)
    if (data.title && data.title !== existing.title) {
      const newSlug = generateSlug(data.title)
      if (skus.some(s => s.slug === newSlug && s.id !== id)) {
        throw new Error(`SKU with slug "${newSlug}" already exists`)
      }
    }

    const updated: SKU = {
      ...existing,
      ...data,
      slug: data.title ? generateSlug(data.title) : existing.slug,
      updated_at: now(),
    }

    skus[index] = updated
    return updated
  },

  // Update media
  updateMedia(id: string, media: Partial<SKU['media']>): SKU | null {
    const sku = this.findById(id)
    if (!sku) return null

    sku.media = {
      ...sku.media,
      ...media,
      images: media.images || sku.media.images,
      videos: media.videos || sku.media.videos,
    }
    sku.updated_at = now()

    return sku
  },

  // Delete
  delete(id: string): boolean {
    const index = skus.findIndex(s => s.id === id)
    if (index === -1) return false
    skus.splice(index, 1)
    return true
  },
}

// Category Operations
export const categoryStore = {
  // Create
  create(data: CreateCategoryDto): Category {
    const id = generateId()
    const slug = data.slug || generateSlug(data.name)

    // Check for duplicate slug
    if (categories.some(c => c.slug === slug)) {
      throw new Error(`Category with slug "${slug}" already exists`)
    }

    // Validate parent exists if provided
    if (data.parent_id && !categories.find(c => c.id === data.parent_id)) {
      throw new Error(`Parent category with id "${data.parent_id}" not found`)
    }

    const category: Category = {
      id,
      name: data.name,
      slug,
      parent_id: data.parent_id || null,
      created_at: now(),
      updated_at: now(),
    }

    categories.push(category)
    return category
  },

  // Read
  findById(id: string): Category | null {
    return categories.find(c => c.id === id) || null
  },

  findBySlug(slug: string): Category | null {
    return categories.find(c => c.slug === slug) || null
  },

  findAll(): Category[] {
    return [...categories].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  },

  findChildren(parentId: string): Category[] {
    return categories.filter(c => c.parent_id === parentId)
  },

  findTree(): Category[] {
    // Return categories in tree structure (flat with parent_id references)
    return this.findAll()
  },

  // Update
  update(id: string, data: UpdateCategoryDto): Category | null {
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) return null

    const existing = categories[index]

    // Check for duplicate slug (if changing)
    if (data.name && data.name !== existing.name) {
      const newSlug = generateSlug(data.name)
      if (categories.some(c => c.slug === newSlug && c.id !== id)) {
        throw new Error(`Category with slug "${newSlug}" already exists`)
      }
    }

    // Validate parent exists if changing
    if (data.parent_id !== undefined && data.parent_id !== existing.parent_id) {
      if (data.parent_id && !categories.find(c => c.id === data.parent_id)) {
        throw new Error(`Parent category with id "${data.parent_id}" not found`)
      }

      // Prevent circular reference
      if (data.parent_id === id) {
        throw new Error('Category cannot be its own parent')
      }
    }

    const updated: Category = {
      ...existing,
      ...data,
      slug: data.name ? generateSlug(data.name) : existing.slug,
      updated_at: now(),
    }

    categories[index] = updated
    return updated
  },

  // Delete
  delete(id: string): boolean {
    // Check if category has children
    if (categories.some(c => c.parent_id === id)) {
      throw new Error('Cannot delete category with children')
    }

    // Check if category is used by SKUs
    if (skus.some(s => s.category_id === id)) {
      throw new Error('Cannot delete category that is used by SKUs')
    }

    const index = categories.findIndex(c => c.id === id)
    if (index === -1) return false
    categories.splice(index, 1)
    return true
  },
}

// Initialize with sample data (optional)
export function initSampleData() {
  if (categories.length === 0) {
    const cat1 = categoryStore.create({ name: 'Honda', slug: 'honda' })
    const cat2 = categoryStore.create({ name: 'Yamaha', slug: 'yamaha' })
    const cat3 = categoryStore.create({
      name: 'Carbon Fiber',
      slug: 'carbon-fiber',
      parent_id: cat1.id,
    })

    skuStore.create({
      code: 'SKU-001',
      title: 'Honda Lead Carbon Black',
      description: 'Premium carbon fiber wrap for Honda Lead',
      price: 500000,
      category_id: cat3.id,
      status: 'active',
      metadata: { material: 'carbon', color: 'black' },
    })
  }
}
