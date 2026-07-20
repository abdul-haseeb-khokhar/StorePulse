/**
 * Seg — segmented radio control (used for the 7d/30d/90d range picker).
 * `options` is [{ value, label }]; `value`/`onChange` behave like a
 * controlled radio group.
 */
export default function Seg({ name, options, value, onChange, "aria-label": ariaLabel }) {
  return (
    <div className="seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <label key={opt.value} className="seg-opt">
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
