import * as THREE from 'three';
import { PanoramaMaterial } from '../../domain/materials/PanoramaMaterial';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { IDesign } from '../../shared-core/interfaces';

/**
 * Рендерер для фонов сцен.
 * Поддерживает:
 * - Panorama материалы (360° изображения)
 * - Градиентные фоны (fallback)
 * - Цветные фоны
 * - HDRI окружения
 */
export class BackgroundRenderer {
  private textureCache = new Map<string, THREE.Texture>();

  /**
   * Получить PanoramaMaterial из дизайна или создать дефолтный градиент
   */
  private resolvePanoramaMaterial(design: IDesign): PanoramaMaterial | null {
    // Ищем Panorama материал в дизайне
    const panoramaMaterials = design.getMaterialsByFormat(MaterialFormat.PANORAMA);
    
    if (panoramaMaterials.length > 0) {
      const firstPanorama = panoramaMaterials[0];
      if (firstPanorama instanceof PanoramaMaterial) {
        return firstPanorama;
      }
    }
    
    return null;
  }

  /**
   * Создать дефолтный градиентный фон
   */
  private createDefaultGradient(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    if (!context) {
      // Fallback: создаем простой цветной фон
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1;
      fallbackCanvas.height = 1;
      const fallbackContext = fallbackCanvas.getContext('2d');
      if (fallbackContext) {
        fallbackContext.fillStyle = '#1a1a1a';
        fallbackContext.fillRect(0, 0, 1, 1);
      }
      return new THREE.CanvasTexture(fallbackCanvas);
    }

    // Градиент от #1a1a1a к #0a0a0a (как в старом компоненте)
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.userData = { isDefaultBackground: true };
    return texture;
  }

  /**
   * Отрендерить фон в сцену
   */
  render(scene: THREE.Scene, design: IDesign | null, fallbackUrl?: string): void {
    // Очистить существующий фон
    if (scene.background) {
      if (scene.background instanceof THREE.Texture) {
        // Не удаляем дефолтный фон из кэша
        if (!scene.background.userData?.isDefaultBackground) {
          scene.background.dispose();
        }
      }
      scene.background = null;
    }
    
    if (scene.environment) {
      if (scene.environment instanceof THREE.Texture) {
        if (!scene.environment.userData?.isDefaultBackground) {
          scene.environment.dispose();
        }
      }
      scene.environment = null;
    }

    // Приоритет 1: Panorama материал из дизайна
    if (design) {
      const panoramaMaterial = this.resolvePanoramaMaterial(design);
      if (panoramaMaterial) {
        this.renderPanoramaMaterial(scene, panoramaMaterial);
        return;
      }
    }

    // Приоритет 2: Fallback URL (из пропсов старого компонента)
    if (fallbackUrl) {
      this.renderPanoramaUrl(scene, fallbackUrl);
      return;
    }

    // Приоритет 3: Дефолтный градиент
    const defaultTexture = this.createDefaultGradient();
    scene.background = defaultTexture;
  }

  /**
   * Отрендерить PanoramaMaterial
   */
  private renderPanoramaMaterial(scene: THREE.Scene, material: PanoramaMaterial): void {
    const resource = material.getResource();
    const url = resource.url;

    // Проверяем кэш
    let texture = this.textureCache.get(url);
    
    if (texture) {
      scene.background = texture;
      // Для HDRI также устанавливаем environment
      if (url.endsWith('.hdr') || url.endsWith('.exr')) {
        scene.environment = texture;
      }
      return;
    }

    // Загружаем текстуру
    const loader = new THREE.TextureLoader();
    
    loader.load(
      url,
      (loadedTexture) => {
        texture = loadedTexture;
        texture.userData = { isDesignBackground: true, url };
        this.textureCache.set(url, texture);

        // Для HDRI используем EquirectangularReflectionMapping
        if (url.endsWith('.hdr') || url.endsWith('.exr')) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.background = texture;
          scene.environment = texture;
        } else {
          // Для обычных изображений (webp, jpg, png)
          scene.background = texture;
        }
      },
      undefined,
      (error) => {
        console.error('[BackgroundRenderer] Error loading panorama:', error);
        // Fallback на дефолтный градиент
        const defaultTexture = this.createDefaultGradient();
        scene.background = defaultTexture;
      }
    );
  }

  /**
   * Отрендерить панораму по URL (legacy поддержка)
   */
  private renderPanoramaUrl(scene: THREE.Scene, url: string): void {
    // Проверяем кэш
    let texture = this.textureCache.get(url);
    
    if (texture) {
      scene.background = texture;
      if (url.endsWith('.hdr') || url.endsWith('.exr')) {
        scene.environment = texture;
      }
      return;
    }

    const loader = new THREE.TextureLoader();
    
    loader.load(
      url,
      (loadedTexture) => {
        texture = loadedTexture;
        texture.userData = { isDesignBackground: true, url };
        this.textureCache.set(url, texture);

        texture.colorSpace = THREE.SRGBColorSpace;

        if (url.endsWith('.hdr') || url.endsWith('.exr')) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.background = texture;
          scene.environment = texture;
        } else {
          scene.background = texture;
        }
      },
      undefined,
      (error) => {
        console.error('[BackgroundRenderer] Error loading panorama URL:', error);
        // Fallback на дефолтный градиент
        const defaultTexture = this.createDefaultGradient();
        scene.background = defaultTexture;
      }
    );
  }

  /**
   * Очистить кэш
   */
  dispose(): void {
    this.textureCache.forEach((texture) => {
      if (!texture.userData?.isDefaultBackground) {
        texture.dispose();
      }
    });
    this.textureCache.clear();
  }

  /**
   * Очистить конкретную текстуру из кэша
   */
  disposeTexture(url: string): void {
    const texture = this.textureCache.get(url);
    if (texture && !texture.userData?.isDefaultBackground) {
      texture.dispose();
      this.textureCache.delete(url);
    }
  }
}




