import { IMaterial } from '../../shared-core/interfaces';
import { MaterialId, MaterialMetadata, ResourceReference } from '../../shared-core/types/ValueObjects';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

/**
 * Материал типа Panorama (360° изображение).
 * Для панорамных просмотров дизайнов.
 */
export class PanoramaMaterial implements IMaterial {
  public readonly format = MaterialFormat.PANORAMA;
  
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


