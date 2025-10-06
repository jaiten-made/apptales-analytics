import { createSlice } from "@reduxjs/toolkit";

import type { State } from "./types";

const initialState: State = {};

const slice = createSlice({
  name: "user-journeys",
  initialState,
  reducers: {
    setSelectedUserStory(state, action) {
      state.selectedUserStory = action.payload;
    },
  },
});

export default slice;

export * as selectors from "./selectors";
export * as types from "./types";
export const actions = slice.actions;
export const reducer = slice.reducer;
