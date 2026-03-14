import { MaterialProcessorRegistry } from '../infrastructure/processors/MaterialProcessorRegistry';
import { MaterialRendererRegistry } from '../infrastructure/renderers/MaterialRendererRegistry';
import { RegistryBootstrap } from '../infrastructure/bootstrap/RegistryBootstrap';
import { PrismaModelRepository } from './repositories/PrismaModelRepository';
import { PrismaDesignRepository } from './repositories/PrismaDesignRepository';
import { ModelService } from './services/ModelService';
import { DesignService } from './services/DesignService';
import { MaterialService } from './services/MaterialService';

/**
 * Контекст приложения - единая точка доступа ко всем сервисам.
 */
export class ApplicationContext {
  private static instance: ApplicationContext;
  
  public readonly processorRegistry: MaterialProcessorRegistry;
  public readonly rendererRegistry: MaterialRendererRegistry;
  public readonly modelRepository: PrismaModelRepository;
  public readonly designRepository: PrismaDesignRepository;
  public readonly modelService: ModelService;
  public readonly designService: DesignService;
  public readonly materialService: MaterialService;
  
  private constructor() {
    // Инициализация регистров (работают на клиенте и сервере)
    this.processorRegistry = RegistryBootstrap.initializeProcessors();
    this.rendererRegistry = RegistryBootstrap.initializeRenderers();
    
    // Инициализация репозиториев (только на сервере)
    // На клиенте они будут null, но это нормально - репозитории используются только в API routes
    const isServer = typeof window === 'undefined';
    if (isServer) {
      try {
        this.modelRepository = new PrismaModelRepository();
        this.designRepository = new PrismaDesignRepository();
        
        // Инициализация сервисов
        this.modelService = new ModelService(this.modelRepository);
        this.designService = new DesignService(
          this.designRepository,
          this.modelRepository
        );
        this.materialService = new MaterialService(
          this.designRepository,
          this.processorRegistry,
          this.rendererRegistry
        );
      } catch (error) {
        console.warn('Failed to initialize repositories (server-side only):', error);
        // Fallback: создаем null значения
        this.modelRepository = null as any;
        this.designRepository = null as any;
        this.modelService = null as any;
        this.designService = null as any;
        this.materialService = null as any;
      }
    } else {
      // Client-side: репозитории не доступны
      this.modelRepository = null as any;
      this.designRepository = null as any;
      this.modelService = null as any;
      this.designService = null as any;
      this.materialService = null as any;
    }
  }
  
  static getInstance(): ApplicationContext {
    if (!ApplicationContext.instance) {
      ApplicationContext.instance = new ApplicationContext();
    }
    return ApplicationContext.instance;
  }
}

