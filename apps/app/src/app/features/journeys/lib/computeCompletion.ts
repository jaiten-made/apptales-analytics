import attemptsRaw from "../components/details/data.json";

export interface AttemptRow {
  id: number | string;
  journeyId?: number | string;
  status?: string;
}

const attempts = attemptsRaw as AttemptRow[];

export function computeJourneyCompletionPercent(
  journeyId: number | string
): number {
  const filtered = attempts.filter(
    (a) => a.journeyId != null && String(a.journeyId) === String(journeyId)
  );
  if (filtered.length === 0) return 0;
  const successes = filtered.filter(
    (a) => a.status && a.status.toLowerCase() === "success"
  ).length;
  return Math.round((successes / filtered.length) * 100);
}

export function computeAllJourneyCompletion(): Record<string, number> {
  const map: Record<string, { success: number; total: number }> = {};
  for (const a of attempts) {
    if (a.journeyId == null) continue;
    const key = String(a.journeyId);
    if (!map[key]) map[key] = { success: 0, total: 0 };
    map[key].total += 1;
    if (a.status?.toLowerCase() === "success") map[key].success += 1;
  }
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(map)) {
    out[k] = v.total === 0 ? 0 : Math.round((v.success / v.total) * 100);
  }
  return out;
}
