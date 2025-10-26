import rows from "./data/journeys.json";

// Story shape mirrors the rows in DataTable data.json.
// Adding optional fields ensures forward compatibility if mock data extends.
export type Story = {
  id: number | string;
  name: string;
  completeRatePercent?: number;
  status?: string; // e.g. "success" | "failed"
};

export const getAllStories = async (): Promise<Story[]> => {
  // keep async signature to allow future network calls
  return rows as Story[];
};

export const getStoryById = async (
  id: string | number
): Promise<Story | undefined> => {
  const list = await getAllStories();
  return list.find((r) => String(r.id) === String(id));
};
