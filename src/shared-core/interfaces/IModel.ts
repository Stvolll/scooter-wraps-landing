import { ModelId, ModelMetadata, DesignId } from '../types/ValueObjects';
import { IDesign } from './IDesign';

/**
 * Изолированная модель из индексированного набора Model[i].
 * НЕ зависит от других Model.
 */
export interface IModel {
  readonly id: ModelId;
  readonly metadata: ModelMetadata;
  
  /**
   * Добавить дизайн в модель.
   */
  addDesign(design: IDesign): void;
  
  /**
   * Удалить дизайн из модели.
   */
  removeDesign(designId: DesignId): boolean;
  
  /**
   * Получить дизайн по ID.
   */
  getDesign(designId: DesignId): IDesign | null;
  
  /**
   * Получить все дизайны.
   */
  listDesigns(): ReadonlyArray<IDesign>;
}


