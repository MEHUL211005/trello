import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./authSlice";
import workspaceReducer from "./workspaceSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  workspace: workspaceReducer,
});

// ONLY persist users & workspace indirectly via auth
const persistConfig = {
  key: "root",
  storage,

  //  DO NOT fully ignore auth
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);