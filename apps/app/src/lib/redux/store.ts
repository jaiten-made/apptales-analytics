import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { reducer as journeysReducer } from "./features/journeys/slice";
import { reducer as userStoriesReducer } from "./features/user-journeys/slice";

const rootReducer = combineReducers({
  journeys: journeysReducer,
  ["user-journeys"]: userStoriesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

setupListeners(store.dispatch);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
