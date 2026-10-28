import './App.css'
import LandingPage from './pages/LandingPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Parent Route */}
        <Route element={<Layout />}>
          {/* Child Routes rendered via <Outlet /> */}
          <Route path="/" element={<LandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}