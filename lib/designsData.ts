/**
 * Mock data for scooter models and designs
 * 
 * This file contains placeholder data for the TXD project.
 * 
 * To add a new scooter model:
 * 1. Add a new entry to the models array
 * 2. Add designs for that model in the designs array
 * 
 * To add a new design:
 * 1. Add an entry to the designs array
 * 2. Set the modelId to match the model's id
 * 3. Add a preview image to /public/images/designs/
 * 
 * In production, this data would come from a CMS or database.
 */

export interface ScooterModel {
  id: string
  name: string
  nameVi: string
  glbPath?: string // Path to 3D model file (e.g., '/models/honda-lead.glb')
  availableDesigns: number
}

export interface Design {
  id: string
  modelId: string
  slug: string
  name: string
  nameVi: string
  description: string
  descriptionVi: string
  price: number
  priceFrom?: boolean // If true, show "from $X"
  image: string // Path to preview image
  style: string[] // Tags like 'holographic', 'minimal', 'neon', etc.
  includedPanels: string[] // What parts are included
  isNew?: boolean
}

// Available scooter models
export const models: ScooterModel[] = [
  {
    id: 'honda-lead-110',
    name: 'Honda Lead 110',
    nameVi: 'Honda Lead 110',
    glbPath: '/models/honda-lead.glb',
    availableDesigns: 6,
  },
  {
    id: 'yamaha-nvx',
    name: 'Yamaha NVX',
    nameVi: 'Yamaha NVX',
    glbPath: '/models/yamaha-nvx.glb',
    availableDesigns: 0, // Will be updated when designs are added
  },
]

// Design collections for each model
export const designs: Design[] = [
  // Honda Lead 110 designs
  {
    id: '1',
    modelId: 'honda-lead-110',
    slug: 'design-0',
    name: 'Design 1',
    nameVi: 'Thiết Kế 1',
    description: 'Premium vinyl wrap design for Honda Lead 110.',
    descriptionVi: 'Thiết kế bọc phim cao cấp cho Honda Lead 110.',
    price: 450,
    priceFrom: false,
    image: '/images/designs/honda lead/honda-lead-0.jpg',
    style: ['premium', 'custom'],
    includedPanels: ['Full body kit'],
    isNew: true,
  },
  {
    id: '2',
    modelId: 'honda-lead-110',
    slug: 'design-1',
    name: 'Design 2',
    nameVi: 'Thiết Kế 2',
    description: 'Premium vinyl wrap design for Honda Lead 110.',
    descriptionVi: 'Thiết kế bọc phim cao cấp cho Honda Lead 110.',
    price: 420,
    image: '/images/designs/honda lead/honda-lead-1.jpg',
    style: ['premium', 'custom'],
    includedPanels: ['Full body kit'],
    isNew: false,
  },
  {
    id: '3',
    modelId: 'honda-lead-110',
    slug: 'design-2',
    name: 'Design 3',
    nameVi: 'Thiết Kế 3',
    description: 'Premium vinyl wrap design for Honda Lead 110.',
    descriptionVi: 'Thiết kế bọc phim cao cấp cho Honda Lead 110.',
    price: 400,
    image: '/images/designs/honda lead/honda-lead-2.jpg',
    style: ['premium', 'custom'],
    includedPanels: ['Full body kit'],
    isNew: false,
  },
  {
    id: '4',
    modelId: 'honda-lead-110',
    slug: 'design-3',
    name: 'Design 4',
    nameVi: 'Thiết Kế 4',
    description: 'Premium vinyl wrap design for Honda Lead 110.',
    descriptionVi: 'Thiết kế bọc phim cao cấp cho Honda Lead 110.',
    price: 380,
    image: '/images/designs/honda lead/honda-lead-3.jpg',
    style: ['premium', 'custom'],
    includedPanels: ['Full body kit'],
    isNew: false,
  },
  {
    id: '5',
    modelId: 'honda-lead-110',
    slug: 'design-4',
    name: 'Design 5',
    nameVi: 'Thiết Kế 5',
    description: 'Premium vinyl wrap design for Honda Lead 110.',
    descriptionVi: 'Thiết kế bọc phim cao cấp cho Honda Lead 110.',
    price: 410,
    image: '/images/designs/honda lead/honda-lead-4.jpg',
    style: ['premium', 'custom'],
    includedPanels: ['Full body kit'],
    isNew: true,
  },
  {
    id: '6',
    modelId: 'honda-lead-110',
    slug: 'design-5',
    name: 'Design 6',
    nameVi: 'Thiết Kế 6',
    description: 'Premium vinyl wrap design for Honda Lead 110.',
    descriptionVi: 'Thiết kế bọc phim cao cấp cho Honda Lead 110.',
    price: 480,
    image: '/images/designs/honda lead/honda-lead-5.jpg',
    style: ['premium', 'custom'],
    includedPanels: ['Full body kit'],
    isNew: false,
  },
  // Yamaha NVX designs (placeholder - add when images are available)
]

/**
 * Get all designs for a specific model
 */
export function getDesignsByModel(modelId: string): Design[] {
  return designs.filter((design) => design.modelId === modelId)
}

/**
 * Get a design by ID
 */
export function getDesignById(id: string): Design | undefined {
  return designs.find((design) => design.id === id)
}

/**
 * Get a design by slug and model
 */
export function getDesignBySlug(modelId: string, slug: string): Design | undefined {
  return designs.find((design) => design.modelId === modelId && design.slug === slug)
}

/**
 * Get a model by ID
 */
export function getModelById(id: string): ScooterModel | undefined {
  return models.find((model) => model.id === id)
}

