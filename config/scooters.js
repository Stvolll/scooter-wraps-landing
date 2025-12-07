/**
 * Scooter Models Configuration
 * 
 * This file contains all scooter models and their available vinyl wrap designs.
 * 
 * To add a new model:
 * 1. Add an entry to the scooters object
 * 2. Place the .glb model file in /public/models/{model-id}.glb
 * 3. Add design textures in /public/textures/{model-id}/{design-id}.png
 * 
 * To add a new design:
 * 1. Add an entry to the designs array for the model
 * 2. Place the texture image in /public/textures/{model-id}/{design-id}.png
 * 3. If using material variants, ensure the variant name matches in the GLB model
 */

export const scooters = {
  vision: {
    id: 'vision',
    name: 'Honda Vision',
    model: '/models/yamaha-nvx.glb', // Using Yamaha NVX as temporary placeholder
    panorama: '/hdr/panoramic_3.webp', // Panorama background
    designs: [
      { 
        id: '01', 
        name: 'Neon Blade', 
        texture: '/textures/vision/neon.png',
        // If using material variants, specify the variant name:
        // variant: 'neon-blade'
      },
      { 
        id: '02', 
        name: 'Holo Lines', 
        texture: '/textures/vision/holo.png',
        // variant: 'holo-lines'
      },
      { 
        id: '03', 
        name: 'Carbon Fiber', 
        texture: '/textures/vision/carbon.png',
        // variant: 'carbon-fiber'
      },
      { 
        id: '04', 
        name: 'Racing Stripes', 
        texture: '/textures/vision/racing.png',
        // variant: 'racing-stripes'
      },
    ]
  },
  lead: {
    id: 'lead',
    name: 'Honda Lead',
    model: '/models/honda-lead.glb',
    panorama: '/hdr/panoramic_saigon_2.webp', // Default panorama background
    designs: [
      { 
        id: '01', 
        name: 'Urban Street', 
        texture: '/textures/honda-lead/3DModel.jpg',
        preview: '/images/designs/honda lead/honda-lead-0.jpg',
        images: [
          '/images/designs/honda lead/honda-lead-0.jpg',
          '/images/designs/honda lead/honda-lead-1.jpg',
          '/textures/honda-lead/3DModel.jpg',
        ],
        description: 'Modern urban design with bold graphics',
        price: '1,200,000 VND',
        background: '/hdr/panoramic_saigon_2.webp', // Custom background for this design
      },
      { 
        id: '02', 
        name: 'Racing Classic', 
        texture: '/textures/honda-lead/3DModel.jpg',
        preview: '/images/designs/honda lead/honda-lead-1.jpg',
        images: [
          '/images/designs/honda lead/honda-lead-1.jpg',
          '/images/designs/honda lead/honda-lead-2.jpg',
          '/textures/honda-lead/3DModel.jpg',
        ],
        description: 'Classic racing stripes with premium finish',
        price: '1,350,000 VND',
        background: '/hdr/panoramic_cinematic_futurist_1.webp',
      },
      { 
        id: '03', 
        name: 'Neon Night', 
        texture: '/textures/honda-lead/3DModel.jpg',
        preview: '/images/designs/honda lead/honda-lead-2.jpg',
        images: [
          '/images/designs/honda lead/honda-lead-2.jpg',
          '/images/designs/honda lead/honda-lead-3.jpg',
          '/textures/honda-lead/3DModel.jpg',
        ],
        description: 'Vibrant neon accents for night riders',
        price: '1,500,000 VND',
        background: '/hdr/panoramic_3.webp',
      },
      { 
        id: '04', 
        name: 'Carbon Elite', 
        texture: '/textures/honda-lead/3DModel.jpg',
        preview: '/images/designs/honda lead/honda-lead-3.jpg',
        images: [
          '/images/designs/honda lead/honda-lead-3.jpg',
          '/images/designs/honda lead/honda-lead-4.jpg',
          '/textures/honda-lead/3DModel.jpg',
        ],
        description: 'Premium carbon fiber texture',
        price: '1,800,000 VND',
        background: '/hdr/panoramic_saigon_2.webp',
      },
      { 
        id: '05', 
        name: 'Minimalist White', 
        texture: '/textures/honda-lead/3DModel.jpg',
        preview: '/images/designs/honda lead/honda-lead-4.jpg',
        images: [
          '/images/designs/honda lead/honda-lead-4.jpg',
          '/images/designs/honda lead/honda-lead-5.jpg',
          '/textures/honda-lead/3DModel.jpg',
        ],
        description: 'Clean minimalist design in white',
        price: '1,100,000 VND',
        background: '/hdr/panoramic_cinematic_futurist_1.webp',
      },
      { 
        id: '06', 
        name: 'Sport Red', 
        texture: '/textures/honda-lead/3DModel.jpg',
        preview: '/images/designs/honda lead/honda-lead-5.jpg',
        images: [
          '/images/designs/honda lead/honda-lead-5.jpg',
          '/images/designs/honda lead/honda-lead-0.jpg',
          '/textures/honda-lead/3DModel.jpg',
        ],
        description: 'Bold red sport design',
        price: '1,400,000 VND',
        background: '/hdr/panoramic_3.webp',
      },
    ]
  },
  sh: {
    id: 'sh',
    name: 'Honda SH',
    model: '/models/yamaha-nvx.glb', // Using Yamaha NVX as temporary placeholder
    panorama: '/hdr/panoramic_cinematic_futurist_1.webp', // Panorama background
    designs: [
      { 
        id: '01', 
        name: 'Neon Blade', 
        texture: '/textures/sh/neon.png',
        // variant: 'neon-blade'
      },
      { 
        id: '02', 
        name: 'Holo Lines', 
        texture: '/textures/sh/holo.png',
        // variant: 'holo-lines'
      },
      { 
        id: '03', 
        name: 'Carbon Fiber', 
        texture: '/textures/sh/carbon.png',
        // variant: 'carbon-fiber'
      },
      { 
        id: '04', 
        name: 'Racing Stripes', 
        texture: '/textures/sh/racing.png',
        // variant: 'racing-stripes'
      },
    ]
  },
  pcx: {
    id: 'pcx',
    name: 'Honda PCX',
    model: '/models/yamaha-nvx.glb', // Using Yamaha NVX as temporary placeholder
    panorama: '/hdr/panoramic_3.webp', // Panorama background
    designs: [
      { 
        id: '01', 
        name: 'Neon Blade', 
        texture: '/textures/pcx/neon.png',
        // variant: 'neon-blade'
      },
      { 
        id: '02', 
        name: 'Holo Lines', 
        texture: '/textures/pcx/holo.png',
        // variant: 'holo-lines'
      },
      { 
        id: '03', 
        name: 'Carbon Fiber', 
        texture: '/textures/pcx/carbon.png',
        // variant: 'carbon-fiber'
      },
    ]
  },
  nvx: {
    id: 'nvx',
    name: 'Yamaha NVX',
    model: '/models/yamaha-nvx.glb',
    panorama: '/images/studio-panorama.png', // Panorama background
    designs: [
      { 
        id: '01', 
        name: 'Design 1', 
        texture: '/textures/yamaha-nvx/3DModel.jpg', // Using existing texture
        preview: '/textures/yamaha-nvx/3DModel.jpg',
      },
      { 
        id: '02', 
        name: 'Design 2', 
        texture: '/textures/nvx/neon.png',
        preview: '/textures/nvx/neon.png',
      },
      { 
        id: '03', 
        name: 'Design 3', 
        texture: '/textures/nvx/holo.png',
        preview: '/textures/nvx/holo.png',
      },
      { 
        id: '04', 
        name: 'Design 4', 
        texture: '/textures/nvx/carbon.png',
        preview: '/textures/nvx/carbon.png',
      },
    ]
  },
}

/**
 * Get scooter by ID
 */
export function getScooterById(id) {
  return scooters[id]
}

/**
 * Get all scooter IDs
 */
export function getScooterIds() {
  return Object.keys(scooters)
}

/**
 * Get default scooter (first one)
 */
export function getDefaultScooter() {
  return scooters[Object.keys(scooters)[0]]
}

