import React, { useEffect, useState } from 'react';
import { useIdentification } from '../context/useIdentification';
import { findAllMatches, validateThreadPitch, findWashers } from '../utils/tableLookup';
import { formatMm, mmToInch } from '../utils/unitConversion';

const ResultCard = () => {
  const { state, actions } = useIdentification();
  const [identification, setIdentification] = useState(null);
  const [washers, setWashers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    setIsProcessing(true);
    try {
      const matches = findAllMatches(state.diameter.measured, 0.3);
      let filteredMatches = matches.all;
      if (state.threadPitch.value && state.threadType) {
        filteredMatches = matches.all.filter(match => {
          if (match.type !== state.threadType) return false;
          const pitchValidation = validateThreadPitch(state.threadPitch.value, match, 0.05);
          return pitchValidation.matches;
        });
      }
      filteredMatches.sort((a, b) => b.confidence - a.confidence);
      const compatibleWashers = findWashers(state.diameter.measured, state.threadType || 'metric');
      setWashers(compatibleWashers);
      const result = {
        matches: filteredMatches,
        finalMatch: filteredMatches[0] || null,
        confidence: filteredMatches[0]?.confidence || 0,
        washers: compatibleWashers,
        recommendations: generateRecommendations(filteredMatches, state)
      };
      setIdentification(result);
      actions.setFinalMatch(result.finalMatch);
      actions.setPossibleMatches(result.matches);
    } catch (error) {
      console.error('Error en identificación:', error);
      setIdentification({
        matches: [],
        finalMatch: null,
        confidence: 0,
        washers: [],
        recommendations: [{
          type: 'error',
          message: 'Error en el proceso de identificación',
          action: 'Revisar datos ingresados'
        }]
      });
    } finally {
      setIsProcessing(false);
    }
  }, [state]);

  function generateRecommendations(matches, currentState) {
    const recommendations = [];
    if (matches.length === 0) {
      recommendations.push({
        type: 'warning',
        message: 'No se encontraron coincidencias exactas',
        action: 'Verificar mediciones'
      });
    } else if (matches[0].confidence < 0.7) {
      recommendations.push({
        type: 'warning',
        message: 'Coincidencia con baja confianza',
        action: 'Revisar diámetro y paso de rosca'
      });
    }
    if (!currentState.threadPitch.value) {
      recommendations.push({
        type: 'info',
        message: 'Para mayor precisión, mida el paso de rosca',
        action: 'Usar peine de roscas'
      });
    }
    if (matches.length > 3) {
      recommendations.push({
        type: 'info',
        message: 'Múltiples coincidencias encontradas',
        action: 'Verificar paso de rosca para confirmar'
      });
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
    const parts = [match.designation];
    if (match.type === 'metric') {
      if (state.threadPitch.value && state.threadPitch.type) {
        parts.push(`×${state.threadPitch.value}`);
      } else {
        parts.push(`×${match.coarsePitch}`);
      }
      if (state.pieceType === 'bolt' && state.length.value) {
        parts.push(`×${state.length.value}mm`);
      }
    } else if (match.type === 'whitworth') {
      const threadInfo = match.subtype || 'BSW';
      parts.push(`-${match.threadsPerInch} TPI`);
      if (match.subtype) {
        parts.push(`(${threadInfo})`);
      }
      if (state.pieceType === 'bolt' && state.length.value) {
        const lengthInInch = state.diameter.unit === 'inch'
          ? state.length.value
          : mmToInch(state.length.value);
        parts.push(`×${lengthInInch.toFixed(2)}"`);
      }
    }
    return parts.join(' ');
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

      {/* Panel de detalles técnicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">📐 Medidas Ingresadas</h4>
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
                <span className="font-bold text-lg capitalize">{state.threadType}</span>
              </div>
            )}
            {state.threadPitch.value && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Paso de rosca:</span>
                <span className="font-bold text-lg">{state.threadPitch.value} mm <span className="text-gray-500 ml-2 font-normal text-sm">({state.threadPitch.type})</span></span>
              </div>
            )}
            {state.pieceType === 'bolt' && state.length.value && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Longitud:</span>
                <span className="font-bold text-lg">{state.length.value} {state.diameter.unit}</span>
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
        {washers && washers.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">⭕ Arandelas Compatibles</h4>
            <div className="space-y-3">
              {washers.slice(0, 3).map((washer, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">{washer.designation}</span>
                  <span className="text-sm text-gray-600">⌀{washer.innerDiameter}→{washer.outerDiameter}mm, e={washer.thickness}mm</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
