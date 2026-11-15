import { useState } from 'react';

// Read-only when `onRate` is not provided; interactive otherwise.
export default function Stars({ value = 0, onRate, size = 20 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || Math.round(value);

  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= shown ? 'star on' : 'star'}
          style={{ cursor: onRate ? 'pointer' : 'default' }}
          onMouseEnter={() => onRate && setHover(n)}
          onMouseLeave={() => onRate && setHover(0)}
          onClick={() => onRate && onRate(n)}
        >
          ★
        </span>
      ))}
    </span>
  );
}
