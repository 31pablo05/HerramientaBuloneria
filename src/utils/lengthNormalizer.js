/**
 * Normaliza la longitud medida al valor estándar más cercano
 * Los largos estándar van de 5 en 5 o de 10 en 10
 * 
 * @param {number} measuredLength - Longitud medida en mm
 * @returns {object} - { normalized: número normalizado, original: número original, difference: diferencia }
 */
export function normalizeBoltLength(measuredLength) {
  if (!measuredLength || isNaN(measuredLength)) {
    return {
      normalized: null,
      original: measuredLength,
      difference: 0
    };
  }

  const length = parseFloat(measuredLength);
  
  // Para longitudes menores a 20mm, redondear a múltiplos de 5
  if (length < 20) {
    const normalized = Math.round(length / 5) * 5;
    return {
      normalized: normalized === 0 ? 5 : normalized, // Mínimo 5mm
      original: length,
      difference: Math.abs(normalized - length)
    };
  }
  
  // Para longitudes entre 20mm y 50mm, redondear a múltiplos de 5
  if (length <= 50) {
    const normalized = Math.round(length / 5) * 5;
    return {
      normalized,
      original: length,
      difference: Math.abs(normalized - length)
    };
  }
  
  // Para longitudes mayores a 50mm, redondear a múltiplos de 10
  const normalized = Math.round(length / 10) * 10;
  return {
    normalized,
    original: length,
    difference: Math.abs(normalized - length)
  };
}

/**
 * Obtiene los largos estándar disponibles según el diámetro
 * A mayor diámetro, más opciones de largos disponibles
 * 
 * @param {number} diameter - Diámetro nominal en mm
 * @returns {array} - Array de largos estándar disponibles
 */
export function getStandardLengths(diameter) {
  if (!diameter) return [];
  
  const dia = parseFloat(diameter);
  
  // Largos muy pequeños (M2-M4)
  if (dia <= 4) {
    return [5, 6, 8, 10, 12, 16, 20, 25, 30];
  }
  
  // Largos pequeños (M5-M6)
  if (dia <= 6) {
    return [6, 8, 10, 12, 16, 20, 25, 30, 35, 40, 45, 50];
  }
  
  // Largos medianos (M8-M12)
  if (dia <= 12) {
    return [10, 12, 16, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120];
  }
  
  // Largos grandes (M14-M20)
  if (dia <= 20) {
    return [16, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200];
  }
  
  // Largos muy grandes (M22+)
  return [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300];
}

/**
 * Valida si un largo es estándar para un diámetro dado
 * 
 * @param {number} length - Longitud a validar
 * @param {number} diameter - Diámetro del bulón
 * @returns {object} - { isValid: boolean, suggestion: número sugerido, message: string }
 */
export function validateLength(length, diameter) {
  if (!length || !diameter) {
    return {
      isValid: false,
      suggestion: null,
      message: 'Falta información para validar'
    };
  }
  
  const standardLengths = getStandardLengths(diameter);
  const normalized = normalizeBoltLength(length);
  
  // Verificar si el largo normalizado está en los estándares
  const isStandard = standardLengths.includes(normalized.normalized);
  
  if (isStandard && normalized.difference <= 2) {
    return {
      isValid: true,
      suggestion: normalized.normalized,
      message: `✓ Largo estándar: ${normalized.normalized}mm`,
      difference: normalized.difference
    };
  }
  
  if (normalized.difference > 0 && normalized.difference <= 3) {
    return {
      isValid: true,
      suggestion: normalized.normalized,
      message: `Medida: ${normalized.original}mm → Estándar sugerido: ${normalized.normalized}mm`,
      difference: normalized.difference
    };
  }
  
  // Encontrar el largo estándar más cercano
  const closest = standardLengths.reduce((prev, curr) => {
    return Math.abs(curr - length) < Math.abs(prev - length) ? curr : prev;
  });
  
  return {
    isValid: false,
    suggestion: closest,
    message: `⚠️ Medida no estándar (${length}mm). Sugerido: ${closest}mm`,
    difference: Math.abs(closest - length)
  };
}

/**
 * Formatea la especificación completa del bulón incluyendo largo
 * 
 * @param {object} match - Objeto de coincidencia del bulón
 * @param {number} length - Longitud del bulón
 * @returns {string} - Especificación completa formateada
 */
export function formatFullSpecification(match, length) {
  if (!match) return 'No identificado';
  
  let spec = match.designation;
  
  // Agregar paso de rosca
  if (match.pitchValidation?.pitchValue) {
    spec += ` × ${match.pitchValidation.pitchValue}mm`;
    if (match.pitchValidation.type === 'fine') {
      spec += ' (Fino)';
    }
  } else if (match.coarsePitch) {
    spec += ` × ${match.coarsePitch}mm`;
  }
  
  // Agregar largo si está disponible
  if (length) {
    const normalized = normalizeBoltLength(length);
    spec += ` × ${normalized.normalized}mm`;
    
    if (normalized.difference > 1) {
      spec += ` (~${normalized.original}mm medido)`;
    }
  }
  
  return spec;
}
