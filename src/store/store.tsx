import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import type { AppState, Project, Progress, Mode, QuizResult } from './types';
import { buildDemoProject } from '../data/demoProject';
import { uid } from '../lib/compute';
import { BADGE_MAP, XP } from '../data/badges';

const KEY = 'pts-academy-v1';
const VERSION = 1;

export function emptyProject(name: string, org = '', planName = ''): Project {
  return {
    id: uid('p'), name, org, planName, createdAt: Date.now(), updatedAt: Date.now(),
    items: [], hazards: [], coverage: {}, selectedHazardId: '', strategy: '', compoundWithId: '', strategyNote: '',
    injects: [], criteria: [],
    escalation: { enabled: false, time: '', targetItemIds: [], event: '', text: '', stopPoint: '',
      checks: { justified: false, targetsUntested: false, prePlanned: false, hasStopPoint: false, withinCapacity: false } },
    observations: [], aar: [], stages: {}, checklist: {},
  };
}

function initialState(): AppState {
  const demo = buildDemoProject();
  return {
    version: VERSION, mode: 'learn', route: '#/',
    progress: { xp: 0, badges: [], modules: {}, lastModuleId: '', conceptErrors: {}, conceptMastery: {}, final: {}, labs: {} },
    projects: [demo], activeProjectId: demo.id, seenIntro: false,
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== VERSION) return initialState();
    // ضمان وجود المشروع التجريبي دائمًا
    if (!parsed.projects.some((p) => p.isDemo)) parsed.projects.unshift(buildDemoProject());
    if (!parsed.projects.some((p) => p.id === parsed.activeProjectId)) parsed.activeProjectId = parsed.projects[0].id;
    parsed.progress.labs = parsed.progress.labs || {};
    parsed.progress.conceptMastery = parsed.progress.conceptMastery || {};
    return parsed;
  } catch { return initialState(); }
}

type Action =
  | { type: 'route'; route: string }
  | { type: 'mode'; mode: Mode }
  | { type: 'seenIntro' }
  | { type: 'addProject'; project: Project }
  | { type: 'updateProject'; id: string; patch: Partial<Project> }
  | { type: 'mutateProject'; id: string; fn: (p: Project) => void }
  | { type: 'editOrFork'; id: string; fn: (p: Project) => void }
  | { type: 'deleteProject'; id: string }
  | { type: 'setActive'; id: string }
  | { type: 'duplicateProject'; id: string; name: string }
  | { type: 'slideSeen'; moduleId: string; slideId: string }
  | { type: 'moduleComplete'; moduleId: string }
  | { type: 'quizDone'; moduleId: string; result: QuizResult; badge?: string }
  | { type: 'concept'; concept: string; correct: boolean }
  | { type: 'lab'; id: string; score: number }
  | { type: 'finalKnowledge'; result: QuizResult }
  | { type: 'finalProject'; report: any; projectId: string }
  | { type: 'xp'; amount: number }
  | { type: 'badge'; id: string }
  | { type: 'reset' }
  | { type: 'import'; state: AppState };

function grantBadge(p: Progress, id?: string) {
  if (!id || p.badges.includes(id)) return;
  p.badges.push(id);
  p.xp += BADGE_MAP[id]?.xp ?? 0;
}

function reducer(state: AppState, a: Action): AppState {
  const s: AppState = JSON.parse(JSON.stringify(state));
  const touch = (id: string) => { const p = s.projects.find((x) => x.id === id); if (p) p.updatedAt = Date.now(); };

  switch (a.type) {
    case 'route': s.route = a.route; return s;
    case 'mode': s.mode = a.mode; return s;
    case 'seenIntro': s.seenIntro = true; return s;

    case 'addProject': s.projects.push(a.project); s.activeProjectId = a.project.id; return s;
    case 'updateProject': {
      const p = s.projects.find((x) => x.id === a.id); if (!p) return s;
      Object.assign(p, a.patch); p.updatedAt = Date.now(); return s;
    }
    case 'mutateProject': {
      const p = s.projects.find((x) => x.id === a.id); if (!p) return s;
      a.fn(p); p.updatedAt = Date.now(); return s;
    }
    case 'editOrFork': {
      const p = s.projects.find((x) => x.id === a.id); if (!p) return s;
      if (!p.isDemo) { a.fn(p); p.updatedAt = Date.now(); return s; }
      const copy: Project = JSON.parse(JSON.stringify(p));
      copy.id = uid('p'); copy.isDemo = false;
      copy.name = 'نسخة قابلة للتعديل — ' + p.name.replace('مثال تدريبي: ', '');
      copy.createdAt = Date.now(); copy.updatedAt = Date.now();
      a.fn(copy);
      s.projects.push(copy); s.activeProjectId = copy.id;
      return s;
    }
    case 'deleteProject': {
      s.projects = s.projects.filter((x) => x.id !== a.id || x.isDemo);
      if (!s.projects.some((x) => x.id === s.activeProjectId)) s.activeProjectId = s.projects[0]?.id ?? '';
      return s;
    }
    case 'duplicateProject': {
      const src = s.projects.find((x) => x.id === a.id); if (!src) return s;
      const copy: Project = JSON.parse(JSON.stringify(src));
      copy.id = uid('p'); copy.name = a.name; copy.isDemo = false;
      copy.createdAt = Date.now(); copy.updatedAt = Date.now();
      s.projects.push(copy); s.activeProjectId = copy.id; return s;
    }
    case 'setActive': s.activeProjectId = a.id; return s;

    case 'slideSeen': {
      const m = (s.progress.modules[a.moduleId] ||= { seen: [], completed: false });
      if (!m.seen.includes(a.slideId)) { m.seen.push(a.slideId); s.progress.xp += XP.slide; }
      s.progress.lastModuleId = a.moduleId;
      return s;
    }
    case 'moduleComplete': {
      const m = (s.progress.modules[a.moduleId] ||= { seen: [], completed: false });
      if (!m.completed) { m.completed = true; s.progress.xp += XP.moduleComplete; }
      return s;
    }
    case 'quizDone': {
      const m = (s.progress.modules[a.moduleId] ||= { seen: [], completed: false });
      const prevBest = m.quiz?.best ?? 0;
      const attempts = (m.quiz?.attempts ?? 0) + 1;
      m.quiz = { ...a.result, attempts, best: Math.max(prevBest, a.result.score) };
      if (a.result.score >= 70 && prevBest < 70) {
        s.progress.xp += XP.quizPass;
        if (a.result.score === 100) s.progress.xp += XP.quizPerfect;
        grantBadge(s.progress, a.badge);
      }
      return s;
    }
    case 'concept': {
      if (a.correct) s.progress.conceptMastery[a.concept] = (s.progress.conceptMastery[a.concept] ?? 0) + 1;
      else s.progress.conceptErrors[a.concept] = (s.progress.conceptErrors[a.concept] ?? 0) + 1;
      return s;
    }
    case 'lab': {
      const prev = s.progress.labs[a.id];
      s.progress.labs[a.id] = { best: Math.max(prev?.best ?? 0, a.score), done: true };
      if (!prev?.done) s.progress.xp += XP.labSolved;
      return s;
    }
    case 'finalKnowledge': {
      s.progress.final.knowledge = a.result;
      return s;
    }
    case 'finalProject': {
      s.progress.final.report = a.report;
      s.progress.final.projectId = a.projectId;
      s.progress.final.submittedAt = Date.now();
      const k = s.progress.final.knowledge?.score ?? 0;
      if (k >= 70 && a.report.total >= 70) { s.progress.xp += XP.finalPass; grantBadge(s.progress, 'master'); }
      return s;
    }
    case 'xp': s.progress.xp += a.amount; return s;
    case 'badge': grantBadge(s.progress, a.id); return s;
    case 'reset': return initialState();
    case 'import': return a.state;
    default: return s;
  }
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  project: Project | undefined;
  mutate: (fn: (p: Project) => void) => void;
  go: (route: string) => void;
}
const StoreCtx = createContext<Ctx>(null as any);

// أثناء التطوير: أي تعديل على هذا الملف يُعيد تحميل الصفحة كاملة
// بدل الاستبدال الجزئي، لأن السياق لا يُستبدل بأمان مع المكوّنات المُركَّبة.
if (import.meta.hot) import.meta.hot.invalidate();

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const saveTimer = useRef<number>();

  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* تجاهل امتلاء التخزين */ }
    }, 250);
  }, [state]);

  useEffect(() => {
    const onHash = () => dispatch({ type: 'route', route: location.hash || '#/' });
    window.addEventListener('hashchange', onHash);
    onHash();
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const project = useMemo(() => state.projects.find((p) => p.id === state.activeProjectId), [state.projects, state.activeProjectId]);

  const value: Ctx = useMemo(() => ({
    state, dispatch, project,
    mutate: (fn) => { if (state.activeProjectId) dispatch({ type: 'mutateProject', id: state.activeProjectId, fn }); },
    go: (route) => { if (location.hash !== route) location.hash = route; else dispatch({ type: 'route', route }); },
  }), [state, project]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export const useStore = () => useContext(StoreCtx);

/** تعديل المشروع؛ إن كان المشروع التجريبي فيُنسخ تلقائيًا ويُطبَّق التعديل على النسخة */
export function useEditableProject() {
  const { state, project, dispatch } = useStore();
  return {
    project,
    isDemo: !!project?.isDemo,
    edit: (fn: (p: Project) => void) => {
      if (!project) return;
      dispatch({ type: 'editOrFork', id: project.id, fn });
    },
    fork: () => { if (project?.isDemo) dispatch({ type: 'editOrFork', id: project.id, fn: () => {} }); },
    state,
  };
}
