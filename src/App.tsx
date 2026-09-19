import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './store/store';
import { Shell } from './components/layout/Shell';
import { Toaster } from './components/ui';
import { Home } from './features/home/Home';
import { Dashboard } from './features/dashboard/Dashboard';
import { LearnList, ModuleView } from './features/learn/Learn';
import { Labs } from './features/labs/Labs';
import { Final } from './features/final/Final';
import { BuildHome } from './features/build/BuildHome';
import { Projects } from './features/build/Projects';
import { Decompose } from './features/build/Decompose';
import { Matrix } from './features/build/Matrix';
import { History } from './features/build/History';
import { Injects } from './features/build/Injects';
import { Msel } from './features/build/Msel';
import { Escalation } from './features/build/Escalation';
import { Criteria } from './features/build/Criteria';
import { Observe } from './features/build/Observe';
import { Aar } from './features/build/Aar';
import { Pipeline } from './features/build/Pipeline';
import { Analytics } from './features/build/Analytics';
import { AuditTool } from './features/build/AuditTool';
import { ChecklistView } from './features/build/Checklist';
import { Forms } from './features/forms/Forms';
import { Reports } from './features/reports/Reports';
import { ContentAudit } from './features/audit/ContentAudit';
import { Assistant } from './features/assistant/Assistant';

function Router() {
  const { state, dispatch } = useStore();
  const r = state.route.replace(/^#/, '') || '/';
  const parts = r.split('/').filter(Boolean);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [r]);

  // مزامنة وضع النظام مع المسار حتى عند الدخول برابط مباشر
  useEffect(() => {
    const head = parts[0];
    const build = ['build', 'projects', 'forms', 'reports'];
    const learn = ['dashboard', 'learn', 'labs', 'final'];
    if (head && build.includes(head) && state.mode !== 'build') dispatch({ type: 'mode', mode: 'build' });
    else if (head && learn.includes(head) && state.mode !== 'learn') dispatch({ type: 'mode', mode: 'learn' });
  }, [r]);

  let page: React.ReactNode;
  if (parts.length === 0) page = <Home />;
  else if (parts[0] === 'dashboard') page = <Dashboard />;
  else if (parts[0] === 'learn') page = parts[1] ? <ModuleView id={parts[1]} /> : <LearnList />;
  else if (parts[0] === 'labs') page = <Labs />;
  else if (parts[0] === 'final') page = <Final />;
  else if (parts[0] === 'projects') page = <Projects />;
  else if (parts[0] === 'forms') page = <Forms initial={parts[1]} />;
  else if (parts[0] === 'reports') page = <Reports />;
  else if (parts[0] === 'audit') page = <ContentAudit />;
  else if (parts[0] === 'build') {
    switch (parts[1]) {
      case undefined: page = <BuildHome />; break;
      case 'decompose': page = <Decompose />; break;
      case 'matrix': page = <Matrix />; break;
      case 'history': page = <History />; break;
      case 'injects': page = <Injects />; break;
      case 'msel': page = <Msel />; break;
      case 'escalation': page = <Escalation />; break;
      case 'criteria': page = <Criteria />; break;
      case 'observe': page = <Observe />; break;
      case 'aar': page = <Aar />; break;
      case 'pipeline': page = <Pipeline />; break;
      case 'analytics': page = <Analytics />; break;
      case 'audit': page = <AuditTool />; break;
      case 'checklist': page = <ChecklistView />; break;
      default: page = <BuildHome />;
    }
  } else page = <Home />;

  return <Shell>{page}</Shell>;
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
      <Assistant />
      <Toaster />
    </StoreProvider>
  );
}
