import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  columns: {
    Todo: [],
    'In Progress': [],
    Review: [],
    Done: []
  },
  loading: false,
};

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    setKanbanBoard: (state, action) => {
      state.columns = action.payload;
    },
    moveTask: (state, action) => {
      const { sourceCol, destCol, sourceIndex, destIndex } = action.payload;
      const [movedTask] = state.columns[sourceCol].splice(sourceIndex, 1);
      movedTask.status = destCol;
      state.columns[destCol].splice(destIndex, 0, movedTask);
    }
  }
});

export const { setKanbanBoard, moveTask } = kanbanSlice.actions;
export default kanbanSlice.reducer;
