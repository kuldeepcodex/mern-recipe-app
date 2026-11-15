import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">🍲 Recipe Book</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Explore</NavLink>
          {user ? (
            <>
              <NavLink to="/favorites">Favorites</NavLink>
              <NavLink to="/mine">My Recipes</NavLink>
              <Link to="/new" className="btn btn-sm">+ Add Recipe</Link>
              <span className="muted hide-sm">Hi, {user.name.split(' ')[0]}</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn btn-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
