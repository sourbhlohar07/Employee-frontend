import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './views/components/common/Navbar';
import ProtectedRoute from './views/components/common/ProtectedRoute';
import PublicEnquiryPage from './views/pages/PublicEnquiryPage';
import AdminLoginPage from './views/pages/AdminLoginPage';
import AdminDashboardPage from './views/pages/AdminDashboardPage';
import AboutPage from './views/pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-main">
          <Routes>
            {/* Public Enquiry Submission */}
            <Route path="/" element={<PublicEnquiryPage />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLoginPage />} />


          <Route path="/about" element={<AboutPage />} />
          


            {/* Protected Admin Active Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

          
            {/* Protected Dedicated Closed Enquiries View */}
            {/* <Route
              path="/admin/enquiries/closed"
              element={
                <ProtectedRoute>
                  <ClosedEnquiriesPage />
                </ProtectedRoute>
              }
            /> */}

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
