
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const StudentTracking = lazy(() => import('./pages/StudentTracking'));
const Students = lazy(() => import('./pages/Students'));
const StudentForm = lazy(() => import('./pages/StudentForm'));
const Teachers = lazy(() => import('./pages/Teachers'));
const TeacherForm = lazy(() => import('./pages/TeacherForm'));
const Users = lazy(() => import('./pages/Users'));
const UserForm = lazy(() => import('./pages/UserForm'));
const Classes = lazy(() => import('./pages/Classes'));
const ClassForm = lazy(() => import('./pages/ClassForm'));
const Profile = lazy(() => import('./pages/Profile'));
const Reports = lazy(() => import('./pages/Reports'));
const Login = lazy(() => import('./pages/Login'));
const ManagerLogin = lazy(() => import('./pages/ManagerLogin'));
const Landing = lazy(() => import('./pages/Landing'));
const ShariaPrograms = lazy(() => import('./pages/ShariaPrograms'));
const Features = lazy(() => import('./pages/Features'));
const About = lazy(() => import('./pages/About'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const InfoPage = lazy(() => import('./pages/Info'));
const StudentExpenses = lazy(() => import('./pages/StudentExpenses'));
const Salaries = lazy(() => import('./pages/Salaries'));
const Accounts = lazy(() => import('./pages/Accounts'));
const DatabasePage = lazy(() => import('./pages/Database'));
const Achievements = lazy(() => import('./pages/Achievements'));
const TeacherAttendance = lazy(() => import('./pages/TeacherAttendance'));
const ClassEvaluation = lazy(() => import('./pages/ClassEvaluation'));
const EvaluationsList = lazy(() => import('./pages/EvaluationsList'));
const RenewalFollowup = lazy(() => import('./pages/RenewalFollowup'));
const SalesEmployees = lazy(() => import('./pages/SalesEmployees'));
const TeacherEarnings = lazy(() => import('./pages/TeacherEarnings'));
const Schedule = lazy(() => import('./pages/Schedule'));
const StaffEarnings = lazy(() => import('./pages/StaffEarnings'));

const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin mb-4"></div>
    <p className="text-blue-900 font-black text-xs uppercase tracking-widest">جاري التحميل...</p>
  </div>
);

const ProtectedRoutes = ({ isAuthenticated, user, onLogout }: { isAuthenticated: boolean, user: any, onLogout: () => void }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Layout user={user} onLogout={onLogout}>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('dawood_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('dawood_user');
  });

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('dawood_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('dawood_user');
  };

  const role = user?.role || 'teacher';
  const perms = user?.permissions || {};

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/landing" element={isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/cp" element={isAuthenticated ? <Navigate to="/" replace /> : <ManagerLogin onLogin={handleLogin} />} />
          <Route path="/features" element={<Features />} />

          <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />}>
            <Route path="/" element={
              role === 'manager' ? <ManagerDashboard /> : 
              role === 'supervisor' ? <Dashboard user={user} /> : 
              <TeacherDashboard user={user} />
            } />
            
            <Route path="/teacher-dashboard" element={role === 'teacher' || role === 'manager' ? <TeacherDashboard user={user} /> : <Navigate to="/" replace />} />
            <Route path="/manager-dashboard" element={role === 'manager' ? <ManagerDashboard /> : <Navigate to="/" replace />} />
            
            <Route path="/student-tracking/:studentId" element={<StudentTracking />} />
            
            {/* Students Routes - Fixed Permissions */}
            <Route path="/students" element={perms.page_students || role === 'manager' ? <Students user={user} /> : <Navigate to="/" replace />} />
            <Route path="/students/form" element={perms.page_students || role === 'manager' ? <StudentForm user={user} /> : <Navigate to="/" replace />} />

            <Route path="/accounts" element={perms.page_finance || role === 'manager' ? <Accounts /> : <Navigate to="/" replace />} />
            
            {/* Teachers Routes - Fixed Permissions */}
            <Route path="/teachers" element={perms.page_teachers || role === 'manager' ? <Teachers /> : <Navigate to="/" replace />} />
            <Route path="/teachers/form" element={perms.page_teachers || role === 'manager' ? <TeacherForm /> : <Navigate to="/" replace />} />
            
            <Route path="/renewal-followup" element={role === 'manager' || role === 'supervisor' ? <RenewalFollowup /> : <Navigate to="/" replace />} />
            <Route path="/teacher-attendance" element={role === 'manager' || role === 'supervisor' ? <TeacherAttendance /> : <Navigate to="/" replace />} />
            <Route path="/class-evaluation" element={role === 'manager' || role === 'supervisor' ? <ClassEvaluation user={user} /> : <Navigate to="/" replace />} />
            
            <Route path="/evaluations-list" element={role === 'manager' ? <EvaluationsList /> : <Navigate to="/" replace />} />
            <Route path="/sales-employees" element={role === 'manager' ? <SalesEmployees user={user} /> : <Navigate to="/" replace />} />
            
            <Route path="/my-earnings" element={role === 'teacher' ? <TeacherEarnings user={user} /> : <Navigate to="/" replace />} />
            <Route path="/staff-earnings" element={role === 'manager' ? <StaffEarnings /> : <Navigate to="/" replace />} />
            
            <Route path="/schedule" element={<Schedule user={user} />} />

            {/* Users Routes - Fixed Permissions */}
            <Route path="/users" element={perms.page_users || role === 'manager' ? <Users user={user} /> : <Navigate to="/" replace />} />
            <Route path="/users/form" element={perms.page_users || role === 'manager' ? <UserForm /> : <Navigate to="/" replace />} />

            <Route path="/sharia-programs" element={role === 'supervisor' ? <ShariaPrograms /> : <Navigate to="/" replace />} />
            
            {/* Classes Routes - Fixed Permissions */}
            <Route path="/classes" element={perms.page_classes || role === 'manager' ? <Classes user={user} /> : <Navigate to="/" replace />} />
            <Route path="/classes/form" element={perms.page_classes || role === 'manager' ? <ClassForm user={user} /> : <Navigate to="/" replace />} />

            <Route path="/reports" element={perms.page_reports || role === 'manager' ? <Reports /> : <Navigate to="/" replace />} />
            <Route path="/achievements" element={perms.page_achievements || role === 'manager' ? <Achievements /> : <Navigate to="/" replace />} />
            <Route path="/settings" element={perms.page_settings || role === 'manager' ? <SettingsPage user={user} /> : <Navigate to="/" replace />} />
            <Route path="/database" element={role === 'manager' ? <DatabasePage user={user} /> : <Navigate to="/" replace />} />
            <Route path="/profile" element={<Profile user={user} onLogout={handleLogout} />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
