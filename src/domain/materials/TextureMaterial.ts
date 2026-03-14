import { IMaterial } from '../../shared-core/interfaces';
import { MaterialId, MaterialMetadata, ResourceReference } from '../../shared-core/types/ValueObjects';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

/**
 * Материал типа Texture для 3D моделей.
 * Самодостаточный, не ссылается на другие материалы.
 */
export class TextureMaterial implements IMaterial {
  public readonly format = MaterialFormat.TEXTURE;
  
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


