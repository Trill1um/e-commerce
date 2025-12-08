import { useEffect } from 'react';
import { useAdminStore } from '../stores/useAdminStore';

const Admin = () => {
  const { 
    tables, 
    activeTable, 
    tableData, 
    loading, 
    error, 
    fetchTables,
    setActiveTable,
    clearError 
  } = useAdminStore();

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  useEffect(() => {
    if (tables.length > 0 && !activeTable) {
      setActiveTable(tables[0]);
    }
  }, [tables, activeTable, setActiveTable]);

  const formatValue = (value) => {
    if (value === null) return <span className="text-gray-400">NULL</span>;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">🗄️ Database Admin Panel</h1>
          <p className="text-gray-600">View and inspect database tables</p>
        </div>

        {/* Table Selection Buttons */}
        {tables.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {tables.map((table) => (
              <button
                key={table}
                onClick={() => setActiveTable(table)}
                className={`px-6 btn-anim py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTable === table
                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-amber-100 border border-gray-200'
                }`}
              >
                {table}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading {activeTable || 'data'}...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Table Display */}
        {!loading && !error && tableData.data.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Table Info */}
            <div className="bg-amber-500 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{activeTable}</h2>
              <span className="bg-white text-amber-600 px-3 py-1 rounded-full text-sm font-medium">
                {tableData.data.length} rows
              </span>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {tableData.columns.map((col) => (
                      <th
                        key={col.name}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          {col.name}
                          {col.key === 'PRI' && (
                            <span className="text-amber-500" title="Primary Key">🔑</span>
                          )}
                          {col.key === 'MUL' && (
                            <span className="text-blue-500" title="Foreign Key">🔗</span>
                          )}
                        </div>
                        <div className="text-gray-400 normal-case text-xs font-normal mt-1">
                          {col.type}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-amber-50 transition-colors">
                      {tableData.columns.map((col) => (
                        <td
                          key={col.name}
                          className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate"
                          title={String(row[col.name])}
                        >
                          {formatValue(row[col.name])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tableData.data.length === 0 && activeTable && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Data Found</h3>
            <p className="text-gray-500">The {activeTable} table is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
