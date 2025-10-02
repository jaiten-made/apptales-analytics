import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../store";

const selectSelf = (state: RootState) => state.journeys;

export const selectSelectedJourney = createSelector(
  selectSelf,
  (state) => state.selectedJourney
);
