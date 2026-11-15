import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';
import { CATEGORIES } from '../constants.js';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api
      .get('/recipes', { params: { q: query, category, page, limit: 9 } })
      .then((res) => {
        if (cancelled) return;
        setRecipes(res.data.recipes);
        setPages(res.data.pages);
      })
      .catch((err) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, category, page]);

  return (
    <>
      <section className="hero">
        <h1>Find your next favourite recipe</h1>
        <input
          className="search"
          type="search"
          placeholder="Search by name or ingredient (e.g. paneer, egg, chocolate)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="chips">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              className={c === category ? 'chip active' : 'chip'}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="alert">{error}</p>}
      {loading ? (
        <p className="muted center">Loading recipes…</p>
      ) : recipes.length === 0 && !error ? (
        <p className="muted center">No recipes found. Try a different search.</p>
      ) : (
        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard key={r._id} recipe={r} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="pager">
          <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          <span className="muted">Page {page} of {pages}</span>
          <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </>
  );
}
