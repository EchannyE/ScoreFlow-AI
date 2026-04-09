import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/appContext.jsx'
import { useApp } from './context/useApp.jsx'
import MainLayout from './components/shared/MainLayout.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminCampaigns from './pages/admin/Campaign.jsx'
import AdminCampaignDetail from './pages/admin/AdminCampaignDetail.jsx'
import AdminSubmissions from './pages/admin/Submission.jsx'
import SubmissionDetail from './pages/admin/SubmissionDetail.jsx'
import AdminEvaluators from './pages/admin/Evaluator.jsx'
import EvaluatorQueue from './pages/evaluator/Queue.jsx'
import EvaluatorScore from './pages/evaluator/Score.jsx'
import MySubmissions from './pages/submitter/MySubmissions.jsx'
import NewSubmission from './pages/submitter/newSubmission.jsx'

function ProtectedRoute({ children, roles }) {
  const { currentUser } = useApp()

  if (!currentUser) return <Navigate to="/login" replace />
  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function RoleRedirect() {
  const { currentUser } = useApp()

  if (!currentUser) return <Navigate to="/login" replace />

  const paths = {
    admin: '/admin',
    evaluator: '/evaluator',
    submitter: '/submitter',
  }

  return <Navigate to={paths[currentUser.role] ?? '/login'} replace />
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RoleRedirect />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="campaigns/:id" element={<AdminCampaignDetail />} />
          <Route path="submissions" element={<AdminSubmissions />} />
          <Route path="submissions/:id" element={<SubmissionDetail />} />
          <Route path="evaluators" element={<AdminEvaluators />} />
        </Route>

        <Route
          path="/evaluator"
          element={
            <ProtectedRoute roles={['evaluator']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EvaluatorQueue />} />
          <Route path="score/:submissionId" element={<EvaluatorScore />} />
        </Route>

        <Route
          path="/submitter"
          element={
            <ProtectedRoute roles={['submitter']}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MySubmissions />} />
          <Route path="new" element={<NewSubmission />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}
