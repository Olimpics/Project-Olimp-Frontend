'use client'

import React from 'react'

type FilterBoxProps<T> = {
  name: string
  options: T[]
  accessor: keyof T
  selectedValues: string[]
  onChange: (selected: string[]) => void
  collapsible?: boolean
}

export const FilterBox = <T extends Record<string, any>>({
  name,
  options,
  accessor,
  selectedValues,
  onChange,
  collapsible = true,
}: FilterBoxProps<T>) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const filteredOptions = options.filter((option) =>
    String(option[accessor]).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="pb-3">
      <h2
        className="text-lg font-semibold mb-2 cursor-pointer flex justify-between items-center"
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        {name}
        {collapsible && <span>{isOpen ? '▲' : '▼'}</span>}
      </h2>

      {(!collapsible || isOpen) && (
        <>
          {options.length > 10 && (
            <input
              type="text"
              placeholder="Пошук..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-1 mb-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <div
            className={`space-y-2 ${options.length > 10 ? 'max-h-[250px] overflow-y-auto pr-1' : ''}`}
          >
            {filteredOptions.map((option, idx) => {
              const value = String(option[accessor])
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
              )
            })}
            {filteredOptions.length === 0 && (
              <div className="text-sm text-gray-500">Нічого не знайдено</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}