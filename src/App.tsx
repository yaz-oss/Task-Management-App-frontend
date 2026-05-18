import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import GoogleSuccess from "./pages/GoogleSuccess";
import Tasks from "./pages/Tasks";
import Organizer from "./pages/Organizer";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route path="/tasks" element={<Tasks />} />
        <Route path="/organizer" element={<Organizer />} />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/tasks"
          element={<AdminDashboard />}
        />

      

      <Route
        path="/google-success"
        element={<GoogleSuccess />}
      />

      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
