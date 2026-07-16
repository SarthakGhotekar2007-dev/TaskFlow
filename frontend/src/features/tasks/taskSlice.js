import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart: (state) => { state.loading = true; state.error = null; },
    fetchTasksSuccess: (state, action) => { state.loading = false; state.items = action.payload; },
    fetchTasksFailure: (state, action) => { state.loading = false; state.error = action.payload; },
    addTask: (state, action) => { state.items.push(action.payload); },
    updateTask: (state, action) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) state.items[index] = action.payload;
    },
    deleteTask: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
  },
});

export const { fetchTasksStart, fetchTasksSuccess, fetchTasksFailure, addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;
