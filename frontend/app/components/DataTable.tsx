'use client';

import { TableRowSkeleton } from './Skeletons/SkeletonLoader';

interface DataTableProps {
  columns: { key: string; label: string; width?: string }[];
  data: any[];
  actions?: {
    label: string;
    onClick: (row: any) => void;
    color?: 'blue' | 'green' | 'red' | 'amber';
  }[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable({
  columns,
  data,
  actions = [],
  isLoading = false,
  emptyMessage = 'No data available'
}: DataTableProps) {
  const getActionColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 text-green-600 hover:bg-green-100';
      case 'red':
        return 'bg-red-50 text-red-600 hover:bg-red-100';
      case 'amber':
        return 'bg-amber-50 text-amber-600 hover:bg-amber-100';
      default:
        return 'bg-blue-50 text-blue-600 hover:bg-blue-100';
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      {isLoading ? (
        <div className="divide-y divide-gray-200">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <TableRowSkeleton key={i} columnCount={columns.length + (actions.length > 0 ? 1 : 0)} />
            ))}
        </div>
      ) : data && data.length > 0 ? (
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={`${rowIndex}-${col.key}`} className="px-6 py-4 text-sm text-gray-900">
                    {typeof row[col.key] === 'object' ? JSON.stringify(row[col.key]) : String(row[col.key])}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 text-sm flex gap-2">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => action.onClick(row)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition ${getActionColor(action.color)}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
