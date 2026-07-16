import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  currentConversationId: null,
  activeMessages: [],
  loading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversationId = action.payload;
    },
    setActiveMessages: (state, action) => {
      state.activeMessages = action.payload;
    },
    addMessage: (state, action) => {
      state.activeMessages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setConversations, setCurrentConversation, setActiveMessages, addMessage, setLoading } = chatSlice.actions;
export default chatSlice.reducer;
