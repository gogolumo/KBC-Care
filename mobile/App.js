// KBC Care mobile - root component.
// One screen state machine like the web page: customer home (+ bottom sheets) or adviser view.
import { useEffect, useRef } from 'react';
import { AppState, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sheet from './src/components/Sheet';
import AdviserScreen from './src/screens/AdviserScreen';
import CustomerHome from './src/screens/CustomerHome';
import DemoSheet from './src/sheets/DemoSheet';
import KateSheet from './src/sheets/KateSheet';
import ShareSheet from './src/sheets/ShareSheet';
import WhySheet from './src/sheets/WhySheet';
import { useCompass } from './src/useCompass';

const SHEETS = { kate: KateSheet, why: WhySheet, share: ShareSheet, demo: DemoSheet };

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const c = useCompass();
  const lastSheet = useRef(null);
  const { start, syncQuietly, view, setView } = c;

  // First load (same calls as the web page on mount).
  useEffect(() => {
    start();
  }, [start]);

  // Coming back to the app: pick up changes made elsewhere (e.g. the web demo).
  const syncRef = useRef(syncQuietly);
  syncRef.current = syncQuietly;
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') syncRef.current();
    });
    return () => sub.remove();
  }, []);

  // Android back button: adviser view -> customer view.
  useEffect(() => {
    if (view !== 'adviser') return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setView('customer');
      return true;
    });
    return () => sub.remove();
  }, [view, setView]);

  if (view === 'adviser') {
    return <AdviserScreen passport={c.passport} confidence={c.confidence} signalCount={c.events.length} onBack={() => setView('customer')} />;
  }

  // Keep rendering the last sheet while the modal fades out.
  if (c.modal) lastSheet.current = c.modal;
  const Content = SHEETS[c.modal || lastSheet.current];

  return (
    <>
      <CustomerHome c={c} />
      <Sheet visible={Boolean(c.modal)} onClose={() => c.setModal(null)}>
        {Content ? <Content c={c} /> : null}
      </Sheet>
    </>
  );
}
