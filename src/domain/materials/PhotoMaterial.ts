import { IMaterial } from '../../shared-core/interfaces';
import { MaterialId, MaterialMetadata, ResourceReference } from '../../shared-core/types/ValueObjects';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

/**
 * Материал типа Photo (статичное изображение).
 * Используется для превью, фотографий результатов, и т.д.
 */
export class PhotoMaterial implements IMaterial {
  public readonly format = MaterialFormat.PHOTO;
  
  constructor(
    public readonly id: MaterialId,
    public readonly metadata: MaterialMetadata,
    private readonly resourceUrl: string,
    private readonly mimeType: string = 'image/jpeg'
  ) {}
  
  getResource(): ResourceReference {
    return {
      url: this.resourceUrl,
      type: this.mimeType,
    };
  }
}


