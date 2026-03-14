import * as THREE from 'three';
import { IMaterialRenderer, RenderContext } from '../../shared-core/interfaces';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { TextureMaterial } from '../../domain/materials/TextureMaterial';

/**
 * Рендерер для Texture материалов.
 * Применяет текстуру к 3D модели через Three.js.
 */
export class TextureRenderer implements IMaterialRenderer<TextureMaterial> {
  readonly supportedFormat = MaterialFormat.TEXTURE;
  private textureCache = new Map<string, THREE.Texture>();
  
  async render(material: TextureMaterial, context: RenderContext): Promise<void> {
    const resource = material.getResource();
    
    // Проверяем кэш
    let texture = this.textureCache.get(resource.url);
    
    if (!texture) {
      texture = await this.loadTexture(resource.url);
      if (texture) {
        this.textureCache.set(resource.url, texture);
      }
    }
    
    if (!texture) return;
    
    // Применяем текстуру к модели
    if (context.model && typeof context.model.traverse === 'function') {
      context.model.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.material) {
          const materials = Array.isArray(child.material) 
            ? child.material 
            : [child.material];
          
          materials.forEach((mat: any) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              mat.map = texture;
              mat.needsUpdate = true;
            }
          });
        }
      });
    }
  }

  /**
   * Отрендерить текстуру в сцену или группу (для React Three Fiber)
   * Применяет текстуру только к UV-мешам для дизайна
   */
  async renderToScene(
    material: TextureMaterial,
    scene: THREE.Scene | THREE.Group
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const resource = material.getResource();
      const textureUrl = resource.url;

      // Проверяем кэш
      let texture = this.textureCache.get(textureUrl);
      
      if (texture) {
        // Текстура уже загружена, применяем сразу
        this.applyTextureToScene(texture, scene);
        resolve();
        return;
      }

      // Очищаем старые текстуры дизайна
      const oldDesignTextures: THREE.Texture[] = [];
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const meshName = child.name || '';
          const isUVMesh = this.isUVMeshForDesign(meshName);
          
          if (!isUVMesh) {
            return; // Пропускаем не-UV меши
          }
          
          if (child.material instanceof THREE.MeshStandardMaterial) {
            if (child.material.map && (child.material.map as any).userData?.isDesignTexture) {
              oldDesignTextures.push(child.material.map);
              child.material.map = null;
            }
          } else if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                if (mat.map && (mat.map as any).userData?.isDesignTexture) {
                  oldDesignTextures.push(mat.map);
                  mat.map = null;
                }
              }
            });
          }
        }
      });

      // Удаляем старые текстуры
      oldDesignTextures.forEach((oldTexture) => {
        const url = (oldTexture as any).userData?.url;
        if (url) {
          this.disposeTexture(url);
        } else {
          oldTexture.dispose();
        }
      });

      // Загружаем новую текстуру
      const loader = new THREE.TextureLoader();
      
      loader.load(
        textureUrl,
        (loadedTexture) => {
          try {
            // Настройка текстуры
            loadedTexture.userData = { 
              url: textureUrl,
              isDesignTexture: true
            };
            this.textureCache.set(textureUrl, loadedTexture);

            loadedTexture.wrapS = THREE.RepeatWrapping;
            loadedTexture.wrapT = THREE.RepeatWrapping;
            loadedTexture.repeat.set(1, 1);
            loadedTexture.flipY = false;

            loadedTexture.colorSpace = THREE.SRGBColorSpace;

            loadedTexture.needsUpdate = true;

            // Применяем только к UV-мешам
            this.applyTextureToScene(loadedTexture, scene);

            resolve();
          } catch (error) {
            console.error('[TextureRenderer] Error applying texture:', error);
            this.textureCache.delete(textureUrl);
            reject(error);
          }
        },
        undefined,
        (error) => {
          console.error('[TextureRenderer] Error loading texture:', error);
          this.textureCache.delete(textureUrl);
          reject(error);
        }
      );
    });
  }

  /**
   * Применить текстуру к сцене (только к UV-мешам)
   */
  private applyTextureToScene(texture: THREE.Texture, scene: THREE.Scene | THREE.Group): void {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const meshName = child.name || '';
        const materialName = (child.material as any)?.name || '';
        const isUVMesh = this.isUVMeshForDesign(meshName, materialName);
        
        if (isUVMesh) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.map = texture;
            child.material.needsUpdate = true;
          } else if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.map = texture;
                mat.needsUpdate = true;
              }
            });
          }
        }
      }
    });
  }

  /**
   * Определить, является ли меш UV-мешем для дизайна
   * Использует паттерны из старого ScooterViewer3D компонента
   */
  private isUVMeshForDesign(meshName: string, materialName?: string): boolean {
    const namesToCheck = [meshName, materialName].filter(Boolean) as string[];
    
    const MATERIAL_PATTERNS = {
      body: [
        'body', 'main', 'primary', 'base',
        'face', 'a-face', 'a_face', 'aface',
        'chassis', 'frame',
        'uv_sh160_a-face', 'texture_sh160_a-face',
      ],
      plastic: [
        'plastic', 'trim', 'secondary',
        'place', 'rl-place', 'rl_place', 'rlplace',
        'panel', 'cover',
        'uv_sh160_rl-place', 'texture_sh160_rl-place',
      ],
      accents: [
        'accent', 'detail', 'highlight',
        'parts', 'z-parts', 'z_parts', 'zparts',
        'accessory', 'decals',
        'uv_sh160_z-parts', 'texture_sh160_z-parts',
      ],
    };

    for (const name of namesToCheck) {
      if (!name) continue;
      
      const normalizedName = name.toLowerCase().trim().replace(/\.\d+$/, '');
      
      for (const patterns of Object.values(MATERIAL_PATTERNS)) {
        for (const pattern of patterns) {
          const lowerPattern = pattern.toLowerCase();
          
          if (normalizedName === lowerPattern || normalizedName.includes(lowerPattern)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  dispose(material: TextureMaterial): void {
    const resource = material.getResource();
    this.disposeTexture(resource.url);
  }

  /**
   * Очистить конкретную текстуру из кэша
   */
  disposeTexture(url: string): void {
    const texture = this.textureCache.get(url);
    if (texture) {
      texture.dispose();
      this.textureCache.delete(url);
    }
  }

  /**
   * Очистить весь кэш
   */
  disposeAll(): void {
    this.textureCache.forEach((texture) => {
      texture.dispose();
    });
    this.textureCache.clear();
  }
  
  private async loadTexture(url: string): Promise<THREE.Texture | null> {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      
      loader.load(
        url,
        (texture) => {
          // Настройка текстуры
          texture.flipY = false;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.set(1, 1);

          texture.colorSpace = THREE.SRGBColorSpace;

          texture.needsUpdate = true;
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error('[TextureRenderer] Error loading texture:', error);
          reject(error);
        }
      );
    });
  }
}


