import { IMaterial } from './IMaterial';
import { MaterialFormat } from '../types/MaterialFormat';

/**
 * Обработчик для конкретного формата материала.
 * Новые форматы добавляются через НОВЫЕ РЕАЛИЗАЦИИ этого интерфейса.
 */
export interface IMaterialProcessor<T extends IMaterial> {
  /**
   * Формат, который поддерживает этот процессор.
   */
  readonly supportedFormat: MaterialFormat;
  
  /**
   * Обработать загруженный файл и создать Material.
   */
  process(file: File): Promise<T>;
  
  /**
   * Оптимизировать существующий материал.
   */
  optimize(material: T): Promise<T>;
  
  /**
   * Валидация файла перед обработкой.
   */
  validate(file: File): Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}


