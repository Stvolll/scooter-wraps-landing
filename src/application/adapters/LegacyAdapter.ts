/**
 * Адаптер для интеграции новой архитектуры со старым кодом.
 * Позволяет постепенно мигрировать без поломки существующего функционала.
 */

import { ApplicationContext } from '../ApplicationContext';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { ModelId, DesignId } from '../../shared-core/types/ValueObjects';

export class LegacyAdapter {
  private context = ApplicationContext.getInstance();
  
  /**
   * Конвертирует старый формат дизайна в новый IDesign.
   */
  async convertLegacyDesignToNew(legacyDesign: any): Promise<any> {
    // Если дизайн уже в новом формате, возвращаем как есть
    if (legacyDesign && 'listMaterials' in legacyDesign) {
      return legacyDesign;
    }
    
    // Конвертируем старый формат
    const design = await this.context.designRepository.findById(
      DesignId(legacyDesign.id || legacyDesign.slug)
    );
    
    if (design) {
      return design;
    }
    
    // Если не найден, возвращаем legacy формат с оберткой
    return {
      ...legacyDesign,
      // Добавляем методы для совместимости
      listMaterials: () => {
        const materials: any[] = [];
        
        // Конвертируем старые поля в материалы
        if (legacyDesign.textureUrl || legacyDesign.texture) {
          materials.push({
            format: MaterialFormat.TEXTURE,
            url: legacyDesign.textureUrl || legacyDesign.texture,
            id: `legacy-texture-${legacyDesign.id}`,
          });
        }
        
        if (legacyDesign.panorama) {
          materials.push({
            format: MaterialFormat.PANORAMA,
            url: legacyDesign.panorama,
            id: `legacy-panorama-${legacyDesign.id}`,
          });
        }
        
        if (legacyDesign.videoPreview || legacyDesign.video) {
          materials.push({
            format: MaterialFormat.VIDEO,
            url: legacyDesign.videoPreview || legacyDesign.video,
            id: `legacy-video-${legacyDesign.id}`,
          });
        }
        
        if (legacyDesign.galleryImages) {
          legacyDesign.galleryImages.forEach((url: string, index: number) => {
            materials.push({
              format: MaterialFormat.PHOTO,
              url,
              id: `legacy-photo-${legacyDesign.id}-${index}`,
            });
          });
        }
        
        return materials;
      },
      getMaterialsByFormat: (format: MaterialFormat) => {
        const allMaterials = (() => {
          const materials: any[] = [];
          
          if (legacyDesign.textureUrl || legacyDesign.texture) {
            materials.push({
              format: MaterialFormat.TEXTURE,
              url: legacyDesign.textureUrl || legacyDesign.texture,
              id: `legacy-texture-${legacyDesign.id}`,
            });
          }
          
          if (legacyDesign.panorama) {
            materials.push({
              format: MaterialFormat.PANORAMA,
              url: legacyDesign.panorama,
              id: `legacy-panorama-${legacyDesign.id}`,
            });
          }
          
          if (legacyDesign.videoPreview || legacyDesign.video) {
            materials.push({
              format: MaterialFormat.VIDEO,
              url: legacyDesign.videoPreview || legacyDesign.video,
              id: `legacy-video-${legacyDesign.id}`,
            });
          }
          
          if (legacyDesign.galleryImages) {
            legacyDesign.galleryImages.forEach((url: string, index: number) => {
              materials.push({
                format: MaterialFormat.PHOTO,
                url,
                id: `legacy-photo-${legacyDesign.id}-${index}`,
              });
            });
          }
          
          return materials;
        })();
        return allMaterials.filter((m: any) => m.format === format);
      },
    };
  }
  
  /**
   * Получить текстуру для дизайна (совместимость со старым кодом).
   */
  getTextureForDesign(design: any): string | null {
    if (!design) return null;
    
    // Пробуем новый формат
    if ('getMaterialsByFormat' in design) {
      const textures = design.getMaterialsByFormat(MaterialFormat.TEXTURE);
      if (textures.length > 0) {
        return textures[0].getResource().url;
      }
    }
    
    // Fallback на старый формат
    return design.textureUrl || design.texture || design.textureWebp || null;
  }
  
  /**
   * Получить панораму для дизайна (совместимость со старым кодом).
   */
  getPanoramaForDesign(design: any): string | null {
    if (!design) return null;
    
    // Пробуем новый формат
    if ('getMaterialsByFormat' in design) {
      const panoramas = design.getMaterialsByFormat(MaterialFormat.PANORAMA);
      if (panoramas.length > 0) {
        return panoramas[0].getResource().url;
      }
    }
    
    // Fallback на старый формат
    return design.panorama || design.bgWebp || null;
  }
  
  /**
   * Получить фото для дизайна (совместимость со старым кодом).
   */
  getPhotosForDesign(design: any): string[] {
    if (!design) return [];
    
    // Пробуем новый формат
    if ('getMaterialsByFormat' in design) {
      const photos = design.getMaterialsByFormat(MaterialFormat.PHOTO);
      return photos.map((p: any) => p.getResource().url);
    }
    
    // Fallback на старый формат
    return design.galleryImages || design.images || [];
  }
}

