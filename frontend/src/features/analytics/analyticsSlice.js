import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  productivityTrend: [],
  heatmapData: [],
  teamPerformance: [],
  loading: false,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalyticsData: (state, action) => {
      state.productivityTrend = action.payload.productivityTrend || [];
      state.heatmapData = action.payload.heatmapData || [];
      state.teamPerformance = action.payload.teamPerformance || [];
    }
  }
});

export const { setAnalyticsData } = analyticsSlice.actions;
export default analyticsSlice.reducer;
