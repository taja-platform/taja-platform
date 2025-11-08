import { useState } from "react";

export const Textarea = ({ id, name, label, value, onChange }) => {
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
          {label}
        </label>
        <textarea
          id={id}
          name={name}
          rows="3"
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full px-4 pt-6 pb-2 bg-gray-50 border transition-all duration-200 rounded-lg text-gray-900 placeholder-transparent ${
            focused
              ? "border-gray-900 bg-white shadow-sm"
              : "border-gray-300 hover:border-gray-400"
          } focus:outline-none focus:ring-2 focus:ring-gray-900/10`}
        />
      </div>
    </div>
  );
};
