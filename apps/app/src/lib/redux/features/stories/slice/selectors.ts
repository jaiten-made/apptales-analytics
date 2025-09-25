import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../store";

const selectSelf = (state: RootState) => state.stories;

export const selectSelectedStory = createSelector(
  selectSelf,
  (state) => state.selectedStory
);
