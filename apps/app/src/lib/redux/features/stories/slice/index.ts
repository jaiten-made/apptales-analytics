import { createSlice } from "@reduxjs/toolkit";

import type { State } from "./types";

const initialState: State = {};

const slice = createSlice({
  name: "stories",
  initialState,
  reducers: {},
});

export default slice;

export * as selectors from "./selectors";
export * as types from "./types";
export const actions = slice.actions;
export const reducer = slice.reducer;
