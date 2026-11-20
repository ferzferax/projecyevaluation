import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { TopBar, type ActiveTab } from './components/TopBar';
import { ExecutiveReportView } from './components/ExecutiveReportView';
import { AuditModulesView } from './components/AuditModulesView';
import { RoiSimulatorView } from './components/RoiSimulatorView';
import { BoardAdvisorView } from './components/BoardAdvisorView';
import { StudioAndSlidesView } from './components/StudioAndSlidesView';
import {
  AUDIT_METADATA,
  DEFAULT_ROI_SCENARIO,
  EDITORIAL_ASSETS,
  buildDefaultDeck,
  type EditorialAsset,
  type RoiScenario,
  type SlideDraft,
} from './data/valuationData';
import { googleSignIn, initAuth, logoutGoogle } from './services/googleAuth';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('report');
  const [scenario, setScenario] = useState<RoiScenario>(DEFAULT_ROI_SCENARIO);
  const [slides, setSlides] = useState<SlideDraft[]>(() => buildDefaultDeck(DEFAULT_ROI_SCENARIO));
  const [assets, setAssets] = useState<EditorialAsset[]>(EDITORIAL_ASSETS);
  const [deckSyncedMessage, setDeckSyncedMessage] = useState<string | null>(null);

  // Google Workspace Auth state (in-memory token only)
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      setGoogleUser(result.user);
      setGoogleAccessToken(result.accessToken);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Não foi possível autenticar com o Google Slides.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleAccessToken(null);
  };

  const handleSyncScenarioToDeck = () => {
    const updatedDefaults = buildDefaultDeck(scenario);
    // Preserve any extra custom slides added by the user or advisor
    const customSlides = slides.filter((s) => s.id.startsWith('slide-custom-') || s.id.startsWith('slide-ai-'));
    const merged = [
      ...updatedDefaults,
      ...customSlides.map((s, idx) => ({ ...s, order: updatedDefaults.length + idx + 1 })),
    ];
    setSlides(merged);
    setDeckSyncedMessage('Cenário aplicado ao Deck!');
    setTimeout(() => setDeckSyncedMessage(null), 3000);
  };

  const handleAddSlideFromAdvisor = (
    draft: Omit<SlideDraft, 'id' | 'order' | 'included'>
  ) => {
    const newSlide: SlideDraft = {
      ...draft,
      id: `slide-ai-${Date.now()}`,
      order: slides.length + 1,
      included: true,
    };
    setSlides((prev) => [...prev, newSlide]);
  };

  const handleAddAsset = (asset: EditorialAsset) => {
    setAssets((prev) => [asset, ...prev]);
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onQuickExport={() => handleSelectTab('studio')}
      />

      <main className="flex-1">
        {activeTab === 'report' && (
          <ExecutiveReportView scenario={scenario} onNavigate={handleSelectTab} />
        )}

        {activeTab === 'audit' && <AuditModulesView />}

        {activeTab === 'roi' && (
          <RoiSimulatorView
            scenario={scenario}
            onChangeScenario={setScenario}
            onSyncDeck={handleSyncScenarioToDeck}
            deckSyncedMessage={deckSyncedMessage}
          />
        )}

        {activeTab === 'advisor' && (
          <BoardAdvisorView
            scenario={scenario}
            onAddSlideFromAdvisor={handleAddSlideFromAdvisor}
          />
        )}

        {activeTab === 'studio' && (
          <StudioAndSlidesView
            scenario={scenario}
            slides={slides}
            onChangeSlides={setSlides}
            assets={assets}
            onAddAsset={handleAddAsset}
            googleUser={googleUser}
            googleAccessToken={googleAccessToken}
            isLoggingIn={isLoggingIn}
            authError={authError}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            {AUDIT_METADATA.company} · Laudo Executivo de Valuation Tecnológico · Responsável Técnico:{' '}
            {AUDIT_METADATA.leadEngineer}
          </p>
          <p className="font-mono tabular-nums">
            Dossiê Mestre 361 págs. · Base 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
