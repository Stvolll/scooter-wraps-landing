import { IMaterial, IDesignRepository } from '../../shared-core/interfaces';
import { MaterialProcessorRegistry } from '../../infrastructure/processors/MaterialProcessorRegistry';
import { MaterialRendererRegistry } from '../../infrastructure/renderers/MaterialRendererRegistry';
import { DesignId, MaterialId } from '../../shared-core/types/ValueObjects';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { RenderContext } from '../../shared-core/interfaces';

export class MaterialService {
  constructor(
    private designRepository: IDesignRepository,
    private processorRegistry: MaterialProcessorRegistry,
    private rendererRegistry: MaterialRendererRegistry
  ) {}
  
  /**
   * Загрузить и обработать файл, добавить как материал в дизайн.
   */
  async uploadMaterial(
    designId: DesignId,
    format: MaterialFormat,
    file: File
  ): Promise<IMaterial> {
    const design = await this.designRepository.findById(designId);
    if (!design) {
      throw new Error(`Design with id ${designId} not found`);
    }
    
    const processor = this.processorRegistry.getProcessor(format);
    if (!processor) {
      throw new Error(`No processor found for format: ${format}`);
    }
    
    // Обрабатываем файл
    const material = await processor.process(file);
    
    // Добавляем материал в дизайн
    design.addMaterial(material);
    
    // Сохраняем дизайн
    await this.designRepository.save(design);
    
    return material;
  }
  
  /**
   * Оптимизировать материал.
   */
  async optimizeMaterial(material: IMaterial): Promise<IMaterial> {
    const processor = this.processorRegistry.getProcessor(material.format);
    if (!processor) {
      throw new Error(`No processor found for format: ${material.format}`);
    }
    
    return processor.optimize(material);
  }
  
  /**
   * Отрендерить материал в сцену.
   */
  async renderMaterial(
    material: IMaterial,
    context: RenderContext
  ): Promise<void> {
    const renderer = this.rendererRegistry.getRenderer(material.format);
    if (!renderer) {
      throw new Error(`No renderer found for format: ${material.format}`);
    }
    
    return renderer.render(material, context);
  }
  
  /**
   * Получить материал из дизайна.
   */
  async getMaterial(
    designId: DesignId,
    materialId: MaterialId
  ): Promise<IMaterial | null> {
    const design = await this.designRepository.findById(designId);
    if (!design) {
      return null;
    }
    
    return design.getMaterial(materialId);
  }
  
  /**
   * Удалить материал из дизайна.
   */
  async deleteMaterial(
    designId: DesignId,
    materialId: MaterialId
  ): Promise<boolean> {
    const design = await this.designRepository.findById(designId);
    if (!design) {
      return false;
    }
    
    const removed = design.removeMaterial(materialId);
    if (removed) {
      await this.designRepository.save(design);
    }
    
    return removed;
  }
  
  /**
   * Получить все поддерживаемые форматы.
   */
  getSupportedFormats(): MaterialFormat[] {
    return this.processorRegistry.getSupportedFormats();
  }
}


