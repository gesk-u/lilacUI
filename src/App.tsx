import './App.css';
import LandingPage from './pages/LandingPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Parent route: Layout renders the shell, child routes appear in its <Outlet /> */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}