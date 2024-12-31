import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage.tsx";
import ProjectPage from "@/pages/ProjectPage.tsx";
import Navbar from "@/components/Navbar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext.tsx";

import "./App.css";
import { ToastContainer } from "react-toastify";
import { TaskProvider } from "./context/TaskContext";
import TaskPage from "./pages/TaskPage";
import { InvitationProvider } from "./context/InvitationContext";
import InvitationPage from "./pages/InvitationPage";
import AcceptInvitationPage from "./pages/AcceptInvitationPage";
import AccountPage from "./pages/AccountPage";
import DashboardPage from "./pages/DashboardPage";

function App() {

  return (
    <div>
      <ToastContainer />
      <Router>
        <AuthProvider>
          <Navbar />
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/project"
                element={
                  <ProjectProvider>
                    <ProjectPage />
                  </ProjectProvider>
                }
              />
              <Route
                path="/task"
                element={
                  <TaskProvider>
                    <TaskPage />
                  </TaskProvider>
                }
              />
              <Route
                path="/invite-user"
                element={
                  <InvitationProvider>
                    <InvitationPage />
                  </InvitationProvider>
                }
              />
              <Route
                path="/accept-invitation"
                element={
                  <InvitationProvider>
                    <AcceptInvitationPage />
                  </InvitationProvider>
                }
              />
              <Route
                path="/my-account"
                element={
                  <AccountPage />
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </div>

  );
}

export default App;
