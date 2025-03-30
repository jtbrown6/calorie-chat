import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AppProvider } from './context/AppContext';
import { GlobalStyles } from './styles/globalStyles';
import { theme } from './styles/theme';
import Layout from './components/layout/Layout';
import ChatView from './components/chat/ChatView';
import DashboardView from './components/dashboard/DashboardView';
import CustomFoodsView from './components/custom-foods/CustomFoodsView';
import SettingsView from './components/settings/SettingsView';

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyles theme={theme} />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<ChatView />} />
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/custom-foods" element={<CustomFoodsView />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;
