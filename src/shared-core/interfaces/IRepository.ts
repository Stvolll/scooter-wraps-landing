import { ModelId, DesignId } from '../types/ValueObjects';
import { IModel } from './IModel';
import { IDesign } from './IDesign';

/**
 * Репозиторий для Model[i].
 */
export interface IModelRepository {
  save(model: IModel): Promise<void>;
  findById(id: ModelId): Promise<IModel | null>;
  findAll(): Promise<ReadonlyArray<IModel>>;
  delete(id: ModelId): Promise<boolean>;
}

/**
 * Репозиторий для Design[j].
 */
export interface IDesignRepository {
  save(design: IDesign): Promise<void>;
  findById(id: DesignId): Promise<IDesign | null>;
  findByModelId(modelId: ModelId): Promise<ReadonlyArray<IDesign>>;
  delete(id: DesignId): Promise<boolean>;
}

