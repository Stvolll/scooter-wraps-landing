import { IMaterial } from './IMaterial';
import { MaterialFormat } from '../types/MaterialFormat';

/**
 * Контекст рендеринга (специфичный для Three.js, но можно абстрагировать).
 */
export interface RenderContext {
  scene: any; // THREE.Scene в реальности
  model: any; // THREE.Group в реальности
  camera?: any;
}

/**
 * Рендерер для конкретного формата материала.
 * Новые форматы добавляются через НОВЫЕ РЕАЛИЗАЦИИ этого интерфейса.
 */
export interface IMaterialRenderer<T extends IMaterial> {
  /**
   * Формат, который поддерживает этот рендерер.
   */
  readonly supportedFormat: MaterialFormat;
  
  /**
   * Отрендерить материал в сцену.
   */
  render(material: T, context: RenderContext): Promise<void>;
  
  /**
   * Очистить ресурсы материала.
   */
  dispose(material: T): void;
}


