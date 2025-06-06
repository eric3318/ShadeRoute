import { createBrowserRouter, RouterProvider } from 'react-router';
import LandingPage from './features/landing/LandingPage';
import MapView from './features/map/MapView';
import AuthPage from './features/auth/AuthPage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/map',
    Component: MapView,
  },
  {
    path: '/sign-in',
    element: <AuthPage />,
  },
  {
    path: '/sign-up',
    element: <AuthPage isSignIn={false} />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
