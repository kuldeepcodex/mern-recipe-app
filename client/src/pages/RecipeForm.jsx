import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { CATEGORIES } from '../constants.js';

const EMPTY = {
  title: '',
  description: '',
  image: '',
  category: 'Dinner',
  cookTime: 30,
  servings: 2,
  ingredients: '',
  steps: '',
};

export default function RecipeForm() {
  const { id } = useParams(); // present when editing
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get(`/recipes/${id}`)
      .then(({ data }) => {
        if (String(data.author?._id) !== String(user?.id)) {
          setError('You can only edit your own recipes.');
          return;
        }
        setForm({
          title: data.title,
          description: data.description || '',
          image: data.image || '',
          category: data.category,
          cookTime: data.cookTime,
          servings: data.servings,
          ingredients: data.ingredients.join('\n'),
          steps: data.steps.join('\n'),
        });
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, user]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      ...form,
      cookTime: Number(form.cookTime),
      servings: Number(form.servings),
      ingredients: form.ingredients.split('\n'),
      steps: form.steps.split('\n'),
    };
    try {
      const { data } = id ? await api.put(`/recipes/${id}`, payload) : await api.post('/recipes', payload);
      navigate(`/recipes/${data._id}`);
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <p className="muted center">Loading…</p>;

  return (
    <form className="form" onSubmit={submit}>
      <h1>{id ? 'Edit recipe' : 'Add a new recipe'}</h1>
      {error && <p className="alert">{error}</p>}

      <label>
        Title *
        <input value={form.title} onChange={set('title')} required maxLength={120} />
      </label>
      <label>
        Short description
        <textarea rows={2} value={form.description} onChange={set('description')} maxLength={600} />
      </label>
      <label>
        Image URL (optional)
        <input type="url" placeholder="https://…" value={form.image} onChange={set('image')} />
      </label>

      <div className="row">
        <label>
          Category
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Cook time (min)
          <input type="number" min="1" max="1440" value={form.cookTime} onChange={set('cookTime')} required />
        </label>
        <label>
          Servings
          <input type="number" min="1" max="100" value={form.servings} onChange={set('servings')} required />
        </label>
      </div>

      <label>
        Ingredients * <small className="muted">(one per line)</small>
        <textarea rows={7} value={form.ingredients} onChange={set('ingredients')} required />
      </label>
      <label>
        Steps * <small className="muted">(one per line)</small>
        <textarea rows={7} value={form.steps} onChange={set('steps')} required />
      </label>

      <div className="actions">
        <button className="btn" disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Publish recipe'}</button>
        <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </form>
  );
}
