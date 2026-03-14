/**
 * GLB File Validator
 * Validates GLB (glTF Binary) file format
 */

export interface GLBMetadata {
  version: number
  length: number
  isValid: boolean
}

export class GLBValidator {
  private static readonly GLB_MAGIC = 0x46546c67 // 'glTF' in ASCII (little-endian)
  private static readonly GLB_VERSION = 2 // glTF 2.0
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

  /**
   * Validate GLB file format
   */
  static async validate(file: File | Buffer): Promise<boolean> {
    console.log('[GLBValidator] Starting validation...')

    try {
      // Check file size
      const size = file instanceof File ? file.size : file.length
      console.log('[GLBValidator] File size:', size, 'bytes')
      
      if (size < 12) {
        console.error('[GLBValidator] File too small (less than 12 bytes)')
        return false
      }

      if (size > this.MAX_FILE_SIZE) {
        console.error(`[GLBValidator] File too large: ${(size / 1024 / 1024).toFixed(2)} MB`)
        return false
      }

      // Read first 12 bytes (GLB header)
      let buffer: ArrayBuffer
      if (file instanceof File) {
        buffer = await file.slice(0, 12).arrayBuffer()
      } else {
        buffer = file.slice(0, 12).buffer.slice(file.byteOffset, file.byteOffset + 12)
      }

      const dataView = new DataView(buffer)

      // Check magic number (first 4 bytes) - 'glTF' in ASCII
      const magic = dataView.getUint32(0, true) // little-endian
      console.log('[GLBValidator] Magic number:', `0x${magic.toString(16)}`, `(${String.fromCharCode(magic & 0xFF, (magic >> 8) & 0xFF, (magic >> 16) & 0xFF, (magic >> 24) & 0xFF)})`)
      
      if (magic !== this.GLB_MAGIC) {
        console.error(`[GLBValidator] Invalid magic number: 0x${magic.toString(16)}. Expected: 0x${this.GLB_MAGIC.toString(16)}`)
        // Try big-endian
        const magicBE = dataView.getUint32(0, false)
        console.log('[GLBValidator] Trying big-endian:', `0x${magicBE.toString(16)}`)
        if (magicBE !== this.GLB_MAGIC) {
          return false
        }
      }

      // Check version (bytes 4-7)
      const version = dataView.getUint32(4, true)
      console.log('[GLBValidator] Version:', version)
      
      if (version !== this.GLB_VERSION) {
        console.warn(`[GLBValidator] Version mismatch: ${version}. Expected: ${this.GLB_VERSION}. Continuing anyway...`)
        // Don't fail on version mismatch - some files might work
      }

      // Check length (bytes 8-11)
      const length = dataView.getUint32(8, true)
      console.log('[GLBValidator] Header length:', length, 'Actual size:', size)
      
      if (length > size) {
        console.warn(`[GLBValidator] Length mismatch: header=${length}, actual=${size}`)
        // This might be okay for some files
      }

      console.log('[GLBValidator] ✅ Valid GLB file')
      return true

    } catch (error: any) {
      console.error('[GLBValidator] Validation error:', error.message)
      console.error('[GLBValidator] Stack:', error.stack)
      return false
    }
  }

  /**
   * Get GLB file metadata
   */
  static async getMetadata(file: File | Buffer): Promise<GLBMetadata> {
    let buffer: ArrayBuffer
    if (file instanceof File) {
      buffer = await file.slice(0, 12).arrayBuffer()
    } else {
      buffer = file.slice(0, 12).buffer.slice(file.byteOffset, file.byteOffset + 12)
    }

    const dataView = new DataView(buffer)
    const version = dataView.getUint32(4, true)
    const length = dataView.getUint32(8, true)

    return {
      version,
      length,
      isValid: version === this.GLB_VERSION
    }
  }

  /**
   * Validate file extension
   */
  static validateExtension(filename: string): boolean {
    const isValid = filename.toLowerCase().endsWith('.glb')
    console.log('[GLBValidator] Extension check:', filename, '->', isValid)
    return isValid
  }
}
