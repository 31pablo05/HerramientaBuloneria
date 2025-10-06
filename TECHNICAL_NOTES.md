# 📋 Notas Técnicas - Sistema de Identificación de Bulonería

## 🔬 Fundamentos del Sistema

### Mediciones con Herramientas Reales

#### Calibre (Vernier/Digital)
- **Precisión típica**: ±0.02mm (digital), ±0.05mm (analógico)
- **Qué medir**: Diámetro exterior de la rosca
- **Consideraciones**:
  - Medir en 3 puntos y promediar
  - Bulones usados tienen desgaste de 0.1-0.25mm
  - Temperatura afecta medición (usar a 20°C ideal)

#### Peine de Roscas (Thread Gauge)
- **Tipos**: Métrico (paso en mm), Imperial (TPI - Threads Per Inch)
- **Uso**: Calzar las hojas hasta encontrar coincidencia exacta
- **Precisión**: ±0.05mm (métrico), ±0.5 TPI (imperial)
- **Crítico**: Diferencia paso grueso vs fino

## 🧮 Algoritmos de Identificación

### 1. Búsqueda por Diámetro

```javascript
function findByDiameter(measuredDiameter) {
  // Rango de búsqueda considerando desgaste
  minAcceptable = nominal - 0.25mm  // Desgaste máximo
  maxAcceptable = nominal + 0.30mm  // Variación fabricación
  
  // Cálculo de confianza
  confidence = 1 - (|measured - nominal| / maxTolerance)
  
  // Penalizar si está muy por debajo del nominal
  if (measured < nominal - 0.15) {
    confidence *= 0.85  // Reducir 15% por desgaste significativo
  }
  
  return matches.sort((a, b) => b.confidence - a.confidence)
}
```

### 2. Validación de Paso de Rosca

```javascript
function validateThreadPitch(measuredPitch, specification) {
  tolerance = 0.08mm  // ±0.08mm es realista con peine
  
  // Para métrico: verificar grueso y finos
  if (isMetric) {
    // Paso grueso
    if (abs(measured - coarsePitch) <= tolerance) {
      return { type: 'coarse', confidence: calculateConfidence() }
    }
    
    // Pasos finos (array)
    for (finePitch of finePitches) {
      if (abs(measured - finePitch) <= tolerance) {
        return { type: 'fine', confidence: calculateConfidence() }
      }
    }
  }
  
  // Para Whitworth: convertir TPI a mm
  if (isWhitworth) {
    pitchMm = 25.4 / threadsPerInch
    if (abs(measured - pitchMm) <= tolerance) {
      return { type: subtype, confidence: calculateConfidence() }
    }
  }
  
  return { matches: false }
}
```

### 3. Identificación Combinada (Óptima)

```javascript
function identifyByDiameterAndPitch(diameter, pitch) {
  // Paso 1: Buscar candidatos por diámetro
  candidates = findByDiameter(diameter, tolerance=0.3)
  
  // Paso 2: Filtrar por paso de rosca
  validMatches = candidates.filter(candidate => {
    validation = validateThreadPitch(pitch, candidate)
    return validation.matches
  })
  
  // Paso 3: Calcular confianza combinada
  validMatches.forEach(match => {
    diameterConfidence = match.confidence
    pitchConfidence = validation.confidence
    
    // Peso: 60% diámetro, 40% paso
    combinedConfidence = (diameterConfidence * 0.6) + (pitchConfidence * 0.4)
    
    match.combinedConfidence = combinedConfidence
  })
  
  // Paso 4: Ordenar y retornar
  return validMatches.sort((a, b) => b.combinedConfidence - a.combinedConfidence)
}
```

## 📊 Tablas de Datos

### Estructura Métrica (metric.json)

```json
{
  "metric_threads": {
    "M8": {
      "diameter": 8.0,              // Diámetro nominal
      "nominal_diameter": 8.0,      // Alias
      "pitch_diameter": 7.188,      // Diámetro de paso (mediano)
      "coarse_pitch": 1.25,         // Paso estándar/grueso
      "fine_pitch": [1.0, 0.75],    // Pasos finos disponibles
      "standard_lengths": [...],     // Longitudes fabricadas
      "head_types": [...],          // Tipos de cabeza disponibles
      "common_applications": [...], // Usos típicos
      "tolerance_class": "6g"       // Clase ISO
    }
  }
}
```

### Estructura Whitworth (whitworth.json)

```json
{
  "whitworth_threads": {
    "1/4": {
      "diameter_inch": 0.25,        // Diámetro en pulgadas
      "diameter_mm": 6.35,          // Diámetro en mm
      "threads_per_inch": 20,       // TPI (Threads Per Inch)
      "pitch_mm": 1.27,            // Paso calculado en mm
      "standard_lengths": [...],
      "head_types": [...]
    },
    "1/4-BSF": {                    // Versión fina (Fine)
      "diameter_inch": 0.25,
      "diameter_mm": 6.35,
      "threads_per_inch": 26,       // Más hilos = rosca fina
      "pitch_mm": 0.977,
      ...
    }
  }
}
```

## 🎯 Casos de Uso Reales

### Caso 1: Bulón Nuevo - Identificación Perfecta

```
Entrada:
- Diámetro: 8.0mm (calibre)
- Paso: 1.25mm (peine)

Resultado:
- Identificación: M8 × 1.25 (paso grueso)
- Confianza: 98%
- Sistema: Métrico ISO
```

### Caso 2: Bulón Usado - Con Desgaste

```
Entrada:
- Diámetro: 7.82mm (calibre) ← 0.18mm menor
- Paso: 1.25mm (peine)

Resultado:
- Identificación: M8 × 1.25
- Confianza: 91%
- Alerta: "Desgaste normal detectado (0.18mm)"
- Sistema: Métrico ISO
```

### Caso 3: Sin Paso de Rosca - Múltiples Coincidencias

```
Entrada:
- Diámetro: 6.3mm (calibre)
- Paso: NO MEDIDO

Resultado:
- Identificación: 1/4" BSW (mejor coincidencia)
- Alternativas: 
  - M6 (6.0mm) - 90% confianza
  - 1/4" BSW (6.35mm) - 85% confianza
  - 1/4" BSF (6.35mm) - 85% confianza
- Recomendación: "Usar peine de roscas para confirmar"
```

### Caso 4: Rosca Fina - Requiere Precisión

```
Entrada:
- Diámetro: 10.0mm
- Paso: 1.0mm (peine)

Resultado:
- Identificación: M10 × 1.0 (paso FINO)
- Confianza: 96%
- Info: "Rosca fina - Aplicaciones de precisión"
- Nota: "Menos común que M10 × 1.5 (grueso)"
```

## ⚠️ Casos Edge y Manejo de Errores

### Error 1: Medida Fuera de Rango

```javascript
if (diameter < 2 || diameter > 70) {
  return {
    error: true,
    message: "Diámetro fuera de rango soportado (2-70mm)",
    recommendation: "Verificar medición o consultar manual"
  }
}
```

### Error 2: Paso Incompatible con Diámetro

```javascript
// Ejemplo: M8 medido pero paso 2.5mm (imposible)
if (candidatesByDiameter.length > 0 && validWithPitch.length === 0) {
  return {
    warning: true,
    message: "Paso de rosca incompatible con diámetro medido",
    recommendation: "Re-verificar medición de paso con peine",
    possibleMistake: "Peine incorrecto (métrico vs imperial)"
  }
}
```

### Error 3: Ambigüedad Alta

```javascript
if (topMatches.length >= 3 && confidenceRange < 0.05) {
  return {
    ambiguous: true,
    message: "Múltiples coincidencias con confianza similar",
    recommendation: "Medir paso de rosca para desambiguar",
    alternatives: topMatches
  }
}
```

## 🔍 Detalles de Implementación

### Priorización de Resultados

1. **Confianza Combinada** (si hay paso de rosca)
2. **Confianza de Diámetro** (solo diámetro)
3. **Priorizar BSW sobre BSF** (Whitworth: estándar antes que fino)
4. **Priorizar paso grueso** (Métrico: más común)

### Tolerancias por Tamaño

```javascript
function getToleranceBySize(diameter) {
  if (diameter <= 5) return 0.15  // Bulones pequeños: más precisión
  if (diameter <= 12) return 0.20 // Rango medio
  if (diameter <= 24) return 0.25 // Bulones grandes
  return 0.30                      // Muy grandes: más holgura
}
```

### Ajuste por Desgaste

```javascript
function adjustForWear(measured, nominal) {
  wear = nominal - measured
  
  if (wear <= 0.05) return { category: 'nuevo', factor: 1.0 }
  if (wear <= 0.15) return { category: 'poco_uso', factor: 0.95 }
  if (wear <= 0.25) return { category: 'desgaste_normal', factor: 0.85 }
  return { category: 'desgaste_alto', factor: 0.70 }
}
```

## 📈 Optimizaciones de Performance

### 1. Búsqueda Binaria en Tablas Ordenadas

```javascript
// Las tablas están ordenadas por diámetro
function findByDiameterOptimized(diameter, table) {
  // Búsqueda binaria para O(log n)
  left = 0
  right = table.length - 1
  
  while (left <= right) {
    mid = floor((left + right) / 2)
    // ...buscar rango
  }
}
```

### 2. Caché de Resultados Frecuentes

```javascript
const commonSizesCache = new Map()

// M6, M8, M10, M12 son 70% de consultas
if (commonSizesCache.has(diameter)) {
  return commonSizesCache.get(diameter)
}
```

### 3. Lazy Loading de Tablas

```javascript
// Solo cargar tabla relevante
if (preferredSystem === 'metric') {
  // No cargar whitworth.json
} else if (preferredSystem === 'whitworth') {
  // No cargar metric.json
}
```

## 🧪 Testing y Validación

### Test Cases Críticos

```javascript
// Test 1: Identificación perfecta
assert(identify(8.0, 1.25).designation === 'M8')
assert(identify(8.0, 1.25).confidence > 0.95)

// Test 2: Desgaste normal
assert(identify(7.85, 1.25).designation === 'M8')
assert(identify(7.85, 1.25).confidence > 0.85)

// Test 3: Whitworth estándar
assert(identify(6.35, 1.27).designation === '1/4')
assert(identify(6.35, 1.27).type === 'whitworth')

// Test 4: Rosca fina
assert(identify(10.0, 1.0).pitchType === 'fine')
assert(identify(10.0, 1.0).designation === 'M10')

// Test 5: Ambigüedad
result = identify(6.2, null)
assert(result.alternatives.length > 1)
assert(result.recommendation.includes('peine'))
```

## 📚 Referencias Técnicas

### Estándares ISO
- **ISO 724**: Dimensiones básicas de rosca métrica
- **ISO 965**: Tolerancias de rosca métrica
- **ISO 898-1**: Propiedades mecánicas de tornillos

### Estándares BSW/BSF
- **BS 84**: Rosca Whitworth estándar
- **BS 93**: Rosca Whitworth fina
- **BS 919**: Designaciones y tolerancias

### Conversiones
```
1 inch = 25.4mm exacto
Paso (mm) = 25.4 / TPI
TPI = 25.4 / Paso (mm)
```

---

**Última actualización**: Octubre 2025
**Versión del algoritmo**: 2.0
