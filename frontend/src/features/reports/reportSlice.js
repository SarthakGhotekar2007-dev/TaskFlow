import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reports: [],
  loading: false,
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action) => {
      state.reports = action.payload;
    }
  }
});

export const { setReports } = reportSlice.actions;
export default reportSlice.reducer;
