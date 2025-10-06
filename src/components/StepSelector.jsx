import React from 'react';
import { useIdentification } from '../context/useIdentification';

const StepSelector = () => {
  const { actions } = useIdentification();
  
  const pieceTypes = [
    {
      id: 'bolt',
      name: 'Tornillo / Bulón',
      description: 'Identificación por diámetro y paso de rosca',
      icon: '�',
      features: ['Medición con calibre', 'Verificación con peine de roscas', 'Sistema métrico o Whitworth']
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
        <h2 className="text-3xl font-bold text-primary-navy mb-4">
          Identificación de Tornillos y Bulones
        </h2>
        <p className="text-steel-600 text-lg">
          Sistema rápido para identificar medidas métricas y Whitworth mediante calibre y peine de roscas
        </p>
        <div className="mt-4 bg-primary-light border-2 border-primary-cyan/30 rounded-lg p-4 text-left">
          <p className="text-sm text-primary-navy font-semibold mb-2">📏 Herramientas necesarias:</p>
          <ul className="text-sm text-steel-700 space-y-1">
            <li>• Calibre (pie de rey) para medir diámetro exterior</li>
            <li>• Peine de roscas para verificar el paso</li>
          </ul>
        </div>
      </div>
      
      <div className="flex justify-center">
        {pieceTypes.map((piece) => (
          <div
            key={piece.id}
            onClick={() => handleSelection(piece.id)}
            className="max-w-md w-full relative cursor-pointer rounded-xl border-2 p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-primary-cyan bg-gradient-to-br from-primary-light to-white ring-2 ring-primary-cyan/30 hover:ring-4 hover:ring-primary-cyan/50"
          >
            <div className="text-center">
              <div className="text-8xl mb-6 animate-bounce">
                {piece.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-primary-navy mb-3">
                {piece.name}
              </h3>
              
              <p className="text-steel-700 text-base mb-6 font-medium">
                {piece.description}
              </p>
              
              <div className="border-t-2 border-primary-cyan/30 pt-5">
                <h4 className="text-base font-bold text-primary-blue mb-3">
                  📋 Proceso de identificación:
                </h4>
                <ul className="text-sm text-steel-700 space-y-2">
                  {piece.features.map((feature, index) => (
                    <li key={index} className="flex items-start justify-center">
                      <span className="text-primary-cyan font-bold mr-2">{index + 1}.</span>
                      <span className="text-left">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <button className="mt-6 px-8 py-3 bg-gradient-primary text-white font-bold rounded-lg shadow-tool-lg hover:shadow-xl transition-all transform hover:scale-110 hover:ring-4 hover:ring-primary-cyan/30">
                Iniciar Identificación →
              </button>
            </div>
          </div>
        ))}
      </div>
      

    </div>
  );
};

export default StepSelector;
