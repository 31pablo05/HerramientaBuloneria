import React, { useState, useEffect } from 'react';
import { useIdentification } from '../context/useIdentification';
import { getHeadTypeInfo } from '../utils/tableLookup';

const HeadTypeSelector = () => {
  const { state, actions } = useIdentification();
  const [selectedHeadType, setSelectedHeadType] = useState(state.headType || '');
  const [availableHeadTypes, setAvailableHeadTypes] = useState([]);
  
  useEffect(() => {
    // Obtener tipos de cabeza disponibles según las especificaciones
    if (state.possibleMatches && state.possibleMatches.length > 0) {
      const allHeadTypes = new Set();
      state.possibleMatches.forEach(match => {
        if (match.headTypes) {
          match.headTypes.forEach(type => allHeadTypes.add(type));
        }
      });
      setAvailableHeadTypes(Array.from(allHeadTypes));
    }
  }, [state.possibleMatches]);
  
  // Auto-saltar si no es tornillo/bulón
  useEffect(() => {
    if (state.pieceType !== 'bolt') {
      actions.nextStep();
    }
  }, [state.pieceType, actions]);
  
  const handleHeadTypeSelect = (headType) => {
    setSelectedHeadType(headType);
    actions.setHeadType(headType);
  };
  
  const handleSkip = () => {
    actions.setHeadType('');
    actions.nextStep();
  };
  
  const getHeadTypeDetails = () => {
    return {
      hex: {
        name: 'Hexagonal',
        description: 'Cabeza hexagonal estándar para llave',
        icon: '⬡',
        tool: 'Llave hexagonal o francesa',
        characteristics: ['6 lados', 'Fácil agarre', 'Alto torque']
      },
      allen: {
        name: 'Allen (Hexagonal Interior)',
        description: 'Cabeza cilíndrica con hueco hexagonal',
        icon: '⭕',
        tool: 'Llave Allen o hexagonal',
        characteristics: ['Hueco hexagonal', 'Cabeza baja', 'Buen acceso']
      },
      phillips: {
        name: 'Phillips (Cruz)',
        description: 'Cabeza con ranura en cruz Phillips',
        icon: '✚',
        tool: 'Destornillador Phillips',
        characteristics: ['Cruz Phillips', 'Auto-centrado', 'Uso común']
      },
      flat: {
        name: 'Plana (Ranura)',
        description: 'Cabeza con ranura recta',
        icon: '➖',
        tool: 'Destornillador plano',
        characteristics: ['Ranura recta', 'Uso básico', 'Económico']
      },
      pan: {
        name: 'Pan (Cilíndrica)',
        description: 'Cabeza cilíndrica redondeada',
        icon: '🔘',
        tool: 'Destornillador Phillips o plano',
        characteristics: ['Cabeza redondeada', 'Versatil', 'Buen acabado']
      }
    };
  };
  
  const headTypeDetails = getHeadTypeDetails();
  
  // Solo mostrar para tornillos/bulones
  if (state.pieceType !== 'bolt') {
    return null;
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Paso 5: Seleccionar Tipo de Cabeza
        </h2>
        <p className="text-gray-600 text-lg">
          Identifique el tipo de cabeza del tornillo/bulón (opcional)
        </p>
      </div>
      
      {/* Información de la identificación actual */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Identificación actual:</h3>
        <div className="text-blue-700 space-y-1">
          <p>Tipo: {state.pieceType === 'bolt' ? 'Tornillo/Bulón' : state.pieceType}</p>
          <p>Diámetro: {state.diameter.value} {state.diameter.unit}</p>
          <p>Rosca: {state.threadType} - Paso {state.threadPitch.value} mm ({state.threadPitch.type})</p>
          <p>Longitud: {state.length.value} {state.diameter.unit}</p>
        </div>
      </div>
      
      {/* Nota sobre ser opcional */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-green-800 font-medium">Este paso es opcional</p>
            <p className="text-green-700 text-sm">
              Puede continuar sin seleccionar el tipo de cabeza o saltar este paso
            </p>
          </div>
        </div>
      </div>
      
      {/* Selector de tipos de cabeza */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-6">
          Tipos de cabeza disponibles:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(headTypeDetails).map(([type, details]) => {
            const isAvailable = availableHeadTypes.length === 0 || availableHeadTypes.includes(type);
            const isSelected = selectedHeadType === type;
            
            return (
              <button
                key={type}
                onClick={() => handleHeadTypeSelect(type)}
                disabled={!isAvailable}
                className={`
                  relative p-6 border-2 rounded-lg text-left transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : isAvailable
                      ? 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  }
                `}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">
                    {details.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {details.name}
                  </h4>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  {details.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    <strong>Herramienta:</strong> {details.tool}
                  </div>
                  
                  <div className="space-y-1">
                    {details.characteristics.map((char, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
                
                {!isAvailable && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-gray-400 text-white text-xs px-2 py-1 rounded">
                      No disponible
                    </div>
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Información adicional del tipo seleccionado */}
      {selectedHeadType && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">
            Tipo de cabeza seleccionado: {headTypeDetails[selectedHeadType].name}
          </h4>
          <div className="text-blue-700">
            <p className="mb-2">{headTypeDetails[selectedHeadType].description}</p>
            
            {/* Información adicional específica del tipo */}
            {getHeadTypeInfo(selectedHeadType, state.threadType) && (
              <div className="mt-3 p-3 bg-white rounded border">
                <h5 className="font-medium text-gray-700 mb-1">Información técnica:</h5>
                <p className="text-sm text-gray-600">
                  {getHeadTypeInfo(selectedHeadType, state.threadType).description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Consejos visuales */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">
          👁️ Consejos para identificar el tipo de cabeza:
        </h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Observe la forma exterior de la cabeza del tornillo</li>
          <li>• Verifique el tipo de ranura o hueco para la herramienta</li>
          <li>• Los tornillos Allen tienen hueco hexagonal en la parte superior</li>
          <li>• Las cabezas hexagonales son exteriores de 6 lados</li>
          <li>• Las ranuras Phillips forman una cruz, las planas una línea recta</li>
        </ul>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => actions.previousStep()}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Anterior
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
          >
            Saltar este paso
          </button>
          
          <button
            onClick={() => actions.nextStep()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:ring-2 focus:ring-blue-200 transition-all"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeadTypeSelector;
