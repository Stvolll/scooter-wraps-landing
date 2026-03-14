/**
 * Вспомогательные функции для 3D вьювера
 * БЕЗ импортов Three.js на верхнем уровне
 */

// Helper function to map rotation to lighting intensity
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const clamped = Math.max(inMin, Math.min(inMax, value))
  return ((clamped - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

// Lerp function for smooth transitions
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

// Material name patterns to match (case-insensitive)
export const MATERIAL_PATTERNS = {
  body: [
    'body', 'main', 'primary', 'base', 
    'face', 'a-face', 'a_face', 'aface',
    'chassis', 'frame',
    'uv_sh160_a-face', 'uv_sh160_a_face', 'uv_sh160_aface',
    'texture_sh160_a-face', 'texture_sh160_a_face',
    'sh160_a-face', 'sh160_a_face', 'sh160_aface',
  ],
  plastic: [
    'plastic', 'trim', 'secondary', 
    'place', 'rl-place', 'rl_place', 'rlplace',
    'panel', 'cover',
    'uv_sh160_rl-place', 'uv_sh160_rl_place', 'uv_sh160_rlplace',
    'texture_sh160_rl-place', 'texture_sh160_rl_place',
    'sh160_rl-place', 'sh160_rl_place', 'sh160_rlplace',
  ],
  accents: [
    'accent', 'detail', 'highlight', 'decoration', 
    'parts', 'z-parts', 'z_parts', 'zparts',
    'accessory', 'decals',
    'uv_sh160_z-parts', 'uv_sh160_z_parts', 'uv_sh160_zparts',
    'texture_sh160_z-parts', 'texture_sh160_z_parts',
    'sh160_z-parts', 'sh160_z_parts', 'sh160_zparts',
  ],
}

// Function to determine material type from name
export function getMaterialType(materialName: string, meshName?: string): 'body' | 'plastic' | 'accents' | null {
  const namesToCheck = [materialName, meshName].filter(Boolean) as string[]
  
  for (const name of namesToCheck) {
    if (!name) continue
    
    const normalizedName = name.toLowerCase().trim().replace(/\.\d+$/, '')
    
    for (const [type, patterns] of Object.entries(MATERIAL_PATTERNS)) {
      for (const pattern of patterns) {
        const lowerPattern = pattern.toLowerCase()
        
        if (normalizedName === lowerPattern || normalizedName.includes(lowerPattern)) {
          return type as 'body' | 'plastic' | 'accents'
        }
        
        const nameParts = normalizedName.split(/[-_\s.]+/).filter(p => !/^\d+$/.test(p))
        const patternParts = lowerPattern.split(/[-_\s.]+/)
        
        if (patternParts.every(pp => nameParts.some(np => np === pp || np.includes(pp)))) {
          return type as 'body' | 'plastic' | 'accents'
        }
        
        if (nameParts.some(np => patternParts.some(pp => np === pp || np.includes(pp)))) {
          return type as 'body' | 'plastic' | 'accents'
        }
      }
    }
  }
  
  return null
}

// Check WebGL support
export function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}




