import { useContext } from 'react';
import IdentificationContext from './IdentificationContext';

// Hook personalizado para usar el contexto
export const useIdentification = () => {
  const context = useContext(IdentificationContext);
  if (!context) {
    throw new Error('useIdentification debe ser usado dentro de un IdentificationProvider');
  }
  return context;
};