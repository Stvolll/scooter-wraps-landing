/**
 * GLB Compressor Utility
 * 
 * Automatically compresses GLB files using Draco compression.
 * Used for large files (>10MB) to reduce size and enable upload.
 * 
 * Per User Rules: Infrastructure layer utility for file processing
 */

import { execSync } from 'child_process'
import { stat, mkdir, access } from 'fs/promises'
import path from 'path'

export interface CompressionResult {
  success: boolean
  originalSize: number
  compressedSize?: number
  reduction?: number
  outputPath?: string
  error?: string
}

/**
 * Compress GLB file using Draco compression
 * @param inputPath - Path to input GLB file
 * @param outputPath - Path to output compressed GLB file (optional, defaults to inputPath with .draco.glb extension)
 * @param quality - Compression quality (0-10, default: 7)
 * @returns Compression result with size information
 */
export async function compressGLBWithDraco(
  inputPath: string,
  outputPath?: string,
  quality: number = 7
): Promise<CompressionResult> {
  try {
    // Check if input file exists
    const inputStats = await stat(inputPath)
    const originalSize = inputStats.size

    // Generate output path if not provided
    if (!outputPath) {
      const dir = path.dirname(inputPath)
      const basename = path.basename(inputPath, '.glb')
      outputPath = path.join(dir, `${basename}.draco.glb`)
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    await mkdir(outputDir, { recursive: true })

    console.log(`📦 [GLB Compressor] Compressing: ${path.basename(inputPath)}`)
    console.log(`   Original size: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`)

    // Compress using gltf-pipeline with Draco
    // Options:
    // -i: Input file
    // -o: Output file
    // -d: Enable Draco compression
    // -b: Binary output (GLB)
    // -q: Quality level (0-10)
    const command = `npx gltf-pipeline -i "${inputPath}" -o "${outputPath}" -d -b -q ${quality}`

    try {
      execSync(command, { 
        stdio: 'pipe', // Suppress output for cleaner logs
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large files
      })
    } catch (execError: any) {
      // gltf-pipeline may output to stderr even on success, check if file was created
      const outputExists = await access(outputPath).then(() => true).catch(() => false)
      if (!outputExists) {
        throw new Error(`Compression failed: ${execError.message}`)
      }
    }

    // Check if output file was created
    const outputStats = await stat(outputPath)
    const compressedSize = outputStats.size
    const reduction = ((1 - compressedSize / originalSize) * 100)

    console.log(`   ✅ Compressed size: ${(compressedSize / (1024 * 1024)).toFixed(2)} MB (${reduction.toFixed(1)}% reduction)`)

    return {
      success: true,
      originalSize,
      compressedSize,
      reduction,
      outputPath,
    }
  } catch (error: any) {
    console.error(`❌ [GLB Compressor] Error compressing ${inputPath}:`, error.message)
    return {
      success: false,
      originalSize: 0,
      error: error.message,
    }
  }
}

/**
 * Check if file should be compressed
 * @param filePath - Path to file
 * @param minSizeMB - Minimum size in MB to trigger compression (default: 10MB)
 * @returns true if file should be compressed
 */
export async function shouldCompress(
  filePath: string,
  minSizeMB: number = 10
): Promise<boolean> {
  try {
    const stats = await stat(filePath)
    const sizeMB = stats.size / (1024 * 1024)
    const isGLB = filePath.toLowerCase().endsWith('.glb')
    
    return isGLB && sizeMB >= minSizeMB
  } catch {
    return false
  }
}

