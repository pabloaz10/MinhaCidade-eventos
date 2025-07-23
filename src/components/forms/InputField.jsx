import React from "react";

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = false, tooltip }) => {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {tooltip && (
                <p className="mt-1 text-xs text-gray-500">
                    {tooltip}
                </p>
            )}
        </div>
    );
};

export default InputField;