import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { reducer as storiesReducer } from "./features/stories/slice";
import { reducer as userStoriesReducer } from "./features/user-stories/slice";

const rootReducer = combineReducers({
  stories: storiesReducer,
  ["user-stories"]: userStoriesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

setupListeners(store.dispatch);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
