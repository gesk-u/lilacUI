import Navbar from "./Navbar"
import Footer from "./Footer"
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div>
      <Navbar />
      
      <main className="content">
        {/* Child components render inside here! */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}