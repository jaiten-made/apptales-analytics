import rows from "./components/DataTable/data.json";

export type Story = {
  id: number | string;
  name: string;
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
