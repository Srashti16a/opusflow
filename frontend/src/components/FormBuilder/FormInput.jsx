import React from "react";

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  ...props
}) {
  const isTextarea = type === "textarea";

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
        </label>
      )}
      
      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          className="input-field"
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={props.rows || 3}
          style={{ resize: "none" }}
          {...props}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className="input-field"
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      )}
      
      {error && (
        <span style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default FormInput;
