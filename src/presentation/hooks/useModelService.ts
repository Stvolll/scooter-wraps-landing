import { useApplicationContext } from './useApplicationContext';

export const useModelService = () => {
  const context = useApplicationContext();
  return context.modelService;
};


