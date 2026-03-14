import { MaterialProcessorRegistry } from '../processors/MaterialProcessorRegistry';
import { MaterialRendererRegistry } from '../renderers/MaterialRendererRegistry';
import { TextureProcessor } from '../processors/TextureProcessor';
import { PhotoProcessor } from '../processors/PhotoProcessor';
import { VideoProcessor } from '../processors/VideoProcessor';
import { TextureRenderer } from '../renderers/TextureRenderer';
import { PanoramaRenderer } from '../renderers/PanoramaRenderer';

/**
 * Инициализация регистров.
 * ЕДИНСТВЕННОЕ место, где регистрируются процессоры и рендереры.
 */
export class RegistryBootstrap {
  static initializeProcessors(): MaterialProcessorRegistry {
    const registry = new MaterialProcessorRegistry();
    
    // Регистрируем все процессоры
    registry.register(new TextureProcessor());
    registry.register(new PhotoProcessor());
    registry.register(new VideoProcessor());
    
    // Новые форматы добавляются здесь:
    // registry.register(new AudioProcessor());
    // registry.register(new Model3DProcessor());
    
    return registry;
  }
  
  static initializeRenderers(): MaterialRendererRegistry {
    const registry = new MaterialRendererRegistry();
    
    // Регистрируем все рендереры
    registry.register(new TextureRenderer());
    registry.register(new PanoramaRenderer());
    
    // Новые форматы добавляются здесь:
    // registry.register(new VideoRenderer());
    // registry.register(new AudioRenderer());
    
    return registry;
  }
}


