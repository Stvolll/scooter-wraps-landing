/**
 * Адаптер для конвертации данных из Prisma в domain объекты.
 */

import { IModel, IDesign } from '../../shared-core/interfaces';
import { Model } from '../../domain/Model';
import { Design } from '../../domain/Design';
import { MaterialFactory } from '../../domain/factories/MaterialFactory';
import { ModelId, DesignId, MaterialId } from '../../shared-core/types/ValueObjects';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

export class PrismaToDomainAdapter {
  private materialFactory = new MaterialFactory();
  
  /**
   * Конвертировать Prisma ScooterModel в domain Model.
   */
  convertPrismaModelToDomain(prismaModel: any): IModel {
    const model = new Model(
      ModelId(prismaModel.id),
      {
        name: prismaModel.name,
        description: prismaModel.seoDescription || undefined,
        createdAt: prismaModel.createdAt?.getTime() || Date.now(),
        updatedAt: prismaModel.updatedAt?.getTime() || Date.now(),
      }
    );
    
    // Конвертируем дизайны
    if (prismaModel.designs && Array.isArray(prismaModel.designs)) {
      prismaModel.designs.forEach((prismaDesign: any) => {
        const design = this.convertPrismaDesignToDomain(prismaDesign);
        model.addDesign(design);
      });
    }
    
    return model;
  }
  
  /**
   * Конвертировать Prisma Design в domain Design.
   */
  convertPrismaDesignToDomain(prismaDesign: any): IDesign {
    const design = new Design(
      DesignId(prismaDesign.id),
      {
        name: prismaDesign.title,
        description: prismaDesign.description || undefined,
        createdAt: prismaDesign.createdAt?.getTime() || Date.now(),
        updatedAt: prismaDesign.updatedAt?.getTime() || Date.now(),
      }
    );
    
    // Конвертируем материалы
    if (prismaDesign.materials && Array.isArray(prismaDesign.materials)) {
      prismaDesign.materials.forEach((prismaMaterial: any) => {
        try {
          const material = this.materialFactory.createMaterial(
            prismaMaterial.format as MaterialFormat,
            MaterialId(prismaMaterial.id),
            {
              name: prismaMaterial.metadata?.name || prismaMaterial.url.split('/').pop() || 'Material',
              description: prismaMaterial.metadata?.description,
              uploadedAt: prismaMaterial.metadata?.uploadedAt || Date.now(),
              fileSize: prismaMaterial.metadata?.fileSize,
            },
            prismaMaterial.url,
            prismaMaterial.metadata?.mimeType
          );
          design.addMaterial(material);
        } catch (error) {
          console.warn('⚠️ Failed to convert material:', error);
        }
      });
    }
    
    // Также конвертируем legacy поля в материалы
    if (prismaDesign.textureUrl || prismaDesign.textureWebp) {
      const textureUrl = prismaDesign.textureWebp || prismaDesign.textureUrl;
      const material = this.materialFactory.createMaterial(
        MaterialFormat.TEXTURE,
        MaterialId(`legacy-texture-${prismaDesign.id}`),
        {
          name: 'Texture',
          uploadedAt: Date.now(),
        },
        textureUrl
      );
      design.addMaterial(material);
    }
    
    if (prismaDesign.panorama || prismaDesign.bgWebp) {
      const panoramaUrl = prismaDesign.bgWebp || prismaDesign.panorama;
      const material = this.materialFactory.createMaterial(
        MaterialFormat.PANORAMA,
        MaterialId(`legacy-panorama-${prismaDesign.id}`),
        {
          name: 'Panorama',
          uploadedAt: Date.now(),
        },
        panoramaUrl
      );
      design.addMaterial(material);
    }
    
    if (prismaDesign.videoPreview || prismaDesign.video) {
      const videoUrl = prismaDesign.videoPreview || prismaDesign.video;
      const material = this.materialFactory.createMaterial(
        MaterialFormat.VIDEO,
        MaterialId(`legacy-video-${prismaDesign.id}`),
        {
          name: 'Video',
          uploadedAt: Date.now(),
        },
        videoUrl
      );
      design.addMaterial(material);
    }
    
    if (prismaDesign.galleryImages && Array.isArray(prismaDesign.galleryImages)) {
      prismaDesign.galleryImages.forEach((url: string, index: number) => {
        const material = this.materialFactory.createMaterial(
          MaterialFormat.PHOTO,
          MaterialId(`legacy-photo-${prismaDesign.id}-${index}`),
          {
            name: `Photo ${index + 1}`,
            uploadedAt: Date.now(),
          },
          url
        );
        design.addMaterial(material);
      });
    }
    
    return design;
  }
}


