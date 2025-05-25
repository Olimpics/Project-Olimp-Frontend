'use client'

import React, { useState } from 'react';

interface Discipline {
    id_disp: number;
    name_disp: string;
}

const disciplines: Discipline[] = [
    { id_disp: 1, name_disp: "Lorem ipsum" },
    { id_disp: 2, name_disp: "Post Gres" },
    { id_disp: 3, name_disp: "Test Disp" },
    { id_disp: 4, name_disp: "Tungtungtung Sahur" }
];

const SearchInput: React.FC<{ index: number; selectedItems: string[]; setSelectedItems: React.Dispatch<React.SetStateAction<string[]>> }> = ({ index, selectedItems, setSelectedItems }) => {
    const [searchDisp, setSearchDisp] = useState("");
    const [filteredItems, setFilteredItems] = useState<Discipline[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchDisp(query);
        const matches = disciplines.filter(disp => disp.name_disp.toLowerCase().includes(query));
        setFilteredItems(matches);
        setShowDropdown(matches.length > 0);
    };

    const handleSelectItem = (name: string) => {
        setSearchDisp(name);
        setSelectedItems(prev => {
            const newItems = [...prev];
            newItems[index] = name;
            return newItems;
        });
        setShowDropdown(false);
    };

    return (
        <div className="relative w-full max-w-md mb-4 bg">
            <input
                type="text"
                placeholder="Дисципліна"
                value={searchDisp}
                onChange={handleSearch}
                onFocus={() => setShowDropdown(filteredItems.length > 0)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            {showDropdown && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredItems.map((item) => (
                        <li
                            key={item.id_disp}
                            onClick={() => handleSelectItem(item.name_disp)}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                        >
                            {item.name_disp}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const Page: React.FC = () => {
    const [selectedItems, setSelectedItems] = useState<string[]>(["", "", "", ""]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        alert(`Збережено: ${selectedItems.filter(item => item).join(", ")}`);
    };

    return (
        <form onSubmit={handleSubmit}  className="flex flex-col items-center justify-center w-full max-w-1/3 max-h-1/3 p-6 bg-blue-600 rounded-3xl space-y-4 shadow-lg">
            {selectedItems.map((_, index) => (
                <SearchInput key={index} index={index} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
            ))}
            <button
                type="submit"
                className="mt-4 px-6 py-2 bg-white text-blue-600  font-semibold rounded-lg hover:shadow-x1 transition duration-300"
            >
                ЗБЕРЕГТИ
            </button>
        </form>
    );
};

export default Page;
