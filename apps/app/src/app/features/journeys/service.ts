import rows from "./components/DataTable/data.json";

export type Journey = {
  id: number | string;
  name: string;
};

export const getAllJourneys = async (): Promise<Journey[]> => {
  // keep async signature to allow future network calls
  return rows as Journey[];
};

export const getJourneyById = async (
  id: string | number
): Promise<Journey | undefined> => {
  const list = await getAllJourneys();
  return list.find((r) => String(r.id) === String(id));
};
