import { router } from 'expo-router';
import type { ProgramTask } from '@/clinical/types';
import { taskQuery } from './taskBudget';

/** Navigate to a task's route, carrying the taskKey (so the destination can mark it complete) and the task's view params (e.g. summary=1). */
export function openTask(task: ProgramTask, key: string, extra?: Record<string, string>) {
  const route = task.id === 'diary.daily' ? '/diary' : task.route;
  router.push(`${route}${route.includes('?') ? '&' : '?'}${taskQuery(task, key, extra)}`);
}
