import { ProcessorRegistry } from '../registry/ProcessorRegistry'
import { RendererRegistry } from '../registry/RendererRegistry'
import { TextureProcessor } from '../processors/TextureProcessor'
import { PhotoProcessor } from '../processors/PhotoProcessor'
import { VideoProcessor } from '../processors/VideoProcessor'
import { BackgroundProcessor } from '../processors/BackgroundProcessor'
import { TextureRenderer } from '../renderers/three/TextureRenderer'
import { BackgroundRenderer } from '../renderers/three/BackgroundRenderer'

export function bootstrapApp() {
  const processorRegistry = new ProcessorRegistry()
  const rendererRegistry = new RendererRegistry()

  // Register processors
  processorRegistry.register('texture', new TextureProcessor())
  processorRegistry.register('photo', new PhotoProcessor())
  processorRegistry.register('video', new VideoProcessor())
  processorRegistry.register('background', new BackgroundProcessor())

  // Register renderers
  // Note: BackgroundRenderer is NOT registered here as it works with Design, not Material
  // It's used directly in RenderDesignService
  rendererRegistry.register('texture', new TextureRenderer())

  return { processorRegistry, rendererRegistry }
}


