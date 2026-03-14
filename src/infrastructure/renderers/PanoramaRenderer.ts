import { IMaterialRenderer, RenderContext } from '../../shared-core/interfaces';
import { MaterialFormat } from '../../shared-core/types/MaterialFormat';
import { PanoramaMaterial } from '../../domain/materials/PanoramaMaterial';

/**
 * Рендерер для Panorama материалов.
 * Создает 360° панораму в сцене.
 */
export class PanoramaRenderer implements IMaterialRenderer<PanoramaMaterial> {
  readonly supportedFormat = MaterialFormat.PANORAMA;
  private sphereMesh: any = null; // THREE.Mesh в реальности
  
  async render(material: PanoramaMaterial, context: RenderContext): Promise<void> {
    const resource = material.getResource();
    
    // В реальности загрузка через THREE.TextureLoader
    const texture = await this.loadTexture(resource.url);
    
    if (!texture || !context.scene) return;
    
    // Создаем сферу для панорамы
    // В реальности:
    // const geometry = new THREE.SphereGeometry(500, 60, 40);
    // geometry.scale(-1, 1, 1); // Инвертируем для просмотра изнутри
    // const material3D = new THREE.MeshBasicMaterial({ map: texture });
    // this.sphereMesh = new THREE.Mesh(geometry, material3D);
    // context.scene.add(this.sphereMesh);
    
    // Временная реализация
    this.sphereMesh = { texture, url: resource.url };
  }
  
  dispose(material: PanoramaMaterial): void {
    if (this.sphereMesh) {
      // В реальности:
      // this.sphereMesh.geometry.dispose();
      // (this.sphereMesh.material as THREE.MeshBasicMaterial).map?.dispose();
      // (this.sphereMesh.material as THREE.Material).dispose();
      // this.sphereMesh.parent?.remove(this.sphereMesh);
      this.sphereMesh = null;
    }
  }
  
  private async loadTexture(url: string): Promise<any> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ image: img, url });
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}


