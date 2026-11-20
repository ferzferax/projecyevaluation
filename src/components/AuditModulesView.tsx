import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Search, Sparkles } from 'lucide-react';
import {
  AUDIT_METADATA,
  COMPLEXITY_MODULES,
  WORKSTREAMS,
  formatBRL,
  type ComplexityLevel,
} from '../data/valuationData';

type ComplexityFilter = 'Todas' | ComplexityLevel;

export const AuditModulesView: React.FC = () => {
  const [filter, setFilter] = useState<ComplexityFilter>('Todas');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('ws-1');

  // Fast Gemini 3.1 Flash-Lite inline explanation state
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explainError, setExplainError] = useState<Record<string, string>>({});

  const filteredWorkstreams = useMemo(() => {
    const q = search.trim().toLowerCase();
    return WORKSTREAMS.filter((ws) => {
      const matchesFilter = filter === 'Todas' || ws.complexity === filter;
      const matchesQuery =
        !q ||
        ws.name.toLowerCase().includes(q) ||
        ws.repoTag.toLowerCase().includes(q) ||
        ws.category.toLowerCase().includes(q) ||
        ws.technicalProof.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, search]);

  const filteredModules = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COMPLEXITY_MODULES.filter((m) => {
      const matchesFilter = filter === 'Todas' || m.complexity === filter;
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.repos.toLowerCase().includes(q) ||
        m.justification.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, search]);

  const totals = useMemo(() => {
    return filteredWorkstreams.reduce(
      (acc, ws) => ({
        creationHours: acc.creationHours + ws.creationHours,
        creationValue: acc.creationValue + ws.creationValue,
        deploymentHours: acc.deploymentHours + ws.deploymentHours,
        deploymentValue: acc.deploymentValue + ws.deploymentValue,
      }),
      { creationHours: 0, creationValue: 0, deploymentHours: 0, deploymentValue: 0 }
    );
  }, [filteredWorkstreams]);

  const handleQuickExplain = async (id: string, topic: string, technicalDetail: string) => {
    setExplainingId(id);
    setExplainError((prev) => ({ ...prev, [id]: '' }));
    try {
      const res = await fetch('/api/gemini/quick-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, technicalDetail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao gerar explicação executiva.');
      }
      setExplanations((prev) => ({ ...prev, [id]: data.explanation }));
    } catch (err) {
      setExplainError((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : 'Erro ao consultar IA.',
      }));
    } finally {
      setExplainingId(null);
    }
  };

  const complexityLabelClass = (level: ComplexityLevel) => {
    if (level === 'Muito Alta') return 'text-red-700 font-semibold';
    if (level === 'Alta') return 'text-[#B45309] font-semibold';
    return 'text-[#0F2744] font-semibold';
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">
            Auditoria de Horas Humanas & Complexidade Técnica · Base 2026 (R$ 140/h – R$ 220/h)
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#0F2744]">
            Orçamento Aberto por Frente e Matriz de Complexidade
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar módulo, repo ou norma..."
              aria-label="Filtrar frentes auditadas"
              className="pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md w-full sm:w-64 focus:outline-none focus:border-[#0F2744]"
            />
          </div>

          <div
            role="group"
            aria-label="Filtrar por complexidade"
            className="inline-flex items-center p-1 bg-slate-100 rounded-md"
          >
            {(['Todas', 'Muito Alta', 'Alta', 'Média-Alta'] as ComplexityFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  filter === item
                    ? 'bg-white text-[#0F2744] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section A: Analytical 8-Workstream Table */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-semibold text-[#0F2744]">
            01. Tabela Analítica: Criação (Desenvolvimento + Testes) vs. Implantação
          </h2>
          <p className="text-xs text-slate-500">
            Clique em uma linha para abrir provas técnicas e tradução executiva por IA
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3.5 px-4">Frente / Projeto Auditado</th>
                  <th className="py-3.5 px-3">Complexidade</th>
                  <th className="py-3.5 px-3 text-right">Horas Criação</th>
                  <th className="py-3.5 px-4 text-right">Valor Criação (Mercado)</th>
                  <th className="py-3.5 px-3 text-right">Horas Implant.</th>
                  <th className="py-3.5 px-4 text-right">Custo Implant.</th>
                  <th className="py-3.5 px-3 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredWorkstreams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      Nenhuma frente encontrada com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredWorkstreams.map((ws) => {
                    const isOpen = expandedId === ws.id;
                    return (
                      <React.Fragment key={ws.id}>
                        <tr
                          onClick={() => setExpandedId(isOpen ? null : ws.id)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-900">
                              <span className="font-mono text-xs text-slate-400 mr-2">{ws.index}.</span>
                              {ws.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {ws.category} · <span className="font-mono">{ws.repoTag}</span>
                            </p>
                          </td>
                          <td className={`py-3.5 px-3 text-xs whitespace-nowrap ${complexityLabelClass(ws.complexity)}`}>
                            {ws.complexity}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            {ws.creationHours.toLocaleString('pt-BR')} h
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#0F2744] whitespace-nowrap">
                            {formatBRL(ws.creationValue)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                            {ws.deploymentHours} h
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#B45309] font-medium whitespace-nowrap">
                            {formatBRL(ws.deploymentValue)}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              aria-label={isOpen ? 'Recolher detalhes' : 'Expandir detalhes'}
                              className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-slate-200/60 text-slate-600"
                            >
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr className="bg-slate-50/60">
                            <td colSpan={7} className="px-6 py-5 border-t border-slate-100">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-7 space-y-2.5">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Escopo Operacional & Prova Técnica Auditada
                                  </p>
                                  <p className="text-sm text-slate-800 leading-relaxed">{ws.summary}</p>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    <strong className="text-slate-800">Evidência de Engenharia:</strong>{' '}
                                    {ws.technicalProof}
                                  </p>
                                  {ws.deploymentNote && (
                                    <p className="text-xs text-[#B45309] font-medium">
                                      Observação de Implantação: {ws.deploymentNote}.
                                    </p>
                                  )}
                                </div>

                                <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-200 rounded-md p-4 space-y-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-[#0F2744]">
                                      Tradução Executiva para Diretoria (IA)
                                    </p>
                                    <button
                                      type="button"
                                      disabled={explainingId === ws.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuickExplain(ws.id, ws.name, `${ws.summary} ${ws.technicalProof}`);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0F2744] hover:bg-[#18365A] disabled:opacity-60 rounded transition-colors whitespace-nowrap cursor-pointer"
                                    >
                                      {explainingId === ws.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Sparkles className="w-3.5 h-3.5" />
                                      )}
                                      <span>
                                        {explanations[ws.id] ? 'Regerar Explicação' : 'Explicar p/ Sócios'}
                                      </span>
                                    </button>
                                  </div>

                                  {explainError[ws.id] && (
                                    <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2.5">
                                      {explainError[ws.id]}
                                    </p>
                                  )}

                                  {explanations[ws.id] ? (
                                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                      {explanations[ws.id]}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                      Gera uma explicação rápida em 3 pontos de negócio (dor resolvida, risco eliminado e custo externo evitado) via Gemini 3.1 Flash-Lite.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-sm">
                  <td className="py-4 px-4 text-[#0F2744]">
                    TOTAL CONSOLIDADO {filter !== 'Todas' || search ? '(FILTRADO)' : 'AUDITADO'}
                  </td>
                  <td className="py-4 px-3 text-xs text-slate-500">
                    {filteredWorkstreams.length} de {WORKSTREAMS.length} frentes
                  </td>
                  <td className="py-4 px-3 text-right font-mono tabular-nums text-[#0F2744]">
                    {totals.creationHours.toLocaleString('pt-BR')} h
                  </td>
                  <td className="py-4 px-4 text-right font-mono tabular-nums text-[#0F2744]">
                    {formatBRL(totals.creationValue)}
                  </td>
                  <td className="py-4 px-3 text-right font-mono tabular-nums text-[#B45309]">
                    {totals.deploymentHours.toLocaleString('pt-BR')} h
                  </td>
                  <td className="py-4 px-4 text-right font-mono tabular-nums text-[#B45309]">
                    {formatBRL(totals.deploymentValue)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Section B: 6-Block Complexity Matrix */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold text-[#0F2744]">
            02. Matriz de Complexidade por Bloco Tecnológico
          </h2>
          <p className="text-xs text-slate-500">
            Referência técnica: {AUDIT_METADATA.dossierTitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((mod) => (
            <article
              key={mod.id}
              className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-slate-500">{mod.repos}</span>
                  <span className={complexityLabelClass(mod.complexity)}>
                    {mod.complexity}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-semibold text-[#0F2744] leading-snug">
                  {mod.index}. {mod.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">{mod.justification}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <p className="text-xs text-slate-800">
                  <strong className="font-semibold text-[#0F2744]">Impacto de Negócio:</strong>{' '}
                  {mod.businessImpact}
                </p>

                <button
                  type="button"
                  disabled={explainingId === mod.id}
                  onClick={() => handleQuickExplain(mod.id, mod.name, `${mod.justification} ${mod.businessImpact}`)}
                  className="text-xs font-medium text-[#B45309] hover:text-[#92400E] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {explainingId === mod.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{explanations[mod.id] ? 'Atualizar resumo IA' : 'Explicar impacto p/ Diretoria'}</span>
                </button>

                {explanations[mod.id] && (
                  <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-3 whitespace-pre-line leading-relaxed">
                    {explanations[mod.id]}
                  </div>
                )}
                {explainError[mod.id] && (
                  <p className="text-xs text-red-700">{explainError[mod.id]}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
