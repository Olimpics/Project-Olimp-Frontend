'use client'

import React, { useState } from 'react';
import styles from './disciplines.module.css';

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
        <div className={styles.inputWrapper}>
            <input
                type="text"
                placeholder="Дисципліна"
                value={searchDisp}
                onChange={handleSearch}
                onFocus={() => setShowDropdown(filteredItems.length > 0)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className={styles.searchbar}
            />
            {showDropdown && (
                <ul className={styles.dropdown}>
                    {filteredItems.map((item) => (
                        <li 
                            key={item.id_disp} 
                            onClick={() => handleSelectItem(item.name_disp)}
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
        <form onSubmit={handleSubmit} className={styles.maindiv}>
            {selectedItems.map((_, index) => (
                <SearchInput key={index} index={index} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />
            ))}
            <button type="submit" className={styles.submitButton}>ЗБЕРЕГТИ</button>
        </form>
    );
};

export default Page;