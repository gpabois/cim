import { configureStore } from '@reduxjs/toolkit'
import projectReducer from './features/projects/projectsSlice';
import controleViewReducer from './features/controleViewSlice';

const store = configureStore({
    reducer: {
        projects: projectReducer,
        controleView: controleViewReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;