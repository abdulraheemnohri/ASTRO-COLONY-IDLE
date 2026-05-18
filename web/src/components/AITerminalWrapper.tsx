import { Suspense, lazy } from 'react';

const AITerminal = lazy(() => import('./AITerminal').then(m => ({ default: m.AITerminal })));

export const AITerminalWrapper = () => (
  <Suspense fallback={null}>
    <AITerminal />
  </Suspense>
);
