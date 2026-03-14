// Custom error classes - NO IMPORTS ALLOWED

export class MaterialNotFoundError extends Error {
  constructor(public readonly type: string) {
    super(`Material processor not found: ${type}`)
    this.name = 'MaterialNotFoundError'
  }
}

export class MaterialProcessorNotFoundError extends Error {
  constructor(public readonly type: string) {
    super(`Material processor not found for type: ${type}`)
    this.name = 'MaterialProcessorNotFoundError'
  }
}

export class MaterialRendererNotFoundError extends Error {
  constructor(public readonly type: string) {
    super(`Material renderer not found for type: ${type}`)
    this.name = 'MaterialRendererNotFoundError'
  }
}

export class MissingTextureError extends Error {
  constructor(public readonly designPath: string) {
    super(`No UV texture found in: ${designPath}`)
    this.name = 'MissingTextureError'
  }
}

export class InvalidFileFormatError extends Error {
  constructor(
    public readonly filename: string,
    public readonly expectedFormat: string
  ) {
    super(`Invalid format for ${filename}, expected ${expectedFormat}`)
    this.name = 'InvalidFileFormatError'
  }
}

export class UnknownFileTypeError extends Error {
  constructor(public readonly filename: string) {
    super(`Unknown file type for: ${filename}`)
    this.name = 'UnknownFileTypeError'
  }
}


