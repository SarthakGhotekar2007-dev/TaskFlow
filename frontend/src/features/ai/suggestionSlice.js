import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  suggestions: [],
  loading: false,
};

const suggestionSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    }
  }
});

export const { setSuggestions } = suggestionSlice.actions;
export default suggestionSlice.reducer;
