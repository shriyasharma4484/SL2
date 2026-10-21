import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import DemoBanner from './components/DemoBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ReportIssuePage from './pages/ReportIssuePage';
import IssuesPage from './pages/IssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ImpactPage from './pages/ImpactPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MemberDashboardPage from './pages/MemberDashboardPage';
import VolunteerDashboardPage from './pages/VolunteerDashboardPage';

// Admin Subpages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminIncomingReportsPage from './pages/admin/AdminIncomingReportsPage';
import AdminVolunteerManagementPage from './pages/admin/AdminVolunteerManagementPage';
import AdminActivitiesPage from './pages/admin/AdminActivitiesPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <DemoBanner />
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LanguageProvider>
          <Router>
          <Routes>
            {/* Public Community Routes */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/report" element={<PublicLayout><ReportIssuePage /></PublicLayout>} />
            <Route path="/issues" element={<PublicLayout><IssuesPage /></PublicLayout>} />
            <Route path="/issues/:id" element={<PublicLayout><IssueDetailPage /></PublicLayout>} />
            <Route path="/activities" element={<PublicLayout><ActivitiesPage /></PublicLayout>} />
            <Route path="/impact" element={<PublicLayout><ImpactPage /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
            <Route path="/my-reports" element={<PublicLayout><MemberDashboardPage /></PublicLayout>} />
            <Route path="/volunteer/dashboard" element={<PublicLayout><VolunteerDashboardPage /></PublicLayout>} />

            {/* Admin Coordinator Protected Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverviewPage />} />
              <Route path="incoming" element={<AdminIncomingReportsPage />} />
              <Route path="active" element={<AdminIncomingReportsPage />} />
              <Route path="resolved" element={<AdminOverviewPage />} />
              <Route path="volunteers" element={<AdminVolunteerManagementPage />} />
              <Route path="activities" element={<AdminActivitiesPage />} />
              <Route path="moderation" element={<AdminModerationPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </NotificationProvider>
  </AuthProvider>
  );
}
