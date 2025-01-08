import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./index.css";
import Login from "./App/pages/login";
import Signup from "./App/pages/signup";
import Home from "./App/pages/home";
import AuthRoute from "./App/components/AuthRoute";
import Header from "./App/components/Header";
import { ToastContainer } from "react-toastify";

import Task from "./App/components/Task";
import AddTask from "./App/pages/assTask";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const shouldShowHeader = !["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {shouldShowHeader && <Header />}
      {children}
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<AuthRoute><Home /></AuthRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<AuthRoute><Home /></AuthRoute>} />
          <Route path="/addtask" element={<AddTask />} />
          <Route path="/addtask/:id" element={<AddTask />} />
          <Route path="task" element={<Task />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
      <ToastContainer />
    </Router>
  </React.StrictMode>
);
