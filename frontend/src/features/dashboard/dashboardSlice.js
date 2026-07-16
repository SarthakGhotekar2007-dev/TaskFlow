import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: { total: 0, completed: 0, pending: 0, highPriority: 0 },
  upcomingTasks: [],
  recentActivities: [],
  loading: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardData: (state, action) => {
      state.stats = action.payload.stats;
      state.upcomingTasks = action.payload.upcomingTasks;
      state.recentActivities = action.payload.recentActivities;
    }
  }
});

export const { setDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
