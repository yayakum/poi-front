import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route index path="/" element={<Login />} />
      <Route path="/Dashboard" element={<Dashboard />}></Route>
    </Routes>
  );
};
export default AppRoutes;