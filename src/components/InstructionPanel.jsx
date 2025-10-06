import React from 'react';

/**
 * Componente de ayuda visual con instrucciones paso a paso
 * Mejora la usabilidad mostrando cómo usar la herramienta correctamente
 */
const InstructionPanel = ({ step, title, icon, instructions, tips, tools }) => {
  return (
    <div className="bg-gradient-to-br from-primary-light to-white rounded-2xl p-6 shadow-tool-lg border-2 border-primary-cyan/20 mb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-primary-cyan/20">
        <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center text-4xl shadow-tool">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary-blue uppercase tracking-wider">
            Paso {step}
          </p>
          <h3 className="text-2xl font-bold text-primary-navy">
            {title}
          </h3>
        </div>
      </div>

      {/* Herramientas necesarias */}
      {tools && tools.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-xl border-2 border-primary-blue/20 shadow-inner-light">
          <h4 className="text-sm font-bold text-primary-navy mb-3 flex items-center gap-2">
            <span className="text-xl">🛠️</span>
            Herramientas Necesarias
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tools.map((tool, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-primary-light rounded-lg border border-primary-cyan/30"
              >
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-xl shadow">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primary-navy text-sm">{tool.name}</p>
                  <p className="text-xs text-steel-600">{tool.precision}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones paso a paso */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-primary-navy mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          Instrucciones
        </h4>
        <div className="space-y-3">
          {instructions.map((instruction, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 p-4 bg-white rounded-xl border-l-4 border-primary-cyan shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-steel-700 font-medium leading-relaxed">
                  {instruction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips y advertencias */}
      {tips && tips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tips.map((tip, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl border-2 ${
                tip.type === 'warning' 
                  ? 'bg-warning/10 border-warning/30' 
                  : tip.type === 'error'
                  ? 'bg-error/10 border-error/30'
                  : 'bg-info/10 border-info/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {tip.type === 'warning' ? '⚠️' : tip.type === 'error' ? '🚫' : '💡'}
                </span>
                <div>
                  <p className={`font-bold text-sm mb-1 ${
                    tip.type === 'warning' 
                      ? 'text-warning' 
                      : tip.type === 'error'
                      ? 'text-error'
                      : 'text-info'
                  }`}>
                    {tip.title}
                  </p>
                  <p className="text-steel-700 text-sm leading-relaxed">
                    {tip.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video o imagen de ayuda (opcional) */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-cyan/10 to-primary-blue/10 rounded-xl border-2 border-dashed border-primary-cyan/30">
        <div className="flex items-center justify-center gap-3 text-primary-navy">
          <span className="text-3xl">📹</span>
          <p className="text-sm font-semibold">
            ¿Necesitas ayuda visual? 
            <button className="ml-2 text-primary-blue hover:text-primary-cyan underline font-bold transition-colors">
              Ver tutorial
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstructionPanel;
