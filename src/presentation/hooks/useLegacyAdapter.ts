import { LegacyAdapter } from '../../application/adapters/LegacyAdapter';

let adapterInstance: LegacyAdapter | null = null;

export const useLegacyAdapter = () => {
  if (!adapterInstance) {
    adapterInstance = new LegacyAdapter();
  }
  return adapterInstance;
};


