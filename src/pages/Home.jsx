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
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-100 animate-fade-in">
      {/* Header de la aplicación */}
  <header className="bg-gradient-to-r from-blue-100 via-white to-purple-100 shadow-lg border-b border-gray-200 animate-header-fade">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 md:h-28">
            <div className="flex items-center">
              <div className="mr-6 flex items-center">
                <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full p-2 shadow-2xl animate-logo-pop">
                  <img
                    src="/public/logo/herramienta bulonerialogo.svg"
                    alt="Logo Herramienta Bulonería"
                    className="w-24 h-24 md:w-32 md:h-32 animate-spin-slow drop-shadow-xl"
                    style={{ animation: 'spin 6s linear infinite' }}
                  />
                </div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes logo-pop {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    60% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                  .animate-logo-pop { animation: logo-pop 1.2s cubic-bezier(.68,-0.55,.27,1.55) 1; }
                  .animate-header-fade { animation: fade-in 1.2s ease; }
                  @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                  }
                `}</style>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 tracking-tight mb-1 animate-fade-in">
                  Herramienta de Identificación
                </h1>
                <p className="text-base md:text-lg text-gray-700 font-medium animate-fade-in">
                  Sistema de identificación de bulonería métrica y Whitworth
                </p>
              </div>
            </div>
            
            {/* Información del usuario actual */}
            <div className="hidden md:flex items-center space-x-4 animate-fade-in">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Empleado</p>
                <p className="text-xs text-gray-600">Bulonería Industrial</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pop">
                <span className="text-white text-lg font-bold">U</span>
              </div>
              <style>{`
                @keyframes pop {
                  0% { transform: scale(0.7); }
                  60% { transform: scale(1.1); }
                  100% { transform: scale(1); }
                }
                .animate-pop { animation: pop 1s cubic-bezier(.68,-0.55,.27,1.55) 1; }
              `}</style>
            </div>
          </div>
        </div>
      </header>
      
      {/* Barra de progreso */}
      {state.currentStep > 1 && (
        <div className="bg-gradient-to-r from-blue-100 via-white to-purple-100 border-b border-gray-200 shadow-sm animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Paso {state.currentStep}: {getStepName()}
              </span>
              <span className="text-sm text-gray-500">
                {getProgress()}% completado
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-700 ease-out animate-progress"
                style={{ width: `${getProgress()}%` }}
              ></div>
              <style>{`
                .animate-progress { animation: progress-bar 1.2s cubic-bezier(.68,-0.55,.27,1.55); }
                @keyframes progress-bar {
                  0% { width: 0; }
                  100% { width: ${getProgress()}%; }
                }
              `}</style>
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
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500 scale-105' 
                        : isCurrent 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white border-blue-400 scale-110 ring-2 ring-blue-200' 
                          : 'bg-gray-200 text-gray-600 border-gray-300'
                      } animate-fade-in`}
                  >
                    {isCompleted ? <span className="text-lg">✓</span> : stepNumber}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido principal */}
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {getCurrentComponent()}
      </main>
      
      {/* Footer */}
  <footer className="bg-gradient-to-r from-blue-100 via-white to-purple-100 border-t border-gray-200 mt-16 shadow-lg animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full p-2 shadow-xl mr-3 animate-logo-pop">
                <img
                  src="/public/logo/herramienta bulonerialogo.svg"
                  alt="Logo Herramienta Bulonería"
                  className="w-10 h-10 md:w-14 md:h-14 animate-spin-slow drop-shadow-lg"
                  style={{ animation: 'spin 6s linear infinite' }}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">
                  Herramienta de Identificación de Bulonería
                </p>
                <p className="text-xs text-gray-600">
                  Versión 1.0 - Para uso interno en ferreterías
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 animate-fade-in">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="font-semibold text-green-700">Sistema operativo</span>
              </div>
              
              <button
                onClick={() => actions.resetIdentification()}
                className="text-blue-600 hover:text-purple-600 font-bold transition-all duration-300 transform hover:scale-110"
              >
                Reiniciar identificación
              </button>
              
              <button
                onClick={() => actions.toggleHistory()}
                className="text-purple-600 hover:text-blue-600 font-bold transition-all duration-300 transform hover:scale-110"
              >
                Ver historial ({state.history.length})
              </button>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
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
        <div className="fixed inset-0 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 shadow-2xl border-2 border-blue-200 animate-fade-in">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-blue-700 font-bold text-lg">Procesando...</p>
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
