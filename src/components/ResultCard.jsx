import React, { useEffect, useState } from 'react';
import { useIdentification } from '../context/useIdentification';
import { identifyByDiameterAndPitch, findAllMatches } from '../utils/tableLookup';
import { formatMm } from '../utils/unitConversion';
import { normalizeBoltLength, validateLength, formatFullSpecification } from '../utils/lengthNormalizer';

const ResultCard = () => {
  const { state, actions } = useIdentification();
  const [identification, setIdentification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    setIsProcessing(true);
    try {
      let result;
      
      // IDENTIFICACIÓN ÓPTIMA: Con diámetro + paso de rosca
      if (state.diameter.measured && state.threadPitch.value) {
        const preferredSystem = state.threadType || 'both';
        const identificationResult = identifyByDiameterAndPitch(
          state.diameter.measured,
          state.threadPitch.value,
          preferredSystem
        );
        
        result = {
          matches: [identificationResult.bestMatch, ...identificationResult.alternatives].filter(Boolean),
          finalMatch: identificationResult.bestMatch,
          confidence: identificationResult.confidence,
          totalCandidates: identificationResult.totalCandidates,
          validMatches: identificationResult.validMatches,
          identificationMethod: 'diameter_and_pitch',
          recommendations: [
            identificationResult.recommendation,
            ...generateRecommendations(identificationResult.bestMatch, identificationResult.alternatives, state)
          ]
        };
      } 
      // IDENTIFICACIÓN BÁSICA: Solo con diámetro
      else if (state.diameter.measured) {
        const matches = findAllMatches(state.diameter.measured, 0.3);
        const filteredMatches = state.threadType 
          ? matches[state.threadType] 
          : matches.all;
        
        filteredMatches.sort((a, b) => b.confidence - a.confidence);
        
        result = {
          matches: filteredMatches,
          finalMatch: filteredMatches[0] || null,
          confidence: filteredMatches[0]?.confidence || 0,
          identificationMethod: 'diameter_only',
          recommendations: generateRecommendations(filteredMatches[0], filteredMatches.slice(1, 4), state)
        };
      }
      // Sin mediciones
      else {
        result = {
          matches: [],
          finalMatch: null,
          confidence: 0,
          identificationMethod: 'none',
          recommendations: [{
            type: 'error',
            message: 'No se proporcionaron mediciones',
            action: 'Medir diámetro con calibre',
            details: 'Necesita al menos el diámetro para identificar el bulón'
          }]
        };
      }
      
      setIdentification(result);
      actions.setFinalMatch(result.finalMatch);
      actions.setPossibleMatches(result.matches);
    } catch (error) {
      console.error('Error en identificación:', error);
      setIdentification({
        matches: [],
        finalMatch: null,
        confidence: 0,
        identificationMethod: 'error',
        recommendations: [{
          type: 'error',
          message: 'Error en el proceso de identificación',
          action: 'Revisar datos ingresados',
          details: error.message
        }]
      });
    } finally {
      setIsProcessing(false);
    }
  }, [state, actions]);

  function generateRecommendations(bestMatch, alternatives, currentState) {
    const recommendations = [];
    
    // Sin coincidencias
    if (!bestMatch) {
      recommendations.push({
        type: 'error',
        message: 'No se encontraron coincidencias en tablas estándar',
        action: 'Verificar mediciones con calibre digital',
        details: 'Puede ser rosca especial o medidas fuera de estándar'
      });
      return recommendations;
    }
    
    // Confianza baja - necesita mejores mediciones
    if (bestMatch.confidence < 0.7) {
      recommendations.push({
        type: 'warning',
        message: 'Confianza baja en identificación',
        action: currentState.threadPitch.value ? 'Revisar ambas mediciones' : 'Medir paso de rosca con peine',
        details: currentState.threadPitch.value 
          ? 'Verificar que el calibre y el peine estén calibrados'
          : 'El paso de rosca es fundamental para identificación precisa'
      });
    }
    
    // Sin paso de rosca - recomendar medición
    if (!currentState.threadPitch.value) {
      recommendations.push({
        type: 'info',
        message: '⚠️ Identificación solo por diámetro - Precisión limitada',
        action: 'Usar peine de roscas para confirmar',
        details: `Hay ${alternatives.length + 1} posibles coincidencias. El paso de rosca es determinante.`
      });
    }
    
    // Múltiples alternativas cercanas
    if (alternatives.length > 2) {
      const systemMix = new Set([bestMatch.type, ...alternatives.map(a => a.type)]).size > 1;
      if (systemMix) {
        recommendations.push({
          type: 'tip',
          message: 'Se encontraron coincidencias en múltiples sistemas',
          action: 'Verificar origen del bulón',
          details: 'Bulones asiáticos suelen ser métricos, europeos/británicos pueden ser Whitworth'
        });
      }
    }
    
    // Desgaste significativo detectado
    if (bestMatch.needsThreadCheck) {
      recommendations.push({
        type: 'info',
        message: 'Diámetro menor al nominal - Posible desgaste',
        action: 'Normal en bulones usados',
        details: `Diferencia: ${bestMatch.diameterDifference?.toFixed(2)}mm. Hasta 0.2mm es aceptable.`
      });
    }
    
    // Rosca fina detectada
    if (bestMatch.pitchValidation?.type === 'fine' || bestMatch.isFine) {
      recommendations.push({
        type: 'success',
        message: '✓ Rosca FINA detectada',
        action: 'Menos común - Verificar disponibilidad',
        details: 'Las roscas finas se usan en aplicaciones de precisión o automotrices'
      });
    }
    
    // Recomendación de longitud y cabeza
    if (currentState.pieceType === 'bolt') {
      if (!currentState.length.value) {
        recommendations.push({
          type: 'tip',
          message: 'Falta especificar longitud y tipo de cabeza',
          action: 'Completar datos para identificación total',
          details: 'Ayuda a encontrar el bulón exacto en inventario'
        });
      }
    }
    
    return recommendations;
  }

  function handleAddToHistory() {
    actions.addToHistory();
  }

  function handleNewIdentification() {
    actions.resetIdentification();
  }

  function formatSpecification(match) {
    if (!match) return 'No identificado';
    
    // Usar la función de formateo completo con normalización de largo
    return formatFullSpecification(match, state.length.measured);
  }
  
  function formatDiameterInfo(match) {
    if (!match) return null;
    
    const parts = [];
    if (match.type === 'metric') {
      parts.push(`⌀ ${match.diameter}mm nominal`);
      if (match.measuredDiameter) {
        parts.push(`(${match.measuredDiameter}mm medido)`);
      }
    } else {
      parts.push(`⌀ ${match.diameterInch}" (${match.diameter}mm)`);
      if (match.measuredDiameter) {
        parts.push(`(${match.measuredDiameter}mm medido)`);
      }
    }
    return parts.join(' ');
  }
  
  function formatThreadInfo(match) {
    if (!match) return null;
    
    if (match.pitchValidation) {
      const validation = match.pitchValidation;
      if (match.type === 'metric') {
        return `Paso: ${validation.pitchValue}mm - ${validation.typeName}`;
      } else {
        return `${validation.threadsPerInch} TPI - ${validation.typeName}`;
      }
    }
    
    // Sin validación de paso
    if (match.type === 'metric') {
      return `Paso estándar: ${match.coarsePitch}mm`;
    } else {
      return `${match.threadsPerInch} TPI estándar`;
    }
  }

  function getConfidenceColor(confidence) {
    if (confidence >= 0.9) return 'from-green-500 to-green-600 text-white';
    if (confidence >= 0.7) return 'from-yellow-500 to-yellow-600 text-white';
    return 'from-red-500 to-red-600 text-white';
  }

  function getConfidenceText(confidence) {
    if (confidence >= 0.95) return 'Excelente';
    if (confidence >= 0.9) return 'Alta';
    if (confidence >= 0.7) return 'Media';
    if (confidence >= 0.5) return 'Baja';
    return 'Muy Baja';
  }

  function getPieceTypeIcon() {
    switch (state.pieceType) {
      case 'bolt': return '🔩';
      case 'nut': return '🔘';
      case 'washer': return '⭕';
      default: return '🔧';
    }
  }

  function getPieceTypeName() {
    switch (state.pieceType) {
      case 'bolt': return 'Tornillo/Bulón';
      case 'nut': return 'Tuerca';
      case 'washer': return 'Arandela';
      default: return 'Elemento de fijación';
    }
  }

  function getSystemIcon(type) {
    return type === 'metric' ? '📏' : '🇬🇧';
  }

  function getSystemName(type) {
    return type === 'metric' ? 'Sistema Métrico (ISO)' : 'Sistema Whitworth (BSW/BSF)';
  }

  if (isProcessing) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Procesando identificación...</h2>
          <p className="text-gray-600">Analizando las medidas y comparando con las tablas estándar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Resultado de Identificación</h2>
        <p className="text-gray-600 text-lg">
          {identification?.finalMatch
            ? '✅ Identificación completada exitosamente'
            : '❌ No se pudo realizar una identificación exacta'}
        </p>
      </div>

      {/* Resultado principal */}
      <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-xl p-8">
        {identification?.finalMatch ? (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="text-6xl">{getPieceTypeIcon()}</div>
              <div className="text-6xl">{getSystemIcon(identification.finalMatch.type)}</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800">{getPieceTypeName()}</h3>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">{formatSpecification(identification.finalMatch)}</div>
              <div className="text-lg text-gray-600 mb-4">{getSystemName(identification.finalMatch.type)}</div>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Nivel de confianza:</span>
                  <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getConfidenceColor(identification.confidence)}`}>
                    <span className="font-bold">{getConfidenceText(identification.confidence)} ({Math.round(identification.confidence * 100)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full bg-gradient-to-r ${getConfidenceColor(identification.confidence)}`} style={{ width: `${identification.confidence * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-2xl text-red-600 font-bold mb-2">No se pudo identificar</p>
            <p className="text-gray-600 text-lg">Las medidas no coinciden con ningún estándar conocido</p>
          </div>
        )}
      </div>

      {/* Especificación completa para búsqueda en inventario */}
      {identification?.finalMatch && state.length.measured && (
        <div className="bg-gradient-to-br from-primary-cyan/10 to-primary-blue/10 border-2 border-primary-cyan rounded-2xl p-8 shadow-2xl">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary-navy mb-4 flex items-center justify-center gap-3">
              <span className="text-3xl">🔍</span>
              Especificación Completa para Búsqueda
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-primary-cyan/30">
              <div className="space-y-4">
                <div className="text-5xl font-bold text-primary-navy">
                  {formatSpecification(identification.finalMatch)}
                </div>
                {(() => {
                  const lengthValidation = validateLength(state.length.measured, identification.finalMatch.diameter);
                  const normalized = normalizeBoltLength(state.length.measured);
                  
                  return (
                    <>
                      {lengthValidation.difference > 1 && (
                        <div className="bg-primary-light/50 rounded-lg p-4 border border-primary-blue/30">
                          <p className="text-primary-navy font-medium text-lg">
                            📏 Largo medido: <span className="font-bold">{normalized.original}mm</span>
                          </p>
                          <p className="text-primary-royal font-semibold text-xl mt-2">
                            ✓ Buscar en inventario: <span className="text-primary-cyan">{normalized.normalized}mm</span>
                          </p>
                          <p className="text-steel-600 text-sm mt-2">
                            (Los largos estándar van de 5 en 5mm o de 10 en 10mm)
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-gradient-primary text-white rounded-lg p-4">
                          <p className="text-sm opacity-90">Diámetro</p>
                          <p className="text-2xl font-bold">{identification.finalMatch.designation}</p>
                        </div>
                        <div className="bg-gradient-primary text-white rounded-lg p-4">
                          <p className="text-sm opacity-90">Paso</p>
                          <p className="text-2xl font-bold">
                            {identification.finalMatch.pitchValidation?.pitchValue || identification.finalMatch.coarsePitch}mm
                          </p>
                        </div>
                        <div className="bg-gradient-primary text-white rounded-lg p-4">
                          <p className="text-sm opacity-90">Largo</p>
                          <p className="text-2xl font-bold">{normalized.normalized}mm</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            <p className="text-steel-600 text-sm mt-4 italic">
              💡 Use esta especificación exacta para buscar el bulón en su inventario o catálogo
            </p>
          </div>
        </div>
      )}

      {/* Panel de detalles técnicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Medidas Ingresadas */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📐</span> Medidas Ingresadas
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Diámetro:</span>
              <span className="font-bold text-lg">
                {state.diameter.value} {state.diameter.unit}
                {state.diameter.unit === 'inch' && (
                  <span className="text-gray-500 ml-2 font-normal text-sm">({formatMm(state.diameter.measured)})</span>
                )}
              </span>
            </div>
            {state.threadType && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Sistema:</span>
                <span className="font-bold text-lg capitalize">{state.threadType === 'metric' ? 'Métrico' : 'Whitworth'}</span>
              </div>
            )}
            {state.threadPitch.value ? (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Paso de rosca:</span>
                <span className="font-bold text-lg">
                  {state.threadPitch.value} mm 
                  {state.threadPitch.type && (
                    <span className="text-green-600 ml-2 font-normal text-sm">✓ Verificado</span>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-yellow-50 px-2 rounded">
                <span className="text-amber-600 font-medium">⚠️ Paso de rosca:</span>
                <span className="text-amber-600 text-sm">No medido</span>
              </div>
            )}
            {state.pieceType === 'bolt' && state.length.measured && (
              <div className="py-2 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Longitud medida:</span>
                  <span className="font-bold text-lg">{state.length.measured} mm</span>
                </div>
                {(() => {
                  const normalized = normalizeBoltLength(state.length.measured);
                  if (normalized.difference > 1) {
                    return (
                      <div className="mt-2 flex justify-between items-center bg-primary-cyan/10 px-3 py-2 rounded-lg">
                        <span className="text-primary-navy font-medium text-sm">→ Largo estándar:</span>
                        <span className="font-bold text-lg text-primary-cyan">{normalized.normalized} mm</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
            {state.headType && (
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Tipo de cabeza:</span>
                <span className="font-bold text-lg capitalize">{state.headType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Información de la Identificación */}
        {identification?.finalMatch && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🔍</span> Detalles de Identificación
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Designación:</span>
                <span className="font-bold text-lg text-blue-600">{identification.finalMatch.designation}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">{formatDiameterInfo(identification.finalMatch)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">{formatThreadInfo(identification.finalMatch)}</span>
              </div>
              {identification.finalMatch.diameterDifference && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Diferencia diámetro:</span>
                  <span className={`font-bold ${identification.finalMatch.diameterDifference > 0.15 ? 'text-amber-600' : 'text-green-600'}`}>
                    {identification.finalMatch.diameterDifference.toFixed(2)}mm
                  </span>
                </div>
              )}
              {identification.identificationMethod && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800">
                    <strong>Método:</strong> {identification.identificationMethod === 'diameter_and_pitch' 
                      ? '✓ Diámetro + Paso (Óptimo)' 
                      : '⚠️ Solo diámetro (Limitado)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Coincidencias Alternativas */}
      {identification?.matches && identification.matches.length > 1 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📋</span> Otras Coincidencias Posibles
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Designación</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sistema</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Diámetro</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Paso/TPI</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Confianza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {identification.matches.slice(1, 5).map((match, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{match.designation}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {match.type === 'metric' ? 'Métrico' : 'Whitworth'}
                      {match.subtype && ` (${match.subtype})`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {match.diameter}mm
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {match.type === 'metric' 
                        ? `${match.coarsePitch}mm` 
                        : `${match.threadsPerInch} TPI`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        match.confidence > 0.85 ? 'bg-green-100 text-green-800' :
                        match.confidence > 0.70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(match.confidence * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500 italic">
            💡 Use el peine de roscas para diferenciar entre opciones similares
          </p>
        </div>
      )}

      {/* Recomendaciones */}
      {identification?.recommendations && identification.recommendations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-lg">
          <h4 className="text-xl font-bold text-amber-800 mb-4 flex items-center">💡 Recomendaciones</h4>
          <div className="space-y-3">
            {identification.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                <div>
                  <span className="text-amber-800 font-medium">{rec.message}</span>
                  {rec.action && (
                    <span className="text-amber-600 text-sm ml-2">- {rec.action}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coincidencias alternativas */}
      {identification?.matches && identification.matches.length > 1 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">🎯 Otras Coincidencias Posibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {identification.matches.slice(1, 7).map((match, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800 text-lg">{match.designation}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getConfidenceColor(match.confidence)}`}>{Math.round(match.confidence * 100)}%</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Sistema:</span> {match.type === 'metric' ? 'Métrico' : 'Whitworth'}</p>
                  <p><span className="font-medium">Paso:</span> {match.type === 'metric' ? `${match.coarsePitch} mm` : `${match.threadsPerInch} TPI`}</p>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(match.confidence)}`} style={{ width: `${match.confidence * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 lg:space-x-6 bg-gray-50 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleAddToHistory}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-200 transition-all transform hover:scale-105 shadow-lg"
          >
            📋 Guardar en Historial
          </button>
          <button
            onClick={actions.toggleHistory}
            className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-bold hover:from-gray-600 hover:to-gray-700 focus:ring-4 focus:ring-gray-200 transition-all transform hover:scale-105 shadow-lg"
          >
            📚 Ver Historial
          </button>
        </div>
        <button
          onClick={handleNewIdentification}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all transform hover:scale-105 shadow-lg"
        >
          🔄 Nueva Identificación
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
