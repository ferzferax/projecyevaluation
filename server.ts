import 'dotenv/config';
import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '20mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const spaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no servidor.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function handleApiError(res: Response, error: unknown, context: string) {
  console.error(`[${context}]`, error);
  const message =
    error instanceof Error ? error.message : 'Erro inesperado ao consultar o serviço de IA.';
  const status =
    message.includes('API_KEY_INVALID') || message.includes('400')
      ? 400
      : message.includes('PERMISSION_DENIED') || message.includes('403')
        ? 403
        : message.includes('RESOURCE_EXHAUSTED') || message.includes('429')
          ? 429
          : 500;
  res.status(status).json({ error: message });
}

const DOSSIER_SYSTEM_CONTEXT = `
Você é o Auditor-Chefe de Tecnologia e Consultor de Valuation Executivo da ALL-IN Logística e Transportes.
Responda sempre em Português do Brasil, com tom sóbrio, objetivo, preciso e orientado a decisão de diretoria (para os sócios Ney, Eduardo e Fábio).

FATOS AUDITADOS DO LAUDO EXECUTIVO (Dossiê Mestre de 361 páginas — Responsável: Fernando Lodo):
- Nota técnica global de engenharia e documentação: 9,6 / 10.
- Fase 1 (CRIAÇÃO DO ZERO — 90% do esforço, JÁ EXECUTADA): 4.280 horas, equipe externa equivalente de 8 a 10 especialistas (9 papéis distintos) por 6 a 8 meses, custo de mercado entre R$ 685.000 e R$ 940.000, total consolidado auditado de R$ 775.800,00 (base 2026: R$ 140/h a R$ 220/h).
- Fase 2 (IMPLANTAÇÃO — 10% do esforço, COM PROJETO PRONTO): 460 horas, 3 a 4 profissionais por 4 a 6 semanas, custo de mão de obra estimado em R$ 52.200,00 (faixa R$ 48.000 a R$ 72.000).
- Hardware para destravar produção 24/7: Servidor Central + Nobreak (~R$ 8.700) + Firewall UniFi / Switch PoE (~R$ 3.900 a R$ 8.600) = ~R$ 13.500 a R$ 17.500 (menos de 2,2% do valor do software já construído).
- Economia recorrente de SaaS/BPO evitada (28 veículos próprios + agregados + 33 dispositivos): R$ 17.000/mês (R$ 204.000/ano):
  1. Apuração de Jornada Lei 13.103 + BPO: R$ 3.500/mês
  2. Portal de Cadastro de Terceiros com OCR + RPA: R$ 2.500/mês
  3. Gestão de Manutenção de Frota + Telemetria: R$ 2.200/mês
  4. Gestão de Compliance / Documentos de Auditoria (GED): R$ 2.800/mês
  5. Firewall tradicional (ex: Fortinet UTP) + Suporte TI N1/N2: R$ 3.500/mês
  6. Consultoria Externa Auditorias Anuais (Castrol, Delta, SASSMAQ): R$ 2.500/mês
- Economia direta anual gerada após entrada em produção (OPEX recuperado): R$ 180.000 a R$ 240.000/ano (+120h/mês de RH/gestão poupadas, 5-6 dias/mês no fechamento de ponto, redução de 82% de manutenção corretiva, prevenção de multas ANTT/IBAMA/INMETRO).
- Payback do hardware: inferior a 60 dias.
- 8 Frentes Auditadas:
  1. Hub Central (Projeto_VS_CODE), Video Wall Reativo ("pulsar": true), Listener IMAP XML (Locaweb TLS legado DEFAULT@SECLEVEL=0), Proxy IA: 780h criação / R$ 140.400 | 60h implantação / R$ 7.200.
  2. Plataforma Unificada (platform): TimescaleDB, PostGIS, Motor Lei 13.103 (5h30 direção, 11h interjornada, 30% espera, hora noturna reduzida), Modo Manutenção: 920h / R$ 184.000 | 80h / R$ 9.600.
  3. Ecossistema de Agregados: Bot WhatsApp OCR Gemini Vision, Portal Web, RPA Playwright ESL Cloud, Gerador CIOT (.NET C# / Pamcard 9.2), saneamento SQLite com crypto.randomUUID(): 840h / R$ 159.600 | 50h / R$ 6.000.
  4. Inteligência Fiscal: Agrupador CT-e (Castrol/Audi), Conector EDI DSV (Proceda NOTFIS/CONEMB/DOCCOB), Pré-Checklist ABM: 380h / R$ 72.200 | 40h / R$ 4.800.
  5. Auditoria 80/20 (cap-castrol), Apps de Assinatura Digital Canvas & Dossiê 252 pts (98,4% / Faixa Excelente): 460h / R$ 73.600
