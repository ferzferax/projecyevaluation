import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Check, RefreshCw, RotateCcw } from 'lucide-react';
import {
  AUDIT_METADATA,
  DEFAULT_ROI_SCENARIO,
  SAAS_AVOIDED_ITEMS,
  calculateRoiMetrics,
  formatBRL,
  type RoiScenario,
} from '../data/valuationData';

interface RoiSimulatorViewProps {
  scenario: RoiScenario;
  onChangeScenario: (next: RoiScenario) => void;
  onSyncDeck: () => void;
  deckSyncedMessage: string | null;
}

export const RoiSimulatorView: React.FC<RoiSimulatorViewProps> = ({
  scenario,
  onChangeScenario,
  onSyncDeck,
  deckSyncedMessage,
}) => {
  const metrics = calculateRoiMetrics(scenario);

  const toggleSaas = (id: string) => {
    const exists = scenario.enabledSaasIds.includes(id);
    const nextIds = exists
      ? scenario.enabledSaasIds.filter((item) => item !== id)
      : [...scenario.enabledSaasIds, id];
    onChangeScenario({ ...scenario, enabledSaasIds: nextIds });
  };

  const comparisonBarData = [
    {
      name: 'CAPEX Construído',
      valor: metrics.capexAvoided,
    },
    {
      name: 'Economia 36m',
      valor: metrics.threeYearNetValue,
    },
    {
      name: 'OPEX / Ano',
      valor: scenario.annualOperationalGain,
    },
    {
      name: 'SaaS / Ano',
      valor: metrics.annualSaasAvoided,
    },
    {
      name: 'Hardware 24/7',
      valor: scenario.hardwareInvestment,
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">
            Simulação Financeira em Tempo Real · Reunião de Sócios (Ney, Eduardo e Fábio)
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#0F2744]">
            Simulador Dinâmico de ROI, Payback e Economia SaaS
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onChangeScenario(DEFAULT_ROI_SCENARIO)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão do Laudo</span>
          </button>

          <button
            type="button"
            onClick={onSyncDeck}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#0F2744] hover:bg-[#18365A] rounded-md transition-colors whitespace-nowrap cursor-pointer"
          >
            {deckSyncedMessage ? (
              <Check className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{deckSyncedMessage || 'Aplicar Cenário ao Deck Google Slides'}</span>
          </button>
        </div>
      </div>

      {/* Live 4-KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-5 space-y-1">
          <p className="text-xs text-slate-500">Valuation CAPEX (4.280 h)</p>
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#0F2744]">
            {formatBRL(metrics.capexAvoided)}
          </p>
          <p className="text-xs text-slate-500">
            Hora técnica: R$ {scenario.hourlyRate.toFixed(0)}/h
          </p>
        </div>

        <div className="p-5 space-y-1">
          <p className="text-xs text-slate-500">Payback do Hardware</p>
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#B45309]">
            {metrics.hardwarePaybackDays} dias
          </p>
          <p className="text-xs text-slate-500">
            Hardware equivale a {metrics.hardwarePctOfAsset.toFixed(1)}% do ativo
          </p>
        </div>

        <div className="p-5 space-y-1">
          <p className="text-xs text-slate-500">Economia SaaS Evitada</p>
          <p className="font-mono tabular-nums text-2xl font-semibold text-emerald-700">
            {formatBRL(metrics.annualSaasAvoided)}/ano
          </p>
          <p className="text-xs text-slate-500">
            {formatBRL(metrics.monthlySaasAvoided)}/mês ({scenario.enabledSaasIds.length} módulos)
          </p>
        </div>

        <div className="p-5 space-y-1">
          <p className="text-xs text-slate-500">Valor Líquido Acumulado (36m)</p>
          <p className="font-mono tabular-nums text-2xl font-semibold text-[#0F2744]">
            {formatBRL(metrics.threeYearNetValue)}
          </p>
          <p className="text-xs text-slate-500">
            Payback total c/ mão de obra: {metrics.fullRolloutPaybackMonths} meses
          </p>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <h2 className="font-serif text-lg font-semibold text-[#0F2744] border-b border-slate-200 pb-3">
              Premissas de Valuation e Investimento
            </h2>

            {/* Hourly Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="hourly-rate" className="font-medium text-slate-800">
                  Taxa Hora de Mercado (Software House)
                </label>
                <span className="font-mono tabular-nums font-semibold text-[#0F2744]">
                  R$ {Math.round(scenario.hourlyRate)}/h
                </span>
              </div>
              <input
                id="hourly-rate"
                type="range"
                min={140}
                max={280}
                step={5}
                value={Math.round(scenario.hourlyRate)}
                onChange={(e) =>
                  onChangeScenario({ ...scenario, hourlyRate: Number(e.target.value) })
                }
                className="w-full editorial-range"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>R$ 140/h (Conservador)</span>
                <span>R$ 181/h (Laudo)</span>
                <span>R$ 280/h (Consultoria)</span>
              </div>
            </div>

            {/* Hardware Investment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="hardware-capex" className="font-medium text-slate-800">
                  Pacote Hardware (Servidor + UniFi + Nobreak)
                </label>
                <span className="font-mono tabular-nums font-semibold text-[#B45309]">
                  {formatBRL(scenario.hardwareInvestment)}
                </span>
              </div>
              <input
                id="hardware-capex"
                type="range"
                min={12000}
                max={30000}
                step={500}
                value={scenario.hardwareInvestment}
                onChange={(e) =>
                  onChangeScenario({ ...scenario, hardwareInvestment: Number(e.target.value) })
                }
                className="w-full editorial-range"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>R$ 12.000</span>
                <span>R$ 15.500 (Laudo)</span>
                <span>R$ 30.000</span>
              </div>
            </div>

            {/* Annual Operational Gain */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="opex-gain" className="font-medium text-slate-800">
                  OPEX Direto Recuperado / Ano
                </label>
                <span className="font-mono tabular-nums font-semibold text-emerald-700">
                  {formatBRL(scenario.annualOperationalGain)}
                </span>
              </div>
              <input
                id="opex-gain"
                type="range"
                min={120000}
                max={300000}
                step={10000}
                value={scenario.annualOperationalGain}
                onChange={(e) =>
                  onChangeScenario({ ...scenario, annualOperationalGain: Number(e.target.value) })
                }
                className="w-full editorial-range"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>R$ 120k</span>
                <span>R$ 210k (Laudo)</span>
                <span>R$ 300k</span>
              </div>
            </div>

            {/* Risk Avoidance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="risk-avoided" className="font-medium text-slate-800">
                  Risco Evitado / Ano (PF, ANTT, Ransomware)
                </label>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {formatBRL(scenario.riskEventsAvoidedCost)}
                </span>
              </div>
              <input
                id="risk-avoided"
                type="range"
                min={0}
                max={120000}
                step={5000}
                value={scenario.riskEventsAvoidedCost}
                onChange={(e) =>
                  onChangeScenario({ ...scenario, riskEventsAvoidedCost: Number(e.target.value) })
                }
                className="w-full editorial-range"
              />
              <p className="text-xs text-slate-500">
                Estimativa conservadora de multas de tacógrafo, retenções rodoviárias e parada por ataque cibernético.
              </p>
            </div>
          </section>

          {/* SaaS Toggles */}
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-baseline justify-between border-b border-slate-200 pb-3">
              <h2 className="font-serif text-lg font-semibold text-[#0F2744]">
                Licenças SaaS / BPO Evitadas
              </h2>
              <span className="font-mono tabular-nums text-sm font-semibold text-emerald-700">
                {formatBRL(metrics.monthlySaasAvoided)}/mês
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {SAAS_AVOIDED_ITEMS.map((item) => {
                const checked = scenario.enabledSaasIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="py-3 flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSaas(item.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0F2744] cursor-pointer"
                      />
                      <div>
                        <p className={`text-sm font-medium ${checked ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">{item.scope}</p>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums text-xs font-semibold text-slate-700 whitespace-nowrap pt-0.5">
                      {formatBRL(item.monthlyCost)}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Charts Column */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="font-serif text-lg font-semibold text-[#0F2744]">
                  Projeção de Economia Acumulada (36 Meses)
                </h2>
                <p className="text-xs text-slate-500">
                  Saldo líquido acumulado (OPEX recuperado menos hardware) vs. mensalidades SaaS poupadas
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">Valores em R$</span>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.cashflowProjection}
                  margin={{ top: 10, right: 16, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis
                    tickFormatter={(v) => formatBRL(Number(v), true)}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    width={78}
                  />
                  <Tooltip
                    formatter={(value) => formatBRL(Number(value ?? 0))}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="saldoLiquido"
                    name="Saldo Líquido (c/ Hardware)"
                    stroke="#0F2744"
                    fill="#0F2744"
                    fillOpacity={0.12}
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="economiaSaas"
                    name="SaaS Evitado Acumulado"
                    stroke="#B45309"
                    fill="#B45309"
                    fillOpacity={0.08}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="font-serif text-lg font-semibold text-[#0F2744]">
                  Comparativo Estrutural de Grandezas Financeiras
                </h2>
                <p className="text-xs text-slate-500">
                  Evidencia visualmente a proporção entre o patrimônio construído ({AUDIT_METADATA.totalCreationHours.toLocaleString('pt-BR')} h) e o custo físico de destravamento
                </p>
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonBarData}
                  margin={{ top: 10, right: 16, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis
                    tickFormatter={(v) => formatBRL(Number(v), true)}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    width={78}
                  />
                  <Tooltip
                    formatter={(value) => formatBRL(Number(value ?? 0))}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="valor" name="Valor Auditado / Simulado" fill="#0F2744" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <span>
                Relação Hardware / Patrimônio:{' '}
                <strong className="font-mono text-[#B45309]">
                  {metrics.hardwarePctOfAsset.toFixed(2)}%
                </strong>
              </span>
              <span>
                Economia líquida no 1º ano (SaaS + Riscos):{' '}
                <strong className="font-mono text-emerald-700">
                  {formatBRL(metrics.totalEconomicBenefitYear1 - scenario.hardwareInvestment)}
                </strong>
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
