import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages and components
import App from "./App";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import UpdateFood from "./pages/UpdateFood";

// Context & Routes
import AuthProvider from "./context/Provider/AuthProvider";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

// Feature pages
import MyFoods from "./routes/MyFoods";
import AddFoodPage from "./routes/AddFoodPage";
import FoodDetailsPage from "./routes/FoodDetailsPage";
import Profile from "./routes/Profile";
import FridgePage from "./routes/FridgePage";
import Overview from "./pages/dashboard/Overview";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import DashboardLayout from "./layout/DashboardLayout";
import AllFoods from "./routes/AllFoods";
import Contact from "./routes/Contact";
import About from "./routes/About";
import FAQ from "./routes/FAQ";
import axiosSecure from "./api/axios";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },

      // {
      //   path: "add-foods",
      //   element: (
      //     <PrivateRoute>
      //       <AddFoodPage />
      //     </PrivateRoute>
      //   ),
      // },
      {
        path: "/fridge",
        element: <FridgePage />,
      },
      {
        path: "update-food/:id",
        loader: ({ params }) =>
  axiosSecure.get(`/foods/${params.id}`),

        element: (
          <PrivateRoute>
            <UpdateFood />
          </PrivateRoute>
        ),
      },

      {
        path: "/faq",
        element: <FAQ />,
      },

      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "food-details/:id",
        element: (
          <PrivateRoute>
            <FoodDetailsPage />
          </PrivateRoute>
        ),
      },

      {
        path: "my-foods",
        element: (
          <PrivateRoute>
            <MyFoods />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },

  // dashboard routes

  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: "all-foods", element: <AllFoods /> },
      { path: "add-food", element: <AddFoodPage /> },
      { path: "my-foods", element: <MyFoods /> },
      { path: "user-profile", element: <Profile /> },
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        ),
      },
      {
        path: "food-details/:id",
        element: (
          <PrivateRoute>
            <FoodDetailsPage />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);