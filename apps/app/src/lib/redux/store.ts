import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { reducer as journeysReducer } from "./features/journeys/slice";
import { reducer as userJourneySlice } from "./features/user-journey/slice";

const rootReducer = combineReducers({
  journeys: journeysReducer,
  ["user-journey"]: userJourneySlice,
});

export const store = configureStore({
  reducer: rootReducer,
});

setupListeners(store.dispatch);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
