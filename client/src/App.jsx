import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import RecipeForm from './pages/RecipeForm.jsx';
import MyList from './pages/MyList.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { useAuth } from './AuthContext.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="muted center">Loading…</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/new" element={<Protected><RecipeForm /></Protected>} />
          <Route path="/recipes/:id/edit" element={<Protected><RecipeForm /></Protected>} />
          <Route path="/favorites" element={<Protected><MyList kind="favorites" /></Protected>} />
          <Route path="/mine" element={<Protected><MyList kind="mine" /></Protected>} />
          <Route path="*" element={<p className="muted center">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
