import './FormField.css';

/**
 * FormField — labeled input/select with a built-in error state.
 * Used by the vendor "New listing" form (US-1), which must block
 * submission and highlight exactly what's missing.
 */
export default function FormField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helper,
  disabled = false,
  options,
}) {
  return (
    <div className={`form-field ${error ? 'form-field-error' : ''}`}>
      <label>{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={onChange} disabled={disabled}>
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      {helper && <p className="form-field-helper">{helper}</p>}
    </div>
  );
}
