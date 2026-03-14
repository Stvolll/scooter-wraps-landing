import { IDesignRepository, IDesign } from '../../shared-core/interfaces';
import { DesignId, ModelId } from '../../shared-core/types/ValueObjects';
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
import { Design } from '../../domain/Design';
import { MaterialFactory } from '../../domain/factories/MaterialFactory';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

/**
 * Репозиторий для Design с использованием Prisma.
 */
export class PrismaDesignRepository implements IDesignRepository {
  private materialFactory = new MaterialFactory();
  
  async save(design: IDesign): Promise<void> {
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error('Prisma is only available on server-side');
    }
    // Находим модель, к которой относится дизайн
    const dbDesign = await prisma.design.findUnique({
      where: { id: design.id },
      include: { scooterModel: true },
    });
    
    if (!dbDesign) {
      throw new Error(`Design ${design.id} not found in database`);
    }
    
    await prisma.design.update({
      where: { id: design.id },
      data: {
        title: design.metadata.name,
        description: design.metadata.description,
        materials: {
          deleteMany: {}, // Удаляем старые материалы
          create: design.listMaterials().map(material => ({
            format: material.format,
            url: material.getResource().url,
            metadata: material.metadata as any,
          })),
        },
      },
    });
  }
  
  async findById(id: DesignId): Promise<IDesign | null> {
    const dbDesign = await prisma.design.findUnique({
      where: { id },
      include: {
        materials: true,
      },
    });
    
    if (!dbDesign) return null;
    
    return this.mapToDomain(dbDesign);
  }
  
  async findByModelId(modelId: ModelId): Promise<ReadonlyArray<IDesign>> {
    const dbDesigns = await prisma.design.findMany({
      where: { scooterModelId: modelId },
      include: {
        materials: true,
      },
    });
    
    return dbDesigns.map(dbDesign => this.mapToDomain(dbDesign));
  }
  
  async delete(id: DesignId): Promise<boolean> {
    try {
      await prisma.design.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  
  private mapToDomain(dbDesign: any): IDesign {
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
    
    return design;
  }
}

