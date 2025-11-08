import { useState } from "react";

export const Input = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  readOnly = false,
  required = false,
  step,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div
        className={`relative transition-all duration-200 ${
          focused || value ? "transform -translate-y-2" : ""
        }`}
      >
        <label
          htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            focused || value
              ? "top-2 text-xs text-gray-700 font-medium"
              : "top-4 text-gray-500"
          }`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          step={step}
          className={`w-full h-14 px-4 pt-6 pb-2 bg-gray-50 border transition-all duration-200 rounded-lg text-gray-900 placeholder-transparent ${
            readOnly
              ? "bg-gray-100 cursor-not-allowed"
              : focused
              ? "border-gray-900 bg-white shadow-sm"
              : "border-gray-300 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
          readOnly={readOnly}
          required={required}
        />
      </div>
    </div>
  );
};
