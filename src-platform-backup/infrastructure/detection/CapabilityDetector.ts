export type DeviceTier = 'high' | 'medium' | 'low'

export class CapabilityDetector {
  getDeviceTier(): DeviceTier {
    if (typeof window === 'undefined') return 'medium'

    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
    const hasWebGL = this.canUseWebGL()

    if (!hasWebGL) return 'low'
    if (isMobile) return 'medium'
    return 'high'
  }

  private canUseWebGL(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const canvas = document.createElement('canvas')
      return !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      )
    } catch {
      return false
    }
  }
}


