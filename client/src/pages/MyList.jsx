import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';

const COPY = {
  favorites: { title: '❤️ Your Favorites', empty: 'You have not saved any favorites yet.' },
  mine: { title: '📒 My Recipes', empty: 'You have not added any recipes yet.' },
};

export default function MyList({ kind }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/recipes/${kind}`, { params: { limit: 50 } })
      .then((res) => setRecipes(res.data.recipes))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [kind]);

  return (
    <>
      <h1>{COPY[kind].title}</h1>
      {error && <p className="alert">{error}</p>}
      {loading ? (
        <p className="muted center">Loading…</p>
      ) : recipes.length === 0 ? (
        <p className="muted center">
          {COPY[kind].empty}{' '}
          <Link to={kind === 'mine' ? '/new' : '/'}>{kind === 'mine' ? 'Add one now' : 'Explore recipes'}</Link>
        </p>
      ) : (
        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard key={r._id} recipe={r} />
          ))}
        </div>
      )}
    </>
  );
}
