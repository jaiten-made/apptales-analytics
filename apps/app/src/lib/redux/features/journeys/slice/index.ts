import { createSlice } from "@reduxjs/toolkit";

import type { State } from "./types";

const initialState: State = {};

const slice = createSlice({
  name: "journeys",
  initialState,
  reducers: {
    setSelectedJourney(state, action) {
      state.selectedJourney = action.payload;
    },
  },
});

export default slice;

export * as selectors from "./selectors";
export * as types from "./types";
export const actions = slice.actions;
export const reducer = slice.reducer;
