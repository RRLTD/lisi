import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PlaySongPage from './pages/PlaySongPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

import DashboardSidebar from './components/DashboardSidebar.jsx';
import DashboardHeader from './components/DashboardHeader.jsx';

import './index.css';
import '@fontsource/inter';

const theme = extendTheme({
    palette: {
        primary: {
            main: "#8026ff",
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <CssVarsProvider theme={theme}>
            <CssBaseline />
            <Routes>
                <Route path="/">
                    <Route index element={<HomePage />} />
                   
                   <Route path="auth">
                        <Route path="login" element={<LoginPage />} />
                    </Route>

                    <Route path="dashboard" element={<><DashboardSidebar /><DashboardHeader /></>}>
                        <Route index element={<DashboardPage />} />

                        <Route path="song">
                            <Route path=":id" element={<PlaySongPage />} />
                        </Route>

                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    <Route path="*" element={<>404</>} />
                </Route>
            </Routes>
        </CssVarsProvider>
    </BrowserRouter>,
)
