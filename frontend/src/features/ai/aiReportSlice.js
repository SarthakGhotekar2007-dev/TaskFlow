import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reports: [],
  loading: false,
};

const aiReportSlice = createSlice({
  name: 'aiReports',
  initialState,
  reducers: {
    setAiReports: (state, action) => {
      state.reports = action.payload;
    }
  }
});

export const { setAiReports } = aiReportSlice.actions;
export default aiReportSlice.reducer;
