import React from "react";

function FormSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  error,
  placeholder = "Select an option",
  loading = false,
  ...props
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        className="input-field"
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={loading}
        {...props}
      >
        <option value="" disabled>
          {loading ? "Loading options..." : placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {error && (
        <span style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default FormSelect;
