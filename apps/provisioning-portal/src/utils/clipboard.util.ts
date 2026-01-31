export const copyToClipboard = async (value: string): Promise<void> => {
  if (!navigator.clipboard) {
    throw new Error("Clipboard API unavailable");
  }
  await navigator.clipboard.writeText(value);
};
