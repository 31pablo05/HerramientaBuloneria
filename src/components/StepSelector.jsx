import React from 'react';
import { useIdentification } from '../context/useIdentification';

const StepSelector = () => {
  const { state, actions } = useIdentification();
  
  const pieceTypes = [
    {
      id: 'bolt',
      name: 'Tornillo / Bulón',
      description: 'Elemento roscado con cabeza y cuerpo cilíndrico',
      icon: '🔩',
      features: ['Cabeza', 'Rosca', 'Longitud específica']
    },
    {
      id: 'nut',
      name: 'Tuerca',
      description: 'Elemento roscado internamente para acoplar con tornillo',
      icon: '🔘',
      features: ['Rosca interna', 'Forma hexagonal típica', 'Sin longitud']
    },
    {
      id: 'washer',
      name: 'Arandela',
      description: 'Elemento plano para distribuir carga y proteger superficie',
      icon: '⭕',
      features: ['Sin rosca', 'Distribución de carga', 'Protección']
    }
  ];
  
  const handleSelection = (pieceType) => {
    actions.setPieceType(pieceType);
    // Auto-avanzar al siguiente paso después de seleccionar
    setTimeout(() => {
      actions.nextStep();
    }, 300);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Paso 1: Seleccionar Tipo de Pieza
        </h2>
        <p className="text-gray-600 text-lg">
          Identifique qué tipo de elemento necesita clasificar
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pieceTypes.map((piece) => (
          <div
            key={piece.id}
            onClick={() => handleSelection(piece.id)}
            className={`
              relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 hover:shadow-lg
              ${state.pieceType === piece.id 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">
                {piece.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {piece.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {piece.description}
              </p>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Características:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {piece.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {state.pieceType === piece.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {state.pieceType && (
        <div className="mt-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
            <div className="flex items-center text-green-700">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                Tipo seleccionado: {pieceTypes.find(p => p.id === state.pieceType)?.name}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => actions.resetIdentification()}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Reiniciar
        </button>
        
        <button
          onClick={() => actions.nextStep()}
          disabled={!state.pieceType}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all
            ${state.pieceType 
              ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-200' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
};

export default StepSelector;
