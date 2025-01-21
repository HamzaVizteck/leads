import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { LeadsProvider } from "./components/LeadsProvider";
import { LeadsManagement } from "./components/LeadsManagement";
import Login from "./pages/Login";

const App = () => {
  return (
    <Router>
      <LeadsProvider>
        <Routes>
          <Route path="/" element={<Login />} />
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
  );
}; // Added missing semicolon and closing brace
export default App;
