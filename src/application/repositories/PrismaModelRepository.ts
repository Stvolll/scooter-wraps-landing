import { IModelRepository, IModel } from '../../shared-core/interfaces';
import { ModelId } from '../../shared-core/types/ValueObjects';
// Prisma should only be used on server-side
// Use dynamic import to avoid client-side bundling
let prisma: any = null;
const getPrisma = () => {
  if (typeof window !== 'undefined') {
    // Client-side: Prisma not available
    return null;
  }
  if (!prisma) {
    try {
      prisma = require('@/lib/prisma').prisma;
    } catch (e) {
      console.warn('Prisma not available (server-side only)');
    }
  }
  return prisma;
};
import { Model } from '../../domain/Model';
import { Design } from '../../domain/Design';
import { MaterialFactory } from '../../domain/factories/MaterialFactory';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

/**
 * Репозиторий для Model с использованием Prisma.
 */
export class PrismaModelRepository implements IModelRepository {
  private materialFactory = new MaterialFactory();
  
  async save(model: IModel): Promise<void> {
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error('Prisma is only available on server-side');
    }
    // Сохранение модели в БД через Prisma
    await prisma.scooterModel.upsert({
      where: { id: model.id },
      create: {
        id: model.id,
        slug: model.id.replace('model_', ''),
        name: model.metadata.name,
        active: true,
        order: 0,
        designs: {
          create: model.listDesigns().map(design => ({
            id: design.id,
            slug: design.id.replace('design_', ''),
            title: design.metadata.name,
            description: design.metadata.description,
            scooterModelId: model.id,
            materials: {
              create: design.listMaterials().map(material => ({
                format: material.format,
                url: material.getResource().url,
                metadata: material.metadata as any,
              })),
            },
          })),
        },
      },
      update: {
        name: model.metadata.name,
        designs: {
          upsert: model.listDesigns().map(design => ({
            where: { id: design.id },
            create: {
              id: design.id,
              slug: design.id.replace('design_', ''),
              title: design.metadata.name,
              description: design.metadata.description,
              scooterModelId: model.id,
              materials: {
                create: design.listMaterials().map(material => ({
                  format: material.format,
                  url: material.getResource().url,
                  metadata: material.metadata as any,
                })),
              },
            },
            update: {
              title: design.metadata.name,
              description: design.metadata.description,
            },
          })),
        },
      },
    });
  }
  
  async findById(id: ModelId): Promise<IModel | null> {
    const dbModel = await prisma.scooterModel.findUnique({
      where: { id },
      include: {
        designs: {
          include: {
            materials: true,
          },
        },
      },
    });
    
    if (!dbModel) return null;
    
    return this.mapToDomain(dbModel);
  }
  
  async findAll(): Promise<ReadonlyArray<IModel>> {
    const dbModels = await prisma.scooterModel.findMany({
      include: {
        designs: {
          include: {
            materials: true,
          },
        },
      },
    });
    
    return dbModels.map(dbModel => this.mapToDomain(dbModel));
  }
  
  async delete(id: ModelId): Promise<boolean> {
    try {
      await prisma.scooterModel.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  private mapToDomain(dbModel: any): IModel {
    const model = new Model(
      ModelId(dbModel.id),
      {
        name: dbModel.name,
        description: dbModel.seoDescription,
        createdAt: dbModel.createdAt.getTime(),
        updatedAt: dbModel.updatedAt.getTime(),
      }
    );
    
    dbModel.designs?.forEach((dbDesign: any) => {
      const design = new Design(
        DesignId(dbDesign.id),
        {
          name: dbDesign.title,
          description: dbDesign.description,
          createdAt: dbDesign.createdAt.getTime(),
          updatedAt: dbDesign.updatedAt.getTime(),
        }
      );
      
      dbDesign.materials?.forEach((dbMaterial: any) => {
        const material = this.materialFactory.createMaterial(
          dbMaterial.format as MaterialFormat,
          MaterialId(dbMaterial.id),
          dbMaterial.metadata,
          dbMaterial.url,
          dbMaterial.metadata?.mimeType
        );
        design.addMaterial(material);
      });
      
      model.addDesign(design);
    });
    
    return model;
  }
}

