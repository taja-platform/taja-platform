import { useState } from "react";

export const Select = ({
  id,
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) => {
  const [focused, setFocused] = useState(false);

  // Determine if the floating label effect should be active
  const isFloating = focused || value;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isFloating
            ? "top-2 text-xs text-gray-700 font-medium"
            : "top-4 text-gray-500"
        }`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={id}
        name={name}
        value={value || ""} // Use empty string for controlled component if value is null
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        className={`w-full h-14 px-4 pt-6 pb-2 bg-gray-50 border transition-all duration-200 rounded-lg text-gray-900 
                    ${
                      disabled
                        ? "bg-gray-100 cursor-not-allowed"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    focus:outline-none focus:ring-2 focus:ring-gray-900/10 appearance-none`}
        required={required}
      >
        {/* Placeholder/Initial Option */}
        <option value="" disabled></option>

        {/* Options from the provided array */}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {/* Custom chevron icon for select */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pt-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};
