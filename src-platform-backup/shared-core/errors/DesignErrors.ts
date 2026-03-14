// Design-related errors - NO IMPORTS ALLOWED

export class CannotPublishError extends Error {
  constructor(public readonly reason: string) {
    super(`Cannot publish design: ${reason}`)
    this.name = 'CannotPublishError'
  }
}

export class DesignNotFoundError extends Error {
  constructor(public readonly designId: string) {
    super(`Design not found: ${designId}`)
    this.name = 'DesignNotFoundError'
  }
}

export class ModelNotFoundError extends Error {
  constructor(public readonly modelId: string) {
    super(`Model not found: ${modelId}`)
    this.name = 'ModelNotFoundError'
  }
}


