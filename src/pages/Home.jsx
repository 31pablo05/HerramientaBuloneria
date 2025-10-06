import React from 'react';
import { useIdentification } from '../context/useIdentification';

// Importar todos los componentes del flujo de identificación de bulones
import StepSelector from '../components/StepSelector';
import DiameterInput from '../components/DiameterInput';
import ThreadSelector from '../components/ThreadSelector';
import LengthInput from '../components/LengthInput';
import HeadTypeSelector from '../components/HeadTypeSelector';
import ResultCard from '../components/ResultCard';

const Home = () => {
  const { state, actions } = useIdentification();
  
  // Determinar qué componente mostrar según el paso actual
  const getCurrentComponent = () => {
    switch (state.currentStep) {
      case 1:
        return <StepSelector />;
      case 2:
        return <DiameterInput />;
      case 3:
        return <ThreadSelector />;
      case 4:
        return <LengthInput />;
      case 5:
        return <HeadTypeSelector />;
      case 6:
        return <ResultCard />;
      default:
        return <StepSelector />;
    }
  };
  
  // Obtener el progreso actual
  const getProgress = () => {
    const totalSteps = 6; // Tipo, Diámetro, Rosca, Largo, Cabeza, Resultado
    return Math.round((state.currentStep / totalSteps) * 100);
  };
  
  // Obtener el nombre del paso actual
  const getStepName = () => {
    switch (state.currentStep) {
      case 1:
        return 'Inicio';
      case 2:
        return 'Diámetro (calibre)';
      case 3:
        return 'Paso de rosca (peine)';
      case 4:
        return 'Longitud';
      case 5:
        return 'Tipo de cabeza';
      case 6:
        return 'Resultado final';
      default:
        return 'Identificación';
    }
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-light via-white to-steel-100">
      {/* Header de la aplicación - Full width */}
      <header className="w-full bg-gradient-navy shadow-xl border-b-4 border-primary-cyan">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-20 sm:h-24 md:h-28 lg:h-32">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="flex items-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-2xl animate-logo-pop border-2 border-primary-cyan/30">
                  <img
                    src="/logo/BulonScan.svg"
                    alt="BulonScan Logo"
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 drop-shadow-2xl"
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
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight mb-0.5 sm:mb-1 drop-shadow-lg">
                  BulonScan
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-primary-cyan font-semibold flex items-center gap-1 sm:gap-2">
                  <span className="inline-block w-2 h-2 bg-primary-cyan rounded-full animate-pulse"></span>
                  Identificación Profesional de Bulonería
                </p>
              </div>
            </div>
            
            {/* Información del usuario actual */}
            <div className="hidden md:flex items-center space-x-4 animate-fade-in">
              <div className="text-right">
                <p className="text-sm font-semibold text-white">Empleado</p>
                <p className="text-xs text-primary-cyan">Ferretería Industrial</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-cyan to-primary-blue rounded-full flex items-center justify-center shadow-tool-lg border-2 border-white/30 animate-pop">
                <span className="text-primary-navy text-lg font-bold">👤</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Barra de progreso - Full width */}
      {state.currentStep > 1 && (
        <div className="w-full bg-white border-b-2 border-steel-200 shadow-tool">
          <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 sm:py-4 md:py-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg md:text-xl font-bold text-primary-navy">
                  Paso {state.currentStep}/6
                </span>
                <span className="text-xs sm:text-sm font-medium text-primary-blue px-2 sm:px-3 py-1 bg-primary-light rounded-full">
                  {getStepName()}
                </span>
              </div>
              <span className="text-sm font-bold text-primary-cyan">
                {getProgress()}%
              </span>
            </div>
            
            <div className="w-full bg-steel-200 rounded-full h-4 shadow-inner-light">
              <div 
                className="bg-gradient-primary h-4 rounded-full transition-all duration-700 ease-out animate-progress shadow-lg"
                style={{ width: `${getProgress()}%`, '--progress-width': `${getProgress()}%` }}
              ></div>
            </div>
            
            {/* Indicadores de pasos */}
            <div className="flex justify-between mt-3 sm:mt-4 gap-1 sm:gap-2">
              {Array.from({ length: actions.getTotalSteps() }, (_, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < state.currentStep;
                const isCurrent = stepNumber === state.currentStep;
                
                return (
                  <div 
                    key={stepNumber}
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm md:text-base font-bold shadow-tool border-2 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-success text-white border-success/50 scale-105' 
                        : isCurrent 
                          ? 'bg-gradient-primary text-white border-primary-cyan scale-110 ring-4 ring-primary-cyan/30 animate-pulse-slow' 
                          : 'bg-steel-200 text-steel-500 border-steel-300'
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
      
      {/* Contenido principal - Full width responsive */}
      <main className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="animate-fade-in">
          {getCurrentComponent()}
        </div>
      </main>
      
      {/* Footer - Full width */}
      <footer className="w-full bg-gradient-navy border-t-4 border-primary-cyan mt-8 sm:mt-12 md:mt-16 shadow-2xl">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 shadow-tool-lg mr-4 border-2 border-primary-cyan/30">
                <img
                  src="/logo/BulonScan.svg"
                  alt="BulonScan Logo"
                  className="w-12 h-12 md:w-16 md:h-16 drop-shadow-2xl"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  BulonScan
                </p>
                <p className="text-sm text-primary-cyan">
                  v2.0 - Herramienta Profesional
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm animate-fade-in">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
                <span className="font-semibold text-success">Sistema activo</span>
              </div>
              
              <button
                onClick={() => actions.resetIdentification()}
                className="text-primary-cyan hover:text-white font-bold transition-all duration-300 transform hover:scale-110 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                🔄 Reiniciar
              </button>
              
              <button
                onClick={() => actions.toggleHistory()}
                className="text-white hover:text-primary-cyan font-bold transition-all duration-300 transform hover:scale-110 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                📋 Historial ({state.history.length})
              </button>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="font-bold mb-2 text-primary-cyan flex items-center gap-2">
                  <span>📏</span> Estándares Soportados
                </p>
                <p className="text-white/80">✓ Sistema Métrico ISO (M2-M68)</p>
                <p className="text-white/80">✓ Sistema Whitworth BSW/BSF</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="font-bold mb-2 text-primary-cyan flex items-center gap-2">
                  <span>🔩</span> Identificación
                </p>
                <p className="text-white/80">• Bulones y tornillos</p>
                <p className="text-white/80">• Medición con calibre + peine</p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="font-bold mb-2 text-primary-cyan flex items-center gap-2">
                  <span>🎯</span> Precisión
                </p>
                <p className="text-white/80">Diámetro: ±0.02mm</p>
                <p className="text-white/80">Paso rosca: ±0.08mm</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-white/50">
              © 2025 BulonScan - Desarrollado para profesionales de la industria
            </p>
            <p className="text-xs text-white/60 mt-2 flex items-center justify-center gap-2">
              Desarrollado con 
              <span className="text-red-500 animate-pulse-slow inline-block">❤️</span> 
              por 
              <a 
                href="https://devcraftpablo.online/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-cyan hover:text-white font-semibold transition-colors duration-300 hover:underline"
              >
                Pablo Proboste
              </a>
            </p>
          </div>
        </div>
      </footer>
      
      {/* Overlay de carga global */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-primary-navy/90 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 shadow-tool-lg border-4 border-primary-cyan animate-fade-in">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-cyan mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🔩</span>
                </div>
              </div>
              <p className="text-primary-navy font-bold text-xl mb-2">Procesando...</p>
              <p className="text-steel-600 text-sm">
                Analizando datos con precisión profesional
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
