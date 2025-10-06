import React, { createContext, useReducer } from 'react';

// Estados iniciales
const initialState = {
  // Paso actual del flujo
  currentStep: 1,
  
  // Datos recolectados - solo para bulones/tornillos
  pieceType: 'bolt', // Siempre 'bolt' ahora
  diameter: {
    value: '',
    unit: 'mm', // 'mm' o 'inch'
    measured: null
  },
  threadType: '', // 'metric', 'whitworth'
  threadPitch: {
    value: '',
    type: '', // 'coarse', 'fine', 'standard'
    measured: null
  },
  length: {
    value: '',
    measured: null
  },
  headType: '',
  
  // Resultados de identificación
  possibleMatches: [],
  finalMatch: null,
  confidence: 0,
  
  // Estado de la UI
  isLoading: false,
  errors: {},
  showHistory: false,
  history: []
};

// Tipos de acciones
const actionTypes = {
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_PIECE_TYPE: 'SET_PIECE_TYPE',
  SET_DIAMETER: 'SET_DIAMETER',
  SET_THREAD_TYPE: 'SET_THREAD_TYPE',
  SET_THREAD_PITCH: 'SET_THREAD_PITCH',
  SET_LENGTH: 'SET_LENGTH',
  SET_HEAD_TYPE: 'SET_HEAD_TYPE',
  SET_POSSIBLE_MATCHES: 'SET_POSSIBLE_MATCHES',
  SET_FINAL_MATCH: 'SET_FINAL_MATCH',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_IDENTIFICATION: 'RESET_IDENTIFICATION',
  GO_TO_STEP: 'GO_TO_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREVIOUS_STEP: 'PREVIOUS_STEP',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  TOGGLE_HISTORY: 'TOGGLE_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY'
};

// Reducer para manejar el estado
function identificationReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };
    
    case actionTypes.SET_PIECE_TYPE:
      return { 
        ...state, 
        pieceType: action.payload,
        // Limpiar datos irrelevantes según el tipo
        length: action.payload === 'nut' || action.payload === 'washer' 
          ? { value: '', measured: null } 
          : state.length,
        headType: action.payload === 'nut' || action.payload === 'washer' 
          ? '' 
          : state.headType
      };
    
    case actionTypes.SET_DIAMETER:
      return { 
        ...state, 
        diameter: { ...state.diameter, ...action.payload },
        // Limpiar matches anteriores cuando cambia el diámetro
        possibleMatches: [],
        finalMatch: null
      };
    
    case actionTypes.SET_THREAD_TYPE:
      return { 
        ...state, 
        threadType: action.payload,
        // Limpiar paso de rosca cuando cambia el tipo
        threadPitch: { value: '', type: '', measured: null },
        possibleMatches: [],
        finalMatch: null
      };
    
    case actionTypes.SET_THREAD_PITCH:
      return { 
        ...state, 
        threadPitch: { ...state.threadPitch, ...action.payload }
      };
    
    case actionTypes.SET_LENGTH:
      return { 
        ...state, 
        length: { ...state.length, ...action.payload }
      };
    
    case actionTypes.SET_HEAD_TYPE:
      return { ...state, headType: action.payload };
    
    case actionTypes.SET_POSSIBLE_MATCHES:
      return { 
        ...state, 
        possibleMatches: action.payload,
        confidence: action.payload.length > 0 ? 
          Math.max(...action.payload.map(m => m.confidence)) : 0
      };
    
    case actionTypes.SET_FINAL_MATCH:
      return { 
        ...state, 
        finalMatch: action.payload,
        confidence: action.payload ? action.payload.confidence : 0
      };
    
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { 
        ...state, 
        errors: { ...state.errors, [action.payload.field]: action.payload.message }
      };
    
    case actionTypes.CLEAR_ERROR: {
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return { ...state, errors: newErrors };
    }
    
    case actionTypes.RESET_IDENTIFICATION:
      return { 
        ...initialState, 
        history: state.history 
      };
    
    case actionTypes.GO_TO_STEP:
      return { ...state, currentStep: action.payload };
    
    case actionTypes.NEXT_STEP:
      return { ...state, currentStep: state.currentStep + 1 };
    
    case actionTypes.PREVIOUS_STEP:
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) };
    
    case actionTypes.ADD_TO_HISTORY: {
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        pieceType: state.pieceType,
        diameter: state.diameter,
        threadType: state.threadType,
        threadPitch: state.threadPitch,
        length: state.length,
        headType: state.headType,
        result: state.finalMatch
      };
      return { 
        ...state, 
        history: [newHistoryItem, ...state.history.slice(0, 49)] // Mantener solo 50 items
      };
    }
    
    case actionTypes.TOGGLE_HISTORY:
      return { ...state, showHistory: !state.showHistory };
    
    case actionTypes.CLEAR_HISTORY:
      return { ...state, history: [] };
    
    default:
      return state;
  }
}

// Crear el contexto
const IdentificationContext = createContext();

// Provider del contexto
export const IdentificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(identificationReducer, initialState);

  // Acciones del contexto
  const actions = {
    // Navegación
    setCurrentStep: (step) => dispatch({ type: actionTypes.SET_CURRENT_STEP, payload: step }),
    goToStep: (step) => dispatch({ type: actionTypes.GO_TO_STEP, payload: step }),
    nextStep: () => dispatch({ type: actionTypes.NEXT_STEP }),
    previousStep: () => dispatch({ type: actionTypes.PREVIOUS_STEP }),
    
    // Datos de identificación
    setPieceType: (type) => dispatch({ type: actionTypes.SET_PIECE_TYPE, payload: type }),
    setDiameter: (diameterData) => dispatch({ type: actionTypes.SET_DIAMETER, payload: diameterData }),
    setThreadType: (type) => dispatch({ type: actionTypes.SET_THREAD_TYPE, payload: type }),
    setThreadPitch: (pitchData) => dispatch({ type: actionTypes.SET_THREAD_PITCH, payload: pitchData }),
    setLength: (lengthData) => dispatch({ type: actionTypes.SET_LENGTH, payload: lengthData }),
    setHeadType: (type) => dispatch({ type: actionTypes.SET_HEAD_TYPE, payload: type }),
    
    // Resultados
    setPossibleMatches: (matches) => dispatch({ type: actionTypes.SET_POSSIBLE_MATCHES, payload: matches }),
    setFinalMatch: (match) => dispatch({ type: actionTypes.SET_FINAL_MATCH, payload: match }),
    
    // Estado de la aplicación
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (field, message) => dispatch({ type: actionTypes.SET_ERROR, payload: { field, message } }),
    clearError: (field) => dispatch({ type: actionTypes.CLEAR_ERROR, payload: field }),
    
    // Utilidades
    resetIdentification: () => dispatch({ type: actionTypes.RESET_IDENTIFICATION }),
    addToHistory: () => dispatch({ type: actionTypes.ADD_TO_HISTORY }),
    toggleHistory: () => dispatch({ type: actionTypes.TOGGLE_HISTORY }),
    clearHistory: () => dispatch({ type: actionTypes.CLEAR_HISTORY }),
    
    // Validaciones de pasos
    canProceedToStep: (stepNumber) => {
      switch (stepNumber) {
        case 2: // Diámetro
          return !!state.pieceType;
        case 3: // Paso de rosca
          return !!state.pieceType && !!state.diameter.value;
        case 4: // Largo
          return !!state.pieceType && !!state.diameter.value && !!state.threadPitch.value;
        case 5: // Tipo de cabeza
          return state.pieceType !== 'bolt' || (!!state.diameter.value && !!state.threadPitch.value && !!state.length.value);
        case 6: // Resultado
          return !!state.diameter.value && !!state.threadPitch.value;
        default:
          return true;
      }
    },
    
    // Obtener el número total de pasos según el tipo de pieza
    getTotalSteps: () => {
      switch (state.pieceType) {
        case 'bolt':
          return 6; // Tipo, Diámetro, Rosca, Largo, Cabeza, Resultado
        case 'nut':
          return 5; // Tipo, Diámetro, Rosca, Identificación de tuerca, Resultado
        case 'washer':
          return 4; // Tipo, Diámetro, Confirmación, Resultado
        default:
          return 6;
      }
    },
    
    // Obtener el progreso actual
    getProgress: () => {
      const totalSteps = actions.getTotalSteps();
      return Math.round((state.currentStep / totalSteps) * 100);
    }
  };

  return (
    <IdentificationContext.Provider value={{ state, actions }}>
      {children}
    </IdentificationContext.Provider>
  );
};

export default IdentificationContext;
