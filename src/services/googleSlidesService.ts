import type { SlideDraft } from '../data/valuationData';

export interface ExportSlidesResult {
  presentationId: string;
  presentationUrl: string;
  title: string;
  slideCount: number;
}

const SLIDES_API_BASE = 'https://slides.googleapis.com/v1/presentations';

// EMU helpers (Google Slides default 16:9 widescreen = 10in x 5.625in = 9144000 x 5143500 EMU)
const PT = 12700; // 1 pt in EMU

const NAVY_RGB = { red: 0.059, green: 0.153, blue: 0.267 }; // #0F2744
const AMBER_RGB = { red: 0.706, green: 0.325, blue: 0.035 }; // #B45309
const INK_RGB = { red: 0.059, green: 0.09, blue: 0.165 }; // #0F172A
const MUTED_RGB = { red: 0.278, green: 0.333, blue: 0.412 }; // #475569
const CANVAS_RGB = { red: 0.973, green: 0.98, blue: 0.988 }; // #F8FAFC
const WHITE_RGB = { red: 1, green: 1, blue: 1 };
const SOFT_AMBER_RGB = { red: 0.996, green: 0.953, blue: 0.78 }; // #FEF3C7
const LIGHT_NAVY_RGB = { red: 0.91, green: 0.933, blue: 0.961 }; // #E8EEF5

function makeId(prefix: string, idx: number): string {
  return `${prefix}_${idx}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function exportDeckToGoogleSlides(
  accessToken: string,
  presentationTitle: string,
  slides: SlideDraft[]
): Promise<ExportSlidesResult> {
  const activeSlides = slides.filter((s) => s.included);
  if (activeSlides.length === 0) {
    throw new Error('Selecione pelo menos um slide para exportar.');
  }

  // 1. Create empty presentation
  const createRes = await fetch(SLIDES_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: presentationTitle }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Falha ao criar apresentação no Google Slides (${createRes.status}): ${errText}`);
  }

  const created = (await createRes.json()) as {
    presentationId: string;
    slides?: Array<{ objectId: string }>;
  };
  const presentationId = created.presentationId;
  const defaultSlideId = created.slides?.[0]?.objectId;

  // 2. Build structured executive slides via batchUpdate
  const requests: Record<string, unknown>[] = [];
  const slideObjectIds: string[] = [];

  activeSlides.forEach((slide, idx) => {
    const slideId = makeId('slide', idx);
    slideObjectIds.push(slideId);

    const isDarkHero = slide.layoutType === 'cover' || slide.layoutType === 'verdict';

    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: idx,
        slideLayoutReference: { predefinedLayout: 'BLANK' },
      },
    });

    // Slide background color
    requests.push({
      updatePageProperties: {
        objectId: slideId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: { rgbColor: isDarkHero ? NAVY_RGB : CANVAS_RGB },
            },
          },
        },
        fields: 'pageBackgroundFill.solidFill.color',
      },
    });

    // Top thin editorial bar
    const topBarId = makeId('topbar', idx);
    requests.push({
      createShape: {
        objectId: topBarId,
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 720 * PT, unit: 'EMU' }, height: { magnitude: 6 * PT, unit: 'EMU' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0, unit: 'EMU' },
        },
      },
    });
    requests.push({
      updateShapeProperties: {
        objectId: topBarId,
        shapeProperties: {
          shapeBackgroundFill: { solidFill: { color: { rgbColor: isDarkHero ? AMBER_RGB : NAVY_RGB } } },
          outline: { propertyState: 'NOT_RENDERED' },
        },
        fields: 'shapeBackgroundFill.solidFill.color,outline.propertyState',
      },
    });

    // Kicker metadata text (no pills!)
    const kickerId = makeId('kicker', idx);
    const kickerText = `ALL-IN LOGÍSTICA E TRANSPORTES  ·  LAUDO DE VALUATION  ·  ${String(idx + 1).padStart(2, '0')} / ${String(activeSlides.length).padStart(2, '0')}`;
    requests.push({
      createShape: {
        objectId: kickerId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 640 * PT, unit: 'EMU' }, height: { magnitude: 22 * PT, unit: 'EMU' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 40 * PT, translateY: 22 * PT, unit: 'EMU' },
        },
      },
    });
    requests.push({
      insertText: { objectId: kickerId, text: kickerText },
    });
    requests.push({
      updateTextStyle: {
        objectId: kickerId,
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: { magnitude: 9, unit: 'PT' },
          bold: true,
          foregroundColor: {
            opaqueColor: { rgbColor: isDarkHero ? SOFT_AMBER_RGB : MUTED_RGB },
          },
        },
        fields: 'fontFamily,fontSize,bold,foregroundColor',
      },
    });

    // Title text box
    const titleId = makeId('title', idx);
    requests.push({
      createShape: {
        objectId: titleId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 640 * PT, unit: 'EMU' }, height: { magnitude: 56 * PT, unit: 'EMU' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 40 * PT, translateY: 46 * PT, unit: 'EMU' },
        },
      },
    });
    requests.push({
      insertText: { objectId: titleId, text: slide.title },
    });
    requests.push({
      updateTextStyle: {
        objectId: titleId,
        style: {
          fontFamily: 'Georgia',
          fontSize: { magnitude: isDarkHero ? 30 : 24, unit: 'PT' },
          bold: true,
          foregroundColor: { opaqueColor: { rgbColor: isDarkHero ? WHITE_RGB : NAVY_RGB } },
        },
        fields: 'fontFamily,fontSize,bold,foregroundColor',
      },
    });

    // Subtitle text box
    const subtitleId = makeId('sub', idx);
    requests.push({
      createShape: {
        objectId: subtitleId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: { width: { magnitude: 640 * PT, unit: 'EMU' }, height: { magnitude: 30 * PT, unit: 'EMU' } },
          transform: { scaleX: 1, scaleY: 1, translateX: 40 * PT, translateY: 102 * PT, unit: 'EMU' },
        },
      },
    });
    requests.push({
      insertText: { objectId: subtitleId, text: slide.subtitle },
    });
    requests.push({
      updateTextStyle: {
        objectId: subtitleId,
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: { magnitude: 13, unit: 'PT' },
          foregroundColor: { opaqueColor: { rgbColor: isDarkHero ? LIGHT_NAVY_RGB : MUTED_RGB } },
        },
        fields: 'fontFamily,fontSize,foregroundColor',
      },
    });

    // Highlight KPI box (if present)
    let bodyTopPt = 144;
    if (slide.highlightMetric) {
      const kpiBoxId = makeId('kpi', idx);
      requests.push({
        createShape: {
          objectId: kpiBoxId,
          shapeType: 'RECTANGLE',
          elementProperties: {
            pageObjectId: slideId,
            size: { width: { magnitude: 640 * PT, unit: 'EMU' }, height: { magnitude: 40 * PT, unit: 'EMU' } },
            transform: { scaleX: 1, scaleY: 1, translateX: 40 * PT, translateY: 138 * PT, unit: 'EMU' },
          },
        },
      });
      requests.push({
        updateShapeProperties: {
          objectId: kpiBoxId,
          shapeProperties: {
            shapeBackgroundFill: {
              solidFill: { color: { rgbColor: isDarkHero ? AMBER_RGB : WHITE_RGB } },
            },
            outline: {
              outlineFill: { solidFill: { color: { rgbColor: isDarkHero ? AMBER_RGB : LIGHT_NAVY_RGB } } },
              weight: { magnitude: 1, unit: 'PT' },
            },
          },
          fields: 'shapeBackgroundFill.solidFill.color,outline',
        },
      });
      requests.push({
        insertText: { objectId: kpiBoxId, text: slide.highlightMetric },
      });
      requests.push({
        updateTextStyle: {
          objectId: kpiBoxId,
          style: {
            fontFamily: 'Plus Jakarta Sans',
            fontSize: { magnitude: 14, unit: 'PT' },
            bold: true,
            foregroundColor: { opaqueColor: { rgbColor: isDarkHero ? WHITE_RGB : AMBER_RGB } },
          },
          fields: 'fontFamily,fontSize,bold,foregroundColor',
        },
      });
      bodyTopPt = 190;
    }

    // Main bullets box
    const bodyId = makeId('body', idx);
    const bodyText = slide.bullets.map((b) => `•  ${b}`).join('\n\n');
    requests.push({
      createShape: {
        objectId: bodyId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 640 * PT, unit: 'EMU' },
            height: { magnitude: (380 - bodyTopPt) * PT, unit: 'EMU' },
          },
          transform: { scaleX: 1, scaleY: 1, translateX: 40 * PT, translateY: bodyTopPt * PT, unit: 'EMU' },
        },
      },
    });
    requests.push({
      insertText: { objectId: bodyId, text: bodyText },
    });
    requests.push({
      updateTextStyle: {
        objectId: bodyId,
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: { magnitude: 13.5, unit: 'PT' },
          foregroundColor: { opaqueColor: { rgbColor: isDarkHero ? WHITE_RGB : INK_RGB } },
        },
        fields: 'fontFamily,fontSize,foregroundColor',
      },
    });
  });

  // Delete initial blank default slide if present
  if (defaultSlideId) {
    requests.push({
      deleteObject: { objectId: defaultSlideId },
    });
  }

  const batchRes = await fetch(`${SLIDES_API_BASE}/${presentationId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!batchRes.ok) {
    const errText = await batchRes.text();
    throw new Error(`Falha ao formatar slides (${batchRes.status}): ${errText}`);
  }

  // 3. Read presentation to attach speaker notes to each slide's notesPage
  const getRes = await fetch(`${SLIDES_API_BASE}/${presentationId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (getRes.ok) {
    const presData = (await getRes.json()) as {
      slides?: Array<{
        objectId: string;
        slideProperties?: {
          notesPage?: {
            notesProperties?: { speakerNotesObjectId?: string };
          };
        };
      }>;
    };

    const noteRequests: Record<string, unknown>[] = [];
    (presData.slides ?? []).forEach((s, idx) => {
      const notesObjId = s.slideProperties?.notesPage?.notesProperties?.speakerNotesObjectId;
      const draft = activeSlides[idx];
      if (notesObjId && draft?.speakerNotes) {
        noteRequests.push({
          insertText: {
            objectId: notesObjId,
            text: draft.speakerNotes,
          },
        });
      }
    });

    if (noteRequests.length > 0) {
      await fetch(`${SLIDES_API_BASE}/${presentationId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests: noteRequests }),
      });
    }
  }

  return {
    presentationId,
    presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    title: presentationTitle,
    slideCount: activeSlides.length,
  };
}
