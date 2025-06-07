'use client'

import React, { useState, useEffect } from 'react';
import { getCookie } from '@/services/cookie-servies';
import { STUDENT_PROFLE } from '@/constants/cookies';

interface Discipline {
    id_disp: number;
    name_disp: string;
    semester_disp: boolean;
}
//
const SearchInput: React.FC<{
    index: number;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    setDisciplineData: React.Dispatch<React.SetStateAction<Discipline[]>>;
}> = ({ index, selectedItems, setSelectedItems, setDisciplineData }) => {
    const [searchDisp, setSearchDisp] = useState("");
    const [allDisciplines, setAllDisciplines] = useState<Discipline[]>([]);
    const [filteredItems, setFilteredItems] = useState<Discipline[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchDisciplines = async () => {
            try {
                const student_storage_raw = getCookie(STUDENT_PROFLE)

                if (!student_storage_raw) {
                    console.error("No student profile found in localStorage");
                    return;
                }

                const student_storage = JSON.parse(student_storage_raw);
                const isEvenSemester = index >= 2;

                const response = await fetch(
                    `http://185.237.207.78:5000/api/DisciplineTab/GetDisciplinesBySemester?studentId=${student_storage.idStudents}&isEvenSemester=${isEvenSemester}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const rawDisciplines = data.disciplines;

                const parsedDisciplines = rawDisciplines.map((d: any) => ({
                    id_disp: d.idAddDisciplines,
                    name_disp: d.codeAddDisciplines + ' ' + d.nameAddDisciplines,
                    semester_disp: isEvenSemester,
                }));

                setAllDisciplines(parsedDisciplines);
                setFilteredItems(parsedDisciplines);
                setDisciplineData(prev => {
                    const newIds = new Set(parsedDisciplines.map((d: Discipline) => d.id_disp));
                    const filteredPrev = prev.filter(d => !newIds.has(d.id_disp));
                    return [...filteredPrev, ...parsedDisciplines];
                });

            } catch (error) {
                console.error('Error fetching disciplines:', error);
            }
        };

        fetchDisciplines();
    }, [index, setDisciplineData]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchDisp(query);

        const filtered = allDisciplines.filter((disp) =>
            disp.name_disp.toLowerCase().includes(query) &&
            (!selectedItems.includes(disp.name_disp) || selectedItems[index] === disp.name_disp)
        );

        setFilteredItems(filtered);
        setShowDropdown(true);
    };

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
        if (!showDropdown) {
            const filtered = allDisciplines.filter(disp =>
                (!selectedItems.includes(disp.name_disp) || selectedItems[index] === disp.name_disp)
            );
            setFilteredItems(filtered);
        }
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
        <div className="relative w-full max-w-md mb-4">
            <div className="flex items-center">
                <input
                    type="text"
                    placeholder="Дисципліна"
                    value={searchDisp}
                    onChange={handleSearch}
                    onFocus={() => {
                        const filtered = allDisciplines.filter(disp =>
                            (!selectedItems.includes(disp.name_disp) || selectedItems[index] === disp.name_disp)
                        );
                        setFilteredItems(filtered);
                        setShowDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
                <button
                    type="button"
                    onClick={toggleDropdown}
                    className="px-3 py-2 bg-white border-t border-b border-r border-gray-300 rounded-r-md hover:bg-gray-300"
                >
                    ▼
                </button>
            </div>
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
    const [disciplineData, setDisciplineData] = useState<Discipline[]>([]);
    const [studentId, setStudentId] = useState<number | null>(null);

    useEffect(() => {
        const student_storage_raw = getCookie(STUDENT_PROFLE)
        if (!student_storage_raw) {
            console.error("No student profile found in localStorage");
            return;
        }

        try {
            const student_storage = JSON.parse(student_storage_raw);
            setStudentId(student_storage.idStudents);
        } catch (err) {
            console.error("Failed to parse student profile:", err);
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!studentId) {
            alert("Student ID not available.");
            return;
        }

        const selectedDisciplineIds = selectedItems
            .map(name => disciplineData.find(d => d.name_disp === name))
            .filter((d): d is Discipline => !!d);

        for (const discipline of selectedDisciplineIds) {
            const payload = {
                studentId: studentId,
                disciplineId: Number(discipline.id_disp),
                semester: discipline.semester_disp ? 0 : 1,
            };

            try {
                const response = await fetch('http://185.237.207.78:5000/api/DisciplineTab/AddDisciplineBind', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error(`Failed to bind discipline: ${discipline.name_disp}`);
                }
            } catch (err) {
                console.error(err);
                alert(`Error saving discipline: ${discipline.name_disp}`);
                return;
            }
        }

        alert(`Збережено: ${selectedItems.filter(item => item).join(", ")}`);
    };

    if (studentId === null) {
        return <div className="text-center text-white">Завантаження профілю студента...</div>;
    }

    return (
        <div className="h-screen flex items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center justify-center w-full max-w-xl p-6 bg-blue-600 rounded-3xl space-y-4 shadow-lg"
            >
                {selectedItems.map((_, index) => (
                    <div key={index} className="w-full flex flex-col items-center">
                        {index === 0 && (
                            <h1 className="text-white font-bold text-lg mb-2 text-center">
                                Осінні дисципліни
                            </h1>
                        )}
                        {index === 2 && (
                            <h1 className="text-white font-bold text-lg mb-2 text-center">
                                Весняні дисципліни
                            </h1>
                        )}
                        <SearchInput
                            index={index}
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            setDisciplineData={setDisciplineData}
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-xl transition duration-300"
                >
                    ЗБЕРЕГТИ
                </button>
            </form>
        </div>
    );
};

export default Page;
