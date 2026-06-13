import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Report from "./pages/Report";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
  path="/profile"
  element={<Profile />}
/>
        <Route
          path="/analytics/:id"
          element={<Analytics />}
        />
        <Route
          path="/report/:id"
          element={<Report />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;