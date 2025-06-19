import { useState, useRef, useCallback } from "react";

const FileUploadModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tables = [
    "Таблиці",
    "Вибіркові дисципліни",
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
      setSelectedFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  }, []);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const resetState = () => {
    setSelectedFile(null);
    setIsChecked(false);
    setSelectedTable("");
    setError(null);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedTable) {
      setError("Будь ласка, виберіть файл і таблицю");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Здесь имитация загрузки файла
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Если нужно обработать ошибку, можно раскомментировать:
      // throw new Error("Помилка завантаження файлу");

      console.log("Файл:", selectedFile.name);
      console.log("Таблиця:", selectedTable);
      console.log("Галочка:", isChecked);

      setIsOpen(false);
      resetState();
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
            className={`w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden p-6 ${
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
            />

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Оберіть таблицю:</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={isLoading}
              >
                <option value="">-- Виберіть таблицю --</option>
                {tables.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
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
                Додати,якщо нема
              </label>
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
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
                disabled={!selectedFile || !selectedTable || isLoading}
                className={`px-4 py-2 rounded transition ${
                  !selectedFile || !selectedTable || isLoading
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