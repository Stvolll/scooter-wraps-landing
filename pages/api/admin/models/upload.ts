// pages/api/admin/models/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import Busboy from 'busboy'
import fs from 'fs'
import path from 'path'
import { GLBValidator } from '@/infrastructure/validators/GLBValidator'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'models')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  return new Promise<void>((resolve, reject) => {
    let savedFile: {
      originalFilename: string
      finalFilename: string
      finalPath: string
      size: number
    } | null = null
    let modelName: string | null = null
    // Track file write as a promise to avoid race condition between
    // busboy 'finish' and writeStream 'finish'
    let fileWritePromise: Promise<void> | null = null

    const bb = Busboy({ headers: req.headers })

    bb.on('field', (name, value) => {
      if (name === 'name' && value) {
        modelName = value
      }
    })

    bb.on('file', (fieldname, fileStream, info) => {
      const filename = info.filename || ''
      if (fieldname !== 'file' && fieldname !== 'glbFile') {
        fileStream.resume()
        return
      }
      if (!filename.toLowerCase().endsWith('.glb')) {
        fileStream.resume()
        return
      }
      if (savedFile || fileWritePromise) {
        fileStream.resume()
        return
      }

      const baseName = (modelName || filename.replace(/\.glb$/i, '') || 'model').trim()
      const sanitizedName = baseName
        .replace(/[^a-zA-Z0-9\s-]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50) || 'model'
      const timestamp = Date.now()
      const finalFilename = `${timestamp}-${sanitizedName}.glb`

      if (finalFilename.includes('..') || path.isAbsolute(finalFilename)) {
        fileStream.resume()
        return
      }

      const finalPath = path.join(uploadDir, finalFilename)
      const resolvedPath = path.resolve(finalPath)
      const resolvedUploadDir = path.resolve(uploadDir)
      if (!resolvedPath.startsWith(resolvedUploadDir)) {
        fileStream.resume()
        return
      }

      const writeStream = fs.createWriteStream(finalPath)
      fileStream.pipe(writeStream)

      // Wrap write in a promise so bb.finish can await it
      fileWritePromise = new Promise<void>((resWrite, rejWrite) => {
        writeStream.on('finish', () => {
          const size = fs.statSync(finalPath).size
          savedFile = {
            originalFilename: filename,
            finalFilename,
            finalPath,
            size,
          }
          resWrite()
        })
        writeStream.on('error', (err) => {
          if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath)
          rejWrite(err)
        })
      })

      fileWritePromise.catch((err) => reject(err))
    })

    bb.on('finish', async () => {
      // Wait for the write stream to fully flush to disk before checking savedFile
      if (fileWritePromise) {
        try {
          await fileWritePromise
        } catch {
          // error already handled via reject above
          return
        }
      }

      if (!savedFile) {
        res.status(400).json({ error: 'No file uploaded' })
        resolve()
        return
      }

      const runValidation = async () => {
        try {
          const fileBuffer = fs.readFileSync(savedFile!.finalPath)
          const isValid = await GLBValidator.validate(fileBuffer)
          if (!isValid) {
            fs.unlinkSync(savedFile!.finalPath)
            res.status(400).json({
              error: 'Invalid GLB file format. Please ensure the file is a valid glTF Binary file.',
            })
            resolve()
            return
          }
        } catch (validationError: unknown) {
          const message = validationError instanceof Error ? validationError.message : String(validationError)
          if (fs.existsSync(savedFile!.finalPath)) fs.unlinkSync(savedFile!.finalPath)
          res.status(400).json({
            error: 'Failed to validate GLB file',
            details: message,
          })
          resolve()
          return
        }

        const glbUrl = `/uploads/models/${savedFile!.finalFilename}`
        res.status(200).json({
          success: true,
          glbUrl,
          filename: savedFile!.finalFilename,
          metadata: {
            originalName: savedFile!.originalFilename,
            size: savedFile!.size,
          },
        })
        resolve()
      }

      runValidation()
    })

    bb.on('error', (err) => {
      res.status(500).json({
        error: 'Upload failed',
        details: err.message,
      })
      resolve()
    })

    req.pipe(bb)
  })
}
