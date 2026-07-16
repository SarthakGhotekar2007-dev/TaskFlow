import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  suggestions: [],
  reports: [],
  loading: false,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    }
  }
});

export const { addMessage, setMessages, setSuggestions } = aiSlice.actions;
export default aiSlice.reducer;
