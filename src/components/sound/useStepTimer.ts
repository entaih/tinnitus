import { useCallback, useEffect, useRef, useState } from 'react';

export interface TimedStep<T> { data: T; seconds: number }
export type StepStatus = 'idle' | 'running' | 'paused' | 'done';

/**
 * One-second step sequencer for guided exercises (breathing, PMR).
 * Drives `index`/`remaining`; calls `onStep` at every step entry and `onFinish` with total elapsed seconds.
 */
export function useStepTimer<T>(steps: TimedStep<T>[], handlers: { onStep?: (step: TimedStep<T>, index: number) => void; onFinish?: (elapsedSec: number) => void } = {}) {
  const [status, setStatus] = useState<StepStatus>('idle');
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.seconds ?? 0);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const h = useRef(handlers); h.current = handlers;
  const stepsRef = useRef(steps); stepsRef.current = steps;
  const elapsedRef = useRef(0);
  const idxRef = useRef(0);
  const remRef = useRef(remaining);
  const statusRef = useRef<StepStatus>('idle');

  const clear = useCallback(() => { if (iv.current) clearInterval(iv.current); iv.current = null; }, []);
  const setStat = useCallback((s: StepStatus) => { statusRef.current = s; setStatus(s); }, []);

  const goTo = useCallback((i: number) => {
    const s = stepsRef.current;
    if (i >= s.length) {
      clear();
      setStat('done');
      h.current.onFinish?.(elapsedRef.current);
      return;
    }
    idxRef.current = i;
    remRef.current = s[i].seconds;
    setIndex(i);
    setRemaining(s[i].seconds);
    h.current.onStep?.(s[i], i);
  }, [clear, setStat]);

  const run = useCallback(() => {
    clear();
    iv.current = setInterval(() => {
      elapsedRef.current += 1;
      remRef.current -= 1;
      if (remRef.current <= 0) goTo(idxRef.current + 1);
      else setRemaining(remRef.current);
    }, 1000);
  }, [clear, goTo]);

  const start = useCallback(() => { elapsedRef.current = 0; setStat('running'); goTo(0); run(); }, [goTo, run, setStat]);
  const pause = useCallback(() => { clear(); setStat('paused'); }, [clear, setStat]);
  const resume = useCallback(() => { if (statusRef.current !== 'paused') return; setStat('running'); run(); }, [run, setStat]);
  const skip = useCallback(() => { if (statusRef.current === 'running' || statusRef.current === 'paused') goTo(idxRef.current + 1); }, [goTo]);
  const reset = useCallback(() => {
    clear(); elapsedRef.current = 0; idxRef.current = 0;
    remRef.current = stepsRef.current[0]?.seconds ?? 0;
    setIndex(0); setRemaining(remRef.current); setStat('idle');
  }, [clear, setStat]);

  // Keep the idle preview in sync when the step list changes (pattern / cycle count edits).
  useEffect(() => { if (statusRef.current === 'idle') { remRef.current = steps[0]?.seconds ?? 0; setRemaining(remRef.current); } }, [steps]);
  useEffect(() => clear, [clear]);

  const totalSec = steps.reduce((a, s) => a + s.seconds, 0);
  const doneSec = steps.slice(0, index).reduce((a, s) => a + s.seconds, 0) + ((steps[index]?.seconds ?? 0) - remaining);
  return {
    status, index, remaining, step: steps[index], totalSec,
    progress: totalSec ? Math.max(0, Math.min(1, doneSec / totalSec)) : 0,
    phaseProgress: steps[index]?.seconds ? 1 - remaining / steps[index].seconds : 0,
    start, pause, resume, skip, reset,
  };
}
