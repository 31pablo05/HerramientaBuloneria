import React, { useState, useEffect } from 'react';
import { useIdentification } from '../context/useIdentification';
import { formatInch, mmToInch } from '../utils/unitConversion';

const NutIdentifier = () => {
  const { state, actions } = useIdentification();
  const [nutMeasurements, setNutMeasurements] = useState({
    outerDiameter: '',
    height: '',
    shape: 'hex' // 'hex', 'square', 'wing', 'cap'
  });
  
  // Solo mostrar para tuercas
  useEffect(() => {
    if (state.pieceType !== 'nut') {
      actions.nextStep();
    }
  }, [state.pieceType, actions]);
  
  const handleMeasurementChange = (field, value) => {
    setNutMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleShapeSelect = (shape) => {
    setNutMeasurements(prev => ({
      ...prev,
      shape
    }));
  };
  
  const nutShapes = {
    hex: {
      name: 'Hexagonal',
      description: 'Tuerca de 6 lados, la más común',
      icon: '⬡',
      measurement: 'Distancia entre caras paralelas'
    },
    square: {
      name: 'Cuadrada',
      description: 'Tuerca de 4 lados cuadrados',
      icon: '⬜',
      measurement: 'Distancia entre caras paralelas'
    },
    wing: {
      name: 'Mariposa',
      description: 'Con aletas para apretar a mano',
      icon: '🦋',
      measurement: 'Diámetro total incluyendo aletas'
    },
    cap: {
      name: 'Ciega/Bellota',
      description: 'Con extremo cerrado decorativo',
      icon: '🔘',
      measurement: 'Distancia entre caras del hexágono'
    }
  };
  
  const getNutSizeRecommendations = () => {
    if (!state.diameter.measured) return [];
    
    const diameter = state.diameter.measured;
    const threadType = state.threadType;
    
    // Recomendaciones basadas en el diámetro del tornillo
    const recommendations = [];
    
    if (threadType === 'metric') {
      // Para métrico, el tamaño de la tuerca suele ser 1.5x el diámetro
      const recommendedSize = Math.round(diameter * 1.5);
      recommendations.push({
        size: recommendedSize,
        description: `Tamaño estándar métrico (≈1.5 × diámetro)`
      });
    } else if (threadType === 'whitworth') {
      // Para Whitworth, usar tabla estándar
      const whitworthSizes = {
        6.35: 10,   // 1/4" → 10mm
        7.94: 12,   // 5/16" → 12mm
        9.53: 15,   // 3/8" → 15mm
        12.7: 19,   // 1/2" → 19mm
        15.88: 24,  // 5/8" → 24mm
        19.05: 30   // 3/4" → 30mm
      };
      
      const closest = Object.keys(whitworthSizes).reduce((prev, curr) => {
        return Math.abs(curr - diameter) < Math.abs(prev - diameter) ? curr : prev;
      });
      
      if (whitworthSizes[closest]) {
        recommendations.push({
          size: whitworthSizes[closest],
          description: `Tamaño estándar Whitworth`
        });
      }
    }
    
    return recommendations;
  };
  
  const validateNutMeasurements = () => {
    const errors = [];
    
    if (nutMeasurements.outerDiameter) {
      const outerDia = parseFloat(nutMeasurements.outerDiameter);
      const innerDia = state.diameter.measured;
      
      if (outerDia <= innerDia) {
        errors.push('El diámetro exterior debe ser mayor al diámetro del tornillo');
      }
      
      if (outerDia > innerDia * 3) {
        errors.push('El diámetro exterior parece demasiado grande para esta tuerca');
      }
    }
    
    if (nutMeasurements.height) {
      const height = parseFloat(nutMeasurements.height);
      if (height < 2 || height > 50) {
        errors.push('La altura de la tuerca debe estar entre 2 y 50 mm');
      }
    }
    
    return errors;
  };
  
  const validationErrors = validateNutMeasurements();
  const sizeRecommendations = getNutSizeRecommendations();
  
  // Solo mostrar para tuercas
  if (state.pieceType !== 'nut') {
    return null;
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Paso 4: Identificación de Tuerca
        </h2>
        <p className="text-gray-600 text-lg">
          Complete las medidas específicas de la tuerca
        </p>
      </div>
      
      {/* Información de la identificación actual */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Identificación actual:</h3>
        <div className="text-blue-700 space-y-1">
          <p>Tipo: Tuerca</p>
          <p>Diámetro interno: {state.diameter.value} {state.diameter.unit}</p>
          <p>Rosca: {state.threadType} - Paso {state.threadPitch.value} mm ({state.threadPitch.type})</p>
        </div>
      </div>
      
      {/* Selector de forma */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Forma de la tuerca:
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(nutShapes).map(([shape, details]) => (
            <button
              key={shape}
              onClick={() => handleShapeSelect(shape)}
              className={`
                p-4 border-2 rounded-lg text-center transition-all
                ${nutMeasurements.shape === shape 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
            >
              <div className="text-3xl mb-2">
                {details.icon}
              </div>
              <h4 className="font-semibold text-gray-800 text-sm">
                {details.name}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {details.description}
              </p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Medidas específicas */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Medidas de la tuerca:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diámetro/tamaño exterior */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {nutShapes[nutMeasurements.shape]?.measurement || 'Tamaño exterior'}:
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={nutMeasurements.outerDiameter}
                onChange={(e) => handleMeasurementChange('outerDiameter', e.target.value)}
                placeholder="Ej: 13.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-500 font-medium">mm</span>
              </div>
            </div>
            
            {nutMeasurements.outerDiameter && (
              <p className="mt-1 text-sm text-gray-600">
                Equivalencia: {formatInch(mmToInch(parseFloat(nutMeasurements.outerDiameter)))}
              </p>
            )}
          </div>
          
          {/* Altura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Altura de la tuerca:
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={nutMeasurements.height}
                onChange={(e) => handleMeasurementChange('height', e.target.value)}
                placeholder="Ej: 8.0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-500 font-medium">mm</span>
              </div>
            </div>
            
            {nutMeasurements.height && (
              <p className="mt-1 text-sm text-gray-600">
                Equivalencia: {formatInch(mmToInch(parseFloat(nutMeasurements.height)))}
              </p>
            )}
          </div>
        </div>
        
        {/* Errores de validación */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-1">Errores de validación:</h4>
            <ul className="text-red-700 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Recomendaciones de tamaño */}
      {sizeRecommendations.length > 0 && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">
            💡 Tamaños recomendados:
          </h4>
          <div className="space-y-2">
            {sizeRecommendations.map((rec, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-green-700">{rec.description}</span>
                <button
                  onClick={() => handleMeasurementChange('outerDiameter', rec.size.toString())}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  {rec.size} mm
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Consejos de medición */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">
          📏 Consejos para medir tuercas:
        </h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Para tuercas hexagonales: mida entre caras paralelas, no entre vértices</li>
          <li>• Use un calibre para mayor precisión en medidas pequeñas</li>
          <li>• La altura se mide desde la base hasta la parte superior</li>
          <li>• Verifique que el tornillo entre libremente en la rosca interna</li>
          <li>• Las tuercas de seguridad pueden tener formas especiales</li>
        </ul>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => actions.previousStep()}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Anterior
        </button>
        
        <button
          onClick={() => {
            // Guardar las medidas de la tuerca en el estado
            actions.setLength({
              value: nutMeasurements.height || 0,
              measured: parseFloat(nutMeasurements.height) || 0
            });
            actions.setHeadType(nutMeasurements.shape);
            
            // Continuar al resultado
            actions.nextStep();
          }}
          disabled={validationErrors.length > 0 || !nutMeasurements.outerDiameter}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all
            ${validationErrors.length === 0 && nutMeasurements.outerDiameter
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

export default NutIdentifier;
