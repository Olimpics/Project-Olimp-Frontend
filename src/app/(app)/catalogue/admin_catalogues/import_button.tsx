import { useState, useRef, useCallback } from "react";
import { useRouter } from 'next/navigation';

const FileUploadModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [useLimit, setUseLimit] = useState(false);
  const [limit, setLimit] = useState("500");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tables = [
    "Таблиці",
    "Виборчі дисціпліни",
    "Студенти",
    "Спеціальності",
    "Групи"
  ];

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFileType(file)) {
        setSelectedFile(file);
      }
      e.dataTransfer.clearData();
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFileType(file)) {
        setSelectedFile(file);
        setError(null);
      }
    }
  }, []);

  const router = useRouter();

  const validateFileType = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/json'
    ];

    if (!validTypes.includes(file.type)) {
      setError('Непідтримуваний тип файлу. Будь ласка, виберіть файл Word, Excel, CSV або JSON.');
      return false;
    }
    return true;
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const resetState = () => {
    setSelectedFile(null);
    setIsChecked(false);
    setSelectedTable("");
    setError(null);
    setSuccessMessage(null);
    setIsLoading(false);
    setUseLimit(false);
    setLimit("500");
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Будь ласка, виберіть файл");
      return;
    }

    if (!selectedTable || selectedTable === "Таблиці") {
      setError("Будь ласка, виберіть таблицю");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("File", selectedFile);
      formData.append("TableName", selectedTable);
      formData.append("IsCreate", String(isChecked));
      formData.append("Limit", useLimit ? limit : "0"); // 0 означает "без лимита"

      const response = await fetch('http://185.237.207.78:5000/api/Import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка завантаження файлу');
      }

      const data = await response.json();
      setSuccessMessage(data.message || 'Файл успішно завантажено!');
      sessionStorage.setItem('navigationState', JSON.stringify(data.result?.students));

      if (selectedTable === "Студенти" && data.result?.students) {
        router.push('/imported-students');
        return;
      }

      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Сталася невідома помилка");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Імпорт
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden p-6 ${
              isDragging ? "border-2 border-blue-500" : ""
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Завантажити файл</h2>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer mb-4"
              onClick={openFileDialog}
            >
              {selectedFile ? (
                <p className="text-green-600 font-medium">{selectedFile.name}</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">Перетягніть файл сюди</p>
                  <p className="text-gray-500 text-sm">або</p>
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    disabled={isLoading}
                  >
                    Виберіть файл
                  </button>
                </>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              disabled={isLoading}
              accept=".doc,.docx,.xls,.xlsx,.csv,.json"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Оберіть таблицю:</label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={isLoading}
                >
                  <option value="Таблиці">-- Виберіть таблицю --</option>
                  {tables.filter(t => t !== "Таблиці").map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Ліміт записів:</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="useLimit"
                    checked={useLimit}
                    onChange={(e) => setUseLimit(e.target.checked)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <label htmlFor="useLimit" className="text-gray-700 mr-2">
                    Обмежити
                  </label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-20 p-2 border border-gray-300 rounded"
                    disabled={!useLimit || isLoading}
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="agree"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mr-2"
                disabled={isLoading}
              />
              <label htmlFor="agree" className="text-gray-700">
                Додати, якщо немає
              </label>
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
            )}

            {successMessage && (
              <div className="mb-4 text-green-500 text-sm">{successMessage}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  if (!isLoading) {
                    setIsOpen(false);
                    resetState();
                  }
                }}
                className={`px-4 py-2 rounded transition ${
                  isLoading ? "bg-gray-300 cursor-not-allowed" : "bg-gray-300 hover:bg-gray-400"
                }`}
                disabled={isLoading}
              >
                Скасувати
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || !selectedTable || selectedTable === "Таблиці" || isLoading}
                className={`px-4 py-2 rounded transition ${
                  !selectedFile || !selectedTable || selectedTable === "Таблиці" || isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Завантаження...
                  </div>
                ) : (
                  "Завантажити"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadModal;