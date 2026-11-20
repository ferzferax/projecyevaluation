import React, { useState } from 'react';
import { ArrowRight, Calculator, Presentation, ShieldCheck } from 'lucide-react';
import {
  AUDIT_METADATA,
  EDITORIAL_ASSETS,
  ENGINEERING_STORIES,
  SAAS_AVOIDED_ITEMS,
  TEAM_ROLES,
  calculateRoiMetrics,
  formatBRL,
  type RoiScenario,
} from '../data/valuationData';
import type { ActiveTab } from './TopBar';

interface ExecutiveReportViewProps {
  scenario: RoiScenario;
  onNavigate: (tab: ActiveTab) => void;
}

export const ExecutiveReportView: React.FC<ExecutiveReportViewProps> = ({
  scenario,
  onNavigate,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const metrics = calculateRoiMetrics(scenario);

  const phase1Roles = TEAM_ROLES.filter((r) => r.phase === 'Fase 1');
  const phase2Roles = TEAM_ROLES.filter((r) => r.phase === 'Fase 2');

  const markImgError = (id: string) =>
    setImgErrors((prev) => ({ ...prev, [id]: true }));

  const heroAsset = EDITORIAL_ASSETS[0];
  const infraAsset = EDITORIAL_ASSETS[1];
  const fleetAsset = EDITORIAL_ASSETS[2];

  const hardwareBarPct = Math.max(3, Math.min(100, (scenario.hardwareInvestment / metrics.capexAvoided) * 100));
  const opexBarPct = Math.max(8, Math.min(100, (scenario.annualOperationalGain / metrics.capexAvoided) * 100));

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-16">
      {/* 1. Editorial Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-medium tracking-wider uppercase text-slate-500">
              {AUDIT_METADATA.company} · Dossiê Mestre (361 págs.) · Parecer Executivo
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.12] tracking-tight text-[#0F2744]">
              Laudo Executivo de Valuation Tecnológico e Auditoria de Engenharia
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Avaliação independente do ecossistema proprietário desenvolvido internamente por{' '}
              <strong className="font-semibold text-slate-900">{AUDIT_METADATA.leadEngineer}</strong>{' '}
              — integrando ERP/TMS satélite, Torre de Controle com IA, Compliance CAP Castrol e
              arquitetura de cibersegurança corporativa para decisão da diretoria ({AUDIT_METADATA.partners.join(', ')}).
            </p>
          </div>

          <div className="border-y border-slate-200 py-5">
            <p className="font-serif italic text-lg text-[#0F2744] leading-snug">
              “O que foi construído internamente na ALL-IN Logística não é um conjunto de planilhas
              ou scripts de suporte. Trata-se de um ativo intangível de nível consultoria Big Four
              com 90% do esforço mais caro já superado.”
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('roi')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#0F2744] hover:bg-[#18365A] rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Calculator className="w-4 h-4" aria-hidden="true" />
              <span>Abrir Simulador de ROI</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('studio')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#0F2744] bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              <Presentation className="w-4 h-4" aria-hidden="true" />
              <span>Revisar Deck Google Slides</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('audit')}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-[#0F2744] transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Ver 8 Frentes Auditadas</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <figure className="lg:col-span-5 flex flex-col">
          <div className="relative flex-1 min-h-[280px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            {!imgErrors[heroAsset.id] ? (
              <img
                src={heroAsset.url}
                alt={heroAsset.title}
                referrerPolicy="no-referrer"
                onError={() => markImgError(heroAsset.id)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#0F2744] to-[#1E3A5F] text-white text-center">
                <ShieldCheck className="w-10 h-10 text-amber-400 mb-3" />
                <p className="font-serif text-lg">{heroAsset.title}</p>
              </div>
            )}
          </div>
          <figcaption className="mt-2.5 text-xs font-serif italic text-slate-500">
            Fig. 1 — Torre de Controle Operacional e Governança Tecnológica ALL-IN Logística. Nota
            de Engenharia Auditada: {AUDIT_METADATA.qualityScore}.
          </figcaption>
        </figure>
      </section>

      {/* 2. Full-Width 4-Column Executive KPI Strip */}
      <section
        aria-label="Indicadores-chave do Valuation"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-slate-200 bg-white rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200"
      >
        <div className="p-6 space-y-1.5">
          <p className="text-xs font-medium text-slate-500">Patrimônio Construído (CAPEX)</p>
          <p className="font-mono tabular-nums text-2xl lg:text-3xl font-semibold text-[#0F2744]">
            {formatBRL(metrics.capexAvoided)}
          </p>
          <p className="text-xs text-slate-500">
            Faixa de mercado: {AUDIT_METADATA.phase1MarketRange}
          </p>
        </div>

        <div className="p-6 space-y-1.5">
          <p className="text-xs font-medium text-slate-500">Esforço Humano Equivalente</p>
          <p className="font-mono tabular-nums text-2xl lg:text-3xl font-semibold text-[#0F2744]">
            4.280 h
          </p>
          <p className="text-xs text-slate-500">
            9 especialistas (6–8 meses) · 90% concluído
          </p>
        </div>

        <div className="p-6 space-y-1.5">
          <p className="text-xs font-medium text-slate-500">Hardware para Destravar 24/7</p>
          <p className="font-mono tabular-nums text-2xl lg:text-3xl font-semibold text-[#B45309]">
            {formatBRL(scenario.hardwareInvestment)}
          </p>
          <p className="text-xs text-slate-500">
            Apenas {metrics.hardwarePctOfAsset.toFixed(1)}% do ativo · Payback ~{metrics.hardwarePaybackDays} dias
          </p>
        </div>

        <div className="p-6 space-y-1.5">
          <p className="text-xs font-medium text-slate-500">Mensalidades SaaS Evitadas</p>
          <p className="font-mono tabular-nums text-2xl lg:text-3xl font-semibold text-emerald-700">
            {formatBRL(metrics.monthlySaasAvoided)}/mês
          </p>
          <p className="text-xs text-slate-500">
            {formatBRL(metrics.annualSaasAvoided)} / ano em licenças e BPO
          </p>
        </div>
      </section>

      {/* 3. Balance Sheet Visual Comparison */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">01. Balanço Patrimonial da Transformação Digital</p>
            <h2 className="font-serif text-2xl font-semibold text-[#0F2744]">
              Patrimônio Construído vs. Investimento para Entrar em Produção
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Diretoria: Ney, Eduardo e Fábio · Base 2026
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-slate-900">
                1. Patrimônio Intelectual Já Construído Internamente (CAPEX Evitado)
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#0F2744]">
                {formatBRL(metrics.capexAvoided)}
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-sm overflow-hidden">
              <div className="h-full bg-[#0F2744] rounded-sm" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-slate-500">
              4.280 horas de engenharia, código proprietário, 32 manuais operacionais e governança CAP Castrol (98,4%) já prontos em casa.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-slate-900">
                2. Investimento de Hardware para Operação 24/7 (Servidor + UniFi + Nobreak)
              </span>
              <span className="font-mono tabular-nums font-semibold text-[#B45309]">
                {formatBRL(scenario.hardwareInvestment)} ({metrics.hardwarePctOfAsset.toFixed(1)}%)
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-sm overflow-hidden">
              <div
                className="h-full bg-[#B45309] rounded-sm transition-all duration-200"
                style={{ width: `${hardwareBarPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Faixa auditada de R$ 13.500 a R$ 17.500 — menos de 2,2% do valor dos sistemas criados.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="font-medium text-slate-900">
                3. Economia Direta Anual Gerada Após Produção (OPEX Recuperado)
              </span>
              <span className="font-mono tabular-nums font-semibold text-emerald-700">
                {formatBRL(scenario.annualOperationalGain)} / ano
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-sm overflow-hidden">
              <div
                className="h-full bg-emerald-700 rounded-sm transition-all duration-200"
                style={{ width: `${opexBarPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Corte de horas extras/jornada, +120h/mês poupadas de RH/gestão, prevenção de multas ANTT/INMETRO/IBAMA e redução de 82% de manutenção corretiva.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Phase 1 vs Phase 2 Structural Comparison */}
      <section className="space-y-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">02. Diferenciação Estrutural</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2744]">
            Por que Criar do Zero é 9x Mais Caro que Implantar o Projeto Pronto
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="bg-white border border-slate-200 rounded-lg p-6 lg:p-7 space-y-4">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-medium text-[#0F2744]">Fase 1 · 90% do Esforço · Já Executado</p>
                <h3 className="font-serif text-xl font-semibold text-slate-900 mt-1">
                  Criação do Zero (P&D, Código e Testes)
                </h3>
              </div>
              <span className="font-mono tabular-nums text-sm font-semibold text-[#0F2744]">
                4.280 h
              </span>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
              <li>• Entender regras fiscais, trabalhistas (Lei 13.103), ANTT, Pamcard e rotinas da transportadora.</li>
              <li>• Codificar milhares de linhas em SQL, Python, Node.js, React e C# (.NET) com IA e RPA.</li>
              <li>• Resolver falhas invisíveis de produção: ECONNRESET na Locaweb, IDs nulos SQLite, bloqueio BIOS/TLS e óptica de câmeras LPR.</li>
              <li>• Testar, refatorar e consolidar 361 páginas de governança + 32 manuais operacionais.</li>
            </ul>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Equipe externa necessária: 8 a 10 especialistas (6–8 meses)</span>
              <span className="font-mono tabular-nums font-semibold text-[#0F2744]">
                {formatBRL(metrics.capexAvoided)}
              </span>
            </div>
          </article>

          <article className="bg-white border border-slate-200 rounded-lg p-6 lg:p-7 space-y-4">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-medium text-[#B45309]">Fase 2 · 10% do Esforço · Rollout Linear</p>
                <h3 className="font-serif text-xl font-semibold text-slate-900 mt-1">
                  Implantação com o Projeto Já Pronto
                </h3>
              </div>
              <span className="font-mono tabular-nums text-sm font-semibold text-[#B45309]">
                460 h
              </span>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed">
              <li>• Montar o Servidor Central com Nobreak e instalar o Firewall UniFi + Switch PoE.</li>
              <li>• Subir os containers Docker já escritos e configurar as 4 VLANs isoladas com Load Balance.</li>
              <li>• Realizar carga inicial do passivo documental (ASOs, contratos, CRLVs e OS antigas).</li>
              <li>• Fixar TVs do Video Wall, treinar a equipe nos 32 manuais prontos e rodar o Pentest final.</li>
            </ul>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Equipe necessária: 3 a 4 profissionais (4–6 semanas)</span>
              <span className="font-mono tabular-nums font-semibold text-[#B45309]">
                {formatBRL(scenario.deploymentLabor)}
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* 5. Engineering Proofs & Editorial Imagery */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">03. Evidências Reais Extraídas dos Logs</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#0F2744]">
              Aderência Cirúrgica à Dor Operacional da ALL-IN
            </h2>
          </div>
          <p className="text-sm font-mono tabular-nums text-slate-600">
            Nota de Engenharia: {AUDIT_METADATA.qualityScore} · CAP Castrol: 98,4%
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ENGINEERING_STORIES.map((story) => (
              <article
                key={story.id}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">{story.domain}</p>
                  <h3 className="font-serif text-base font-semibold text-[#0F2744]">
                    {story.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{story.challenge}</p>
                  <p className="text-xs text-slate-800 leading-relaxed">{story.solution}</p>
                </div>
                <p className="pt-2.5 border-t border-slate-100 text-xs font-medium text-[#B45309]">
                  Resultado: {story.impact}
                </p>
              </article>
            ))}
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <figure className="flex-1 flex flex-col">
              <div className="relative flex-1 min-h-[190px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                {!imgErrors[fleetAsset.id] ? (
                  <img
                    src={fleetAsset.url}
                    alt={fleetAsset.title}
                    referrerPolicy="no-referrer"
                    onError={() => markImgError(fleetAsset.id)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0F2744] text-white flex items-center justify-center p-4 text-sm">
                    {fleetAsset.title}
                  </div>
                )}
              </div>
              <figcaption className="mt-1.5 text-xs font-serif italic text-slate-500">
                Fig. 2 — Frota auditada (28 veículos próprios + agregados) e conformidade CAP Castrol 98,4%.
              </figcaption>
            </figure>

            <figure className="flex-1 flex flex-col">
              <div className="relative flex-1 min-h-[190px] rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                {!imgErrors[infraAsset.id] ? (
                  <img
                    src={infraAsset.url}
                    alt={infraAsset.title}
                    referrerPolicy="no-referrer"
                    onError={() => markImgError(infraAsset.id)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#0F2744] text-white flex items-center justify-center p-4 text-sm">
                    {infraAsset.title}
                  </div>
                )}
              </div>
              <figcaption className="mt-1.5 text-xs font-serif italic text-slate-500">
                Fig. 3 — Arquitetura centralizada de servidor, 4 VLANs UniFi e proteção contra EternalBlue.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 6. External Team Sizing & Monthly SaaS Avoided */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-medium text-slate-500">04. Dimensionamento de Equipe Equivalente</p>
            <h2 className="font-serif text-2xl font-semibold text-[#0F2744] mt-1">
              9 Especialistas (Fase 1) vs. 3–4 Profissionais (Fase 2)
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                Fase 1 · Equipe Externa Equivalente (6 a 8 meses)
              </h3>
              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {phase1Roles.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-start gap-4 text-sm">
                    <span className="font-mono tabular-nums font-semibold text-[#0F2744] w-10 shrink-0">
                      {r.headcount}x
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{r.role}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{r.responsibility}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#B45309] mb-2.5">
                Fase 2 · Equipe de Implantação Hoje (4 a 6 semanas)
              </h3>
              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {phase2Roles.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-start gap-4 text-sm">
                    <span className="font-mono tabular-nums font-semibold text-[#B45309] w-10 shrink-0">
                      {r.headcount}x
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{r.role}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{r.responsibility}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-medium text-slate-500">05. Aluguel SaaS / BPO Evitado</p>
              <h2 className="font-serif text-2xl font-semibold text-[#0F2744] mt-1">
                Custo Recorrente Poupado
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Comparativo de licenças de mercado para 28 veículos próprios, agregados e 33 dispositivos.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {SAAS_AVOIDED_ITEMS.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.scope}</p>
                  </div>
                  <span className="font-mono tabular-nums text-sm font-semibold text-slate-900 whitespace-nowrap">
                    {formatBRL(item.monthlyCost)}/mês
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-[#0F2744]">Total Recorrente Evitado</span>
              <span className="font-mono tabular-nums text-lg font-semibold text-emerald-700">
                R$ 17.000/mês · R$ 204.000/ano
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('roi')}
              className="w-full py-2.5 px-4 text-sm font-medium text-[#0F2744] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              Personalizar itens no Simulador de ROI
            </button>
          </div>
        </div>
      </section>

      {/* 7. Final Auditor Verdict */}
      <section className="bg-[#0F2744] text-white rounded-lg p-7 lg:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-5">
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-amber-300">
              06. Veredito Final do Auditor
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white mt-1">
              Decisão Recomendada à Diretoria
            </h2>
          </div>
          <span className="font-mono tabular-nums text-sm text-amber-300">
            Payback Estimado: &lt; 60 dias
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm leading-relaxed text-slate-200">
          <div className="space-y-2">
            <h3 className="font-serif text-base font-semibold text-white">
              1. Patrimônio Já Pertence à ALL-IN
            </h3>
            <p>
              O ecossistema construído por Fernando Lodo representa um ativo intangível de{' '}
              <strong className="text-white">R$ 775.800</strong>. Isoladamente, o Dossiê Executivo de
              361 páginas custaria entre <strong className="text-white">R$ 25.000 e R$ 40.000</strong>{' '}
              em consultoria empresarial.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-base font-semibold text-white">
              2. Custo-Benefício do Destravamento
            </h3>
            <p>
              Com mais de 90% da etapa mais difícil pronta, travar a entrada em produção 24/7 por
              falta do Servidor Central (~R$ 8.700 com Nobreak), Firewall UniFi (R$ 3.900–R$ 8.600),
              senhas de domínio e apoio de digitação inicial é contrassenso econômico.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif text-base font-semibold text-white">
              3. Retorno e Blindagem Imediata
            </h3>
            <p>
              O investimento físico se paga em menos de 60 dias apenas com a economia de 5–6 dias/mês
              no fechamento de ponto, prevenção de retenções rodoviárias (como as 11h na PF do
              caminhão FFW6161) e proteção contra Ransomware (EternalBlue).
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('advisor')}
            className="px-4 py-2.5 text-sm font-medium bg-amber-600 hover:bg-amber-500 text-white rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            Consultar Auditor IA (Pensamento Profundo)
          </button>
          <button
            type="button"
            onClick={() => onNavigate('studio')}
            className="px-4 py-2.5 text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md transition-colors cursor-pointer whitespace-nowrap"
          >
            Gerar Apresentação no Google Slides
          </button>
        </div>
      </section>
    </div>
  );
};
