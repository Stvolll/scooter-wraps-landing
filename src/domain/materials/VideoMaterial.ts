import { IMaterial } from '../../shared-core/interfaces';
import { MaterialId, MaterialMetadata, ResourceReference } from '../../shared-core/types/ValueObjects';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

/**
 * Материал типа Video.
 * Для видео-презентаций дизайнов.
 */
export class VideoMaterial implements IMaterial {
  public readonly format = MaterialFormat.VIDEO;
  
  constructor(
    public readonly id: MaterialId,
    public readonly metadata: MaterialMetadata,
    private readonly resourceUrl: string,
    private readonly mimeType: string = 'video/mp4'
  ) {}
  
  getResource(): ResourceReference {
    return {
      url: this.resourceUrl,
      type: this.mimeType,
    };
  }
}


