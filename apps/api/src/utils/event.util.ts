export const getEventCategory = (type: string) =>
  type === "page_view" ? "PAGE_VIEW" : "CLICK";
