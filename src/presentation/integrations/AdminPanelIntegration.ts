/**
 * Интеграция новой архитектуры с админ-панелью.
 * Позволяет использовать MaterialService для загрузки материалов.
 */

import { useApplicationContext } from '../hooks/useApplicationContext';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { DesignId } from '../../shared-core/types/ValueObjects';

export const useAdminPanelIntegration = () => {
  const context = useApplicationContext();
  
  /**
   * Загрузить материал в дизайн используя новую архитектуру.
   */
  const uploadMaterialToDesign = async (
    designId: string,
    format: MaterialFormat,
    file: File
  ): Promise<void> => {
    try {
      await context.materialService.uploadMaterial(
        DesignId(designId),
        format,
        file
      );
      console.log('✅ Material uploaded using new architecture');
    } catch (error) {
      console.error('❌ Error uploading material:', error);
      throw error;
    }
  };
  
  /**
   * Получить все материалы дизайна.
   */
  const getDesignMaterials = async (designId: string) => {
    try {
      const design = await context.designService.getDesign(DesignId(designId));
      if (!design) {
        return [];
      }
      
      return design.listMaterials().map(material => ({
        id: material.id,
        format: material.format,
        url: material.getResource().url,
        metadata: material.metadata,
      }));
    } catch (error) {
      console.error('❌ Error getting design materials:', error);
      return [];
    }
  };
  
  /**
   * Удалить материал из дизайна.
   */
  const deleteMaterialFromDesign = async (
    designId: string,
    materialId: string
  ): Promise<boolean> => {
    try {
      return await context.materialService.deleteMaterial(
        DesignId(designId),
        materialId as any
      );
    } catch (error) {
      console.error('❌ Error deleting material:', error);
      return false;
    }
  };
  
  /**
   * Получить поддерживаемые форматы материалов.
   */
  const getSupportedFormats = (): MaterialFormat[] => {
    return context.materialService.getSupportedFormats();
  };
  
  return {
    uploadMaterialToDesign,
    getDesignMaterials,
    deleteMaterialFromDesign,
    getSupportedFormats,
    materialService: context.materialService,
    designService: context.designService,
  };
};


