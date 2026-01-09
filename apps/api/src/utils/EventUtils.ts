import { EventCategory } from "@prisma/client";

export const getEventCategory = (type: string): EventCategory =>
  type === "page_view" ? EventCategory.PAGE_VIEW : EventCategory.CLICK;
