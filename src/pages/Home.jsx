import React from 'react';
import { useIdentification } from '../context/useIdentification';

// Importar todos los componentes del flujo
import StepSelector from '../components/StepSelector';
import DiameterInput from '../components/DiameterInput';
import ThreadSelector from '../components/ThreadSelector';
import LengthInput from '../components/LengthInput';
import HeadTypeSelector from '../components/HeadTypeSelector';
import NutIdentifier from '../components/NutIdentifier';
import ResultCard from '../components/ResultCard';

const Home = () => {
  const { state, actions } = useIdentification();
  
  // Determinar qué componente mostrar según el paso actual y tipo de pieza
  const getCurrentComponent = () => {
    switch (state.currentStep) {
      case 1:
        return <StepSelector />;
      case 2:
        return <DiameterInput />;
      case 3:
        return <ThreadSelector />;
      case 4:
        // Para tuercas, mostrar NutIdentifier en lugar de LengthInput
        if (state.pieceType === 'nut') {
          return <NutIdentifier />;
        } else if (state.pieceType === 'bolt') {
          return <LengthInput />;
        } else {
          // Para arandelas, saltar directamente al resultado
          return <ResultCard />;
        }
      case 5:
        // Solo para tornillos/bulones
        if (state.pieceType === 'bolt') {
          return <HeadTypeSelector />;
        } else {
          return <ResultCard />;
        }
      case 6:
        return <ResultCard />;
      default:
        return <StepSelector />;
    }
  };
  
  // Obtener el progreso actual
  const getProgress = () => {
    let totalSteps = 6; // Valor por defecto
    
    switch (state.pieceType) {
      case 'bolt':
        totalSteps = 6; // Tipo, Diámetro, Rosca, Largo, Cabeza, Resultado
        break;
      case 'nut':
        totalSteps = 5; // Tipo, Diámetro, Rosca, Identificación específica, Resultado
        break;
      case 'washer':
        totalSteps = 4; // Tipo, Diámetro, Confirmación, Resultado
        break;
      default:
        totalSteps = 6;
    }
    
    return Math.round((state.currentStep / totalSteps) * 100);
  };
  
  // Obtener el nombre del paso actual
  const getStepName = () => {
    switch (state.currentStep) {
      case 1:
        return 'Tipo de pieza';
      case 2:
        return 'Diámetro nominal';
      case 3:
        return 'Paso de rosca';
      case 4:
        if (state.pieceType === 'nut') return 'Identificación de tuerca';
        if (state.pieceType === 'bolt') return 'Longitud';
        return 'Confirmación';
      case 5:
        if (state.pieceType === 'bolt') return 'Tipo de cabeza';
        return 'Resultado';
      case 6:
        return 'Resultado';
      default:
        return 'Identificación';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la aplicación */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600 mr-3">🔧</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Herramienta de Identificación
                </h1>
                <p className="text-sm text-gray-600">
                  Sistema de identificación de bulonería métrica y Whitworth
                </p>
              </div>
            </div>
            
            {/* Información del usuario actual */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Empleado</p>
                <p className="text-xs text-gray-600">Bulonería Industrial</p>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Barra de progreso */}
      {state.currentStep > 1 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Paso {state.currentStep}: {getStepName()}
              </span>
              <span className="text-sm text-gray-500">
                {getProgress()}% completado
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            
            {/* Indicadores de pasos */}
            <div className="flex justify-between mt-3">
              {Array.from({ length: actions.getTotalSteps() }, (_, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < state.currentStep;
                const isCurrent = stepNumber === state.currentStep;
                
                return (
                  <div 
                    key={stepNumber}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent 
                          ? 'bg-blue-500 text-white ring-2 ring-blue-200' 
                          : 'bg-gray-300 text-gray-600'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getCurrentComponent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="text-lg font-bold text-blue-600 mr-2">🔧</div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Herramienta de Identificación de Bulonería
                </p>
                <p className="text-xs text-gray-600">
                  Versión 1.0 - Para uso interno en ferreterías
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Sistema operativo
              </div>
              
              <button
                onClick={() => actions.resetIdentification()}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Reiniciar identificación
              </button>
              
              <button
                onClick={() => actions.toggleHistory()}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Ver historial ({state.history.length})
              </button>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
              <div>
                <p className="font-medium mb-1">Estándares soportados:</p>
                <p>• Sistema Métrico (ISO)</p>
                <p>• Sistema Whitworth (BSW)</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Tipos de elementos:</p>
                <p>• Tornillos y bulones</p>
                <p>• Tuercas</p>
                <p>• Arandelas</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Precisión de medida:</p>
                <p>• Diámetros: ±0.1 mm</p>
                <p>• Pasos de rosca: ±0.05 mm</p>
                <p>• Longitudes: ±1 mm</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Overlay de carga global */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-800 font-medium">Procesando...</p>
              <p className="text-gray-600 text-sm mt-1">
                Analizando datos de identificación
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
