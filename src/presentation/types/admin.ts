/**
 * Типизированные интерфейсы для Admin Panel
 * Per User Rules: Presentation layer не должен импортировать domain entities
 */

export interface SerializedModel {
  id: string
  name: string
  glbUrl: string
  createdAt: string
  updatedAt: string
}

export interface SerializedDesign {
  id: string
  modelId: string
  name: string
  version: {
    major: number
    minor: number
    patch: number
    status: string
  }
  status: string
  previewImageUrl: string
  mainTexture?: {
    id: string
    payload: {
      url: string
      width: number
      height: number
      format: string
    }
    type: string
  }
  supportMaterials?: {
    photos: Array<{
      id: string
      payload: {
        originalUrl: string
        thumbnailUrl: string
        width: number
        height: number
        caption?: string
      }
    }>
    videos: Array<{
      id: string
      payload: {
        url: string
        duration: number
        thumbnailUrl: string
        format: string
      }
    }>
    sceneBackground: {
      id: string
      payload: {
        type: string
        color?: string
        gradient?: {
          from: string
          to: string
          direction: string
        }
        url?: string
        format?: string
      }
    } | null
  }
  createdAt: string
  updatedAt: string
}

export interface SerializedDesignWithMaterials extends SerializedDesign {
  mainTexture: {
    id: string
    payload: {
      url: string
      width: number
      height: number
      format: string
    }
  }
  supportMaterials: {
    photos: Array<{
      id: string
      payload: {
        originalUrl: string
        thumbnailUrl: string
        width: number
        height: number
      }
    }>
    videos: Array<{
      id: string
      payload: {
        url: string
        duration: number
        thumbnailUrl: string
        format: string
      }
    }>
    sceneBackground: {
      id: string
      payload: {
        type: string
        color?: string
        gradient?: {
          from: string
          to: string
          direction: string
        }
        url?: string
        format?: string
      }
    } | null
  }
}


