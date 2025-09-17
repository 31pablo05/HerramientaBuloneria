import React, { useState, useEffect } from 'react';
import { useIdentification } from '../context/useIdentification';
import { validateLength, normalizeValue } from '../utils/validators';
import { formatMm, formatInch, mmToInch, inchToMm } from '../utils/unitConversion';
import { validateLength as validateStandardLength } from '../utils/tableLookup';

const LengthInput = () => {
  const { state, actions } = useIdentification();
  const [inputValue, setInputValue] = useState(state.length.value || '');
  const [unit, setUnit] = useState(state.diameter.unit || 'mm'); // Usar la misma unidad que el diámetro
  const [lengthValidation, setLengthValidation] = useState(null);
  const [standardLengths, setStandardLengths] = useState([]);
  
  // Obtener longitudes estándar basadas en las especificaciones actuales
  useEffect(() => {
    if (state.possibleMatches && state.possibleMatches.length > 0) {
      const allLengths = new Set();
      state.possibleMatches.forEach(match => {
        if (match.standardLengths) {
          match.standardLengths.forEach(length => allLengths.add(length));
        }
      });
      
      const sortedLengths = Array.from(allLengths).sort((a, b) => a - b);
      setStandardLengths(sortedLengths);
    }
  }, [state.possibleMatches]);
  
  // Validar longitud cuando cambia el input
  useEffect(() => {
    if (inputValue && state.possibleMatches && state.possibleMatches.length > 0) {
      const normalizedValue = normalizeValue(inputValue);
      if (normalizedValue) {
        // Convertir a mm para validación
        const lengthInMm = unit === 'inch' ? inchToMm(normalizedValue) : normalizedValue;
        
        // Validar contra especificaciones disponibles
        const bestMatch = state.possibleMatches[0];
        if (bestMatch) {
          const validation = validateStandardLength(lengthInMm, bestMatch);
          setLengthValidation(validation);
        }
        
        // Actualizar el estado
        actions.setLength({
          value: normalizedValue,
          measured: lengthInMm
        });
      }
    } else {
      setLengthValidation(null);
    }
  }, [inputValue, unit, state.possibleMatches, actions]);
  
  const validation = inputValue ? validateLength(inputValue, unit) : { isValid: true, error: null };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    actions.clearError('length');
  };
  
  const handleUnitChange = (newUnit) => {
    if (newUnit !== unit && inputValue) {
      const normalizedValue = normalizeValue(inputValue);
      if (normalizedValue) {
        let convertedValue;
        if (unit === 'mm' && newUnit === 'inch') {
          convertedValue = mmToInch(normalizedValue);
        } else if (unit === 'inch' && newUnit === 'mm') {
          convertedValue = inchToMm(normalizedValue);
        } else {
          convertedValue = normalizedValue;
        }
        setInputValue(convertedValue.toFixed(newUnit === 'inch' ? 3 : 0));
      }
    }
    setUnit(newUnit);
  };
  
  const handleStandardLengthClick = (length) => {
    const value = unit === 'inch' ? mmToInch(length) : length;
    setInputValue(value.toFixed(unit === 'inch' ? 3 : 0));
  };
  
  const getStandardLengthsForUnit = () => {
    if (unit === 'mm') {
      return standardLengths;
    } else {
      // Convertir a pulgadas y filtrar valores razonables
      return standardLengths
        .map(length => mmToInch(length))
        .filter(length => length >= 0.125 && length <= 20)
        .map(length => Math.round(length * 8) / 8); // Redondear a 1/8"
    }
  };
  
  // Auto-saltar al siguiente paso para tuercas y arandelas
  useEffect(() => {
    if (state.pieceType !== 'bolt') {
      actions.nextStep();
    }
  }, [state.pieceType, actions]);
  
  const getMeasurementTips = () => {
    return [
      'Mida desde la parte inferior de la cabeza hasta la punta',
      'No incluya la cabeza en la medición de longitud',
      'Use una regla o calibre para mayor precisión',
      'Para tornillos avellanados, mida toda la longitud'
    ];
  };
  
  // Solo mostrar este componente para tornillos/bulones
  if (state.pieceType !== 'bolt') {
    return null;
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Paso 4: Ingresar Longitud
        </h2>
        <p className="text-gray-600 text-lg">
          Mida la longitud del tornillo/bulón bajo la cabeza
        </p>
      </div>
      
      {/* Información de la identificación actual */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Identificación actual:</h3>
        <div className="text-blue-700 space-y-1">
          <p>Tipo: {state.pieceType === 'bolt' ? 'Tornillo/Bulón' : state.pieceType}</p>
          <p>Diámetro: {state.diameter.value} {state.diameter.unit}</p>
          <p>Rosca: {state.threadType} - Paso {state.threadPitch.value} mm ({state.threadPitch.type})</p>
        </div>
      </div>
      
      {/* Selector de unidad */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Unidad de medida:
        </label>
        <div className="flex space-x-4 max-w-md">
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
        </div>
      </div>
      
      {/* Input de longitud */}
      <div className="mb-6 max-w-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Longitud medida:
        </label>
        <div className="relative">
          <input
            type="number"
            step={unit === 'mm' ? '1' : '0.125'}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={unit === 'mm' ? 'Ej: 25' : 'Ej: 1.0'}
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
        
        {/* Validación contra longitudes estándar */}
        {lengthValidation && inputValue && (
          <div className="mt-3 p-3 rounded-lg border">
            {lengthValidation.isStandard ? (
              <div className="text-green-600">
                <div className="flex items-center mb-1">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Longitud estándar</span>
                </div>
                <p className="text-sm">
                  Confianza: {Math.round(lengthValidation.confidence * 100)}%
                </p>
              </div>
            ) : (
              <div className="text-yellow-600">
                <div className="flex items-center mb-1">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Longitud no estándar</span>
                </div>
                <p className="text-sm">
                  Longitud estándar más cercana: {lengthValidation.closestStandard} mm
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Longitudes estándar disponibles */}
      {standardLengths.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Longitudes estándar disponibles ({unit === 'mm' ? 'milímetros' : 'pulgadas'}):
          </h4>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {getStandardLengthsForUnit().slice(0, 20).map((length, index) => (
              <button
                key={index}
                onClick={() => handleStandardLengthClick(unit === 'mm' ? length : inchToMm(length))}
                className={`
                  py-2 px-3 text-sm border rounded hover:bg-gray-50 transition-colors
                  ${parseFloat(inputValue) === (unit === 'mm' ? length : length) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300'
                  }
                `}
              >
                {unit === 'mm' ? length : length.toFixed(3)}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Consejos de medición */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">
          📏 Consejos para medir la longitud:
        </h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          {getMeasurementTips().map((tip, index) => (
            <li key={index}>• {tip}</li>
          ))}
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

export default LengthInput;
