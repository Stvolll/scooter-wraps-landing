import type { PhotoMaterial, VideoMaterial, BackgroundMaterial } from '../entities/materials'

export class SupportMaterials {
  constructor(
    public readonly photos: PhotoMaterial[] = [],
    public readonly videos: VideoMaterial[] = [],
    public readonly sceneBackground?: BackgroundMaterial
  ) {}
}


