import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  achievements: [],
  loading: false,
};

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    setAchievements: (state, action) => {
      state.achievements = action.payload;
    }
  }
});

export const { setAchievements } = achievementSlice.actions;
export default achievementSlice.reducer;
