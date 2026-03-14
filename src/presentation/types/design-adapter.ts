import { Design } from '../../domain/Design';
import { TextureMaterial } from '../../domain/materials/TextureMaterial';
import { PanoramaMaterial } from '../../domain/materials/PanoramaMaterial';
import { MaterialFactory } from '../../domain/factories/MaterialFactory';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { MaterialId, DesignId, DesignMetadata, MaterialMetadata } from '../../shared-core/types/ValueObjects';

/**
 * Старый формат дизайна (из ScooterViewer3D)
 */
export interface LegacyDesign {
  id?: string;
  name?: string;
  textures?: {
    body?: string;
    plastic?: string;
    accents?: string;
  };
  texture?: string; // Legacy: single texture
  designGlb?: string;
  bg_webp?: string;
  panorama?: string;
  panoramaUrl?: string;
}

/**
 * Адаптер для конвертации старых дизайнов в новый формат
 */
export class DesignAdapter {
  private materialFactory: MaterialFactory;

  constructor() {
    this.materialFactory = new MaterialFactory();
  }

  /**
   * Конвертировать старый формат дизайна в новый Design entity
   */
  adaptLegacyDesignToNew(legacyDesign: LegacyDesign, modelId?: string): Design | null {
    if (!legacyDesign.id && !legacyDesign.name) {
      return null;
    }

    const designId = legacyDesign.id || `legacy-${Date.now()}`;
    const designMetadata: DesignMetadata = {
      name: legacyDesign.name || 'Unnamed Design',
      modelId: modelId || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const design = new Design(
      designId as DesignId,
      designMetadata
    );

    // Добавляем текстуры
    if (legacyDesign.textures) {
      // Новый формат: множественные текстуры
      if (legacyDesign.textures.body) {
        const texture = this.createTextureMaterial(
          `${designId}-texture-body`,
          legacyDesign.textures.body
        );
        design.addMaterial(texture);
      }
      if (legacyDesign.textures.plastic) {
        const texture = this.createTextureMaterial(
          `${designId}-texture-plastic`,
          legacyDesign.textures.plastic
        );
        design.addMaterial(texture);
      }
      if (legacyDesign.textures.accents) {
        const texture = this.createTextureMaterial(
          `${designId}-texture-accents`,
          legacyDesign.textures.accents
        );
        design.addMaterial(texture);
      }
    } else if (legacyDesign.texture) {
      // Legacy формат: одна текстура для всех
      const texture = this.createTextureMaterial(
        `${designId}-texture-main`,
        legacyDesign.texture
      );
      design.addMaterial(texture);
    }

    // Добавляем панораму (фон)
    const panoramaUrl = legacyDesign.bg_webp || legacyDesign.panorama || legacyDesign.panoramaUrl;
    if (panoramaUrl) {
      const panorama = this.createPanoramaMaterial(
        `${designId}-panorama`,
        panoramaUrl
      );
      design.addMaterial(panorama);
    }

    return design;
  }

  /**
   * Создать TextureMaterial
   */
  private createTextureMaterial(id: string, url: string): TextureMaterial {
    const materialId = id as MaterialId;
    const metadata: MaterialMetadata = {
      role: 'main',
      order: 0,
    };

    return this.materialFactory.createMaterial(
      MaterialFormat.TEXTURE,
      materialId,
      metadata,
      url,
      'image/jpeg'
    ) as TextureMaterial;
  }

  /**
   * Создать PanoramaMaterial
   */
  private createPanoramaMaterial(id: string, url: string): PanoramaMaterial {
    const materialId = id as MaterialId;
    const metadata: MaterialMetadata = {
      role: 'background',
      order: 0,
    };

    return this.materialFactory.createMaterial(
      MaterialFormat.PANORAMA,
      materialId,
      metadata,
      url,
      url.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
    ) as PanoramaMaterial;
  }
}




