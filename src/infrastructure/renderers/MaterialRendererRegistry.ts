import { IMaterialRenderer, IMaterial } from '../../shared-core/interfaces';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

/**
 * Регистр рендереров материалов.
 * Позволяет добавлять новые форматы БЕЗ изменения существующего кода.
 */
export class MaterialRendererRegistry {
  private renderers = new Map<MaterialFormat, IMaterialRenderer<any>>();
  
  register<T extends IMaterial>(renderer: IMaterialRenderer<T>): void {
    if (this.renderers.has(renderer.supportedFormat)) {
      console.warn(`Renderer for format ${renderer.supportedFormat} already registered. Overwriting.`);
    }
    this.renderers.set(renderer.supportedFormat, renderer);
  }
  
  getRenderer<T extends IMaterial>(format: MaterialFormat): IMaterialRenderer<T> | null {
    return this.renderers.get(format) ?? null;
  }
  
  hasRenderer(format: MaterialFormat): boolean {
    return this.renderers.has(format);
  }
  
  getSupportedFormats(): MaterialFormat[] {
    return Array.from(this.renderers.keys());
  }
}


