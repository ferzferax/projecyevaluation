import React, { useState } from 'react';
import { Brain, Check, Loader2, PlusCircle, Send, Sparkles } from 'lucide-react';
import {
  calculateRoiMetrics,
  formatBRL,
  type RoiScenario,
  type SlideDraft,
} from '../data/valuationData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinkingLevel?: 'HIGH' | 'MEDIUM';
  convertedToSlide?: boolean;
}

interface BoardAdvisorViewProps {
  scenario: RoiScenario;
  onAddSlideFromAdvisor: (slide: Omit<SlideDraft, 'id' | 'order' | 'included'>) => void;
}

const PARTNER_PROMPTS = [
  {
    label: 'Custo de adiar o servidor em 6 meses',
    prompt:
      'Faça uma análise de estresse financeiro para os sócios (Ney, Eduardo e Fábio): quanto a ALL-IN perde em OPEX, risco trabalhista (Lei 13.103), risco rodoviário (INMETRO/PF) e exposição ao EternalBlue se adiar a compra do Servidor Central e Firewall UniFi por 6 meses?',
    deep: true,
  },
  {
    label: 'Defender valuation de R$ 775 mil',
    prompt:
      'Como defender tecnicamente e financeiramente o valuation de R$ 775.800 (4.280 horas) caso um dos sócios questione se não seria mais barato contratar uma software house ou assinar ferramentas SaaS prontas?',
    deep: true,
  },
  {
    label: 'Plano de ação de 6 semanas para a diretoria',
    prompt:
      'Monte um roteiro objetivo semana a semana (semanas 1 a 6) com as decisões exatas que Ney, Eduardo e Fábio precisam liberar hoje para destravar a Fase 2 de Implantação.',
    deep: false,
  },
  {
    label: 'Impacto comercial do CAP Castrol 98,4%',
    prompt:
      'Explique como a nota 98,4% (252 pontos / Faixa Excelente) no CAP Castrol e os 32 manuais do TMS ESL protegem contratos de grandes embarcadores como Castrol e Audi e fortalecem a margem da ALL-IN.',
    deep: false,
  },
];

export const BoardAdvisorView: React.FC<BoardAdvisorViewProps> = ({
  scenario,
  onAddSlideFromAdvisor,
}) => {
  const [deepThinking, setDeepThinking] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Estou pronto para apoiar a reunião de diretoria da ALL-IN Logística com base integral no Dossiê Mestre (361 páginas), nas 8 frentes auditadas (R$ 775.800 / 4.280h) e nos parâmetros ativos no Simulador de ROI.\n\nAtive o Modo Pensamento Profundo para análises complexas de risco, payback e defesa de valuation — ou selecione uma pergunta estratégica ao lado.',
      thinkingLevel: 'MEDIUM',
    },
  ]);

  const metrics = calculateRoiMetrics(scenario);
  const scenarioSummary = `CAPEX Evitado: ${formatBRL(metrics.capexAvoided)} (taxa R$ ${Math.round(scenario.hourlyRate)}/h) | Hardware 24/7: ${formatBRL(scenario.hardwareInvestment)} (${metrics.hardwarePctOfAsset.toFixed(1)}% do ativo) | Payback Hardware: ${metrics.hardwarePaybackDays} dias | Economia SaaS: ${formatBRL(metrics.monthlySaasAvoided)}/mês (${formatBRL(metrics.annualSaasAvoided)}/ano) | OPEX Anual: ${formatBRL(scenario.annualOperationalGain)} | Valor Líquido 36m: ${formatBRL(metrics.threeYearNetValue)}.`;

  const sendQuestion = async (questionText: string, forceDeep?: boolean) => {
    const trimmed = questionText.trim();
    if (!trimmed || loading) return;

    const useDeep = forceDeep ?? deepThinking;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          history: nextMessages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
          deepThinking: useDeep,
          scenarioSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao consultar o Consultor de Diretoria.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          thinkingLevel: data.thinkingLevel,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o serviço de IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToSlide = async (msg: Message) => {
    setConvertingId(msg.id);
    setError(null);
    try {
      const res = await fetch('/api/gemini/refine-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: `Transforme esta análise executiva em um slide adicional de alto impacto para o deck dos sócios:\n\n${msg.content}`,
          scenarioSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível criar o slide.');
      }
      onAddSlideFromAdvisor({
        layoutType: 'narrative',
        title: data.slide.title || 'Análise Adicional da Diretoria',
        subtitle: data.slide.subtitle || 'Aprofundamento técnico-financeiro do Laudo ALL-IN',
        highlightMetric: data.slide.highlightMetric,
        bullets: Array.isArray(data.slide.bullets) ? data.slide.bullets : [],
        speakerNotes: data.slide.speakerNotes || '',
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, convertedToSlide: true } : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao transformar resposta em slide.');
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">
            Inteligência Gemini 4 Hydrogen · Contextualizado com Dossiê de 361 Páginas + Simulador Ativo
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#0F2744]">
            Consultor de Diretoria e Raciocínio Profundo
          </h1>
        </div>

        {/* Thinking Level Segmented Control */}
        <div
          role="group"
          aria-label="Modo de raciocínio da IA"
          className="inline-flex items-center p-1 bg-slate-100 rounded-md self-start lg:self-auto"
        >
          <button
            type="button"
            onClick={() => setDeepThinking(false)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              !deepThinking
                ? 'bg-white text-[#0F2744] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Modo Executivo</span>
          </button>
          <button
            type="button"
            onClick={() => setDeepThinking(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              deepThinking
                ? 'bg-[#0F2744] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Pensamento Profundo (High)</span>
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Active Context + Quick Partner Questions */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h2 className="font-serif text-base font-semibold text-[#0F2744]">
              Cenário Conectado ao Consultor
            </h2>
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between gap-2">
                <dt className="text-slate-500">CAPEX Auditado</dt>
                <dd className="font-mono tabular-nums font-semibold text-[#0F2744]">
                  {formatBRL(metrics.capexAvoided)}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-2">
                <dt className="text-slate-500">Hardware 24/7</dt>
                <dd className="font-mono tabular-nums font-semibold text-[#B45309]">
                  {formatBRL(scenario.hardwareInvestment)}
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-2">
                <dt className="text-slate-500">Payback Hardware</dt>
                <dd className="font-mono tabular-nums font-semibold text-emerald-700">
                  {metrics.hardwarePaybackDays} dias
                </dd>
              </div>
              <div className="py-2 flex justify-between gap-2">
                <dt className="text-slate-500">SaaS Evitado / Ano</dt>
                <dd className="font-mono tabular-nums font-semibold text-slate-900">
                  {formatBRL(metrics.annualSaasAvoided)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h2 className="font-serif text-base font-semibold text-[#0F2744]">
              Perguntas Típicas de Sócios
            </h2>
            <div className="space-y-2">
              {PARTNER_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setDeepThinking(item.deep);
                    sendQuestion(item.prompt, item.deep);
                  }}
                  className="w-full text-left p-3 rounded-md border border-slate-200 hover:border-[#0F2744] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <p className="text-xs font-semibold text-[#0F2744]">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {item.deep ? 'Pensamento Profundo · Stress-Test' : 'Análise Executiva Rápida'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Conversation Canvas */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-lg flex flex-col min-h-[580px]">
          <div className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[600px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-lg p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#0F2744] text-white'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 text-[11px]">
                    <span
                      className={
                        msg.role === 'user'
                          ? 'text-amber-300 font-medium'
                          : 'text-slate-500 font-medium'
                      }
                    >
                      {msg.role === 'user'
                        ? 'Diretoria ALL-IN'
                        : msg.thinkingLevel === 'HIGH'
                          ? 'Auditor IA · Pensamento Profundo (High)'
                          : 'Auditor IA · Modo Executivo'}
                    </span>
                  </div>

                  <div className="whitespace-pre-line">{msg.content}</div>

                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end">
                      <button
                        type="button"
                        disabled={convertingId === msg.id || msg.convertedToSlide}
                        onClick={() => handleConvertToSlide(msg)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F2744] hover:text-[#B45309] disabled:opacity-60 cursor-pointer"
                      >
                        {convertingId === msg.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : msg.convertedToSlide ? (
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <PlusCircle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {msg.convertedToSlide
                            ? 'Adicionado ao Deck Google Slides'
                            : 'Transformar resposta em Slide no Deck'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-[85%] flex items-center gap-3 text-sm text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-[#0F2744] shrink-0" />
                <span>
                  {deepThinking
                    ? 'Executando raciocínio profundo sobre o Dossiê ALL-IN e premissas financeiras...'
                    : 'Elaborando resposta executiva...'}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-6 mb-3 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuestion(input);
            }}
            className="border-t border-slate-200 p-4 flex items-center gap-3 bg-white rounded-b-lg"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre valuation, payback, riscos ANTT/PF, equipe ou cronograma..."
              aria-label="Pergunta para o Consultor de Diretoria"
              className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:bg-white focus:border-[#0F2744]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0F2744] hover:bg-[#18365A] disabled:opacity-50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
