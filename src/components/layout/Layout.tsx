import Navbar from "./Navbar"
import Footer from "./Footer"
import { Outlet } from 'react-router-dom';
import { LilacLogo } from "./logo/LilacLogo";
// export { LilacLogo } from "./LilacLogo";
// export type { LilacLogoProps } from "./LilacLogo";


export function Layout() {
  return (
    <div>
      <Navbar logo={<LilacLogo size={28} title="Lilac UI"/>} />
      
      <main className="content">
        {/* Child components render inside here! */}
        <Outlet />
      </main>

      <Footer logo={<LilacLogo size={20} />} />
    </div>
  );
}