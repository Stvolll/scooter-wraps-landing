import { IMaterialProcessor, IMaterial } from '../../shared-core/interfaces';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';

/**
 * Регистр процессоров материалов.
 * Позволяет добавлять новые форматы БЕЗ изменения существующего кода.
 */
export class MaterialProcessorRegistry {
  private processors = new Map<MaterialFormat, IMaterialProcessor<any>>();
  
  register<T extends IMaterial>(processor: IMaterialProcessor<T>): void {
    if (this.processors.has(processor.supportedFormat)) {
      console.warn(`Processor for format ${processor.supportedFormat} already registered. Overwriting.`);
    }
    this.processors.set(processor.supportedFormat, processor);
  }
  
  getProcessor<T extends IMaterial>(format: MaterialFormat): IMaterialProcessor<T> | null {
    return this.processors.get(format) ?? null;
  }
  
  hasProcessor(format: MaterialFormat): boolean {
    return this.processors.has(format);
  }
  
  getSupportedFormats(): MaterialFormat[] {
    return Array.from(this.processors.keys());
  }
}


