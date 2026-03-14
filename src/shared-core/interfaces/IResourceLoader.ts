import { ResourceReference } from '../types/ValueObjects';

/**
 * Загрузчик ресурсов.
 * Абстракция над различными способами загрузки (HTTP, локальные файлы, и т.д.).
 */
export interface IResourceLoader<T> {
  /**
   * Загрузить ресурс.
   */
  load(resource: ResourceReference): Promise<T>;
  
  /**
   * Освободить ресурс.
   */
  dispose(resource: T): void;
}


