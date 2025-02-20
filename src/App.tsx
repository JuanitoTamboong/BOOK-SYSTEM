import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[][]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      setExcelData(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleEdit = (rowIndex: number, colIndex: number, value: string) => {
    const updatedData = [...excelData];
    updatedData[rowIndex][colIndex] = value;
    setExcelData(updatedData);
  };

  const handleSave = () => {
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, file ? file.name : "Updated_File.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Modern Excel Editor</h2>
        <p className="text-gray-600 mb-4">Upload an Excel file, edit its content, and save changes.</p>

        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileUpload}
          className="mb-4 p-3 border border-gray-300 rounded-lg shadow-sm w-full cursor-pointer"
        />
        {file && <p className="text-gray-500 text-sm">Editing: {file.name}</p>}

        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md mt-4 hover:bg-blue-600 transition"
        >
          Save Changes
        </button>
      </div>

      {excelData.length > 0 && (
        <div className="overflow-auto w-full max-w-4xl mt-6 bg-white rounded-xl shadow-lg p-4">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-blue-500 text-white text-left">
                {excelData[0].map((header, colIndex) => (
                  <th key={colIndex} className="p-3 border border-gray-300 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.slice(1).map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-300 ${
                    rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 transition`}
                >
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="p-3 border border-gray-300">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleEdit(rowIndex + 1, colIndex, e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
