'use client'

import React from 'react'

type FilterBoxProps<T> = {
    name: string;
    options: T[];
    accessor: keyof T;
    selectedValues: string[];
    onChange: (selected: string[]) => void;
    collapsible?: boolean;
};

export const FilterBox = <T extends Record<string, any>>({
    name,
    options,
    accessor,
    selectedValues,
    onChange,
    collapsible = true,
}: FilterBoxProps<T>) => {
    const [isOpen, setIsOpen] = React.useState(true);

    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div>
            <h2
                className="text-lg font-semibold mb-2 cursor-pointer flex justify-between items-center"
                onClick={() => collapsible && setIsOpen(!isOpen)}
            >
                {name}
                {collapsible && <span>{isOpen ? '▲' : '▼'}</span>}
            </h2>

            {(!collapsible || isOpen) && (
                <div className="space-y-2">
                    {options.map((option, idx) => {
                        const value = String(option[accessor]);
                        return (
                            <div key={idx} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`${name}-${value}`}
                                    checked={selectedValues.includes(value)}
                                    onChange={() => toggleOption(value)}
                                    className="mr-2"
                                />
                                <label htmlFor={`${name}-${value}`} className="text-gray-700">
                                    {value}
                                </label>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
