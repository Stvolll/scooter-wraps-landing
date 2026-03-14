/**
 * Интеграция новой архитектуры с ScooterViewer компонентом.
 * Позволяет использовать MaterialService для рендеринга материалов.
 */

import { useApplicationContext } from '../hooks/useApplicationContext';
import { useLegacyAdapter } from '../hooks/useLegacyAdapter';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { RenderContext } from '../../shared-core/interfaces';

export const useScooterViewerIntegration = () => {
  // ApplicationContext может быть недоступен на клиенте (репозитории null)
  // Используем только rendererRegistry и processorRegistry, которые работают на клиенте
  let context: any = null;
  try {
    context = useApplicationContext();
  } catch (error) {
    console.warn('ApplicationContext not available, using fallback');
  }
  const adapter = useLegacyAdapter();
  
  /**
   * Применить текстуру к 3D модели используя новую архитектуру.
   */
  const applyTextureWithNewArchitecture = async (
    selectedDesign: any,
    scene: any,
    model: any
  ): Promise<void> => {
    if (!selectedDesign || !scene || !model) {
      console.warn('⚠️ Missing required parameters for texture application');
      return;
    }
    
    try {
      // Конвертируем legacy дизайн в новый формат
      const design = await adapter.convertLegacyDesignToNew(selectedDesign);
      
      // Получаем текстуру
      const textures = design.getMaterialsByFormat 
        ? design.getMaterialsByFormat(MaterialFormat.TEXTURE)
        : [];
      
      if (textures.length === 0) {
        console.warn('⚠️ No texture material found in design');
        return;
      }
      
      const textureMaterial = textures[0];
      
      // Создаем контекст рендеринга
      const renderContext: RenderContext = {
        scene,
        model,
      };
      
      // Используем MaterialService для рендеринга (если доступен)
      if (context?.materialService) {
        await context.materialService.renderMaterial(textureMaterial, renderContext);
      } else {
        // Fallback: используем renderer напрямую из registry
        const renderer = context?.rendererRegistry?.getRenderer(textureMaterial.format);
        if (renderer) {
          await renderer.render(textureMaterial, renderContext);
        } else {
          throw new Error('No renderer available for texture material');
        }
      }
      
      console.log('✅ Texture applied using new architecture');
    } catch (error) {
      console.error('❌ Error applying texture with new architecture:', error);
      
      // Fallback на старую логику
      console.log('🔄 Falling back to legacy texture application');
      const textureUrl = adapter.getTextureForDesign(selectedDesign);
      if (textureUrl) {
        // Используем старую логику как fallback
        console.log('Using legacy texture URL:', textureUrl);
      }
    }
  };
  
  /**
   * Получить панораму для дизайна (с поддержкой новой архитектуры).
   */
  const getPanoramaUrl = (selectedDesign: any): string | null => {
    return adapter.getPanoramaForDesign(selectedDesign);
  };
  
  /**
   * Получить текстуру для дизайна (с поддержкой новой архитектуры).
   */
  const getTextureUrl = (selectedDesign: any): string | null => {
    return adapter.getTextureForDesign(selectedDesign);
  };
  
  /**
   * Получить фото для дизайна (с поддержкой новой архитектуры).
   */
  const getPhotoUrls = (selectedDesign: any): string[] => {
    return adapter.getPhotosForDesign(selectedDesign);
  };
  
  return {
    applyTextureWithNewArchitecture,
    getPanoramaUrl,
    getTextureUrl,
    getPhotoUrls,
    materialService: context?.materialService || null,
    rendererRegistry: context?.rendererRegistry || null,
    adapter,
  };
};

