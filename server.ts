import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '20mb' }));

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
  5. Auditoria 80/20 (cap-castrol), Apps de Assinatura Digital Canvas & Dossiê 252 pts (98,4% / Faixa Excelente): 460h / R$ 73.600 | 90h / R$ 8.100.
  6. Manutenção de Frota (projeto-manutencao), Transcrição IA de 53 áudios WhatsApp (Faster-Whisper), 114 OS, 15 certificados INMETRO (82% corretiva, 6 caminhões em risco PF, caso real caminhão FFW6161 retido 11h): 320h / R$ 48.000 | 50h / R$ 4.500.
  7. Agente RAG Regulatório (rag-logistica: ChromaDB 1.638 docs / 17.653 chunks), Fábrica de 32 Manuais TMS ESL (MHTML -> CSS -> PDF Edge Headless + Anytype) & Videoaulas: 360h / R$ 54.000 | 30h / R$ 3.000.
  8. Redes, CFTV IA (YOLOv8 LPR / Muralha Paulista, lente 3.6mm vs 2.8mm, WDR Real), Diagnóstico Segurança (EternalBlue CVE-2017-0144), 4 VLANs UniFi & Agente Autônomo TI: 220h / R$ 44.000 | 60h / R$ 9.000.
- Valor isolado do Dossiê Executivo de 361 páginas: R$ 25.000 a R$ 40.000 em consultoria externa.
`;

// 1. Fast executive explanation using gemini-3.1-flash-lite (free tier)
app.post('/api/gemini/quick-explain', async (req: Request, res: Response) => {
  try {
    const { topic, technicalDetail } = req.body as {
      topic?: string;
      technicalDetail?: string;
    };

    if (!topic) {
      res.status(400).json({ error: 'Informe o tópico para explicação executiva.' });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Traduza para os sócios da ALL-IN Logística (linguagem de negócios, sem jargão excessivo) o seguinte item auditado: "${topic}". Contexto técnico: "${technicalDetail ?? ''}". Entregue exatamente 3 pontos curtos: (1) O que resolve na operação diária, (2) Risco financeiro/jurídico que elimina, (3) Por que custaria caro contratar fora.`,
      config: {
        systemInstruction: DOSSIER_SYSTEM_CONTEXT,
      },
    });

    res.json({
      explanation: response.text ?? 'Não foi possível gerar a explicação no momento.',
      model: 'gemini-3.1-flash-lite',
    });
  } catch (error) {
    handleApiError(res, error, 'quick-explain');
  }
});

// 2. Boardroom AI Advisor using gemini-4-hydrogen (free tier, supports ThinkingLevel.HIGH)
app.post('/api/gemini/advisor', async (req: Request, res: Response) => {
  try {
    const { question, history, deepThinking, scenarioSummary } = req.body as {
      question?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      deepThinking?: boolean;
      scenarioSummary?: string;
    };

    if (!question?.trim()) {
      res.status(400).json({ error: 'Digite uma pergunta para o Consultor de Diretoria.' });
      return;
    }

    const ai = getGeminiClient();
    const recentHistory = (history ?? [])
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Sócio/Diretoria' : 'Auditor IA'}: ${m.content}`)
      .join('\n\n');

    const prompt = `${scenarioSummary ? `CENÁRIO ATUAL DO SIMULADOR ROI:\n${scenarioSummary}\n\n` : ''}${
      recentHistory ? `HISTÓRICO RECENTE DA REUNIÃO:\n${recentHistory}\n\n` : ''
    }NOVA PERGUNTA DA DIRETORIA:\n${question}\n\nEstruture a resposta de forma clara, executiva, com números exatos do laudo e do simulador, usando tópicos objetivos e uma conclusão acionável para decisão.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: DOSSIER_SYSTEM_CONTEXT,
        thinkingConfig: {
          thinkingLevel: deepThinking ? ThinkingLevel.HIGH : ThinkingLevel.MEDIUM,
        },
      },
    });

    res.json({
      answer: response.text ?? 'Sem resposta retornada pelo modelo.',
      model: 'gemini-4-hydrogen',
      thinkingLevel: deepThinking ? 'HIGH' : 'MEDIUM',
    });
  } catch (error) {
    handleApiError(res, error, 'advisor');
  }
});

// 3. Refine a single slide or generate a new slide via gemini-4-hydrogen (free tier JSON)
app.post('/api/gemini/refine-slide', async (req: Request, res: Response) => {
  try {
    const { instruction, slide, scenarioSummary } = req.body as {
      instruction?: string;
      slide?: {
        title: string;
        subtitle: string;
        bullets: string[];
        highlightMetric?: string;
        speakerNotes: string;
      };
      scenarioSummary?: string;
    };

    if (!instruction?.trim()) {
      res.status(400).json({ error: 'Informe a instrução para gerar ou refinar o slide.' });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `${scenarioSummary ? `CENÁRIO ROI ATUAL:\n${scenarioSummary}\n\n` : ''}${
        slide
          ? `SLIDE ATUAL:\nTítulo: ${slide.title}\nSubtítulo: ${slide.subtitle}\nTópicos: ${slide.bullets.join(' | ')}\nDestaque: ${slide.highlightMetric ?? ''}\nNotas: ${slide.speakerNotes}\n\n`
          : ''
      }TAREFA: ${instruction}\n\nRetorne um slide executivo pronto para diretoria em JSON estrito, com frases curtas, impactantes e 100% fiéis aos números do laudo ALL-IN.`,
      config: {
        systemInstruction: DOSSIER_SYSTEM_CONTEXT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Título conciso do slide (máx 60 chars).' },
            subtitle: { type: Type.STRING, description: 'Subtítulo executivo (máx 110 chars).' },
            highlightMetric: {
              type: Type.STRING,
              description: 'Indicador numérico de alto impacto (ex: R$ 775.800 | Payback < 60 dias).',
            },
            bullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Entre 3 e 5 tópicos diretos e objetivos para o slide.',
            },
            speakerNotes: {
              type: Type.STRING,
              description: 'Roteiro de fala de 30 a 45 segundos para apresentar aos sócios.',
            },
          },
          required: ['title', 'subtitle', 'bullets', 'speakerNotes'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({ slide: parsed, model: 'gemini-4-hydrogen' });
  } catch (error) {
    handleApiError(res, error, 'refine-slide');
  }
});

// 4. Multimodal Image Analysis + Storyboard Script Generator (free tier gemini-4-hydrogen)
app.post('/api/gemini/analyze-media', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, goal } = req.body as {
      imageBase64?: string;
      mimeType?: string;
      goal?: string;
    };

    const ai = getGeminiClient();
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      });
    }

    parts.push({
      text: `Com base ${imageBase64 ? 'nesta imagem corporativa/operacional e ' : ''}no Laudo Executivo da ALL-IN Logística, crie um pacote de comunicação visual para o objetivo: "${
        goal || 'Apresentação executiva de Valuation e Destravamento Operacional para os sócios'
      }". Retorne título curto para sobrepor na arte, legenda de 1 linha, KPI recomendado em destaque e um roteiro de vídeo em 3 cenas curtas (para renderização em vídeo 16:9 ou 9:16).`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: { parts },
      config: {
        systemInstruction: DOSSIER_SYSTEM_CONTEXT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overlayTitle: { type: Type.STRING, description: 'Título editorial curto para a arte.' },
            overlaySubtitle: { type: Type.STRING, description: 'Legenda de apoio em 1 linha.' },
            kpiCallout: { type: Type.STRING, description: 'Métrica-âncora curta (ex: R$ 775.800 CAPEX Evitado).' },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  caption: { type: Type.STRING },
                  metric: { type: Type.STRING },
                },
                required: ['headline', 'caption', 'metric'],
              },
              description: 'Exatamente 3 cenas sequenciais para o vídeo executivo.',
            },
          },
          required: ['overlayTitle', 'overlaySubtitle', 'kpiCallout', 'scenes'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    res.json({ result: parsed, model: 'gemini-4-hydrogen' });
  } catch (error) {
    handleApiError(res, error, 'analyze-media');
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ALL-IN Executive Valuation Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
