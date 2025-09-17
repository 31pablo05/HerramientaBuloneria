import React, { useState, useEffect } from 'react';
import { useIdentification } from '../context/useIdentification';
import { validateDiameter, normalizeValue } from '../utils/validators';
import { mmToInch, inchToMm, formatMm, formatInch, detectUnit } from '../utils/unitConversion';
import { findAllMatches } from '../utils/tableLookup';

const DiameterInput = () => {
  const { state, actions } = useIdentification();
  const [inputValue, setInputValue] = useState(state.diameter.value || '');
  const [unit, setUnit] = useState(state.diameter.unit || 'mm');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    if (inputValue) {
      const normalizedValue = normalizeValue(inputValue);
      if (normalizedValue) {
        // Convertir a mm para las búsquedas
        const diameterInMm = unit === 'inch' ? inchToMm(normalizedValue) : normalizedValue;
        
        // Buscar coincidencias y generar sugerencias
        const matches = findAllMatches(diameterInMm, 1.0);
        setSuggestions(matches.all.slice(0, 5));
        setShowSuggestions(matches.all.length > 0);
        
        // Actualizar el estado
        actions.setDiameter({
          value: normalizedValue,
          unit: unit,
          measured: diameterInMm
        });
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, unit, actions]);
  
  const validation = inputValue ? validateDiameter(inputValue, unit) : { isValid: true, error: null };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    actions.clearError('diameter');
  };
  
  const handleUnitChange = (newUnit) => {
    if (newUnit !== unit && inputValue) {
      const normalizedValue = normalizeValue(inputValue);
      if (normalizedValue) {
        // Convertir el valor existente a la nueva unidad
        let convertedValue;
        if (unit === 'mm' && newUnit === 'inch') {
          convertedValue = mmToInch(normalizedValue);
        } else if (unit === 'inch' && newUnit === 'mm') {
          convertedValue = inchToMm(normalizedValue);
        } else {
          convertedValue = normalizedValue;
        }
        setInputValue(convertedValue.toFixed(newUnit === 'inch' ? 4 : 1));
      }
    }
    setUnit(newUnit);
  };
  
  const handleSuggestionClick = (suggestion) => {
    const value = unit === 'inch' ? mmToInch(suggestion.diameter) : suggestion.diameter;
    setInputValue(value.toFixed(unit === 'inch' ? 4 : 1));
    setShowSuggestions(false);
  };
  
  const handleAutoDetectUnit = () => {
    if (inputValue) {
      const normalizedValue = normalizeValue(inputValue);
      if (normalizedValue) {
        const detectedUnit = detectUnit(normalizedValue);
        if (detectedUnit !== unit) {
          setUnit(detectedUnit);
        }
      }
    }
  };

  const getCommonSizes = () => {
    if (unit === 'mm') {
      return [3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30];
    } else {
      return [0.125, 0.1875, 0.25, 0.3125, 0.375, 0.4375, 0.5, 0.625, 0.75, 0.875, 1.0, 1.125, 1.25];
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Paso 2: Ingresar Diámetro Nominal
        </h2>
        <p className="text-gray-600 text-lg">
          Mida el diámetro con calibre y seleccione la unidad de medida
        </p>
      </div>
      
      {/* Información sobre medición de diámetro */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Medición del diámetro exterior:</p>
            <ul className="space-y-1 text-xs">
              <li>• Mida con calibre el diámetro exterior</li>
              <li>• Es normal que sea 0.1-0.2mm menor que el nominal</li>
              <li>• Esto se debe al desgaste natural de la rosca</li>
              <li>• La herramienta compensará automáticamente</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="max-w-md mx-auto">
        {/* Selector de unidad */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Unidad de medida:
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handleUnitChange('mm')}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all
                ${unit === 'mm' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Milímetros (mm)
            </button>
            <button
              onClick={() => handleUnitChange('inch')}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all
                ${unit === 'inch' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Pulgadas (")
            </button>
            {inputValue && (
              <button
                onClick={handleAutoDetectUnit}
                className="px-3 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-all text-sm font-medium"
                title="Detectar unidad automáticamente"
              >
                Auto
              </button>
            )}
          </div>
        </div>
        
        {/* Input de diámetro */}
        <div className="mb-6 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diámetro nominal:
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={unit === 'mm' ? 'Ej: 8.0' : 'Ej: 0.25'}
              className={`
                w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                ${validation.isValid ? 'border-gray-300' : 'border-red-500'}
              `}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-500 font-medium">
                {unit === 'mm' ? 'mm' : '"'}
              </span>
            </div>
          </div>
          
          {!validation.isValid && (
            <p className="mt-2 text-sm text-red-600">
              {validation.error}
            </p>
          )}
          
          {validation.isValid && inputValue && (
            <p className="mt-2 text-sm text-gray-600">
              Equivalencia: {unit === 'mm' 
                ? formatInch(mmToInch(parseFloat(inputValue)))
                : formatMm(inchToMm(parseFloat(inputValue)))
              }
            </p>
          )}
        </div>
        
        {/* Sugerencias automáticas */}
        {showSuggestions && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Coincidencias encontradas:
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-800">
                        {suggestion.designation}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        ({suggestion.type === 'metric' ? 'Métrico' : 'Whitworth'})
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatMm(suggestion.diameter)}
                      {suggestion.type === 'whitworth' && (
                        <span className="ml-1">
                          ({formatInch(suggestion.diameterInch || mmToInch(suggestion.diameter))})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Información sobre pasos de rosca */}
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                    <p className="font-medium mb-1">Para validar en el paso 3:</p>
                    {suggestion.type === 'metric' ? (
                      <div>
                        <p>• Paso grueso: <span className="font-medium">{suggestion.coarsePitch}mm</span></p>
                        {suggestion.finePitch && (
                          <p>• Paso fino: <span className="font-medium">{suggestion.finePitch}mm</span></p>
                        )}
                        <p className="text-blue-600 mt-1">→ Use peine métrico para verificar</p>
                      </div>
                    ) : (
                      <div>
                        <p>• Hilos por pulgada: <span className="font-medium">{suggestion.threadsPerInch} TPI</span></p>
                        <p>• Paso equivalente: <span className="font-medium">{suggestion.pitchMm.toFixed(2)}mm</span></p>
                        <p className="text-blue-600 mt-1">→ Use peine Whitworth para verificar</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{ width: `${suggestion.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      Confianza: {Math.round(suggestion.confidence * 100)}%
                      {suggestion.measuredDiameter && (
                        <span className="ml-2">
                          (Diferencia: {Math.abs(suggestion.diameter - suggestion.measuredDiameter).toFixed(1)}mm)
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Tamaños comunes */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Tamaños comunes ({unit === 'mm' ? 'milímetros' : 'pulgadas'}):
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {getCommonSizes().map((size) => (
              <button
                key={size}
                onClick={() => setInputValue(size.toString())}
                className="py-2 px-3 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => actions.previousStep()}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Anterior
        </button>
        
        <button
          onClick={() => actions.nextStep()}
          disabled={!validation.isValid || !inputValue}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all
            ${validation.isValid && inputValue
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

export default DiameterInput;
