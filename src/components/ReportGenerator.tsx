'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import GroupedReportDisplay from './GroupedReport';

type Reading = {
  id: number;
  category: string;
  value: string;
};
type Round = {
  roundId: number;
  date: string;
  technician: string;
  notes: string;
  readings: Reading[];
};

const mockRoundsData: Round[] = [
  {
    roundId: 1,
    date: "2025-10-08",
    technician: "John Doe",
    notes: "All systems running smoothly in the morning. West wing AC was making a slight noise, but it resolved itself.",
    readings: [
      { id: 1, category: "Steam Pressure - High", value: "122" },
      { id: 2, category: "Outside Temp", value: "68°F" },
      { id: 5, category: "Pump Pressure - High", value: "75" },
    ]
  },
  {
    roundId: 2,
    date: "2025-10-06",
    technician: "Jane Smith",
    notes: "Routine check, no issues to report.",
    readings: [
      { id: 3, category: "Steam Pressure - High", value: "120" },
      { id: 4, category: "Outside Temp", value: "65°F" },
    ]
  },
];

const mockBuildings = [
  "Administration Building",
  "Colden Hall",
  "Franken Hall",
  "Valk Center",
  "Wells Hall",
];

export default function ReportGenerator() {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  const [reportData, setReportData] = useState<Round[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding || !startDate || !endDate) {
      alert("Please select a building and a full date range.");
      return;
    }
    setIsLoading(true);
    setReportData(null);
    setTimeout(() => {
      setReportData(mockRoundsData);
      setIsLoading(false);
    }, 1500);
  };
  
  const isButtonDisabled = !selectedBuilding || !startDate || !endDate || isLoading;

  return (
    <div className="w-full mx-10">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Generate a New Report</h2>
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
           {/* Building Selector */}
          <div>
            <label htmlFor="building" className="block text-sm font-medium text-gray-700">
              Building*
            </label>
            <select
              id="building"
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Choose a building</option>
              {mockBuildings.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
          </div>
          {/* Date Range Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date Range*
            </label>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setStartDate(update[0]);
                setEndDate(update[1]);
              }}
              isClearable={true}
              placeholderText="Select start and end dates"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {/* Generate Button */}
          <div>
            <button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>

      <div>
        {isLoading && <p className="text-center text-gray-500">Loading report data...</p>}
        {!isLoading && !reportData && (
          <div className="flex bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            <p>Please select your criteria to see the results.</p>
          </div>
        )}
        {!isLoading && reportData && (
          <GroupedReportDisplay rounds={reportData} />
        )}
      </div>
    </div>
  );
}