// Conversiones entre milímetros y pulgadas

/**
 * Convierte milímetros a pulgadas
 * @param {number} mm - Valor en milímetros
 * @returns {number} Valor en pulgadas
 */
export const mmToInch = (mm) => {
  return mm / 25.4;
};

/**
 * Convierte pulgadas a milímetros
 * @param {number} inch - Valor en pulgadas
 * @returns {number} Valor en milímetros
 */
export const inchToMm = (inch) => {
  return inch * 25.4;
};

/**
 * Formatea un valor en milímetros para mostrar
 * @param {number} mm - Valor en milímetros
 * @param {number} decimals - Número de decimales (default: 2)
 * @returns {string} Valor formateado
 */
export const formatMm = (mm, decimals = 2) => {
  return `${parseFloat(mm).toFixed(decimals)} mm`;
};

/**
 * Formatea un valor en pulgadas para mostrar
 * @param {number} inch - Valor en pulgadas
 * @param {boolean} asFraction - Si mostrar como fracción (default: true)
 * @returns {string} Valor formateado
 */
export const formatInch = (inch, asFraction = true) => {
  if (!asFraction) {
    return `${parseFloat(inch).toFixed(4)}"`;
  }
  
  return `${decimalToFraction(inch)}"`;
};

/**
 * Convierte un decimal a fracción común
 * @param {number} decimal - Número decimal
 * @returns {string} Fracción como string
 */
export const decimalToFraction = (decimal) => {
  // Fracciones comunes en tornillería
  const commonFractions = [
    { decimal: 0.125, fraction: '1/8' },
    { decimal: 0.15625, fraction: '5/32' },
    { decimal: 0.1875, fraction: '3/16' },
    { decimal: 0.25, fraction: '1/4' },
    { decimal: 0.3125, fraction: '5/16' },
    { decimal: 0.375, fraction: '3/8' },
    { decimal: 0.4375, fraction: '7/16' },
    { decimal: 0.5, fraction: '1/2' },
    { decimal: 0.5625, fraction: '9/16' },
    { decimal: 0.625, fraction: '5/8' },
    { decimal: 0.75, fraction: '3/4' },
    { decimal: 0.875, fraction: '7/8' },
    { decimal: 1.0, fraction: '1' },
    { decimal: 1.125, fraction: '1-1/8' },
    { decimal: 1.25, fraction: '1-1/4' }
  ];
  
  // Buscar la fracción más cercana
  const closest = commonFractions.reduce((prev, curr) => {
    return Math.abs(curr.decimal - decimal) < Math.abs(prev.decimal - decimal) ? curr : prev;
  });
  
  // Si la diferencia es muy pequeña, usar la fracción común
  if (Math.abs(closest.decimal - decimal) < 0.01) {
    return closest.fraction;
  }
  
  // Si no, convertir a fracción usando algoritmo simple
  return convertToFraction(decimal);
};

/**
 * Convierte decimal a fracción usando algoritmo
 * @param {number} decimal - Número decimal
 * @returns {string} Fracción como string
 */
const convertToFraction = (decimal) => {
  const tolerance = 1.0E-6;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = decimal;
  
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
  
  if (k1 === 1) {
    return h1.toString();
  }
  
  if (h1 >= k1) {
    const whole = Math.floor(h1 / k1);
    const remainder = h1 % k1;
    if (remainder === 0) {
      return whole.toString();
    }
    return `${whole}-${remainder}/${k1}`;
  }
  
  return `${h1}/${k1}`;
};

/**
 * Detecta si un valor ingresado es métrico o imperial
 * @param {number} value - Valor numérico
 * @returns {string} 'metric' o 'imperial'
 */
export const detectUnit = (value) => {
  // Rangos típicos para tornillería
  if (value >= 1 && value <= 50) {
    return 'metric'; // Probablemente milímetros
  } else if (value > 0 && value <= 2) {
    return 'imperial'; // Probablemente pulgadas
  }
  
  // Para valores ambiguos, usar rangos comunes
  const commonMetric = [3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 30];
  const commonImperial = [0.125, 0.15625, 0.1875, 0.25, 0.3125, 0.375, 0.4375, 0.5, 0.5625, 0.625, 0.75, 0.875, 1.0, 1.125, 1.25];
  
  // Verificar cercanía a valores métricos comunes
  const closeToMetric = commonMetric.some(metric => Math.abs(value - metric) < 0.5);
  
  // Verificar cercanía a valores imperiales comunes
  const closeToImperial = commonImperial.some(imperial => Math.abs(value - imperial) < 0.02);
  
  if (closeToMetric && !closeToImperial) return 'metric';
  if (closeToImperial && !closeToMetric) return 'imperial';
  
  // Por defecto, asumir métrico si el valor es mayor a 2
  return value > 2 ? 'metric' : 'imperial';
};

/**
 * Convierte automáticamente entre unidades
 * @param {number} value - Valor a convertir
 * @param {string} fromUnit - Unidad origen ('mm' o 'inch')
 * @param {string} toUnit - Unidad destino ('mm' o 'inch')
 * @returns {number} Valor convertido
 */
export const convertUnit = (value, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'mm' && toUnit === 'inch') {
    return mmToInch(value);
  }
  
  if (fromUnit === 'inch' && toUnit === 'mm') {
    return inchToMm(value);
  }
  
  return value;
};

/**
 * Redondea un valor a la precisión apropiada para tornillería
 * @param {number} value - Valor a redondear
 * @param {string} unit - Unidad ('mm' o 'inch')
 * @returns {number} Valor redondeado
 */
export const roundToPrecision = (value, unit = 'mm') => {
  if (unit === 'mm') {
    // Para milímetros, redondear a 0.1 mm
    return Math.round(value * 10) / 10;
  } else {
    // Para pulgadas, redondear a 0.001"
    return Math.round(value * 1000) / 1000;
  }
};

/**
 * Obtiene las unidades de medida apropiadas según el contexto
 * @param {string} measurementType - Tipo de medición ('diameter', 'length', 'pitch')
 * @returns {object} Objeto con opciones de unidades
 */
export const getUnitsForMeasurement = (measurementType) => {
  const baseUnits = {
    diameter: {
      metric: { unit: 'mm', label: 'Milímetros', symbol: 'mm' },
      imperial: { unit: 'inch', label: 'Pulgadas', symbol: '"' }
    },
    length: {
      metric: { unit: 'mm', label: 'Milímetros', symbol: 'mm' },
      imperial: { unit: 'inch', label: 'Pulgadas', symbol: '"' }
    },
    pitch: {
      metric: { unit: 'mm', label: 'Milímetros', symbol: 'mm' },
      imperial: { unit: 'tpi', label: 'Hilos por pulgada', symbol: 'TPI' }
    }
  };
  
  return baseUnits[measurementType] || baseUnits.diameter;
};
