import { Header } from "./components/Header";
import { LeadsProvider } from "./components/LeadsProvider";
import { LeadsManagement } from "./components/LeadsManagement";

const App = () => {
  return (
    <LeadsProvider>
      <Header />
      <LeadsManagement />
    </LeadsProvider>
  );
};

export default App;
