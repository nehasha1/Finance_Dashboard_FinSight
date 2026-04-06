import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import Goals from './pages/Goals';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="insights" element={<Insights />} />
            <Route path="goals" element={<Goals />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer 
        position="bottom-right"
        theme="colored"
        toastStyle={{ backgroundColor: '#08152aff', color: '#fff' }}
      />
    </AppProvider>
  );
}

export default App;
