import React, { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  Check,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Plus,
  Presentation,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  EDITORIAL_ASSETS,
  calculateRoiMetrics,
  formatBRL,
  type EditorialAsset,
  type RoiScenario,
  type SlideDraft,
} from '../data/valuationData';
import { exportDeckToGoogleSlides, type ExportSlidesResult } from '../services/googleSlidesService';

type StudioSubTab = 'slides' | 'image-editor' | 'video-studio';
type ImageRatio = '16:9' | '4:3' | '1:1' | '9:16';
type VideoRatio = '16:9' | '9:16';

interface VideoScene {
  headline: string;
  caption: string;
  metric: string;
}

interface StudioAndSlidesViewProps {
  scenario: RoiScenario;
  slides: SlideDraft[];
  onChangeSlides: (next: SlideDraft[]) => void;
  assets: EditorialAsset[];
  onAddAsset: (asset: EditorialAsset) => void;
  googleUser: User | null;
  googleAccessToken: string | null;
  isLoggingIn: boolean;
  authError: string | null;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
}

export const StudioAndSlidesView: React.FC<StudioAndSlidesViewProps> = ({
  scenario,
  slides,
  onChangeSlides,
  assets,
  onAddAsset,
  googleUser,
  googleAccessToken,
  isLoggingIn,
  authError,
  onGoogleLogin,
  onGoogleLogout,
}) => {
  const [subTab, setSubTab] = useState<StudioSubTab>('slides');
  const [selectedSlideId, setSelectedSlideId] = useState<string>(slides[0]?.id ?? 'slide-1');
  const [deckTitle, setDeckTitle] = useState(
    'ALL-IN Logística — Laudo Executivo de Valuation Tecnológico (2026)'
  );

  // Slide AI refiner state
  const [refineInstruction, setRefineInstruction] = useState('');
  const [refiningSlide, setRefiningSlide] = useState(false);
  const [slideAiError, setSlideAiError] = useState<string | null>(null);

  // Google Slides export confirmation modal & result
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [exportingSlides, setExportingSlides] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<ExportSlidesResult | null>(null);

  // Image Composer state (100% client-side + free Gemini multimodal captioning)
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id ?? EDITORIAL_ASSETS[0].id);
  const [imageRatio, setImageRatio] = useState<ImageRatio>('16:9');
  const [overlayTitle, setOverlayTitle] = useState('ALL-IN Logística — Valuation Tecnológico');
  const [overlaySubtitle, setOverlaySubtitle] = useState(
    '90% do patrimônio de engenharia concluído · Destravamento imediato em 4–6 semanas'
  );
  const [overlayKpi, setOverlayKpi] = useState('R$ 775.800 CAPEX Evitado');
  const [overlayDarkness, setOverlayDarkness] = useState(65);
  const [showEditorialFrame, setShowEditorialFrame] = useState(true);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [mediaAiError, setMediaAiError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Video Studio state (16:9 or 9:16 real Canvas MediaRecorder renderer, zero paid API)
  const [videoMode, setVideoMode] = useState<'animate-photo' | 'text-storyboard'>('animate-photo');
  const [videoRatio, setVideoRatio] = useState<VideoRatio>('16:9');
  const [videoAssetId, setVideoAssetId] = useState<string>(assets[0]?.id ?? EDITORIAL_ASSETS[0].id);
  const [videoPrompt, setVideoPrompt] = useState(
    'Apresentação executiva para os sócios destacando o patrimônio de R$ 775.800 já pronto, o investimento de apenas R$ 15.500 em hardware e o payback inferior a 60 dias.'
  );
  const [scenes, setScenes] = useState<VideoScene[]>([
    {
      headline: 'Patrimônio Tecnológico ALL-IN',
      caption: '4.280 horas de engenharia, código proprietário e Dossiê de 361 páginas concluídos',
      metric: 'R$ 775.800 CAPEX Evitado',
    },
    {
      headline: 'Destravamento Físico Imediato',
      caption: 'Servidor Central + Nobreak + Firewall UniFi com 4 VLANs isoladas',
      metric: 'Hardware < 2,2% do Ativo',
    },
    {
      headline: 'Economia Recorrente e Blindagem',
      caption: 'R$ 17.000/mês evitados em SaaS/BPO, CAP Castrol 98,4% e proteção EternalBlue',
      metric: 'Payback < 60 Dias',
    },
  ]);
  const [generatingStoryboard, setGeneratingStoryboard] = useState(false);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [videoOutputUrl, setVideoOutputUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedSlide = slides.find((s) => s.id === selectedSlideId) ?? slides[0];
  const activeSlidesCount = slides.filter((s) => s.included).length;
  const metrics = calculateRoiMetrics(scenario);
  const scenarioSummary = `CAPEX: ${formatBRL(metrics.capexAvoided)} | Hardware: ${formatBRL(scenario.hardwareInvestment)} | Payback: ${metrics.hardwarePaybackDays} dias | SaaS: ${formatBRL(metrics.monthlySaasAvoided)}/mês.`;

  const activeEditorAsset = assets.find((a) => a.id === selectedAssetId) ?? assets[0];
  const activeVideoAsset = assets.find((a) => a.id === videoAssetId) ?? assets[0];

  // Update a single slide field
  const updateSlide = (id: string, patch: Partial<SlideDraft>) => {
    onChangeSlides(slides.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  // Add blank or AI-assisted slide
  const handleAddBlankSlide = () => {
    const newId = `slide-custom-${Date.now()}`;
    const nextSlide: SlideDraft = {
      id: newId,
      order: slides.length + 1,
      layoutType: 'narrative',
      title: 'Novo Tópico de Diretoria',
      subtitle: 'Ponto complementar para deliberação dos sócios',
      highlightMetric: `${formatBRL(metrics.capexAvoided)} Auditados`,
      bullets: [
        'Descreva o ponto estratégico ou use o botão Refinar com IA abaixo',
        'Vincule métricas do Simulador de ROI para manter o deck consistente',
      ],
      speakerNotes: 'Notas do apresentador para este slide.',
      included: true,
    };
    onChangeSlides([...slides, nextSlide]);
    setSelectedSlideId(newId);
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) return;
    const filtered = slides.filter((s) => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 }));
    onChangeSlides(filtered);
    if (selectedSlideId === id) {
      setSelectedSlideId(filtered[0].id);
    }
  };

  const handleRefineSlideWithAI = async () => {
    if (!selectedSlide || !refineInstruction.trim()) return;
    setRefiningSlide(true);
    setSlideAiError(null);
    try {
      const res = await fetch('/api/gemini/refine-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: refineInstruction,
          slide: {
            title: selectedSlide.title,
            subtitle: selectedSlide.subtitle,
            bullets: selectedSlide.bullets,
            highlightMetric: selectedSlide.highlightMetric,
            speakerNotes: selectedSlide.speakerNotes,
          },
          scenarioSummary,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao refinar slide.');
      }
      updateSlide(selectedSlide.id, {
        title: data.slide.title || selectedSlide.title,
        subtitle: data.slide.subtitle || selectedSlide.subtitle,
        highlightMetric: data.slide.highlightMetric ?? selectedSlide.highlightMetric,
        bullets: Array.isArray(data.slide.bullets) ? data.slide.bullets : selectedSlide.bullets,
        speakerNotes: data.slide.speakerNotes || selectedSlide.speakerNotes,
      });
      setRefineInstruction('');
    } catch (err) {
      setSlideAiError(err instanceof Error ? err.message : 'Erro ao refinar slide com IA.');
    } finally {
      setRefiningSlide(false);
    }
  };

  // Real Google Slides Export after explicit confirmation
  const handleConfirmGoogleSlidesExport = async () => {
    if (!googleAccessToken) {
      setExportError('Faça login com sua conta Google antes de exportar.');
      setShowConfirmModal(false);
      return;
    }
    setExportingSlides(true);
    setExportError(null);
    try {
      const result = await exportDeckToGoogleSlides(googleAccessToken, deckTitle, slides);
      setExportResult(result);
      setShowConfirmModal(false);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Falha ao criar apresentação no Google Slides.');
      setShowConfirmModal(false);
    } finally {
      setExportingSlides(false);
    }
  };

  // Upload local photo into session gallery
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'editor' | 'video'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const uploaded: EditorialAsset = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^.]+$/, ''),
        subtitle: 'Imagem carregada pelo usuário',
        category: 'Upload Próprio',
        url: dataUrl,
        aspectRatio: '16:9',
        defaultKpi: `${formatBRL(metrics.capexAvoided)} Auditados`,
      };
      onAddAsset(uploaded);
      if (target === 'editor') {
        setSelectedAssetId(uploaded.id);
      } else {
        setVideoAssetId(uploaded.id);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Draw live composed executive image onto Canvas
  useEffect(() => {
    if (subTab !== 'image-editor' || !imageCanvasRef.current || !activeEditorAsset) return;
    const canvas = imageCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dims: Record<ImageRatio, [number, number]> = {
      '16:9': [1280, 720],
      '4:3': [1200, 900],
      '1:1': [1080, 1080],
      '9:16': [720, 1280],
    };
    const [W, H] = dims[imageRatio];
    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, W, H);
      // Cover-fit crop
      const scale = Math.max(W / img.width, H / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = (W - drawW) / 2;
      const offsetY = (H - drawH) / 2;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

      // Editorial scrim
      const alpha = overlayDarkness / 100;
      const grad = ctx.createLinearGradient(0, H * 0.25, 0, H);
      grad.addColorStop(0, `rgba(15, 39, 68, ${alpha * 0.2})`);
      grad.addColorStop(0.6, `rgba(15, 39, 68, ${alpha * 0.72})`);
      grad.addColorStop(1, `rgba(9, 24, 43, ${Math.min(0.95, alpha + 0.22)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      if (showEditorialFrame) {
        // Top thin amber bar
        ctx.fillStyle = '#D97706';
        ctx.fillRect(0, 0, W, 8);

        const pad = Math.round(W * 0.055);
        // Brand kicker
        ctx.fillStyle = '#FCD34D';
        ctx.font = `600 ${Math.round(W * 0.015)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText('ALL-IN LOGÍSTICA E TRANSPORTES  ·  LAUDO DE VALUATION', pad, pad + 18);

        // KPI Box
        if (overlayKpi.trim()) {
          const kpiFontSize = Math.round(W * 0.02);
          ctx.font = `600 ${kpiFontSize}px "JetBrains Mono", monospace`;
          const kpiWidth = ctx.measureText(overlayKpi).width + 36;
          const kpiY = H - pad - Math.round(W * 0.145);
          ctx.fillStyle = '#B45309';
          ctx.fillRect(pad, kpiY, Math.min(W - pad * 2, kpiWidth), Math.round(W * 0.044));
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(overlayKpi, pad + 18, kpiY + Math.round(W * 0.029));
        }

        // Main Headline
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${Math.round(W * 0.042)}px "Fraunces", Georgia, serif`;
        ctx.fillText(overlayTitle.slice(0, 56), pad, H - pad - Math.round(W * 0.048));

        // Subtitle
        ctx.fillStyle = '#E2E8F0';
        ctx.font = `400 ${Math.round(W * 0.019)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(overlaySubtitle.slice(0, 96), pad, H - pad - Math.round(W * 0.012));
      }
    };
    img.src = activeEditorAsset.url;
  }, [
    subTab,
    activeEditorAsset,
    imageRatio,
    overlayTitle,
    overlaySubtitle,
    overlayKpi,
    overlayDarkness,
    showEditorialFrame,
  ]);

  // Analyze selected image with free Gemini 4 Hydrogen multimodal
  const handleAnalyzeImageWithAI = async () => {
    if (!activeEditorAsset) return;
    setAnalyzingImage(true);
    setMediaAiError(null);
    try {
      // Convert current asset image to base64
      const blob = await fetch(activeEditorAsset.url).then((r) => r.blob());
      const base64Full = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const [meta, base64Data] = base64Full.split(',');
      const mimeType = meta.match(/data:(.*?);/)?.[1] || 'image/jpeg';

      const res = await fetch('/api/gemini/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          goal: `Compor capa executiva e roteiro de vídeo para a apresentação do Laudo ALL-IN (${scenarioSummary})`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao analisar imagem.');
      }
      if (data.result?.overlayTitle) setOverlayTitle(data.result.overlayTitle);
      if (data.result?.overlaySubtitle) setOverlaySubtitle(data.result.overlaySubtitle);
      if (data.result?.kpiCallout) setOverlayKpi(data.result.kpiCallout);
      if (Array.isArray(data.result?.scenes) && data.result.scenes.length > 0) {
        setScenes(data.result.scenes.slice(0, 3));
      }
    } catch (err) {
      setMediaAiError(err instanceof Error ? err.message : 'Erro ao analisar imagem com IA.');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSaveComposedImage = () => {
    if (!imageCanvasRef.current) return;
    const dataUrl = imageCanvasRef.current.toDataURL('image/png');
    const newAsset: EditorialAsset = {
      id: `composed-${Date.now()}`,
      title: overlayTitle || 'Arte Executiva ALL-IN',
      subtitle: overlaySubtitle,
      category: `Arte ${imageRatio}`,
      url: dataUrl,
      aspectRatio: imageRatio === '4:3' ? '4:3' : '16:9',
      defaultKpi: overlayKpi,
    };
    onAddAsset(newAsset);
    setVideoAssetId(newAsset.id);
    setSavedNotice('Arte salva na galeria e pronta para o Estúdio de Vídeo.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleDownloadComposedImage = () => {
    if (!imageCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `all-in-valuation-${imageRatio.replace(':', 'x')}.png`;
    link.href = imageCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Generate 3-scene storyboard from text prompt using free Gemini 4 Hydrogen
  const handleGenerateStoryboardFromText = async () => {
    if (!videoPrompt.trim()) return;
    setGeneratingStoryboard(true);
    setVideoError(null);
    try {
      const res = await fetch('/api/gemini/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: `${videoPrompt} | Dados atuais: ${scenarioSummary}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar roteiro de vídeo.');
      }
      if (Array.isArray(data.result?.scenes) && data.result.scenes.length > 0) {
        setScenes(data.result.scenes.slice(0, 3));
      }
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Erro ao gerar roteiro com IA.');
    } finally {
      setGeneratingStoryboard(false);
    }
  };

  // Real In-Browser Executive Video Renderer (Canvas + MediaRecorder, 16:9 or 9:16)
  const handleRenderExecutiveVideo = async () => {
    if (!videoCanvasRef.current) return;
    if (typeof MediaRecorder === 'undefined') {
      setVideoError('Seu navegador não suporta gravação de vídeo MediaRecorder.');
      return;
    }

    setRenderingVideo(true);
    setRenderProgress(0);
    setVideoError(null);
    if (videoOutputUrl) {
      URL.revokeObjectURL(videoOutputUrl);
      setVideoOutputUrl(null);
    }

    try {
      const canvas = videoCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Contexto gráfico indisponível.');

      const W = videoRatio === '16:9' ? 1280 : 720;
      const H = videoRatio === '16:9' ? 720 : 1280;
      canvas.width = W;
      canvas.height = H;

      // Preload background photo(s)
      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.crossOrigin = 'anonymous';
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = src;
        });

      const sceneImages: HTMLImageElement[] = [];
      if (videoMode === 'animate-photo' && activeVideoAsset) {
        const single = await loadImage(activeVideoAsset.url);
        sceneImages.push(single, single, single);
      } else {
        for (let k = 0; k < 3; k++) {
          const asset = assets[k % assets.length];
          sceneImages.push(await loadImage(asset.url));
        }
      }

      const stream = canvas.captureStream(30);
      const mimeCandidate = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeCandidate,
        videoBitsPerSecond: 4_500_000,
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };

      const donePromise = new Promise<string>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeCandidate });
          resolve(URL.createObjectURL(blob));
        };
      });

      recorder.start();

      const totalDurationMs = 7500; // 2.5s per scene x 3 scenes
      const sceneDurationMs = totalDurationMs / 3;
      const startTime = performance.now();

      const wrapText = (text: string, maxW: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let current = '';
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxW && current) {
            lines.push(current);
            current = word;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
        return lines;
      };

      await new Promise<void>((resolve) => {
        const renderFrame = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / totalDurationMs);
          setRenderProgress(Math.round(progress * 100));

          const sceneIdx = Math.min(2, Math.floor(elapsed / sceneDurationMs));
          const sceneLocalProgress = (elapsed - sceneIdx * sceneDurationMs) / sceneDurationMs;
          const scene = scenes[sceneIdx] ?? scenes[0];
          const bg = sceneImages[sceneIdx];

          // Smooth Ken Burns zoom & gentle pan
          const zoom = 1.0 + 0.08 * sceneLocalProgress;
          const baseScale = Math.max(W / bg.width, H / bg.height) * zoom;
          const drawW = bg.width * baseScale;
          const drawH = bg.height * baseScale;
          const panX = (W - drawW) / 2 + (sceneIdx % 2 === 0 ? -18 : 18) * sceneLocalProgress;
          const panY = (H - drawH) / 2;

          ctx.clearRect(0, 0, W, H);
          ctx.drawImage(bg, panX, panY, drawW, drawH);

          // Rich editorial navy gradient scrim
          const grad = ctx.createLinearGradient(0, 0, 0, H);
          grad.addColorStop(0, 'rgba(9, 24, 43, 0.45)');
          grad.addColorStop(0.55, 'rgba(15, 39, 68, 0.65)');
          grad.addColorStop(1, 'rgba(9, 24, 43, 0.94)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);

          // Top amber progress accent
          ctx.fillStyle = '#D97706';
          ctx.fillRect(0, 0, W * progress, 8);

          const pad = Math.round(W * 0.07);
          const fade = Math.min(1, sceneLocalProgress * 4);
          ctx.globalAlpha = fade;

          // Kicker
          ctx.fillStyle = '#FCD34D';
          ctx.font = `600 ${Math.round(W * 0.018)}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillText(
            `ALL-IN LOGÍSTICA  ·  VALUATION EXECUTIVO  ·  0${sceneIdx + 1}/03`,
            pad,
            pad + 24
          );

          // Metric box
          const metricY = H * (videoRatio === '16:9' ? 0.52 : 0.56);
          ctx.font = `600 ${Math.round(W * 0.025)}px "JetBrains Mono", monospace`;
          const mWidth = Math.min(W - pad * 2, ctx.measureText(scene.metric).width + 36);
          ctx.fillStyle = '#B45309';
          ctx.fillRect(pad, metricY, mWidth, Math.round(W * 0.055));
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(scene.metric, pad + 18, metricY + Math.round(W * 0.036));

          // Headline
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `700 ${Math.round(W * (videoRatio === '16:9' ? 0.045 : 0.062))}px "Fraunces", Georgia, serif`;
          const hLines = wrapText(scene.headline, W - pad * 2);
          let cursorY = metricY + Math.round(W * 0.115);
          hLines.slice(0, 2).forEach((line) => {
            ctx.fillText(line, pad, cursorY);
            cursorY += Math.round(W * (videoRatio === '16:9' ? 0.052 : 0.072));
          });

          // Caption
          ctx.fillStyle = '#E2E8F0';
          ctx.font = `400 ${Math.round(W * (videoRatio === '16:9' ? 0.022 : 0.032))}px "Plus Jakarta Sans", sans-serif`;
          const cLines = wrapText(scene.caption, W - pad * 2);
          cursorY += 8;
          cLines.slice(0, 3).forEach((line) => {
            ctx.fillText(line, pad, cursorY);
            cursorY += Math.round(W * (videoRatio === '16:9' ? 0.03 : 0.044));
          });

          ctx.globalAlpha = 1;

          if (elapsed < totalDurationMs) {
            requestAnimationFrame(renderFrame);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(renderFrame);
      });

      recorder.stop();
      const url = await donePromise;
      setVideoOutputUrl(url);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Erro ao renderizar vídeo.');
    } finally {
      setRenderingVideo(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">
            Preparação Completa de Reunião · Google Slides + Compositor de Imagens + Vídeo 16:9 / 9:16
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#0F2744]">
            Estúdio de Apresentação e Google Slides
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Ferramentas do Estúdio"
          className="inline-flex items-center p-1 bg-slate-100 rounded-md self-start lg:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'slides'}
            onClick={() => setSubTab('slides')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'slides'
                ? 'bg-white text-[#0F2744] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Deck Google Slides ({activeSlidesCount})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'image-editor'}
            onClick={() => setSubTab('image-editor')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'image-editor'
                ? 'bg-white text-[#0F2744] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Editor de Imagens</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'video-studio'}
            onClick={() => setSubTab('video-studio')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'video-studio'
                ? 'bg-white text-[#0F2744] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Estúdio de Vídeo</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: GOOGLE SLIDES BUILDER ==================== */}
      {subTab === 'slides' && (
        <div className="space-y-6">
          {/* Google Workspace Connection & Export Ribbon */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="deck-title" className="text-xs font-medium text-slate-500 block">
                Título da Apresentação no Google Slides
              </label>
              <input
                id="deck-title"
                type="text"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                className="w-full max-w-xl px-3 py-2 text-sm font-medium text-[#0F2744] bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:bg-white focus:border-[#0F2744]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {!googleAccessToken ? (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={isLoggingIn}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="block w-full h-full"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isLoggingIn ? 'Conectando...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              ) : (
                <>
                  <div className="text-right text-xs">
                    <p className="font-medium text-slate-900">
                      {googleUser?.displayName || 'Conta Google Conectada'}
                    </p>
                    <p className="text-slate-500">{googleUser?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={onGoogleLogout}
                    title="Desconectar conta Google"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                  <button
                    type="button"
                    disabled={activeSlidesCount === 0 || exportingSlides}
                    onClick={() => setShowConfirmModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#0F2744] hover:bg-[#18365A] disabled:opacity-50 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Presentation className="w-4 h-4" />
                    <span>Publicar no Google Slides ({activeSlidesCount})</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {(authError || exportError) && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {authError || exportError}
            </div>
          )}

          {exportResult && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>
                    Apresentação criada no Google Slides com {exportResult.slideCount} slides e notas do apresentador!
                  </span>
                </p>
                <p className="text-xs text-emerald-800">{exportResult.title}</p>
              </div>
              <a
                href={exportResult.presentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-700 rounded-md whitespace-nowrap"
              >
                <span>Abrir no Google Slides</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Slide Deck Editor Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Rail: Slide List */}
            <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-serif text-base font-semibold text-[#0F2744]">
                  Estrutura do Deck ({activeSlidesCount}/{slides.length})
                </h2>
                <button
                  type="button"
                  onClick={handleAddBlankSlide}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#0F2744] bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Slide</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
                {slides.map((s, idx) => {
                  const isSelected = s.id === selectedSlide?.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSlideId(s.id)}
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#F3F6FA]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={s.included}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateSlide(s.id, { included: e.target.checked })}
                        aria-label={`Incluir slide ${idx + 1}`}
                        className="mt-1 h-4 w-4 accent-[#0F2744] cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-mono text-slate-400">
                          SLIDE {String(idx + 1).padStart(2, '0')} · {s.layoutType}
                        </p>
                        <p
                          className={`text-sm font-medium truncate ${
                            s.included ? 'text-slate-900' : 'text-slate-400 line-through'
                          }`}
                        >
                          {s.title}
                        </p>
                      </div>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(s.id);
                          }}
                          aria-label="Remover slide"
                          className="p-1 text-slate-400 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right Pane: Live 16:9 Slide Preview + Editor + AI Refiner */}
            {selectedSlide && (
              <div className="lg:col-span-8 space-y-5">
                {/* 16:9 Boardroom Preview */}
                <div
                  className={`aspect-video w-full rounded-lg border border-slate-300 overflow-hidden flex flex-col justify-between p-6 sm:p-8 ${
                    selectedSlide.layoutType === 'cover' || selectedSlide.layoutType === 'verdict'
                      ? 'bg-[#0F2744] text-white'
                      : 'bg-[#F8FAFC] text-[#0F172A]'
                  }`}
                >
                  <div className="space-y-2">
                    <p
                      className={`text-[11px] font-medium tracking-wider uppercase ${
                        selectedSlide.layoutType === 'cover' || selectedSlide.layoutType === 'verdict'
                          ? 'text-amber-300'
                          : 'text-slate-500'
                      }`}
                    >
                      ALL-IN Logística e Transportes · Laudo Executivo · Slide{' '}
                      {String(selectedSlide.order).padStart(2, '0')}
                    </p>
                    <h3
                      className={`font-serif text-xl sm:text-2xl font-semibold leading-tight ${
                        selectedSlide.layoutType === 'cover' || selectedSlide.layoutType === 'verdict'
                          ? 'text-white'
                          : 'text-[#0F2744]'
                      }`}
                    >
                      {selectedSlide.title}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm ${
                        selectedSlide.layoutType === 'cover' || selectedSlide.layoutType === 'verdict'
                          ? 'text-slate-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {selectedSlide.subtitle}
                    </p>
                  </div>

                  {selectedSlide.highlightMetric && (
                    <div
                      className={`px-4 py-2 rounded text-xs sm:text-sm font-mono font-semibold ${
                        selectedSlide.layoutType === 'cover' || selectedSlide.layoutType === 'verdict'
                          ? 'bg-[#B45309] text-white'
                          : 'bg-white border border-slate-200 text-[#B45309]'
                      }`}
                    >
                      {selectedSlide.highlightMetric}
                    </div>
                  )}

                  <ul className="space-y-1.5 text-xs sm:text-sm leading-snug">
                    {selectedSlide.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#D97706] font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Slide Editor Form */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <h3 className="font-serif text-lg font-semibold text-[#0F2744]">
                      Revisão e Edição do Slide {selectedSlide.order}
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        placeholder="Ex: Deixe mais direto para CFO..."
                        className="px-3 py-1.5 text-xs border border-slate-300 rounded-md w-56 focus:outline-none focus:border-[#0F2744]"
                      />
                      <button
                        type="button"
                        disabled={refiningSlide || !refineInstruction.trim()}
                        onClick={handleRefineSlideWithAI}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0F2744] hover:bg-[#18365A] disabled:opacity-50 rounded-md whitespace-nowrap cursor-pointer"
                      >
                        {refiningSlide ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Refinar com IA</span>
                      </button>
                    </div>
                  </div>

                  {slideAiError && (
                    <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2.5">
                      {slideAiError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Título</label>
                      <input
                        type="text"
                        value={selectedSlide.title}
                        onChange={(e) => updateSlide(selectedSlide.id, { title: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#0F2744]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Métrica em Destaque</label>
                      <input
                        type="text"
                        value={selectedSlide.highlightMetric ?? ''}
                        onChange={(e) =>
                          updateSlide(selectedSlide.id, { highlightMetric: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-md focus:outline-none focus:border-[#0F2744]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Subtítulo</label>
                    <input
                      type="text"
                      value={selectedSlide.subtitle}
                      onChange={(e) => updateSlide(selectedSlide.id, { subtitle: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#0F2744]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">
                      Tópicos do Slide (1 por linha)
                    </label>
                    <textarea
                      rows={4}
                      value={selectedSlide.bullets.join('\n')}
                      onChange={(e) =>
                        updateSlide(selectedSlide.id, {
                          bullets: e.target.value.split('\n').filter((line) => line.trim() !== ''),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-[#0F2744]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">
                      Notas do Apresentador (exportadas para o rodapé do Google Slides)
                    </label>
                    <textarea
                      rows={2}
                      value={selectedSlide.speakerNotes}
                      onChange={(e) =>
                        updateSlide(selectedSlide.id, { speakerNotes: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs text-slate-700 border border-slate-300 rounded-md focus:outline-none focus:border-[#0F2744]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: EDITORIAL IMAGE COMPOSER ==================== */}
      {subTab === 'image-editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="font-serif text-lg font-semibold text-[#0F2744]">
                Compositor de Capas e Fotos
              </h2>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0F2744] bg-slate-100 hover:bg-slate-200 rounded cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Enviar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'editor')}
                  className="hidden"
                />
              </label>
            </div>

            {/* Asset Selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Escolha a imagem base</p>
              <div className="grid grid-cols-3 gap-2">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      setSelectedAssetId(asset.id);
                      setOverlayTitle(asset.title);
                      setOverlaySubtitle(asset.subtitle);
                      setOverlayKpi(asset.defaultKpi);
                    }}
                    className={`rounded-md overflow-hidden border-2 transition-colors cursor-pointer text-left ${
                      selectedAssetId === asset.id
                        ? 'border-[#0F2744]'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={asset.url}
                      alt={asset.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-16 object-cover"
                    />
                    <p className="text-[10px] p-1.5 truncate text-slate-700 font-medium">
                      {asset.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Free Multimodal AI Analysis Button */}
            <button
              type="button"
              disabled={analyzingImage}
              onClick={handleAnalyzeImageWithAI}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-white bg-[#0F2744] hover:bg-[#18365A] disabled:opacity-50 rounded-md cursor-pointer"
            >
              {analyzingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Analisar Foto e Gerar Textos Executivos com IA</span>
            </button>

            {mediaAiError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2.5">
                {mediaAiError}
              </p>
            )}

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Proporção de Exportação</p>
              <div className="grid grid-cols-4 gap-2">
                {(['16:9', '4:3', '1:1', '9:16'] as ImageRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setImageRatio(ratio)}
                    className={`py-2 text-xs font-mono font-medium rounded border cursor-pointer ${
                      imageRatio === ratio
                        ? 'bg-[#0F2744] text-white border-[#0F2744]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Overlays */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEditorialFrame}
                  onChange={(e) => setShowEditorialFrame(e.target.checked)}
                  className="accent-[#0F2744]"
                />
                <span>Aplicar identidade editorial ALL-IN (título, KPI e faixa âmbar)</span>
              </label>

              <div className="space-y-1">
                <label className="text-xs text-slate-600">Título da Arte</label>
                <input
                  type="text"
                  value={overlayTitle}
                  onChange={(e) => setOverlayTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600">Legenda de Apoio</label>
                <input
                  type="text"
                  value={overlaySubtitle}
                  onChange={(e) => setOverlaySubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600">Métrica em Destaque</label>
                <input
                  type="text"
                  value={overlayKpi}
                  onChange={(e) => setOverlayKpi(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-md"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Contraste do Véu Azul-Marinho</span>
                  <span className="font-mono">{overlayDarkness}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={overlayDarkness}
                  onChange={(e) => setOverlayDarkness(Number(e.target.value))}
                  className="w-full editorial-range"
                />
              </div>
            </div>
          </div>

          {/* Live Canvas Preview */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-500">
                Pré-visualização em Alta Resolução ({imageRatio})
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveComposedImage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0F2744] bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar na Galeria</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadComposedImage}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#0F2744] hover:bg-[#18365A] rounded-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar PNG</span>
                </button>
              </div>
            </div>

            {savedNotice && (
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2.5">
                {savedNotice}
              </p>
            )}

            <div className="flex items-center justify-center bg-slate-100 border border-slate-200 rounded-md p-4 min-h-[380px]">
              <canvas
                ref={imageCanvasRef}
                className="max-w-full max-h-[520px] rounded shadow-sm bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: EXECUTIVE VIDEO STUDIO (16:9 / 9:16) ==================== */}
      {subTab === 'video-studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="font-serif text-lg font-semibold text-[#0F2744]">
                Estúdio de Vídeo Executivo
              </h2>
              <div className="inline-flex p-1 bg-slate-100 rounded text-xs">
                <button
                  type="button"
                  onClick={() => setVideoRatio('16:9')}
                  className={`px-2.5 py-1 rounded font-mono cursor-pointer ${
                    videoRatio === '16:9' ? 'bg-[#0F2744] text-white' : 'text-slate-600'
                  }`}
                >
                  16:9
                </button>
                <button
                  type="button"
                  onClick={() => setVideoRatio('9:16')}
                  className={`px-2.5 py-1 rounded font-mono cursor-pointer ${
                    videoRatio === '9:16' ? 'bg-[#0F2744] text-white' : 'text-slate-600'
                  }`}
                >
                  9:16
                </button>
              </div>
            </div>

            {/* Mode Switch */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVideoMode('animate-photo')}
                className={`py-2 px-3 text-xs font-medium rounded border cursor-pointer ${
                  videoMode === 'animate-photo'
                    ? 'bg-[#0F2744] text-white border-[#0F2744]'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Animar Foto em Vídeo
              </button>
              <button
                type="button"
                onClick={() => setVideoMode('text-storyboard')}
                className={`py-2 px-3 text-xs font-medium rounded border cursor-pointer ${
                  videoMode === 'text-storyboard'
                    ? 'bg-[#0F2744] text-white border-[#0F2744]'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Roteiro / Texto p/ Vídeo
              </button>
            </div>

            {videoMode === 'animate-photo' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-600">Foto a Animar (Ken Burns)</p>
                  <label className="inline-flex items-center gap-1 text-xs font-medium text-[#0F2744] cursor-pointer hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setVideoAssetId(asset.id)}
                      className={`rounded overflow-hidden border-2 cursor-pointer ${
                        videoAssetId === asset.id ? 'border-[#0F2744]' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={asset.url}
                        alt={asset.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-14 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Storyboard Generator */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">
                Diretriz de Roteiro (gerar 3 cenas com Gemini 4 Hydrogen)
              </label>
              <textarea
                rows={3}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-[#0F2744]"
              />
              <button
                type="button"
                disabled={generatingStoryboard}
                onClick={handleGenerateStoryboardFromText}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-[#0F2744] bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer disabled:opacity-50"
              >
                {generatingStoryboard ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Criar Roteiro de 3 Cenas com IA</span>
              </button>
            </div>

            {/* Editable 3 Scenes */}
            <div className="space-y-3 border-t border-slate-200 pt-3">
              <p className="text-xs font-semibold text-slate-700">Cenas do Vídeo (7,5s)</p>
              {scenes.map((scene, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                  <p className="text-[11px] font-mono text-slate-500">CENA 0{idx + 1}</p>
                  <input
                    type="text"
                    value={scene.headline}
                    onChange={(e) =>
                      setScenes(
                        scenes.map((s, i) => (i === idx ? { ...s, headline: e.target.value } : s))
                      )
                    }
                    className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    value={scene.metric}
                    onChange={(e) =>
                      setScenes(
                        scenes.map((s, i) => (i === idx ? { ...s, metric: e.target.value } : s))
                      )
                    }
                    className="w-full px-2.5 py-1 text-xs font-mono bg-white border border-slate-300 rounded"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={renderingVideo}
              onClick={handleRenderExecutiveVideo}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-[#0F2744] hover:bg-[#18365A] disabled:opacity-50 rounded-md cursor-pointer"
            >
              {renderingVideo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Film className="w-4 h-4" />
              )}
              <span>
                {renderingVideo
                  ? `Renderizando Vídeo (${renderProgress}%)...`
                  : `Renderizar Vídeo Executivo (${videoRatio})`}
              </span>
            </button>
          </div>

          {/* Preview & Output Player */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Estúdio de Renderização Local · Proporção {videoRatio} ({videoRatio === '16:9' ? 'Paisagem' : 'Retrato'})
              </p>
              {videoOutputUrl && (
                <a
                  href={videoOutputUrl}
                  download={`all-in-valuation-${videoRatio.replace(':', 'x')}.webm`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#B45309] hover:bg-[#92400E] rounded-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Vídeo</span>
                </a>
              )}
            </div>

            {videoError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-3">
                {videoError}
              </p>
            )}

            {renderingVideo && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-[#0F2744] transition-all duration-100"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 font-mono">
                  Gravando quadros em 30fps com animação editorial... {renderProgress}%
                </p>
              </div>
            )}

            <div className="bg-slate-100 border border-slate-200 rounded-md p-4 flex items-center justify-center min-h-[380px]">
              {videoOutputUrl && !renderingVideo ? (
                <video
                  src={videoOutputUrl}
                  controls
                  autoPlay
                  loop
                  className="max-w-full max-h-[520px] rounded shadow-sm bg-black"
                />
              ) : (
                <div className="text-center space-y-3 max-w-md">
                  <canvas
                    ref={videoCanvasRef}
                    className={`mx-auto rounded shadow-sm ${
                      renderingVideo ? 'block max-w-full max-h-[460px]' : 'hidden'
                    }`}
                  />
                  {!renderingVideo && (
                    <>
                      <Film className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="font-serif text-lg text-[#0F2744]">
                        Pronto para renderizar seu vídeo executivo {videoRatio}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Escolha Animar Foto ou Roteiro de 3 Cenas à esquerda, ajuste os textos com a
                        IA e clique em Renderizar Vídeo para gerar o arquivo pronto para apresentar
                        aos sócios ou enviar no WhatsApp.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Keep canvas mounted when videoOutputUrl is shown so re-render always has ref */}
            {videoOutputUrl && !renderingVideo && (
              <canvas ref={videoCanvasRef} className="hidden" />
            )}
          </div>
        </div>
      )}

      {/* ==================== MANDATORY CONFIRMATION MODAL FOR GOOGLE SLIDES ==================== */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-slides-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[#B45309]">Confirmação Obrigatória · Google Slides</p>
              <h2 id="confirm-slides-title" className="font-serif text-xl font-semibold text-[#0F2744]">
                Criar nova apresentação na sua conta Google?
              </h2>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2 text-sm text-slate-700">
              <p>
                <strong className="text-slate-900">Título:</strong> {deckTitle}
              </p>
              <p>
                <strong className="text-slate-900">Slides incluídos:</strong> {activeSlidesCount} slides
                executivos com notas do apresentador
              </p>
              <p>
                <strong className="text-slate-900">Conta destino:</strong>{' '}
                {googleUser?.email || 'Conta Google conectada'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={exportingSlides}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={exportingSlides}
                onClick={handleConfirmGoogleSlidesExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0F2744] hover:bg-[#18365A] disabled:opacity-60 rounded-md cursor-pointer"
              >
                {exportingSlides ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Presentation className="w-4 h-4" />
                )}
                <span>{exportingSlides ? 'Criando no Google Slides...' : 'Confirmar e Criar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
