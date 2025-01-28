import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {ProjectId} from "@shared/model";
import { isSome, None, Optional } from "@shared/option";

export interface ProjectsState {
    current: Optional<ProjectId>,
    opened: Array<ProjectId>
}

const initialState: ProjectsState = {
    current: None,
    opened: []
}

export const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        setCurrent: (state: ProjectsState, action: PayloadAction<ProjectId>) => {
            state.current = action.payload;
        },
    },
    extraReducers(builder) {
        builder.addCase(newProject.fulfilled, (state, action) => {
            if (isSome(action.payload)) {
                state.current = action.payload;
                state.opened.push(action.payload);
            }
        });

        builder.addCase(openProject.fulfilled, (state, action) => {
            if(isSome(action.payload)) {
                state.current = action.payload;
                state.opened.push(action.payload);
            }
        });
    },
})

export const newProject = createAsyncThunk("projects/new", async () => {
    return await window.cim.project.new()
});

export const openProject = createAsyncThunk("projects/open", async () => {
    return await window.cim.project.open()
});


export default projectSlice.reducer;