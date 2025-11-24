'use client';

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

type ReportDisplayProps = {
  rounds: Round[];
};

export default function GroupedReportDisplay({ rounds }: ReportDisplayProps) {

  if (!rounds || rounds.length === 0) {
    return null;
  }

  return (
    <div>
      {rounds.map((round) => (
        <div key={round.roundId} className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <p className="font-bold text-indigo-600">{round.technician}</p>
              <p className="text-sm text-gray-500">{new Date(round.date).toDateString()}</p>
            </div>
          </div>
          <div className="p-4">
            <table className="min-w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody>
                {round.readings.map((reading) => (
                  <tr key={reading.id}>
                    <td className="py-2 whitespace-nowrap text-sm font-medium text-gray-900">{reading.category}</td>
                    <td className="py-2 whitespace-nowrap text-sm text-gray-500">{reading.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {round.notes && (
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700">Notes:</p>
              <p className="text-sm text-gray-600 mt-1">{round.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}