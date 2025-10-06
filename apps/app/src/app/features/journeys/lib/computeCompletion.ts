import journeysRaw from "../components/DataTable/data.json";
import attemptsRaw from "../components/details/data.json";
// NOTE: The attempts dataset is intentionally large & varied to yield
// diverse completion percentages per journey. Percentages are derived
// purely from (success count / total attempts for that journey) * 100 and
// rounded. Adjust the data.json to tune displayed completion rates.

export interface AttemptRow {
  id: number | string;
  journeyId?: number | string;
  status?: string;
}

const attempts = attemptsRaw as AttemptRow[];

interface JourneyStaticRow {
  id: number | string;
  completeRatePercent?: number;
}
const journeyStatic = journeysRaw as JourneyStaticRow[];

function clampPercent(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 1;
  if (n < 1) return 1;
  if (n > 100) return 100;
  return Math.round(n);
}

export function computeJourneyCompletionPercent(
  journeyId: number | string
): number {
  const filtered = attempts.filter(
    (a) => a.journeyId != null && String(a.journeyId) === String(journeyId)
  );
  if (filtered.length === 0) {
    // fallback to static percent if present, otherwise minimum 1
    const staticRow = journeyStatic.find(
      (r) => String(r.id) === String(journeyId)
    );
    return clampPercent(staticRow?.completeRatePercent ?? 1);
  }
  const successes = filtered.filter(
    (a) => a.status && a.status.toLowerCase() === "success"
  ).length;
  const pct = (successes / filtered.length) * 100;
  return clampPercent(pct);
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
  // first add computed values for journeys with attempts
  for (const [k, v] of Object.entries(map)) {
    const pct = v.total === 0 ? 0 : (v.success / v.total) * 100;
    out[k] = clampPercent(pct);
  }
  // then ensure every static journey id has an entry
  for (const j of journeyStatic) {
    const key = String(j.id);
    if (!(key in out)) {
      out[key] = clampPercent(j.completeRatePercent ?? 1);
    }
  }
  return out;
}
