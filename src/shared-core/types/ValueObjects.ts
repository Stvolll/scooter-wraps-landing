export type ModelId = string & { readonly __brand: 'ModelId' };
export type DesignId = string & { readonly __brand: 'DesignId' };
export type MaterialId = string & { readonly __brand: 'MaterialId' };

export const ModelId = (value: string): ModelId => value as ModelId;
export const DesignId = (value: string): DesignId => value as DesignId;
export const MaterialId = (value: string): MaterialId => value as MaterialId;

export interface ModelMetadata {
  readonly name: string;
  readonly description?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface DesignMetadata {
  readonly name: string;
  readonly description?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface MaterialMetadata {
  readonly name: string;
  readonly description?: string;
  readonly uploadedAt: number;
  readonly fileSize?: number;
}

export interface ResourceReference {
  readonly url: string;
  readonly type: string; // MIME type
  readonly size?: number;
}


