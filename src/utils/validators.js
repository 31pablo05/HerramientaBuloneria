// Validaciones para los datos de entrada

/**
 * Valida un valor de diámetro
 * @param {string|number} value - Valor a validar
 * @param {string} unit - Unidad ('mm' o 'inch')
 * @returns {object} { isValid: boolean, error: string, normalizedValue: number }
 */
export const validateDiameter = (value, unit = 'mm') => {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue) || numValue <= 0) {
    return {
      isValid: false,
      error: 'El diámetro debe ser un número positivo',
      normalizedValue: null
    };
  }
  
  // Rangos válidos según la unidad
  if (unit === 'mm') {
    if (numValue < 1 || numValue > 50) {
      return {
        isValid: false,
        error: 'El diámetro debe estar entre 1 y 50 mm',
        normalizedValue: null
      };
    }
  } else if (unit === 'inch') {
    if (numValue < 0.05 || numValue > 2) {
      return {
        isValid: false,
        error: 'El diámetro debe estar entre 0.05" y 2"',
        normalizedValue: null
      };
    }
  }
  
  return {
    isValid: true,
    error: null,
    normalizedValue: numValue,
    note: 'El diámetro medido puede ser hasta 0.2mm menor que el nominal debido al desgaste de la rosca'
  };
};

/**
 * Valida un valor de paso de rosca
 * @param {string|number} value - Valor a validar
 * @param {string} threadType - Tipo de rosca ('metric' o 'whitworth')
 * @returns {object} { isValid: boolean, error: string, normalizedValue: number }
 */
export const validatePitch = (value, threadType = 'metric') => {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue) || numValue <= 0) {
    return {
      isValid: false,
      error: 'El paso debe ser un número positivo',
      normalizedValue: null
    };
  }
  
  if (threadType === 'metric') {
    // Pasos métricos comunes: 0.35, 0.5, 0.7, 0.75, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5
    const validPitches = [0.35, 0.5, 0.7, 0.75, 0.8, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5];
    const tolerance = 0.05;
    
    const isValidPitch = validPitches.some(pitch => Math.abs(numValue - pitch) <= tolerance);
    
    if (!isValidPitch) {
      return {
        isValid: false,
        error: `Paso métrico no estándar. Pasos comunes: ${validPitches.join(', ')} mm`,
        normalizedValue: null
      };
    }
  } else if (threadType === 'whitworth') {
    // Para Whitworth, validar hilos por pulgada (TPI)
    if (numValue < 5 || numValue > 50) {
      return {
        isValid: false,
        error: 'Los hilos por pulgada deben estar entre 5 y 50',
        normalizedValue: null
      };
    }
  }
  
  return {
    isValid: true,
    error: null,
    normalizedValue: numValue
  };
};

/**
 * Valida un valor de longitud
 * @param {string|number} value - Valor a validar
 * @param {string} unit - Unidad ('mm' o 'inch')
 * @returns {object} { isValid: boolean, error: string, normalizedValue: number }
 */
export const validateLength = (value, unit = 'mm') => {
  const numValue = parseFloat(value);
  
  if (isNaN(numValue) || numValue <= 0) {
    return {
      isValid: false,
      error: 'La longitud debe ser un número positivo',
      normalizedValue: null
    };
  }
  
  // Rangos válidos según la unidad
  if (unit === 'mm') {
    if (numValue < 3 || numValue > 500) {
      return {
        isValid: false,
        error: 'La longitud debe estar entre 3 y 500 mm',
        normalizedValue: null
      };
    }
  } else if (unit === 'inch') {
    if (numValue < 0.125 || numValue > 20) {
      return {
        isValid: false,
        error: 'La longitud debe estar entre 1/8" y 20"',
        normalizedValue: null
      };
    }
  }
  
  return {
    isValid: true,
    error: null,
    normalizedValue: numValue
  };
};

/**
 * Valida que un tipo de pieza sea válido
 * @param {string} pieceType - Tipo de pieza
 * @returns {object} { isValid: boolean, error: string }
 */
export const validatePieceType = (pieceType) => {
  const validTypes = ['bolt', 'nut', 'washer'];
  
  if (!pieceType || !validTypes.includes(pieceType)) {
    return {
      isValid: false,
      error: 'Debe seleccionar un tipo de pieza válido'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Valida que un tipo de rosca sea válido
 * @param {string} threadType - Tipo de rosca
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateThreadType = (threadType) => {
  const validTypes = ['metric', 'whitworth'];
  
  if (!threadType || !validTypes.includes(threadType)) {
    return {
      isValid: false,
      error: 'Debe seleccionar un tipo de rosca válido'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Valida que un tipo de cabeza sea válido
 * @param {string} headType - Tipo de cabeza
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateHeadType = (headType) => {
  const validTypes = ['hex', 'allen', 'phillips', 'flat', 'pan'];
  
  if (!headType) {
    // El tipo de cabeza es opcional
    return {
      isValid: true,
      error: null
    };
  }
  
  if (!validTypes.includes(headType)) {
    return {
      isValid: false,
      error: 'Tipo de cabeza no válido'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Valida todos los datos de identificación
 * @param {object} data - Datos a validar
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateIdentificationData = (data) => {
  const errors = {};
  let isValid = true;
  
  // Validar tipo de pieza
  const pieceTypeValidation = validatePieceType(data.pieceType);
  if (!pieceTypeValidation.isValid) {
    errors.pieceType = pieceTypeValidation.error;
    isValid = false;
  }
  
  // Validar diámetro
  if (data.diameter && data.diameter.value) {
    const diameterValidation = validateDiameter(data.diameter.value, data.diameter.unit);
    if (!diameterValidation.isValid) {
      errors.diameter = diameterValidation.error;
      isValid = false;
    }
  } else {
    errors.diameter = 'El diámetro es obligatorio';
    isValid = false;
  }
  
  // Validar tipo de rosca
  const threadTypeValidation = validateThreadType(data.threadType);
  if (!threadTypeValidation.isValid) {
    errors.threadType = threadTypeValidation.error;
    isValid = false;
  }
  
  // Validar paso de rosca
  if (data.threadPitch && data.threadPitch.value) {
    const pitchValidation = validatePitch(data.threadPitch.value, data.threadType);
    if (!pitchValidation.isValid) {
      errors.threadPitch = pitchValidation.error;
      isValid = false;
    }
  } else {
    errors.threadPitch = 'El paso de rosca es obligatorio';
    isValid = false;
  }
  
  // Validar longitud (solo para tornillos/bulones)
  if (data.pieceType === 'bolt') {
    if (data.length && data.length.value) {
      const lengthValidation = validateLength(data.length.value, data.diameter.unit);
      if (!lengthValidation.isValid) {
        errors.length = lengthValidation.error;
        isValid = false;
      }
    } else {
      errors.length = 'La longitud es obligatoria para tornillos/bulones';
      isValid = false;
    }
  }
  
  // Validar tipo de cabeza (opcional)
  if (data.headType) {
    const headTypeValidation = validateHeadType(data.headType);
    if (!headTypeValidation.isValid) {
      errors.headType = headTypeValidation.error;
      isValid = false;
    }
  }
  
  return {
    isValid,
    errors
  };
};

/**
 * Verifica si un valor está dentro de un rango con tolerancia
 * @param {number} value - Valor a verificar
 * @param {number} target - Valor objetivo
 * @param {number} tolerance - Tolerancia permitida
 * @returns {boolean} True si está dentro del rango
 */
export const isWithinTolerance = (value, target, tolerance = 0.1) => {
  return Math.abs(value - target) <= tolerance;
};

/**
 * Normaliza un valor de entrada (quita espacios, convierte a número)
 * @param {string|number} value - Valor a normalizar
 * @returns {number|null} Valor normalizado o null si no es válido
 */
export const normalizeValue = (value) => {
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    // Quitar espacios y caracteres no numéricos (excepto punto y coma)
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const numValue = parseFloat(cleaned);
    
    return isNaN(numValue) ? null : numValue;
  }
  
  return null;
};

/**
 * Valida un rango de valores
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {string} fieldName - Nombre del campo para el mensaje de error
 * @returns {object} { isValid: boolean, error: string }
 */
export const validateRange = (value, min, max, fieldName = 'valor') => {
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `El ${fieldName} debe estar entre ${min} y ${max}`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Valida que los datos sean suficientes para una identificación
 * @param {object} data - Datos de identificación
 * @returns {object} { isComplete: boolean, missingFields: array }
 */
export const validateCompleteness = (data) => {
  const missingFields = [];
  
  if (!data.pieceType) missingFields.push('Tipo de pieza');
  if (!data.diameter?.value) missingFields.push('Diámetro');
  if (!data.threadType) missingFields.push('Tipo de rosca');
  if (!data.threadPitch?.value) missingFields.push('Paso de rosca');
  
  if (data.pieceType === 'bolt' && !data.length?.value) {
    missingFields.push('Longitud');
  }
  
  return {
    isComplete: missingFields.length === 0,
    missingFields
  };
};
