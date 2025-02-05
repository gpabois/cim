import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { None, Optional } from "@shared/option"

export interface ControleViewState {
    currentTab: number,
    currrentPoint: Optional<number>,
    currentTabPoint: number
}

const initialState: ControleViewState = {
    currentTab: 0,
    currrentPoint: None,
    currentTabPoint: 0
}

export const controleViewSlice = createSlice({
  name: 'contrôle-view',
  initialState,

  reducers: {
    setCurrentTab: (state: ControleViewState, action: PayloadAction<number>) => {
        state.currentTab = action.payload
    },
    setCurrentPoint: (state: ControleViewState, action: PayloadAction<Optional<number>>) => {
      state.currrentPoint = action.payload
    },
    setCurrentPointTab: (state: ControleViewState, action: PayloadAction<number>) => {
      state.currentTabPoint = action.payload
    }
},
})

export const {setCurrentTab, setCurrentPoint, setCurrentPointTab} = controleViewSlice.actions;

export default controleViewSlice.reducer;