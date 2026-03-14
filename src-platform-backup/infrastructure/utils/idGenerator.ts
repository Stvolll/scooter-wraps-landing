export function generateMaterialId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateDesignId(): string {
  return `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateModelId(): string {
  return `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}


