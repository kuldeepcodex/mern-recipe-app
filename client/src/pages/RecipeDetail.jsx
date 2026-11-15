import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Stars from '../components/Stars.jsx';
import { RecipeImage } from '../components/RecipeCard.jsx';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setRecipe(null);
    api
      .get(`/recipes/${id}`)
      .then((res) => setRecipe(res.data))
      .catch((err) => setError(errorMessage(err)));
  }, [id, user]);

  const requireLogin = () => {
    setNotice('Please log in to do that.');
    return !user;
  };

  const act = async (fn) => {
    setNotice('');
    try {
      setRecipe((await fn()).data);
    } catch (err) {
      setNotice(errorMessage(err));
    }
  };

  const rate = (value) => (requireLogin() ? null : act(() => api.post(`/recipes/${id}/rate`, { value })));
  const toggleFavorite = () => (requireLogin() ? null : act(() => api.post(`/recipes/${id}/favorite`)));

  const remove = async () => {
    if (!window.confirm('Delete this recipe permanently?')) return;
    try {
      await api.delete(`/recipes/${id}`);
      navigate('/mine');
    } catch (err) {
      setNotice(errorMessage(err));
    }
  };

  if (error) return <p className="alert">{error}</p>;
  if (!recipe) return <p className="muted center">Loading…</p>;

  const isOwner = user && recipe.author && String(recipe.author._id) === String(user.id);

  return (
    <article className="detail">
      <RecipeImage recipe={recipe} className="detail-img" />
      <div className="detail-head">
        <div>
          <span className="tag">{recipe.category}</span>
          <h1>{recipe.title}</h1>
          <p className="muted">
            by {recipe.author?.name || 'Unknown'} · ⏱ {recipe.cookTime} min · 🍽 serves {recipe.servings}
          </p>
        </div>
        <div className="actions">
          <button className={recipe.isFavorite ? 'btn' : 'btn btn-outline'} onClick={toggleFavorite}>
            {recipe.isFavorite ? '❤️ Saved' : '🤍 Save'} ({recipe.favoriteCount})
          </button>
          {isOwner && (
            <>
              <Link className="btn btn-outline" to={`/recipes/${id}/edit`}>Edit</Link>
              <button className="btn btn-danger" onClick={remove}>Delete</button>
            </>
          )}
        </div>
      </div>

      {notice && (
        <p className="alert">
          {notice} {!user && <Link to="/login">Log in</Link>}
        </p>
      )}

      {recipe.description && <p className="lead">{recipe.description}</p>}

      <div className="rating-row">
        <Stars value={recipe.avgRating} size={24} />
        <span className="muted">
          {recipe.ratingCount ? `${recipe.avgRating} (${recipe.ratingCount} rating${recipe.ratingCount > 1 ? 's' : ''})` : 'No ratings yet'}
        </span>
        <span className="spacer" />
        <span className="muted">Your rating:</span>
        <Stars value={recipe.myRating} onRate={rate} size={24} />
      </div>

      <div className="two-col">
        <section>
          <h2>Ingredients</h2>
          <ul className="ingredients">
            {recipe.ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Method</h2>
          <ol className="steps">
            {recipe.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
