import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Home from "./pages/Home";
import Gallery from "./components/Gallery";
import ProtectedRoute from "./components/shared/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Tickets from "./pages/Tickets";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import ContactPage from "./pages/ContactPage";
import ForgotPassword from "./pages/ForgotPassword";
import AnimalDetails from "./pages/AnimalDetails";
import Dashboard from "./pages/admin/Dashboard";
import ManageAnimals from "./pages/admin/ManageAnimals";
import AnimalEditor from "./pages/admin/AnimalEditor";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageGallery from "./pages/admin/ManageGallery";
import ManageTickets from "./pages/admin/ManageTickets";
import ManageUsers from "./pages/admin/ManageUsers";
import History from "./pages/admin/History";

const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/animals/:id" element={<AnimalDetails />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="visitor" />}>
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="animals" element={<ManageAnimals />} />
          <Route path="animals/new" element={<AnimalEditor />} />
          <Route path="animals/:id/edit" element={<AnimalEditor />} />
          <Route path="tickets" element={<ManageTickets />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="history" element={<History />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
