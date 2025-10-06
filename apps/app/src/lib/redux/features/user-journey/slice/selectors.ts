import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../../store";

const selectSelf = (state: RootState) => state["user-journey"];

export const selectSelectedUserStory = createSelector(
  selectSelf,
  (state) => state.selectedUserStory
);
