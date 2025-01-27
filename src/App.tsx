import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { LeadsProvider } from "./components/LeadsProvider";
import { LeadsManagement } from "./components/LeadsManagement";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp"; // Import SignUp page
import { AuthProvider } from './context/AuthContext'; // Adjust the path as necessary

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <LeadsProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />{" "}
            {/* Add route for SignUp */}
            <Route
              path="/leads"
              element={
                <>
                  <Header />
                  <LeadsManagement />
                </>
              }
            />
          </Routes>
        </LeadsProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;
