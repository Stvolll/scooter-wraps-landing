import { IMaterial } from '../../shared-core/interfaces';
import { MaterialId, MaterialMetadata } from '../../shared-core/types/ValueObjects';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { TextureMaterial } from '../materials/TextureMaterial';
import { PhotoMaterial } from '../materials/PhotoMaterial';
import { VideoMaterial } from '../materials/VideoMaterial';
import { PanoramaMaterial } from '../materials/PanoramaMaterial';

/**
 * Фабрика для создания материалов.
 * Единственное место, где используются условные операторы для форматов.
 */
export class MaterialFactory {
  createMaterial(
    format: MaterialFormat,
    id: MaterialId,
    metadata: MaterialMetadata,
    resourceUrl: string,
    mimeType?: string
  ): IMaterial {
    switch (format) {
      case MaterialFormat.TEXTURE:
        return new TextureMaterial(id, metadata, resourceUrl, mimeType);
      
      case MaterialFormat.PHOTO:
        return new PhotoMaterial(id, metadata, resourceUrl, mimeType);
      
      case MaterialFormat.VIDEO:
        return new VideoMaterial(id, metadata, resourceUrl, mimeType);
      
      case MaterialFormat.PANORAMA:
        return new PanoramaMaterial(id, metadata, resourceUrl, mimeType);
      
      default:
        throw new Error(`Unsupported material format: ${format}`);
    }
  }
}


