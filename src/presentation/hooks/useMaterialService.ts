import { useApplicationContext } from './useApplicationContext';

export const useMaterialService = () => {
  const context = useApplicationContext();
  return context.materialService;
};


