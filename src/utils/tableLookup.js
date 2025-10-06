/**
 * Tabla de búsqueda para identificación de bulones - Optimizado para uso con calibre y peine de roscas
 * 
 * FLUJO DE IDENTIFICACIÓN:
 * 1. Medir diámetro exterior con CALIBRE (precisión ±0.1mm)
 * 2. Medir paso de rosca con PEINE DE ROSCAS (precisión ±0.05mm o ±1 TPI)
 * 3. Combinar ambas mediciones para identificación precisa
 * 
 * TOLERANCIAS REALES:
 * - Diámetro: ±0.2mm (desgaste de rosca común)
 * - Paso métrico: ±0.05mm
 * - TPI Whitworth: ±0.5 hilos
 */

import metricData from '../assets/tables/metric.json';
import whitworthData from '../assets/tables/whitworth.json';

/**
 * Verifica si un valor está dentro de un rango con tolerancia
 * @param {number} value - Valor a verificar
 * @param {number} target - Valor objetivo
 * @param {number} tolerance - Tolerancia permitida
 * @returns {boolean} True si está dentro del rango
 */
const isWithinTolerance = (value, target, tolerance = 0.1) => {
  return Math.abs(value - target) <= tolerance;
};

/**
 * Busca coincidencias métricas basadas en diámetro
 * OPTIMIZADO para calibre digital/analógico con tolerancia realista
 * @param {number} diameter - Diámetro medido con calibre en mm
 * @param {number} tolerance - Tolerancia de búsqueda (default: 0.3mm para desgaste)
 * @returns {array} Array de coincidencias métricas ordenadas por confianza
 */
export const findMetricMatches = (diameter, tolerance = 0.3) => {
  const matches = [];
  
  Object.entries(metricData.metric_threads).forEach(([key, data]) => {
    // TOLERANCIA REALISTA:
    // - Diámetro puede ser 0.2mm menor (desgaste normal de rosca)
    // - Diámetro puede ser 0.1mm mayor (variación de fabricación)
    // - Calibre tiene ±0.02mm de precisión típica
    const minExpected = data.diameter - 0.25; // Desgaste + error de medición
    const maxExpected = data.diameter + tolerance;
    
    if (diameter >= minExpected && diameter <= maxExpected) {
      const diameterDiff = Math.abs(diameter - data.diameter);
      const confidence = calculateDiameterConfidence(diameter, data.diameter);
      
      matches.push({
        designation: key,
        diameter: data.diameter,
        measuredDiameter: diameter,
        diameterDifference: diameterDiff,
        coarsePitch: data.coarse_pitch,
        finePitch: Array.isArray(data.fine_pitch) ? data.fine_pitch : [],
        standardLengths: data.standard_lengths,
        headTypes: data.head_types,
        type: 'metric',
        confidence: confidence,
        hasFinePitch: Array.isArray(data.fine_pitch) && data.fine_pitch.length > 0,
        // Info adicional para empleados de ferretería
        isLikelyMatch: confidence > 0.85,
        needsThreadCheck: diameterDiff > 0.15 // Recomendar usar peine si diff > 0.15mm
      });
    }
  });
  
  return matches.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Busca coincidencias Whitworth basadas en diámetro
 * OPTIMIZADO para rosca Whitworth (BSW y BSF)
 * @param {number} diameter - Diámetro medido con calibre en mm
 * @param {number} tolerance - Tolerancia de búsqueda (default: 0.3mm)
 * @returns {array} Array de coincidencias Whitworth ordenadas por confianza
 */
export const findWhitworthMatches = (diameter, tolerance = 0.3) => {
  const matches = [];
  
  Object.entries(whitworthData.whitworth_threads).forEach(([key, data]) => {
    // TOLERANCIA REALISTA para sistema imperial
    const minExpected = data.diameter_mm - 0.25;
    const maxExpected = data.diameter_mm + tolerance;
    
    if (diameter >= minExpected && diameter <= maxExpected) {
      const isBSF = key.includes('BSF');
      const diameterDiff = Math.abs(diameter - data.diameter_mm);
      const confidence = calculateDiameterConfidence(diameter, data.diameter_mm);
      
      matches.push({
        designation: key,
        diameter: data.diameter_mm,
        measuredDiameter: diameter,
        diameterDifference: diameterDiff,
        diameterInch: data.diameter_inch,
        threadsPerInch: data.threads_per_inch,
        pitchMm: data.pitch_mm,
        standardLengths: data.standard_lengths,
        headTypes: data.head_types,
        type: 'whitworth',
        subtype: isBSF ? 'BSF' : 'BSW',
        confidence: confidence,
        isFine: isBSF,
        // Info útil para ferretería
        isLikelyMatch: confidence > 0.85,
        needsThreadCheck: diameterDiff > 0.15,
        displayName: `${key} (${data.threads_per_inch} TPI)`
      });
    }
  });
  
  return matches.sort((a, b) => {
    // Priorizar BSW (grueso) sobre BSF (fino) cuando confianza es similar
    if (Math.abs(a.confidence - b.confidence) < 0.01) {
      return a.isFine ? 1 : -1;
    }
    return b.confidence - a.confidence;
  });
};

/**
 * Busca coincidencias en ambas tablas (métrica y Whitworth)
 * @param {number} diameter - Diámetro medido con calibre en mm
 * @param {number} tolerance - Tolerancia de búsqueda
 * @returns {object} { metric: array, whitworth: array, all: array }
 */
export const findAllMatches = (diameter, tolerance = 0.3) => {
  const metricMatches = findMetricMatches(diameter, tolerance);
  const whitworthMatches = findWhitworthMatches(diameter, tolerance);
  
  return {
    metric: metricMatches,
    whitworth: whitworthMatches,
    all: [...metricMatches, ...whitworthMatches].sort((a, b) => b.confidence - a.confidence)
  };
};

/**
 * Busca una coincidencia específica por designación
 * @param {string} designation - Designación (ej: 'M8', '1/4', '1/4-BSF')
 * @param {string} type - Tipo ('metric' o 'whitworth')
 * @returns {object|null} Datos de la coincidencia o null
 */
export const findByDesignation = (designation, type) => {
  if (type === 'metric') {
    const data = metricData.metric_threads[designation];
    if (data) {
      return {
        designation,
        diameter: data.diameter,
        coarsePitch: data.coarse_pitch,
        finePitch: Array.isArray(data.fine_pitch) ? data.fine_pitch : [],
        standardLengths: data.standard_lengths,
        headTypes: data.head_types,
        type: 'metric',
        hasFinePitch: Array.isArray(data.fine_pitch) && data.fine_pitch.length > 0
      };
    }
  } else if (type === 'whitworth') {
    const data = whitworthData.whitworth_threads[designation];
    if (data) {
      const isBSF = designation.includes('BSF');
      return {
        designation,
        diameter: data.diameter_mm,
        diameterInch: data.diameter_inch,
        threadsPerInch: data.threads_per_inch,
        pitchMm: data.pitch_mm,
        standardLengths: data.standard_lengths,
        headTypes: data.head_types,
        type: 'whitworth',
        subtype: isBSF ? 'BSF' : 'BSW',
        isFine: isBSF
      };
    }
  }
  
  return null;
};

/**
 * Valida si un paso de rosca coincide con una especificación
 * OPTIMIZADO para uso con PEINE DE ROSCAS (thread gauge)
 * 
 * PRECISIONES REALES:
 * - Peine métrico: ±0.05mm de precisión
 * - Peine imperial: ±0.5 TPI de precisión
 * 
 * @param {number} pitch - Paso medido con peine (mm para métrico, mm calculado para Whitworth)
 * @param {object} spec - Especificación de rosca
 * @param {number} tolerance - Tolerancia (default: 0.08mm para margen de error)
 * @returns {object} { matches: boolean, type: string, confidence: number, pitchValue: number, recommendation: string }
 */
export const validateThreadPitch = (pitch, spec, tolerance = 0.08) => {
  if (spec.type === 'metric') {
    // Verificar paso GRUESO (más común)
    if (isWithinTolerance(pitch, spec.coarsePitch, tolerance)) {
      const confidence = calculateConfidence(pitch, spec.coarsePitch, tolerance);
      return {
        matches: true,
        type: 'coarse',
        typeName: 'Paso Grueso',
        confidence: confidence,
        pitchValue: spec.coarsePitch,
        designation: `${spec.designation} x ${spec.coarsePitch}`,
        isExactMatch: Math.abs(pitch - spec.coarsePitch) < 0.02,
        recommendation: confidence > 0.9 ? 'Coincidencia exacta' : 'Verificar con peine nuevamente'
      };
    }
    
    // Verificar pasos FINOS (menos comunes, mayor precisión requerida)
    if (spec.finePitch && Array.isArray(spec.finePitch)) {
      for (const finePitch of spec.finePitch) {
        if (isWithinTolerance(pitch, finePitch, tolerance)) {
          const confidence = calculateConfidence(pitch, finePitch, tolerance);
          return {
            matches: true,
            type: 'fine',
            typeName: 'Paso Fino',
            confidence: confidence,
            pitchValue: finePitch,
            designation: `${spec.designation} x ${finePitch}`,
            isExactMatch: Math.abs(pitch - finePitch) < 0.02,
            recommendation: confidence > 0.9 ? 'Coincidencia exacta - Rosca fina' : 'Verificar con peine de precisión'
          };
        }
      }
    }
  } else if (spec.type === 'whitworth') {
    // Para Whitworth: convertir TPI a paso en mm
    // Fórmula: Paso(mm) = 25.4 / TPI
    const pitchFromTpi = 25.4 / spec.threadsPerInch;
    
    if (isWithinTolerance(pitch, pitchFromTpi, tolerance)) {
      const confidence = calculateConfidence(pitch, pitchFromTpi, tolerance);
      return {
        matches: true,
        type: spec.subtype || 'BSW',
        typeName: spec.isFine ? 'BSF (Fino)' : 'BSW (Estándar)',
        confidence: confidence,
        pitchValue: pitchFromTpi,
        threadsPerInch: spec.threadsPerInch,
        designation: `${spec.designation} (${spec.threadsPerInch} TPI)`,
        isExactMatch: Math.abs(pitch - pitchFromTpi) < 0.02,
        recommendation: confidence > 0.9 ? `Coincidencia ${spec.threadsPerInch} TPI` : 'Verificar TPI con peine imperial'
      };
    }
  }
  
  return {
    matches: false,
    type: null,
    typeName: null,
    confidence: 0,
    pitchValue: null,
    recommendation: 'No coincide - Verificar medición o sistema de rosca'
  };
};

/**
 * FUNCIÓN PRINCIPAL - Identifica bulón combinando diámetro + paso de rosca
 * Esta es la función más precisa cuando tienes ambas mediciones
 * 
 * @param {number} diameter - Diámetro medido con calibre (mm)
 * @param {number} threadPitch - Paso de rosca medido con peine (mm)
 * @param {string} preferredSystem - Sistema preferido ('metric', 'whitworth', o 'both')
 * @returns {object} Resultado con mejor coincidencia y alternativas
 */
export const identifyByDiameterAndPitch = (diameter, threadPitch, preferredSystem = 'both') => {
  let candidateMatches = [];
  
  // Buscar candidatos por diámetro
  if (preferredSystem === 'metric' || preferredSystem === 'both') {
    candidateMatches = [...candidateMatches, ...findMetricMatches(diameter, 0.3)];
  }
  if (preferredSystem === 'whitworth' || preferredSystem === 'both') {
    candidateMatches = [...candidateMatches, ...findWhitworthMatches(diameter, 0.3)];
  }
  
  // Filtrar y rankear por paso de rosca
  const validatedMatches = candidateMatches
    .map(match => {
      const pitchValidation = validateThreadPitch(threadPitch, match, 0.08);
      return {
        ...match,
        pitchValidation,
        // Confianza combinada: 60% diámetro + 40% paso
        combinedConfidence: (match.confidence * 0.6) + (pitchValidation.confidence * 0.4),
        isValidPitch: pitchValidation.matches
      };
    })
    .filter(match => match.isValidPitch) // Solo mantener los que coinciden en paso
    .sort((a, b) => b.combinedConfidence - a.combinedConfidence);
  
  const bestMatch = validatedMatches[0] || null;
  const alternatives = validatedMatches.slice(1, 4); // Top 3 alternativas
  
  return {
    identified: bestMatch !== null,
    bestMatch,
    alternatives,
    confidence: bestMatch ? bestMatch.combinedConfidence : 0,
    totalCandidates: candidateMatches.length,
    validMatches: validatedMatches.length,
    recommendation: generateIdentificationRecommendation(bestMatch, validatedMatches)
  };
};

/**
 * Genera recomendación basada en resultado de identificación
 */
const generateIdentificationRecommendation = (bestMatch, allMatches) => {
  if (!bestMatch) {
    return {
      type: 'error',
      message: 'No se encontró coincidencia',
      action: 'Verificar mediciones con calibre y peine',
      details: 'Las medidas no coinciden con estándares métricos ni Whitworth'
    };
  }
  
  if (bestMatch.combinedConfidence > 0.95) {
    return {
      type: 'success',
      message: `Identificación precisa: ${bestMatch.designation}`,
      action: 'Bulón identificado correctamente',
      details: `Sistema ${bestMatch.type === 'metric' ? 'Métrico ISO' : 'Whitworth'}, ${bestMatch.pitchValidation.typeName}`
    };
  }
  
  if (bestMatch.combinedConfidence > 0.80) {
    return {
      type: 'warning',
      message: `Probable: ${bestMatch.designation}`,
      action: 'Verificar mediciones',
      details: allMatches.length > 1 ? 'Hay alternativas similares, confirmar con cliente' : 'Confianza aceptable'
    };
  }
  
  return {
    type: 'warning',
    message: 'Confianza baja en identificación',
    action: 'Repetir mediciones con precisión',
    details: 'Usar calibre digital y peine de roscas de calidad'
  };
};

/**
 * Busca arandelas compatibles con un diámetro
 * @param {number} diameter - Diámetro del tornillo en mm
 * @param {string} type - Tipo ('metric' o 'whitworth')
 * @returns {array} Array de arandelas compatibles
 */
export const findWashers = (diameter, type = 'metric') => {
  const washers = [];
  
  if (type === 'metric') {
    Object.entries(metricData.washers).forEach(([key, data]) => {
      // La arandela debe tener un diámetro interno ligeramente mayor al tornillo
      if (data.inner_diameter >= diameter && data.inner_diameter <= diameter + 1) {
        washers.push({
          designation: key,
          innerDiameter: data.inner_diameter,
          outerDiameter: data.outer_diameter,
          thickness: data.thickness,
          type: 'metric'
        });
      }
    });
  } else if (type === 'whitworth') {
    Object.entries(whitworthData.washers).forEach(([key, data]) => {
      if (data.inner_diameter_mm >= diameter && data.inner_diameter_mm <= diameter + 1) {
        washers.push({
          designation: key,
          innerDiameter: data.inner_diameter_mm,
          innerDiameterInch: data.inner_diameter_inch,
          outerDiameter: data.outer_diameter_mm,
          outerDiameterInch: data.outer_diameter_inch,
          thickness: data.thickness_mm,
          thicknessInch: data.thickness_inch,
          type: 'whitworth'
        });
      }
    });
  }
  
  return washers;
};

/**
 * Verifica si una longitud es estándar para una especificación
 * @param {number} length - Longitud en mm
 * @param {object} spec - Especificación de tornillo
 * @returns {object} { isStandard: boolean, closestStandard: number, confidence: number }
 */
export const validateLength = (length, spec) => {
  const standardLengths = spec.standardLengths || [];
  
  // Buscar longitud exacta
  if (standardLengths.includes(length)) {
    return {
      isStandard: true,
      closestStandard: length,
      confidence: 1.0
    };
  }
  
  // Buscar la longitud estándar más cercana
  if (standardLengths.length > 0) {
    const closest = standardLengths.reduce((prev, curr) => {
      return Math.abs(curr - length) < Math.abs(prev - length) ? curr : prev;
    });
    
    const difference = Math.abs(closest - length);
    const confidence = Math.max(0, 1 - (difference / 10)); // Reducir confianza según diferencia
    
    return {
      isStandard: difference <= 2, // Considerar estándar si está dentro de 2mm
      closestStandard: closest,
      confidence
    };
  }
  
  return {
    isStandard: false,
    closestStandard: null,
    confidence: 0
  };
};

/**
 * Genera una identificación completa basada en todos los parámetros
 * @param {object} params - Parámetros de identificación
 * @returns {object} Resultado de identificación completa
 */
export const identifyFastener = (params) => {
  const { diameter, threadType, threadPitch, length, headType, pieceType } = params;
  
  let matches = [];
  
  if (threadType === 'metric') {
    matches = findMetricMatches(diameter);
  } else if (threadType === 'whitworth') {
    matches = findWhitworthMatches(diameter);
  } else {
    // Si no se especifica el tipo, buscar en ambas
    const allMatches = findAllMatches(diameter);
    matches = allMatches.all;
  }
  
  // Filtrar por paso de rosca si se proporciona
  if (threadPitch) {
    matches = matches.filter(match => {
      const pitchValidation = validateThreadPitch(threadPitch, match);
      return pitchValidation.matches;
    }).map(match => {
      const pitchValidation = validateThreadPitch(threadPitch, match);
      return {
        ...match,
        threadType: pitchValidation.type,
        pitchConfidence: pitchValidation.confidence
      };
    });
  }
  
  // Validar longitud para tornillos/bulones
  if (pieceType === 'bolt' && length) {
    matches = matches.map(match => {
      const lengthValidation = validateLength(length, match);
      return {
        ...match,
        lengthValidation,
        confidence: match.confidence * 0.7 + lengthValidation.confidence * 0.3
      };
    });
  }
  
  // Filtrar por tipo de cabeza si se proporciona
  if (headType) {
    matches = matches.filter(match => {
      return match.headTypes && match.headTypes.includes(headType);
    });
  }
  
  // Ordenar por confianza
  matches.sort((a, b) => b.confidence - a.confidence);
  
  const finalMatch = matches.length > 0 ? matches[0] : null;
  
  return {
    matches,
    finalMatch,
    confidence: finalMatch ? finalMatch.confidence : 0,
    recommendations: generateRecommendations(matches)
  };
};

/**
 * Calcula un nivel de confianza para diámetros considerando desgaste de rosca
 * @param {number} measured - Diámetro medido con calibre
 * @param {number} nominal - Diámetro nominal de la tabla
 * @returns {number} Confianza entre 0 y 1
 */
const calculateDiameterConfidence = (measured, nominal) => {
  const difference = nominal - measured; // Diferencia (positiva si medido es menor)
  
  // Confianza máxima si coincide exactamente
  if (Math.abs(difference) < 0.05) return 1.0;
  
  // Si el medido es menor que el nominal (caso normal por desgaste)
  if (difference >= 0 && difference <= 0.2) {
    // Confianza alta: 0.9 - 0.7 dependiendo del desgaste
    return 0.9 - (difference / 0.2) * 0.2;
  }
  
  // Si el medido es mayor que el nominal (menos común)
  if (difference < 0 && difference >= -0.1) {
    // Confianza media: puede ser error de medición o tolerancia
    return 0.6 - (Math.abs(difference) / 0.1) * 0.1;
  }
  
  // Si la diferencia es muy grande, confianza baja
  const totalDifference = Math.abs(difference);
  if (totalDifference <= 0.5) {
    return Math.max(0.2, 0.5 - (totalDifference / 0.5) * 0.3);
  }
  
  return 0.1; // Confianza mínima para diferencias muy grandes
};

/**
 * Calcula un nivel de confianza basado en la cercanía de valores
 * @param {number} measured - Valor medido
 * @param {number} standard - Valor estándar
 * @param {number} tolerance - Tolerancia máxima
 * @returns {number} Confianza entre 0 y 1
 */
const calculateConfidence = (measured, standard, tolerance) => {
  const difference = Math.abs(measured - standard);
  if (difference > tolerance) return 0;
  return Math.max(0, 1 - (difference / tolerance));
};

/**
 * Genera recomendaciones basadas en los resultados
 * @param {array} matches - Coincidencias encontradas
 * @param {object} params - Parámetros originales
 * @returns {array} Array de recomendaciones
 */
const generateRecommendations = (matches) => {
  const recommendations = [];
  
  if (matches.length === 0) {
    recommendations.push({
      type: 'warning',
      message: 'No se encontraron coincidencias exactas. Verifique las mediciones.',
      action: 'Revisar medidas',
      details: 'Recuerde que el diámetro medido con calibre puede ser hasta 0.2mm menor que el nominal debido al desgaste de la rosca.'
    });
  } else if (matches.length > 3) {
    recommendations.push({
      type: 'info',
      message: 'Múltiples coincidencias encontradas. Considere medidas adicionales.',
      action: 'Agregar más detalles',
      details: 'Use el peine de roscas para determinar el paso exacto y diferenciar entre opciones.'
    });
  }
  
  // Verificar si hay diferencias significativas en diámetro
  const hasLowConfidenceDiameter = matches.some(m => {
    if (m.measuredDiameter && m.diameter) {
      const diameterDiff = m.diameter - m.measuredDiameter;
      return diameterDiff > 0.15; // Más de 0.15mm de diferencia
    }
    return false;
  });
  
  if (hasLowConfidenceDiameter) {
    recommendations.push({
      type: 'info',
      message: 'El diámetro medido es notablemente menor que el nominal.',
      action: 'Normal por desgaste',
      details: 'Es normal que el diámetro exterior sea hasta 0.2mm menor debido al desgaste de la rosca durante el uso.'
    });
  }
  
  if (matches.some(m => m.confidence < 0.7)) {
    recommendations.push({
      type: 'warning',
      message: 'Algunas coincidencias tienen baja confianza. Verifique con herramientas de precisión.',
      action: 'Verificar medidas',
      details: 'Use calibre digital y peine de roscas para mediciones más precisas.'
    });
  }
  
  // Recomendación específica para diámetros muy cercanos
  if (matches.length >= 2) {
    const topTwo = matches.slice(0, 2);
    const diameterDiff = Math.abs(topTwo[0].diameter - topTwo[1].diameter);
    
    if (diameterDiff <= 1) {
      recommendations.push({
        type: 'tip',
        message: 'Diámetros muy similares detectados.',
        action: 'Usar paso de rosca',
        details: 'Use el peine de roscas para diferenciar entre las opciones. El paso de rosca es determinante.'
      });
    }
  }
  
  return recommendations;
};

/**
 * Obtiene información detallada de tipos de cabeza
 * @param {string} headType - Tipo de cabeza
 * @param {string} standard - Estándar ('metric' o 'whitworth')
 * @returns {object} Información del tipo de cabeza
 */
export const getHeadTypeInfo = (headType, standard = 'metric') => {
  const data = standard === 'metric' ? metricData : whitworthData;
  return data.head_types[headType] || null;
};

/**
 * Obtiene todas las designaciones disponibles por tipo
 * @param {string} type - Tipo ('metric' o 'whitworth')
 * @returns {array} Array de designaciones
 */
export const getAvailableDesignations = (type) => {
  if (type === 'metric') {
    return Object.keys(metricData.metric_threads);
  } else if (type === 'whitworth') {
    return Object.keys(whitworthData.whitworth_threads);
  }
  return [];
};