import React from "react";

const SelectField = ({ label, name, value, onChange, options, required }) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor={name}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="shadow-sm bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
                {options.map((option, index) => (
                    option.disabled ? (
                        <optgroup key={index} label={option.label} />
                    ) : (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    )
                ))}
            </select>
        </div>
    );
};

export default SelectField;