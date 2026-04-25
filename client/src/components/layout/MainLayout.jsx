import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../NavBar';
import Footer from '../Footer';
import BackNavigation from '../shared/BackNavigation';

const MainLayout = () => {
  const location = useLocation();
  const showBackNavigation = location.pathname !== '/';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main className="flex-1">
        {showBackNavigation ? (
          <div className="section-shell pt-24">
            <BackNavigation fallbackTo="/" label="Back" />
          </div>
        ) : null}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
