import React, { useState, useEffect } from 'react';
import { useIdentification } from '../context/useIdentification';
import { validatePitch } from '../utils/validators';
import { findAllMatches, validateThreadPitch } from '../utils/tableLookup';

const ThreadSelector = () => {
  const { state, actions } = useIdentification();
  const [selectedThreadType, setSelectedThreadType] = useState(state.threadType || '');
  const [pitchInput, setPitchInput] = useState(state.threadPitch.value || '');
  const [pitchType, setPitchType] = useState(state.threadPitch.type || '');
  const [availableSpecs, setAvailableSpecs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
    // Obtener especificaciones disponibles basadas en el diámetro
    if (state.diameter.measured) {
      const matches = findAllMatches(state.diameter.measured, 0.5);
      setAvailableSpecs(matches.all);
      
      // Auto-seleccionar el tipo de rosca con mayor confianza si no hay uno seleccionado
      if (matches.all.length > 0 && !selectedThreadType) {
        const bestMatch = matches.all[0];
        setSelectedThreadType(bestMatch.type);
        actions.setThreadType(bestMatch.type);
      }
    }
  }, [state.diameter.measured, selectedThreadType, actions]);
  
  useEffect(() => {
    // Generar sugerencias cuando se selecciona el tipo de rosca
    if (selectedThreadType && availableSpecs.length > 0) {
      const filtered = availableSpecs.filter(spec => spec.type === selectedThreadType);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [selectedThreadType, availableSpecs]);
  
  useEffect(() => {
    // Validar paso cuando se ingresa manualmente
    if (pitchInput && selectedThreadType && suggestions.length > 0) {
      const numPitch = parseFloat(pitchInput);
      if (!isNaN(numPitch)) {
        // Buscar coincidencias con el paso ingresado
        const matchingSpecs = suggestions.filter(spec => {
          const validation = validateThreadPitch(numPitch, spec, 0.05);
          return validation.matches;
        });
        
        if (matchingSpecs.length > 0) {
          const bestMatch = matchingSpecs[0];
          const validation = validateThreadPitch(numPitch, bestMatch, 0.05);
          setPitchType(validation.type);
        }
      }
    }
  }, [pitchInput, selectedThreadType, suggestions]);
  
  const handleThreadTypeChange = (type) => {
    setSelectedThreadType(type);
    setPitchInput('');
    setPitchType('');
    actions.setThreadType(type);
    actions.setThreadPitch({ value: '', type: '', measured: null });
  };
  
  const handlePitchInputChange = (e) => {
    const value = e.target.value;
    setPitchInput(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      actions.setThreadPitch({
        value: numValue,
        type: pitchType,
        measured: numValue
      });
    }
  };
  
  // Función auxiliar para obtener el primer paso fino disponible
  const getFinePitch = (spec, index = 0) => {
    if (!spec.finePitch) return null;
    if (Array.isArray(spec.finePitch)) {
      return spec.finePitch[index] || null;
    }
    return spec.finePitch;
  };

  // Función auxiliar para verificar si hay pasos finos disponibles
  const hasFinePitch = (spec) => {
    if (!spec.finePitch) return false;
    if (Array.isArray(spec.finePitch)) {
      return spec.finePitch.length > 0;
    }
    return true;
  };

  const handleSuggestionClick = (spec, pitchType, finePitchIndex = 0) => {
    let pitchValue;
    
    if (spec.type === 'metric') {
      if (pitchType === 'coarse') {
        pitchValue = spec.coarsePitch;
      } else {
        // Para pasos finos, usar el índice específico
        if (Array.isArray(spec.finePitch) && spec.finePitch.length > finePitchIndex) {
          pitchValue = spec.finePitch[finePitchIndex];
        } else {
          pitchValue = getFinePitch(spec, finePitchIndex);
        }
      }
    } else if (spec.type === 'whitworth') {
      pitchValue = 25.4 / spec.threadsPerInch; // Convertir TPI a paso en mm
    }
    
    if (pitchValue) {
      setPitchInput(pitchValue.toString());
      setPitchType(pitchType);
      
      actions.setThreadPitch({
        value: pitchValue,
        type: pitchType,
        measured: pitchValue
      });
    }
  };
  
  const validation = pitchInput ? validatePitch(pitchInput, selectedThreadType) : { isValid: true, error: null };
  
  const getThreadTypeDescription = (type) => {
    switch (type) {
      case 'metric':
        return 'Sistema métrico estándar (ISO). Paso expresado en milímetros.';
      case 'whitworth':
        return 'Sistema británico Whitworth. Paso expresado en hilos por pulgada (TPI).';
      default:
        return '';
    }
  };
  
  const formatPitch = (value, type, pitchType) => {
    if (type === 'metric') {
      return `${value} mm (${pitchType})`;
    } else if (type === 'whitworth') {
      const tpi = Math.round(25.4 / value);
      return `${tpi} TPI (${value.toFixed(3)} mm)`;
    }
    return value;
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Paso 3: Seleccionar Paso de Rosca
        </h2>
        <p className="text-gray-600 text-lg">
          Use el peine de roscas para medir el paso y confirme el tipo de rosca
        </p>
      </div>
      
      {/* Información del diámetro actual y recomendación principal */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-3 text-lg">📏 Diámetro identificado:</h3>
        <p className="text-blue-700 mb-4">
          {state.diameter.value} {state.diameter.unit} 
          {state.diameter.unit === 'inch' && (
            <span className="ml-2 text-sm">({(state.diameter.measured).toFixed(1)} mm)</span>
          )}
        </p>
        
        {/* Mostrar la coincidencia con mayor confianza */}
        {availableSpecs.length > 0 && (
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-green-800 mb-2">🎯 Mayor probabilidad de coincidencia:</h4>
                <div className="text-lg font-semibold text-gray-800">
                  {availableSpecs[0].designation} ({availableSpecs[0].type === 'metric' ? 'Métrico' : 'Whitworth'})
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Confianza: {Math.round(availableSpecs[0].confidence * 100)}%
                </div>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {availableSpecs[0].type === 'metric' ? 'M' : 'W'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Recomendación de peines basada en la mayor probabilidad */}
      {availableSpecs.length > 0 && (
        <div className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-4 flex items-center">
            🔧 Peines recomendados para probar:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recomendación principal */}
            <div className="bg-white rounded-lg p-4 border-2 border-yellow-400">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">1°</span>
                </div>
                <h4 className="font-semibold text-gray-800">Primera opción</h4>
                <span className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  {Math.round(availableSpecs[0].confidence * 100)}% confianza
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-gray-800">{availableSpecs[0].designation}</p>
                
                {availableSpecs[0].type === 'metric' ? (
                  <div className="space-y-1">
                    <div className="bg-blue-100 p-2 rounded">
                      <p className="text-sm font-medium text-blue-800">🔵 Peine Métrico</p>
                      <p className="text-sm text-blue-700">Paso grueso: {availableSpecs[0].coarsePitch}mm</p>
                      {hasFinePitch(availableSpecs[0]) && (
                        <p className="text-sm text-blue-700">Paso fino: {getFinePitch(availableSpecs[0])}mm</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-100 p-2 rounded">
                    <p className="text-sm font-medium text-orange-800">🟠 Peine Whitworth</p>
                    <p className="text-sm text-orange-700">{availableSpecs[0].threadsPerInch} TPI</p>
                    <p className="text-sm text-orange-700">({availableSpecs[0].pitchMm.toFixed(2)}mm paso)</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Segunda opción si existe */}
            {availableSpecs.length > 1 && (
              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">2°</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">Segunda opción</h4>
                  <span className="ml-auto bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                    {Math.round(availableSpecs[1].confidence * 100)}% confianza
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium text-gray-800">{availableSpecs[1].designation}</p>
                  
                  {availableSpecs[1].type === 'metric' ? (
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-sm font-medium text-blue-800">🔵 Peine Métrico</p>
                      <p className="text-sm text-blue-700">Paso grueso: {availableSpecs[1].coarsePitch}mm</p>
                      {hasFinePitch(availableSpecs[1]) && (
                        <p className="text-sm text-blue-700">Paso fino: {getFinePitch(availableSpecs[1])}mm</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-sm font-medium text-orange-800">🟠 Peine Whitworth</p>
                      <p className="text-sm text-orange-700">{availableSpecs[1].threadsPerInch} TPI</p>
                      <p className="text-sm text-orange-700">({availableSpecs[1].pitchMm.toFixed(2)}mm paso)</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              💡 Instrucciones: Pruebe primero el peine de la opción con mayor confianza. 
              Si encaja perfectamente, seleccione esa especificación abajo.
            </p>
          </div>
        </div>
      )}
      
      {/* Selector de tipo de rosca */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Tipo de sistema de rosca:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleThreadTypeChange('metric')}
            className={`
              p-6 border-2 rounded-lg text-left transition-all
              ${selectedThreadType === 'metric' 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800">Métrico (ISO)</h4>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              {getThreadTypeDescription('metric')}
            </p>
            <div className="text-xs text-gray-500">
              Ejemplos: M3×0.5, M8×1.25, M12×1.75
            </div>
          </button>
          
          <button
            onClick={() => handleThreadTypeChange('whitworth')}
            className={`
              p-6 border-2 rounded-lg text-left transition-all
              ${selectedThreadType === 'whitworth' 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
            `}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800">Whitworth (BSW)</h4>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              {getThreadTypeDescription('whitworth')}
            </p>
            <div className="text-xs text-gray-500">
              Ejemplos: 1/4"-20, 3/8"-16, 1/2"-13
            </div>
          </button>
        </div>
      </div>
      
      {/* Confirmación de prueba de peines */}
      {selectedThreadType && suggestions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            ✅ Confirme su prueba de peine - {selectedThreadType === 'metric' ? 'Métrico' : 'Whitworth'}:
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {suggestions.map((spec, index) => (
              <div key={index} className={`
                border-2 rounded-lg p-6 transition-all
                ${index === 0 ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}
              `}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {index === 0 && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">★</span>
                      </div>
                    )}
                    <h4 className="font-bold text-gray-800 text-lg">
                      {spec.designation}
                    </h4>
                    {index === 0 && (
                      <span className="ml-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        MÁS PROBABLE
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    Confianza: {Math.round(spec.confidence * 100)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {spec.type === 'metric' && (
                    <>
                      <button
                        onClick={() => handleSuggestionClick(spec, 'coarse')}
                        className={`
                          p-4 border-2 rounded-lg text-left transition-all hover:shadow-md
                          ${pitchInput && parseFloat(pitchInput) === spec.coarsePitch
                            ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-blue-300 bg-white'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-blue-800">🔵 Paso Grueso</span>
                          <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded">
                            COMÚN
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 mb-1">
                          {spec.coarsePitch} mm
                        </div>
                        <div className="text-sm text-gray-600">
                          Peine métrico {spec.coarsePitch}mm
                        </div>
                        {pitchInput && parseFloat(pitchInput) === spec.coarsePitch && (
                          <div className="mt-2 text-sm text-blue-600 font-medium">
                            ✓ ¡Seleccionado!
                          </div>
                        )}
                      </button>
                      
                      {spec.finePitch && (
                        <button
                          onClick={() => handleSuggestionClick(spec, 'fine')}
                          className={`
                            p-4 border-2 rounded-lg text-left transition-all hover:shadow-md
                            ${pitchInput && parseFloat(pitchInput) === spec.finePitch
                              ? 'border-purple-500 bg-purple-100 ring-2 ring-purple-200'
                              : 'border-gray-300 hover:border-purple-300 bg-white'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-purple-800">🟣 Paso Fino</span>
                            <span className="text-sm bg-purple-200 text-purple-800 px-2 py-1 rounded">
                              ESPECIAL
                            </span>
                          </div>
                          <div className="text-2xl font-bold text-gray-800 mb-1">
                            {spec.finePitch} mm
                          </div>
                          <div className="text-sm text-gray-600">
                            Peine métrico {spec.finePitch}mm
                          </div>
                          {pitchInput && parseFloat(pitchInput) === spec.finePitch && (
                            <div className="mt-2 text-sm text-purple-600 font-medium">
                              ✓ ¡Seleccionado!
                            </div>
                          )}
                        </button>
                      )}
                    </>
                  )}
                  
                  {spec.type === 'whitworth' && (
                    <button
                      onClick={() => handleSuggestionClick(spec, 'standard')}
                      className={`
                        p-4 border-2 rounded-lg text-left transition-all hover:shadow-md md:col-span-2
                        ${pitchInput && Math.abs(parseFloat(pitchInput) - spec.pitchMm) < 0.01
                          ? 'border-orange-500 bg-orange-100 ring-2 ring-orange-200'
                          : 'border-gray-300 hover:border-orange-300 bg-white'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-orange-800">🟠 Whitworth Estándar</span>
                        <span className="text-sm bg-orange-200 text-orange-800 px-2 py-1 rounded">
                          TPI
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-800">
                            {spec.threadsPerInch} TPI
                          </div>
                          <div className="text-sm text-gray-600">
                            Peine Whitworth {spec.threadsPerInch}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-700">
                            = {spec.pitchMm.toFixed(3)} mm
                          </div>
                          <div className="text-xs text-gray-500">
                            paso equivalente
                          </div>
                        </div>
                      </div>
                      {pitchInput && Math.abs(parseFloat(pitchInput) - spec.pitchMm) < 0.01 && (
                        <div className="mt-2 text-sm text-orange-600 font-medium">
                          ✓ ¡Seleccionado!
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Input manual del paso */}
      {selectedThreadType && (
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            O ingrese el paso medido:
          </h3>
          
          <div className="max-w-md">
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={pitchInput}
                onChange={handlePitchInputChange}
                placeholder={selectedThreadType === 'metric' ? 'Ej: 1.25' : 'Ej: 1.27'}
                className={`
                  w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500
                  ${validation.isValid ? 'border-gray-300' : 'border-red-500'}
                `}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-gray-500 font-medium">
                  mm
                </span>
              </div>
            </div>
            
            {!validation.isValid && (
              <p className="mt-2 text-sm text-red-600">
                {validation.error}
              </p>
            )}
            
            {validation.isValid && pitchInput && pitchType && (
              <p className="mt-2 text-sm text-green-600">
                ✓ Paso {pitchType} identificado: {formatPitch(parseFloat(pitchInput), selectedThreadType, pitchType)}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Instrucciones de medición */}
      <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg">
        <h4 className="font-bold text-yellow-800 mb-4 text-lg flex items-center">
          � Guía paso a paso para verificar con peines:
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h5 className="font-semibold text-blue-800 flex items-center">
              🔵 Para peines métricos:
            </h5>
            <ol className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
                Tome el peine métrico recomendado arriba
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
                Coloque el peine sobre la rosca del tornillo
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
                Si encaja perfectamente sin holgura, ¡es el correcto!
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">4</span>
                Seleccione la opción correspondiente arriba
              </li>
            </ol>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-semibold text-orange-800 flex items-center">
              🟠 Para peines Whitworth:
            </h5>
            <ol className="text-sm text-orange-700 space-y-2">
              <li className="flex items-start">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
                Use el peine Whitworth con el TPI recomendado
              </li>
              <li className="flex items-start">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
                Coloque sobre la rosca y verifique el ajuste
              </li>
              <li className="flex items-start">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
                Los hilos deben encajar exactamente
              </li>
              <li className="flex items-start">
                <span className="bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">4</span>
                Confirme seleccionando la opción correcta
              </li>
            </ol>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ <strong>Importante:</strong> Si ningún peine encaja perfectamente, pruebe con la segunda opción recomendada 
            o verifique la medición del diámetro.
          </p>
        </div>
      </div>
      
      {/* Resumen de selección actual */}
      {selectedThreadType && pitchInput && pitchType && (
        <div className="mb-8 p-4 bg-green-100 border-2 border-green-400 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-bold text-green-800">Especificación confirmada:</h4>
                <p className="text-green-700">
                  {selectedThreadType === 'metric' ? 'Métrico' : 'Whitworth'} - 
                  Paso: {pitchInput}mm ({pitchType})
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setPitchInput('');
                setPitchType('');
                actions.setThreadPitch({ value: '', type: '', measured: null });
              }}
              className="text-green-600 hover:text-green-800 font-medium text-sm"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <button
          onClick={() => actions.previousStep()}
          className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Anterior
        </button>
        
        <button
          onClick={() => actions.nextStep()}
          disabled={!selectedThreadType || !pitchInput || !validation.isValid}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all
            ${selectedThreadType && pitchInput && validation.isValid
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

export default ThreadSelector;
