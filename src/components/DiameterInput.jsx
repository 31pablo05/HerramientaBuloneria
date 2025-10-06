import React, { useState, useEffect } from 'react';
import { useIdentification } from '../context/useIdentification';
import { validateDiameter, normalizeValue } from '../utils/validators';
import { mmToInch, inchToMm, formatMm, formatInch, detectUnit } from '../utils/unitConversion';
import { findAllMatches } from '../utils/tableLookup';
import InstructionPanel from './InstructionPanel';

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
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Panel de instrucciones */}
      <InstructionPanel
        step={2}
        title="Medir Diámetro Exterior"
        icon="📏"
        tools={[
          {
            icon: '📐',
            name: 'Calibre Digital',
            precision: 'Precisión: ±0.02mm'
          },
          {
            icon: '🔧',
            name: 'Calibre Analógico',
            precision: 'Precisión: ±0.05mm'
          }
        ]}
        instructions={[
          'Limpiar el bulón y el calibre para eliminar suciedad o grasa',
          'Abrir las mordazas del calibre y colocar el bulón entre ellas',
          'Cerrar suavemente hasta que toque el diámetro exterior (parte roscada)',
          'Leer la medida en la escala digital o vernier',
          'Realizar 3 mediciones y usar el promedio para mayor precisión'
        ]}
        tips={[
          {
            type: 'tip',
            title: 'Desgaste Normal',
            message: 'Es normal que la medida sea 0.1-0.2mm menor que el nominal por desgaste de la rosca. El sistema lo compensará automáticamente.'
          },
          {
            type: 'warning',
            title: 'Punto de Medición',
            message: 'Mida en la parte ROSCADA, no en el cuello liso bajo la cabeza. El diámetro de rosca es lo que importa.'
          }
        ]}
      />
      
      <div className="max-w-2xl mx-auto">
        {/* Selector de unidad */}
        <div className="mb-6 bg-white rounded-2xl p-6 shadow-tool border-2 border-primary-cyan/20">
          <label className="block text-lg font-bold text-primary-navy mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            Unidad de Medida
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleUnitChange('mm')}
              className={`
                py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-tool
                ${unit === 'mm' 
                  ? 'bg-gradient-primary text-white border-2 border-primary-cyan scale-105' 
                  : 'bg-steel-100 text-steel-700 hover:bg-steel-200 border-2 border-steel-300'
                }
              `}
            >
              <div className="text-3xl mb-2">📏</div>
              Milímetros (mm)
              <div className="text-xs mt-1 opacity-75">Sistema Métrico</div>
            </button>
            <button
              onClick={() => handleUnitChange('inch')}
              className={`
                py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-tool
                ${unit === 'inch' 
                  ? 'bg-gradient-primary text-white border-2 border-primary-cyan scale-105' 
                  : 'bg-steel-100 text-steel-700 hover:bg-steel-200 border-2 border-steel-300'
                }
              `}
            >
              <div className="text-3xl mb-2">📐</div>
              Pulgadas (")
              <div className="text-xs mt-1 opacity-75">Sistema Imperial</div>
            </button>
          </div>
          {inputValue && (
            <button
              onClick={handleAutoDetectUnit}
              className="mt-4 w-full py-3 px-4 bg-warning/20 text-warning border-2 border-warning/50 rounded-xl hover:bg-warning/30 transition-all font-bold text-sm"
              title="Detectar unidad automáticamente"
            >
              🤖 Detectar unidad automáticamente
            </button>
          )}
        </div>
        
        {/* Input de diámetro */}
        <div className="mb-6 relative bg-white rounded-2xl p-6 shadow-tool border-2 border-primary-cyan/20">
          <label className="block text-lg font-bold text-primary-navy mb-4 flex items-center gap-2">
            <span className="text-2xl">🔢</span>
            Ingrese el Diámetro Medido
          </label>
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={unit === 'mm' ? 'Ej: 8.0' : 'Ej: 0.25'}
              className={`
                w-full px-6 py-4 border-2 rounded-xl text-2xl font-bold text-center transition-all duration-300
                focus:ring-4 focus:outline-none
                ${validation.isValid 
                  ? 'border-steel-300 focus:ring-primary-cyan/20 focus:border-primary-cyan' 
                  : 'border-error focus:ring-error/20 focus:border-error'
                }
              `}
            />
            <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
              <span className="text-primary-blue font-bold text-xl">
                {unit === 'mm' ? 'mm' : '"'}
              </span>
            </div>
          </div>
          
          {!validation.isValid && (
            <div className="mt-3 p-3 bg-error/10 border-2 border-error/30 rounded-lg">
              <p className="text-error font-medium text-sm flex items-center gap-2">
                <span>⚠️</span>
                {validation.error}
              </p>
            </div>
          )}
          
          {validation.isValid && inputValue && (
            <div className="mt-3 p-3 bg-success/10 border-2 border-success/30 rounded-lg">
              <p className="text-success font-medium text-sm flex items-center gap-2 justify-center">
                <span>✓</span>
                Equivalencia: {unit === 'mm' 
                  ? formatInch(mmToInch(parseFloat(inputValue)))
                  : formatMm(inchToMm(parseFloat(inputValue)))
                }
              </p>
            </div>
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
