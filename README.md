# 🔩 Herramienta de Identificación de Bulonería

Aplicación web profesional para identificar bulones y tornillos mediante mediciones precisas con calibre y peine de roscas. Diseñada específicamente para empleados de ferreterías y talleres mecánicos.

## 🎯 Propósito

Esta herramienta elimina la necesidad de buscar manualmente en tablas de especificaciones al permitir identificar rápidamente bulones y tornillos mediante:
- **Calibre digital/analógico**: Medición de diámetro exterior (±0.02mm precisión)
- **Peine de roscas**: Verificación de paso de rosca (métrico en mm, imperial en TPI)

## ✨ Características Principales

### 📐 Sistemas Soportados
- **Sistema Métrico ISO**: M2 hasta M68
  - Paso grueso y fino
  - Tolerancias según ISO 724/965
- **Sistema Whitworth**: 1/16" hasta 4"
  - BSW (British Standard Whitworth)
  - BSF (British Standard Fine)

### 🔍 Método de Identificación
1. **Medición de Diámetro** (obligatorio)
   - Con calibre digital o analógico
   - Tolerancia: ±0.3mm (incluye desgaste normal)
   
2. **Medición de Paso de Rosca** (recomendado)
   - Con peine de roscas métrico o imperial
   - Tolerancia: ±0.08mm para métrico
   - Diferencia entre paso grueso y fino

3. **Especificaciones Adicionales** (opcional)
   - Longitud total del bulón
   - Tipo de cabeza (hexagonal, allen, phillips, etc.)

### 💡 Funcionalidades Avanzadas

- **Identificación Inteligente**: Combina diámetro + paso para máxima precisión
- **Detección de Desgaste**: Identifica bulones con hasta 0.25mm de desgaste
- **Múltiples Coincidencias**: Muestra alternativas cuando hay ambigüedad
- **Recomendaciones Contextuales**: Guía paso a paso para mejor identificación
- **Nivel de Confianza**: Indica qué tan precisa es la identificación

## 🛠️ Tecnologías

- **React 18+**: UI moderna y reactiva
- **Vite**: Build rápido y HMR
- **Tailwind CSS**: Diseño responsivo y profesional
- **Context API**: Gestión de estado simplificada

## 📊 Algoritmo de Identificación

### Cálculo de Confianza

```javascript
Confianza = (Confianza_Diámetro × 0.6) + (Confianza_Paso × 0.4)

Confianza_Diámetro = 1 - (|medido - nominal| / tolerancia_max)
Confianza_Paso = 1 - (|paso_medido - paso_estándar| / tolerancia_paso)
```

### Niveles de Confianza
- **95-100%**: ✅ Excelente - Identificación exacta
- **85-94%**: ✅ Alta - Muy probable
- **70-84%**: ⚠️ Media - Verificar mediciones
- **50-69%**: ⚠️ Baja - Revisar con herramientas calibradas
- **<50%**: ❌ Muy Baja - Medidas fuera de estándar

## 📁 Estructura del Proyecto

```
src/
├── assets/
│   └── tables/
│       ├── metric.json          # Tabla ISO métrica completa
│       └── whitworth.json       # Tabla Whitworth BSW/BSF
├── components/
│   ├── StepSelector.jsx         # Inicio (auto-selección bulón)
│   ├── DiameterInput.jsx        # Medición con calibre
│   ├── ThreadSelector.jsx       # Sistema de rosca
│   ├── LengthInput.jsx          # Longitud del bulón
│   ├── HeadTypeSelector.jsx     # Tipo de cabeza
│   └── ResultCard.jsx           # Resultado con detalles
├── context/
│   ├── IdentificationContext.jsx
│   └── useIdentification.js
├── utils/
│   ├── tableLookup.js           # ⭐ Motor de identificación
│   ├── unitConversion.js        # Conversiones mm ↔ inch
│   └── validators.js            # Validación de entradas
└── pages/
    └── Home.jsx                 # Página principal

```

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build producción
npm run build

# Preview producción
npm run preview
```

## 📖 Guía de Uso

### Para Empleados de Ferretería

1. **Medir Diámetro**
   - Usar calibre en la parte externa de la rosca
   - Anotar medida en mm o pulgadas
   - Normal que sea 0.1-0.2mm menor que nominal (desgaste)

2. **Verificar Paso de Rosca** (crítico!)
   - Probar con peine de roscas métrico (mm) o imperial (TPI)
   - Buscar el que calce perfectamente
   - Diferencia entre grueso/fino es crucial

3. **Completar Datos**
   - Longitud total (incluye cabeza)
   - Tipo de cabeza ayuda a confirmar

4. **Interpretar Resultado**
   - Verde (>85%): Identificación segura
   - Amarillo (70-85%): Verificar con cliente
   - Rojo (<70%): Re-medir con más precisión

## 🔧 Mejoras Implementadas (Última Actualización)

### Sistema de Identificación
- ✅ Algoritmo combinado diámetro + paso de rosca
- ✅ Función `identifyByDiameterAndPitch()` optimizada
- ✅ Detección automática de rosca fina vs gruesa
- ✅ Manejo inteligente de desgaste de roscas
- ✅ Priorización BSW sobre BSF cuando confianza es igual

### Interfaz de Usuario
- ✅ Tabla de coincidencias alternativas
- ✅ Panel de detalles técnicos mejorado
- ✅ Recomendaciones contextuales inteligentes
- ✅ Indicadores visuales de método de identificación
- ✅ Alertas de diferencia de diámetro
- ✅ Gradientes y animaciones profesionales

### Base de Datos
- ✅ Tablas actualizadas con diámetros de paso (pitch diameter)
- ✅ Información de aplicaciones comunes
- ✅ Clase de tolerancia ISO
- ✅ Longitudes estándar ampliadas

## 🎓 Información Técnica

### Tolerancias Implementadas

**Diámetros:**
- Nuevos: ±0.1mm
- Desgaste normal: hasta -0.2mm
- Máximo aceptable: -0.25mm

**Pasos de Rosca:**
- Métrico: ±0.08mm
- Imperial (TPI): ±0.5 hilos

### Fórmulas de Conversión

```
Paso (mm) = 25.4 / TPI
TPI = 25.4 / Paso (mm)

Inch = mm / 25.4
mm = Inch × 25.4
```

## 📝 Próximas Mejoras

- [ ] Base de datos offline (IndexedDB)
- [ ] Historial de identificaciones
- [ ] Exportar resultados a PDF
- [ ] Modo oscuro
- [ ] Soporte multiidioma (inglés/español)
- [ ] Integración con inventario

## 👥 Contribuciones

Este proyecto está diseñado para ferreterías profesionales. Si tienes sugerencias o encuentras algún error en las tablas de especificaciones, por favor abre un issue.

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

---

**Desarrollado con ❤️ para facilitar el trabajo en ferreterías y talleres mecánicos**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
