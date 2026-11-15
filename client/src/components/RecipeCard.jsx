import { useState } from 'react';
import { Link } from 'react-router-dom';
import Stars from './Stars.jsx';
import { CATEGORY_EMOJI } from '../constants.js';

export function RecipeImage({ recipe, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (recipe.image && !failed) {
    return <img className={`recipe-img ${className}`} src={recipe.image} alt={recipe.title} onError={() => setFailed(true)} />;
  }
  return <div className={`recipe-img placeholder ${className}`}>{CATEGORY_EMOJI[recipe.category] || '🍽️'}</div>;
}

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipes/${recipe._id}`} className="card">
      <RecipeImage recipe={recipe} />
      <div className="card-body">
        <span className="tag">{recipe.category}</span>
        <h3>{recipe.title}</h3>
        <p className="muted clamp">{recipe.description || 'No description yet.'}</p>
        <div className="card-meta">
          <span>⏱ {recipe.cookTime} min</span>
          <span>
            <Stars value={recipe.avgRating} size={14} />{' '}
            <small className="muted">{recipe.ratingCount ? `(${recipe.ratingCount})` : ''}</small>
          </span>
        </div>
      </div>
    </Link>
  );
}
