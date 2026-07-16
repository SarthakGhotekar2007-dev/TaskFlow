import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import taskReducer from '../features/tasks/taskSlice';
import kanbanReducer from '../features/kanban/kanbanSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import aiReducer from '../features/ai/aiSlice';
import reportReducer from '../features/reports/reportSlice';
import achievementReducer from '../features/analytics/achievementSlice';
import chatReducer from '../features/ai/chatSlice';
import suggestionReducer from '../features/ai/suggestionSlice';
import aiReportReducer from '../features/ai/aiReportSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    kanban: kanbanReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer,
    ai: aiReducer,
    reports: reportReducer,
    achievements: achievementReducer,
    chat: chatReducer,
    suggestions: suggestionReducer,
    aiReports: aiReportReducer,
  },
});
