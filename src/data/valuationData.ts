export type ComplexityLevel = 'Muito Alta' | 'Alta' | 'Média-Alta';

export interface WorkstreamItem {
  id: string;
  index: string;
  name: string;
  repoTag: string;
  category: string;
  complexity: ComplexityLevel;
  creationHours: number;
  creationValue: number;
  deploymentHours: number;
  deploymentValue: number;
  deploymentNote?: string;
  summary: string;
  technicalProof: string;
}

export interface ComplexityModule {
  id: string;
  index: string;
  name: string;
  repos: string;
  complexity: ComplexityLevel;
  justification: string;
  businessImpact: string;
}

export interface SaasAvoidedItem {
  id: string;
  name: string;
  scope: string;
  monthlyCost: number;
  defaultEnabled: boolean;
}

export interface TeamRole {
  id: string;
  phase: 'Fase 1' | 'Fase 2';
  headcount: string;
  role: string;
  responsibility: string;
}

export interface EngineeringBattleStory {
  id: string;
  title: string;
  domain: string;
  challenge: string;
  solution: string;
  impact: string;
}

export interface EditorialAsset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  url: string;
  aspectRatio: '16:9' | '4:3';
  defaultKpi: string;
}

export interface RoiScenario {
  hourlyRate: number; // Default ~181.26 (R$ 775.800 / 4.280h)
  hardwareInvestment: number; // Default R$ 15.500 (intervalo R$ 13.500 - R$ 17.500)
  deploymentLabor: number; // Default R$ 52.200
  enabledSaasIds: string[];
  annualOperationalGain: number; // Default R$ 210.000 (intervalo R$ 180k - R$ 240k)
  riskEventsAvoidedCost: number; // Default R$ 35.000/ano (multas/retenções/ransomware)
}

export interface SlideDraft {
  id: string;
  order: number;
  layoutType: 'cover' | 'kpi' | 'comparison' | 'table' | 'narrative' | 'verdict';
  title: string;
  subtitle: string;
  highlightMetric?: string;
  bullets: string[];
  speakerNotes: string;
  included: boolean;
  attachedAssetId?: string;
}

export const EDITORIAL_ASSETS: EditorialAsset[] = [
  {
    id: 'asset-control-tower',
    title: 'Torre de Controle Operacional ALL-IN',
    subtitle: 'Video Wall reativo, monitoramento 24/7 e integração em tempo real com frota e agregados',
    category: 'Operações & Video Wall',
    url: '/src/assets/images/hero_control_tower_1795163849535.jpg',
    aspectRatio: '16:9',
    defaultKpi: 'R$ 775.800 em Patrimônio Tecnológico',
  },
  {
    id: 'asset-server-rack',
    title: 'Infraestrutura Central, VLANs e Blindagem UniFi',
    subtitle: 'Servidor dedicado, Nobreak, 4 VLANs isoladas e mitigação total de riscos críticos',
    category: 'Infraestrutura & Segurança',
    url: '/src/assets/images/infra_server_rack_1795163850010.jpg',
    aspectRatio: '4:3',
    defaultKpi: 'Hardware: < 2,2% do Ativo Criado',
  },
  {
    id: 'asset-fleet-audit',
    title: 'Frota Auditada, Compliance CAP Castrol e Manutenção',
    subtitle: '28 veículos próprios, agregados e conformidade 98,4% (Faixa Excelente)',
    category: 'Frota & QSMS',
    url: '/src/assets/images/fleet_compliance_audit_1795163852434.jpg',
    aspectRatio: '4:3',
    defaultKpi: 'Payback < 60 dias · CAP 98,4%',
  },
];

export const AUDIT_METADATA = {
  company: 'ALL-IN Logística e Transportes',
  object:
    'Ecossistema Tecnológico Proprietário, Automação Logística, IA Aplicada, Infraestrutura de Rede, Cibersegurança e Governança Regulatória',
  dossierTitle: 'Dossiê Executivo Mestre (361 páginas) e Repositórios Integrados',
  leadEngineer: 'Fernando Lodo',
  partners: ['Ney', 'Eduardo', 'Fábio'],
  qualityScore: '9,6 / 10',
  castrolScore: '98,4% (252 pts · Faixa Excelente)',
  dossierStandaloneRange: 'R$ 25.000 a R$ 40.000',
  phase1MarketRange: 'R$ 685.000 a R$ 940.000',
  phase2MarketRange: 'R$ 48.000 a R$ 72.000',
  hardwareRange: 'R$ 13.500 a R$ 17.500',
  opexRange: 'R$ 180.000 a R$ 240.000 / ano',
  totalCreationHours: 4280,
  totalCreationValue: 775800,
  totalDeploymentHours: 460,
  totalDeploymentValue: 52200,
};

export const WORKSTREAMS: WorkstreamItem[] = [
  {
    id: 'ws-1',
    index: '01',
    name: 'Hub Central, Video Wall Reativo, Listener IMAP XML e Proxy IA Multi-Modelo',
    repoTag: 'Projeto_VS_CODE',
    category: 'Torre de Controle',
    complexity: 'Muito Alta',
    creationHours: 780,
    creationValue: 140400,
    deploymentHours: 60,
    deploymentValue: 7200,
    summary:
      'Núcleo reativo de operação com alertas visuais ("pulsar": true), ingestão automatizada de XML via IMAP e roteamento inteligente de IA.',
    technicalProof:
      'Manipulação de sockets IMAP com cifras TLS legadas da Locaweb (DEFAULT@SECLEVEL=0), debounce de imagens, autenticação JWT e sincronização de estado em demanda_state.json.',
  },
  {
    id: 'ws-2',
    index: '02',
    name: 'Plataforma Unificada: Banco TimescaleDB, Motor Lei 13.103 e Modo Manutenção',
    repoTag: 'platform',
    category: 'Telemetria & Jornada',
    complexity: 'Muito Alta',
    creationHours: 920,
    creationValue: 184000,
    deploymentHours: 80,
    deploymentValue: 9600,
    summary:
      'Modelagem geoespacial e temporal para controle rigoroso da Lei do Motorista com trava automática vinculada às ordens de serviço de oficina.',
    technicalProof:
      'Séries temporais TimescaleDB + PostGIS, máquina de estados completa (direção contínua 5h30, interjornada 11h, espera 30%, hora noturna reduzida) e suspensão de alertas na GR durante Modo Manutenção.',
  },
  {
    id: 'ws-3',
    index: '03',
    name: 'Ecossistema de Agregados: Bot WhatsApp OCR, Portal Web, RPA ESL e Gerador CIOT',
    repoTag: 'Projeto_Cadastro · whatsapp_agent · GeradorCIOT',
    category: 'Agregados & RPA',
    complexity: 'Alta',
    creationHours: 840,
    creationValue: 159600,
    deploymentHours: 50,
    deploymentValue: 6000,
    summary:
      'Automação ponta a ponta de cadastro e homologação de agregados com extração de CNH/CRLV por visão computacional e emissão integrada de CIOT.',
    technicalProof:
      'Playwright preenchendo modais dinâmicos no TMS ESL Cloud, OCR multimodal, deploy Oracle Cloud / Hugging Face e integração .NET C# com WebService Pamcard 9.2 + seguro GEP.',
  },
  {
    id: 'ws-4',
    index: '04',
    name: 'Inteligência Fiscal: Agrupador CT-e (Castrol/Audi), Conector EDI DSV e Pré-Checklist ABM',
    repoTag: 'fiscal-edi',
    category: 'Fiscal & EDI',
    complexity: 'Alta',
    creationHours: 380,
    creationValue: 72200,
    deploymentHours: 40,
    deploymentValue: 4800,
    summary:
      'Elimina fragmentação de CT-e em operações críticas e automatiza intercâmbio eletrônico de arquivos fiscais e embarques.',
    technicalProof:
      'Regras fiscais específicas Castrol/Audi, conector padrão Proceda (NOTFIS, CONEMB, DOCCOB) e validações prévias de faturamento sem retrabalho manual.',
  },
  {
    id: 'ws-5',
    index: '05',
    name: 'Sistema Autônomo de Auditoria 80/20, Apps de Assinatura Digital e Dossiê 252 pts',
    repoTag: 'cap-castrol',
    category: 'Compliance & QSMS',
    complexity: 'Alta',
    creationHours: 460,
    creationValue: 73600,
    deploymentHours: 90,
    deploymentValue: 8100,
    deploymentNote: 'Inclui carga inicial de documentos',
    summary:
      'Estrutura de governança multinacional que levou a ALL-IN à nota 98,4% (Faixa Excelente) nos 5 blocos de auditoria Castrol/SASSMAQ.',
    technicalProof:
      'Conformidade normativa ANTT, IBAMA, NR-06, NR-20, NR-35, INMETRO e Smith System, combinada a aplicativos próprios de assinatura digital em Canvas.',
  },
  {
    id: 'ws-6',
    index: '06',
    name: 'Gestão de Manutenção de Frota, Auditoria de Áudios IA, Tacógrafos e AppSheet',
    repoTag: 'projeto-manutencao',
    category: 'Manutenção de Frota',
    complexity: 'Alta',
    creationHours: 320,
    creationValue: 48000,
    deploymentHours: 50,
    deploymentValue: 4500,
    deploymentNote: 'Inclui carga inicial de OS',
    summary:
      'Diagnóstico forense de manutenção preventiva/corretiva e controle de vencimento de certificados obrigatórios da frota.',
    technicalProof:
      'Transcrição automatizada de 53 áudios do WhatsApp via Faster-Whisper cruzada com 114 ordens de serviço e 15 certificados INMETRO, comprovando 82% de manutenção corretiva.',
  },
  {
    id: 'ws-7',
    index: '07',
    name: 'Agente RAG Regulatório, Fábrica de 32 Manuais TMS ESL e Academia de Videoaulas',
    repoTag: 'rag-logistica · Manuais',
    category: 'Conhecimento & RAG',
    complexity: 'Média-Alta',
    creationHours: 360,
    creationValue: 54000,
    deploymentHours: 30,
    deploymentValue: 3000,
    summary:
      'Base de conhecimento institucional vetorizada e linha de produção automática de documentação operacional de nível Big Four.',
    technicalProof:
      'ChromaDB com 1.638 documentos e 17.653 chunks + motor Python que extrai MHTML, aplica CSS corporativo, gera diagramas Mermaid e renderiza 32 PDFs via Edge Headless + grafo Anytype.',
  },
  {
    id: 'ws-8',
    index: '08',
    name: 'Arquitetura de Rede, CFTV IA (Muralha Paulista), Diagnóstico de Segurança e Agente TI',
    repoTag: 'Manual_Kali_Pentest · UniFi',
    category: 'Redes & Cibersegurança',
    complexity: 'Alta',
    creationHours: 220,
    creationValue: 44000,
    deploymentHours: 60,
    deploymentValue: 9000,
    deploymentNote: 'Inclui config. UniFi + Pentest final',
    summary:
      'Blindagem corporativa contra ransomware, segmentação de rede em 4 VLANs e visão computacional para leitura de placas no pátio.',
    technicalProof:
      'Identificação da vulnerabilidade crítica EternalBlue (CVE-2017-0144), topologia UniFi com Load Balance, especificação óptica LPR (3.6mm vs 2.8mm, WDR Real) e pipeline RTSP + YOLOv8.',
  },
];

export const COMPLEXITY_MODULES: ComplexityModule[] = [
  {
    id: 'cm-1',
    index: '01',
    name: 'Hub Central, Video Wall, Listener IMAP & Bot WhatsApp',
    repos: 'Projeto_VS_CODE · whatsapp_agent',
    complexity: 'Muito Alta',
    justification:
      'Mensageria assíncrona em tempo real, sockets IMAP com cifras TLS legadas Locaweb, debounce de imagens, OCR multimodal, autenticação JWT e sincronização de estado.',
    businessImpact: 'Visibilidade instantânea de pendências de contrato e embarques críticos no telão operacional.',
  },
  {
    id: 'cm-2',
    index: '02',
    name: 'Plataforma Unificada: Telemetria, Lei 13.103 & Manutenção',
    repos: 'platform',
    complexity: 'Muito Alta',
    justification:
      'TimescaleDB + PostGIS, máquina de estados complexa da Lei do Motorista (5h30 direção, 11h interjornada, espera 30%, noturna reduzida) e trava cruzada com Ordens de Serviço.',
    businessImpact: 'Poupa 5 a 6 dias/mês no fechamento de ponto e elimina passivo trabalhista e alertas falsos de GR.',
  },
  {
    id: 'cm-3',
    index: '03',
    name: 'Portal do Agregado + RPA TMS ESL + Seguro GEP',
    repos: 'Projeto_Cadastro · GeradorCIOT',
    complexity: 'Alta',
    justification:
      'Automação Playwright em modais dinâmicos no ESL Cloud, extração estruturada de CNH/CRLV por IA, deploy em nuvem e integração .NET C# com WebService Pamcard 9.2.',
    businessImpact: 'Reduz horas de digitação manual no cadastro de terceiros e acelera liberação de viagens.',
  },
  {
    id: 'cm-4',
    index: '04',
    name: 'Motor RAG Jurídico/Regulatório & Fábrica de 32 Manuais',
    repos: 'rag-logistica · Manuais',
    complexity: 'Média-Alta',
    justification:
      'Ingestão e vetorização ChromaDB de 1.638 documentos (17.653 chunks) + pipeline Python que transforma MHTML em PDFs corporativos com fluxos Mermaid e Anytype.',
    businessImpact: 'Elimina dependência de conhecimento tácito e padroniza onboarding da equipe operacional.',
  },
  {
    id: 'cm-5',
    index: '05',
    name: 'Engenharia de Compliance 80/20 (Castrol/Audi/SASSMAQ) & Frota',
    repos: 'cap-castrol · projeto-manutencao',
    complexity: 'Alta',
    justification:
      'Domínio regulatório (ANTT, IBAMA, NR-06/20/35, INMETRO, Smith System), transcrição Faster-Whisper de 53 áudios e apps próprios de assinatura digital em Canvas.',
    businessImpact: 'Sustenta nota 98,4% no CAP Castrol e previne retenções rodoviárias e multas de fiscalização.',
  },
  {
    id: 'cm-6',
    index: '06',
    name: 'Cibersegurança, CFTV IA (LPR / Muralha Paulista) & Redes',
    repos: 'Manual_Kali_Pentest · UniFi',
    complexity: 'Alta',
    justification:
      'Diagnóstico EternalBlue (CVE-2017-0144), arquitetura de 4 VLANs isoladas, especificação óptica de câmeras (lente 3.6mm vs 2.8mm, WDR Real) e pipeline RTSP + YOLOv8.',
    businessImpact: 'Protege o faturamento e os dados fiscais contra paralisação por ransomware e controla acessos do galpão.',
  },
];

export const ENGINEERING_STORIES: EngineeringBattleStory[] = [
  {
    id: 'st-1',
    title: 'Estabilidade IMAP Locaweb & TLS Legado',
    domain: 'Engenharia de Redes & Mensageria',
    challenge:
      'O robô de e-mail travava com ECONNRESET ao tentar baixar 514 mensagens simultâneas da Locaweb com cifras antigas.',
    solution:
      'Algoritmo reescrito para filtrar cabeçalhos leves antes de baixar ZIP/XML e injeção de NODE_OPTIONS=--tls-cipher-list=DEFAULT@SECLEVEL=0 no launcher Windows.',
    impact: 'Coleta fiscal contínua sem quedas manuais.',
  },
  {
    id: 'st-2',
    title: 'Resiliência em Hardware Restrito (Athlon 3000G)',
    domain: 'Arquitetura & Contorno Físico',
    challenge:
      'Máquina bloqueada sem virtualização habilitada na BIOS impedia rodar Redis e containers tradicionais em ambiente corporativo.',
    solution:
      'Implementação de InMemoryRedis, heurísticas de fallback de tokens e malha criptografada Tailscale + Cloudflare + Syncthing (.stignore Windows/Linux).',
    impact: 'Operação mantida ativa mesmo sem servidor dedicado.',
  },
  {
    id: 'st-3',
    title: 'Auditoria Forense de 53 Áudios & Risco Polícia Federal',
    domain: 'IA Aplicada & Manutenção',
    challenge:
      'Falhas recorrentes de freio e direção ficavam dispersas em mensagens de voz informais sem rastreabilidade gerencial.',
    solution:
      'Transcrição com Faster-Whisper cruzada com 114 ordens de serviço e 15 certificados do INMETRO.',
    impact:
      'Comprovou 82% de manutenção corretiva e identificou 6 veículos sob risco real de apreensão (caso caminhão FFW6161 retido por 11h na PF).',
  },
  {
    id: 'st-4',
    title: 'Saneamento Retroativo & Fábrica de 32 Manuais',
    domain: 'Dados & Governança Documental',
    challenge:
      'Chaves primárias nulas no SQLite bloqueavam aprovação de agregados; processos do TMS ESL não tinham padronização escrita.',
    solution:
      'Script de saneamento com crypto.randomUUID() + gerador Python que converte telas MHTML do ESL em 32 manuais PDF/Mermaid/Anytype.',
    impact: 'Base íntegra e documentação corporativa pronta para treinamento imediato.',
  },
];

export const TEAM_ROLES: TeamRole[] = [
  // Phase 1 (9 professionals)
  {
    id: 't1-1',
    phase: 'Fase 1',
    headcount: '1',
    role: 'Arquiteto de Software / Tech Lead Sênior',
    responsibility: 'Banco unificado (schema.sql), arquitetura de microserviços, proxy IA e integrações críticas.',
  },
  {
    id: 't1-2',
    phase: 'Fase 1',
    headcount: '2',
    role: 'Desenvolvedores Full-Stack Pleno/Sênior',
    responsibility: 'Node.js, Python e React para Portal Operacional, Video Wall, Portal do Agregado, APIs e apps de assinatura.',
  },
  {
    id: 't1-3',
    phase: 'Fase 1',
    headcount: '1',
    role: 'Engenheiro de Dados, IA e Automação RPA',
    responsibility: 'Motor RAG (ChromaDB), OCR Vision, transcrição Whisper, LPR YOLOv8 e robôs Playwright do TMS ESL.',
  },
  {
    id: 't1-4',
    phase: 'Fase 1',
    headcount: '1',
    role: 'Especialista em Integração Logística / EDI (.NET)',
    responsibility: 'Gerador CIOT, integração Pamcard 9.2, agrupador de CT-e e conector EDI Proceda (NOTFIS/CONEMB/DOCCOB).',
  },
  {
    id: 't1-5',
    phase: 'Fase 1',
    headcount: '1',
    role: 'Engenheiro de Redes e Cibersegurança (DevSecOps)',
    responsibility: 'Mapeamento de rede, VPN Mesh, auditoria EternalBlue, topologia de 4 VLANs e especificação CFTV LPR.',
  },
  {
    id: 't1-6',
    phase: 'Fase 1',
    headcount: '1',
    role: 'Consultor Sênior de QSMS / SASSMAQ & CAP Castrol',
    responsibility: 'POPs, matrizes de risco, planos preventivos, dossiês dos 5 blocos Castrol e adequação normativa.',
  },
  {
    id: 't1-7',
    phase: 'Fase 1',
    headcount: '2',
    role: 'Analistas de Processos / Redatores Técnicos',
    responsibility: 'Mapeamento de fluxos do TMS ESL, captura de telas, redação dos 32 manuais e edição de videoaulas.',
  },
  // Phase 2 (3 to 4 professionals)
  {
    id: 't2-1',
    phase: 'Fase 2',
    headcount: '1',
    role: 'Líder Técnico / Engenheiro de Sistemas (Fernando Lodo)',
    responsibility: 'Orquestração do servidor central, subida dos containers Docker, configuração do Firewall UniFi e Pentest final.',
  },
  {
    id: 't2-2',
    phase: 'Fase 2',
    headcount: '1',
    role: 'Técnico de Infraestrutura Física / Cabeamento (Pontual)',
    responsibility: 'Passagem de cabos Cat6, fixação física das câmeras PoE no novo galpão e montagem do rack.',
  },
  {
    id: 't2-3',
    phase: 'Fase 2',
    headcount: '1 a 2',
    role: 'Auxiliares Administrativos / Estagiários de Operações',
    responsibility: 'Carga inicial de contratos antigos, ASOs, CRLVs e OS passadas até os agentes autônomos assumirem 100%.',
  },
];

export const SAAS_AVOIDED_ITEMS: SaasAvoidedItem[] = [
  {
    id: 'saas-jornada',
    name: 'Sistema de Apuração de Jornada (Lei 13.103) + BPO',
    scope: '28 motoristas/veículos próprios e fechamento mensal de ponto',
    monthlyCost: 3500,
    defaultEnabled: true,
  },
  {
    id: 'saas-cadastro',
    name: 'Portal de Cadastro de Terceiros com OCR + Automação RPA',
    scope: 'Homologação de agregados e preenchimento no TMS ESL',
    monthlyCost: 2500,
    defaultEnabled: true,
  },
  {
    id: 'saas-manutencao',
    name: 'Plataforma de Gestão de Manutenção de Frota + Telemetria',
    scope: 'Controle preventivo, OS e alertas de oficina',
    monthlyCost: 2200,
    defaultEnabled: true,
  },
  {
    id: 'saas-compliance',
    name: 'Software de Gestão de Compliance / Auditoria (GED)',
    scope: 'Dossiês digitais, validade de documentos e assinaturas',
    monthlyCost: 2800,
    defaultEnabled: true,
  },
  {
    id: 'saas-firewall',
    name: 'Licenciamento Firewall Tradicional (ex: Fortinet UTP) + TI N1/N2',
    scope: 'Segurança de perímetro e sustentação de 33 dispositivos',
    monthlyCost: 3500,
    defaultEnabled: true,
  },
  {
    id: 'saas-consultoria',
    name: 'Consultoria Externa para Auditorias Anuais (Castrol, Delta, SASSMAQ)',
    scope: 'Preparação recorrente de evidências e plano de ação (diluído)',
    monthlyCost: 2500,
    defaultEnabled: true,
  },
];

export const DEFAULT_ROI_SCENARIO: RoiScenario = {
  hourlyRate: 181.26, // Matches R$ 775.800 / 4.280h
  hardwareInvestment: 15500, // Midpoint of R$ 13.500 - R$ 17.500
  deploymentLabor: 52200,
  enabledSaasIds: SAAS_AVOIDED_ITEMS.map((item) => item.id),
  annualOperationalGain: 210000, // Midpoint of R$ 180k - R$ 240k
  riskEventsAvoidedCost: 35000,
};

export function calculateRoiMetrics(scenario: RoiScenario) {
  const capexAvoided = Math.round(AUDIT_METADATA.totalCreationHours * scenario.hourlyRate);
  const monthlySaasAvoided = SAAS_AVOIDED_ITEMS.filter((item) =>
    scenario.enabledSaasIds.includes(item.id)
  ).reduce((sum, item) => sum + item.monthlyCost, 0);
  const annualSaasAvoided = monthlySaasAvoided * 12;

  // Combined measurable economic return (Direct OPEX + SaaS avoided; avoiding double count by offering both clearly)
  const monthlyOpexGain = scenario.annualOperationalGain / 12;
  const effectiveAnnualSavings = Math.max(annualSaasAvoided, scenario.annualOperationalGain);
  const totalEconomicBenefitYear1 = annualSaasAvoided + scenario.riskEventsAvoidedCost;
  const hardwarePctOfAsset = capexAvoided > 0 ? (scenario.hardwareInvestment / capexAvoided) * 100 : 0;

  const monthlyBenefitForPayback = (effectiveAnnualSavings + scenario.riskEventsAvoidedCost) / 12;
  const hardwarePaybackDays =
    monthlyBenefitForPayback > 0
      ? Math.max(7, Math.round((scenario.hardwareInvestment / monthlyBenefitForPayback) * 30))
      : 365;

  const fullRolloutPaybackMonths =
    monthlyBenefitForPayback > 0
      ? Number(((scenario.hardwareInvestment + scenario.deploymentLabor) / monthlyBenefitForPayback).toFixed(1))
      : 12;

  const threeYearNetValue =
    effectiveAnnualSavings * 3 +
    scenario.riskEventsAvoidedCost * 3 -
    scenario.hardwareInvestment;

  const cashflowProjection = Array.from({ length: 13 }, (_, idx) => {
    const month = idx * 3; // 0, 3, 6 ... 36 months
    const saasCumulative = Math.round(monthlySaasAvoided * month);
    const opexCumulative = Math.round(monthlyOpexGain * month);
    const netSavings = Math.round(
      (effectiveAnnualSavings / 12) * month - scenario.hardwareInvestment
    );
    return {
      month: `M${month}`,
      mesNumero: month,
      economiaSaas: saasCumulative,
      ganhoOperacional: opexCumulative,
      saldoLiquido: netSavings,
    };
  });

  return {
    capexAvoided,
    monthlySaasAvoided,
    annualSaasAvoided,
    effectiveAnnualSavings,
    totalEconomicBenefitYear1,
    hardwarePctOfAsset,
    hardwarePaybackDays,
    fullRolloutPaybackMonths,
    threeYearNetValue,
    cashflowProjection,
  };
}

export function formatBRL(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toFixed(2).replace('.', ',')} mi`;
    }
    if (Math.abs(value) >= 1_000) {
      return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')} mil`;
    }
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildDefaultDeck(scenario: RoiScenario): SlideDraft[] {
  const m = calculateRoiMetrics(scenario);
  return [
    {
      id: 'slide-1',
      order: 1,
      layoutType: 'cover',
      title: 'Laudo Executivo de Valuation Tecnológico',
      subtitle: 'ALL-IN Logística e Transportes — Auditoria de Engenharia, Ativo Intangível e Plano de Destravamento',
      highlightMetric: `${formatBRL(m.capexAvoided)} em Patrimônio Construído`,
      bullets: [
        'Objeto: Dossiê Executivo Mestre (361 páginas) e ecossistema proprietário integrado',
        'Responsável Técnico Auditado: Fernando Lodo',
        'Apresentação à Diretoria: Ney, Eduardo e Fábio',
      ],
      speakerNotes:
        'Abertura formal do parecer executivo: apresentar que o trabalho auditado não é um conjunto de planilhas, mas um ativo tecnológico proprietário avaliado em cerca de R$ 775 mil.',
      included: true,
      attachedAssetId: 'asset-control-tower',
    },
    {
      id: 'slide-2',
      order: 2,
      layoutType: 'kpi',
      title: 'Sumário Executivo: O Ativo Já Está em Casa',
      subtitle: 'Nota técnica global 9,6/10 com aderência cirúrgica à operação da ALL-IN',
      highlightMetric: '4.280h Executadas · 90% do Caminho Concluído',
      bullets: [
        `CAPEX Evitado (Fase 1 Criação): ${formatBRL(m.capexAvoided)} (faixa de mercado R$ 685 mil a R$ 940 mil)`,
        `Implantação Restante (Fase 2): 460h técnicas (~${formatBRL(scenario.deploymentLabor)}) em 4 a 6 semanas`,
        `Hardware para Produção 24/7: ${formatBRL(scenario.hardwareInvestment)} (${m.hardwarePctOfAsset.toFixed(1)}% do ativo criado)`,
        `Economia Recorrente Evitada (SaaS/BPO): ${formatBRL(m.monthlySaasAvoided)}/mês (${formatBRL(m.annualSaasAvoided)}/ano)`,
      ],
      speakerNotes:
        'Reforçar o quadro-síntese: nenhuma software house externa entrega simultaneamente 7 disciplinas críticas com essa aderência em tão pouco tempo.',
      included: true,
    },
    {
      id: 'slide-3',
      order: 3,
      layoutType: 'comparison',
      title: 'Criação do Zero (90%) vs. Implantação (10%)',
      subtitle: 'Por que a fase mais cara, arriscada e demorada já foi superada',
      highlightMetric: 'Criação é 9x Mais Cara que a Implantação',
      bullets: [
        'Fase 1 (Concluída): 4.280h de engenharia reversa, código SQL/Python/Node/React/C#, testes e 361 páginas de documentação',
        'Fase 2 (Destravamento): 460h lineares de subida de containers Docker, 4 VLANs UniFi, carga inicial e treinamento',
        'Riscos invisíveis já resolvidos: Locaweb TLS legado, saneamento UUID SQLite, contorno sem BIOS VT-x e 32 manuais ESL',
        'Dependência atual: apenas servidor central, firewall UniFi, senhas de domínio e apoio operacional de digitação inicial',
      ],
      speakerNotes:
        'Explicar aos sócios a diferença brutal entre criar um sistema complexo do zero e simplesmente implantar o código que já foi testado e documentado.',
      included: true,
    },
    {
      id: 'slide-4',
      order: 4,
      layoutType: 'narrative',
      title: 'Qualidade de Engenharia e Resiliência (9,6 / 10)',
      subtitle: 'Soluções feitas sob medida para a dor real da transportadora',
      highlightMetric: 'CAP Castrol 98,4% · 32 Manuais TMS ESL',
      bullets: [
        'Video Wall reativo com alerta "pulsar": true quando falta assinatura de contrato de agregado',
        'Modo Manutenção integrado: suspende alertas falsos da gerenciadora de risco durante entrada em oficina',
        'Resiliência física: InMemoryRedis e malha Tailscale + Cloudflare + Syncthing mantendo operação viva sem servidor',
        'Dossiê de 361 páginas avaliado isoladamente entre R$ 25.000 e R$ 40.000 em consultoria externa',
      ],
      speakerNotes:
        'Destacar exemplos concretos que provam por que softwares genéricos de prateleira não resolvem a rotina real da ALL-IN.',
      included: true,
      attachedAssetId: 'asset-fleet-audit',
    },
    {
      id: 'slide-5',
      order: 5,
      layoutType: 'table',
      title: 'Matriz de Complexidade dos 6 Blocos Tecnológicos',
      subtitle: 'Disciplinas integradas: Full-Stack, IA/Visão, RPA, Redes, Pentest e QSMS',
      highlightMetric: '2 Blocos Muito Alta · 3 Alta · 1 Média-Alta',
      bullets: [
        'Muito Alta: Hub Central + Video Wall + IMAP Locaweb + Bot WhatsApp OCR e Plataforma TimescaleDB/PostGIS Lei 13.103',
        'Alta: Portal Agregado + RPA Playwright ESL + CIOT Pamcard 9.2 (.NET C#)',
        'Alta: Compliance 80/20 Castrol/Audi/SASSMAQ + Manutenção IA (53 áudios Whisper) + Redes/CFTV YOLOv8 LPR',
        'Média-Alta: Agente RAG Regulatório (ChromaDB 17.653 chunks) e Fábrica automática de 32 manuais PDF/Anytype',
      ],
      speakerNotes:
        'Mostrar a amplitude multidisciplinar: um ecossistema completo de ERP/TMS satélite + Torre de Controle + Governança.',
      included: true,
    },
    {
      id: 'slide-6',
      order: 6,
      layoutType: 'comparison',
      title: 'Dimensionamento de Equipe Externa Equivalente',
      subtitle: 'No mercado, 9 especialistas seriam obrigatórios para construir o mesmo escopo',
      highlightMetric: '9 Especialistas (6–8 meses) vs. 3–4 Pessoas (4–6 sem.)',
      bullets: [
        'Fase 1 (Mercado): 1 Arquiteto Tech Lead, 2 Full-Stack, 1 Engenheiro IA/RPA, 1 Especialista EDI/.NET',
        'Fase 1 (Mercado cont.): 1 Engenheiro Redes/Pentest, 1 Consultor QSMS/SASSMAQ e 2 Analistas/Redatores Técnicos',
        'Fase 2 (Implantação hoje): Fernando Lodo liderando infraestrutura/Docker/Pentest + 1 técnico pontual de cabeamento Cat6',
        'Apoio temporário: 1 a 2 auxiliares administrativos para carga inicial de contratos, ASOs, CRLVs e OS antigas',
      ],
      speakerNotes:
        'Evidenciar o ganho de alavancagem: contratar Software House + Consultoria QSMS + Integradora de Redes exigiria gerir três fornecedores simultâneos.',
      included: true,
    },
    {
      id: 'slide-7',
      order: 7,
      layoutType: 'table',
      title: 'Auditoria Financeira Aberta — 8 Frentes de Trabalho',
      subtitle: 'Orçamento de mercado base 2026 (hora técnica R$ 140/h a R$ 220/h)',
      highlightMetric: `4.280h (${formatBRL(m.capexAvoided)}) vs. 460h (${formatBRL(scenario.deploymentLabor)})`,
      bullets: [
        'Plataforma Lei 13.103 & TimescaleDB (920h · R$ 184 mil) e Ecossistema Agregados + CIOT (840h · R$ 159,6 mil)',
        'Hub Central, Video Wall & Proxy IA (780h · R$ 140,4 mil) e Auditoria 80/20 CAP Castrol (460h · R$ 73,6 mil)',
        'Inteligência Fiscal CT-e / EDI DSV (380h · R$ 72,2 mil) e RAG + 32 Manuais ESL (360h · R$ 54 mil)',
        'Manutenção Frota & Áudios IA (320h · R$ 48 mil) e Redes UniFi / CFTV IA / Segurança (220h · R$ 44 mil)',
      ],
      speakerNotes:
        'Apresentar a transparência dos números auditados: mesmo usando taxas abaixo de grandes consultorias (R$ 350+/h), o valor consolidado alcança R$ 775.800.',
      included: true,
    },
    {
      id: 'slide-8',
      order: 8,
      layoutType: 'kpi',
      title: 'Custo SaaS Evitado: Economia Recorrente Mensal',
      subtitle: 'Licenças mensais poupadas para 28 veículos próprios, agregados e 33 dispositivos',
      highlightMetric: `${formatBRL(m.monthlySaasAvoided)} / mês (${formatBRL(m.annualSaasAvoided)} / ano)`,
      bullets: [
        'Apuração de Jornada Lei 13.103 + BPO (R$ 3.500/mês) e Firewall Fortinet + TI N1/N2 (R$ 3.500/mês)',
        'Gestão de Compliance / GED de Auditoria (R$ 2.800/mês) e Portal Terceiros OCR/RPA (R$ 2.500/mês)',
        'Consultoria Externa Auditorias Castrol/Delta/SASSMAQ (R$ 2.500/mês) e Manutenção/Telemetria (R$ 2.200/mês)',
        `Ganho econômico acumulado em 36 meses (líquido do hardware): ${formatBRL(m.threeYearNetValue)}`,
      ],
      speakerNotes:
        'Enfatizar que, além do CAPEX evitado, a ALL-IN deixa de pagar assinaturas perpétuas que reajustam todo ano por placa ou usuário.',
      included: true,
    },
    {
      id: 'slide-9',
      order: 9,
      layoutType: 'narrative',
      title: 'Provas de Campo: Mitigação de Riscos Reais',
      subtitle: 'Evidências operacionais, jurídicas e de cibersegurança levantadas na auditoria',
      highlightMetric: '82% Corretiva Identificada · EternalBlue Mitigado',
      bullets: [
        'Auditoria IA de 53 áudios + 114 OS + 15 certificados INMETRO revelou 6 caminhões sob risco de apreensão',
        'Prevenção direta de ocorrências como a retenção de 11h na Polícia Federal do caminhão FFW6161',
        'Blindagem contra ataque de ransomware via falha crítica EternalBlue (CVE-2017-0144) identificada na rede',
        'Economia imediata de 5 a 6 dias/mês no fechamento de ponto e +120h/mês da Diretoria e RH',
      ],
      speakerNotes:
        'Um único incidente de ransomware ou retenção prolongada de veículo em rodovia já supera o investimento total em hardware.',
      included: true,
      attachedAssetId: 'asset-server-rack',
    },
    {
      id: 'slide-10',
      order: 10,
      layoutType: 'comparison',
      title: 'Balanço Patrimonial & Plano de Rollout (4–6 Semanas)',
      subtitle: 'O que falta aprovar para colocar toda a arquitetura em produção 24/7',
      highlightMetric: `Investimento: ${formatBRL(scenario.hardwareInvestment)} · Payback: ${m.hardwarePaybackDays} dias`,
      bullets: [
        'Semana 1–2: Aquisição e montagem do Servidor Central + Nobreak (~R$ 8.700) e Firewall UniFi + Switch PoE',
        'Semana 2–3: Liberação das senhas de domínio, criação das 4 VLANs isoladas e subida dos containers Docker',
        'Semana 3–5: Carga inicial de documentos (ASOs, contratos, CRLVs, OS) com apoio administrativo dedicado',
        'Semana 5–6: Fixação das TVs do Video Wall, treinamento nos 32 manuais prontos e Pentest final de certificação',
      ],
      speakerNotes:
        'Mostrar que o cronograma é linear, previsível e não envolve mais incertezas de pesquisa e desenvolvimento.',
      included: true,
    },
    {
      id: 'slide-11',
      order: 11,
      layoutType: 'verdict',
      title: 'Veredito Final do Auditor para a Diretoria',
      subtitle: 'Decisão estratégica de altíssimo retorno e risco técnico praticamente zerado',
      highlightMetric: `Payback < ${m.hardwarePaybackDays} dias · Ativo de ${formatBRL(m.capexAvoided)}`,
      bullets: [
        `Travar um patrimônio de ${formatBRL(m.capexAvoided)} por ${formatBRL(scenario.hardwareInvestment)} em hardware (< ${m.hardwarePctOfAsset.toFixed(1)}%) é contrassenso econômico`,
        `Retorno operacional direto estimado em ${formatBRL(scenario.annualOperationalGain)}/ano após entrada em produção 24/7`,
        'Aprovação imediata recomendada: Servidor Central, Firewall UniFi, senhas de rede e auxiliar para carga inicial',
        'Resultado: ALL-IN operando com governança padrão multinacional, independência tecnológica e blindagem fiscal/cibernética',
      ],
      speakerNotes:
        'Encerramento para decisão imediata dos sócios Ney, Eduardo e Fábio: solicitar aprovação formal do pacote de hardware e início da semana 1.',
      included: true,
    },
  ];
}
