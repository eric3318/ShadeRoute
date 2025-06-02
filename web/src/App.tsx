import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import LandingPage from "./features/landing/LandingPage";
import MapView from "./features/map/MapView";

const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/map",
    Component: MapView,
  },
]);

function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
