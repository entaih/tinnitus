import { router } from 'expo-router';
import type { ProgramTask } from '@/clinical/types';

/** Navigate to a task's route, carrying the taskKey so the destination can mark it complete. */
export function openTask(task: ProgramTask, key: string) {
  const route = task.id === 'diary.daily' ? '/diary' : task.route;
  router.push(`${route}${route.includes('?') ? '&' : '?'}taskKey=${encodeURIComponent(key)}`);
}
