import { useState, useEffect } from "react";
import axios from "axios";

const Tables = () => {
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // API Call to Backend
    axios.get(`http://localhost:8000/api/brands?page=${page}&search=${search}`)
      .then(res => {
        setBrands(res.data.data);
        setTotal(res.data.total);
      })
      .catch(err => console.error("Table API error:", err));
  }, [page, search]);

  return (
    <div className="mt-5 p-6 bg-white rounded-2xl shadow-md min-h-[600px] border border-gray-100">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1B254B' }}>Brands Database</h2>
          <p className="text-sm text-gray-400 mt-1">Manage and monitor all brands in the dataset</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <span className="text-blue-600 font-bold text-lg">{total}</span>
          <span className="text-blue-400 text-xs ml-2 uppercase font-semibold tracking-wider">Total Records</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          className="border border-gray-200 rounded-xl p-3 pl-10 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          style={{ color: '#1B254B', background: '#FFFFFF' }}
          placeholder="Search by brand name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span className="absolute left-3 top-3 text-gray-400">🔍</span>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-bold">
              <th className="px-5 py-4">Brand Name</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Market Share</th>
              <th className="px-5 py-4">SEO Score</th>
              <th className="px-5 py-4">Sentiment</th>
              <th className="px-5 py-4">Market Years</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {brands.map((b, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors cursor-pointer group border-b border-gray-50">
                <td className="px-5 py-4 font-bold" style={{ color: '#1B254B' }}>{b.brand_name}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded-md text-[11px] font-bold text-gray-600 uppercase">
                    {b.type_of_brand}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-700">{b.market_share}%</td>
                <td className="px-5 py-4">
                   <div className="flex items-center gap-2">
                     <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                       <div className="h-full bg-green-500" style={{ width: `${b.seo_score}%` }}></div>
                     </div>
                     <span className="text-xs font-bold text-gray-600">{b.seo_score}</span>
                   </div>
                </td>
                <td className={`px-5 py-4 font-bold ${b.sentiment_score > 0 ? "text-green-500" : "text-red-400"}`}>
                  {b.sentiment_score > 0 ? "+" : ""}{b.sentiment_score}
                </td>
                <td className="px-5 py-4 text-gray-500 text-sm italic">{b.years_in_market} Years</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-6">
        <p className="text-sm text-gray-500" style={{ color: '#4A5568' }}>
          Showing <b>{brands.length}</b> result per page
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm border"
            style={{ 
                backgroundColor: '#EDF2F7', 
                color: page === 1 ? '#CBD5E0' : '#2D3748',
                borderColor: '#E2E8F0',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            PREVIOUS
          </button>
          
          <div 
            className="px-4 py-2 rounded-xl text-xs font-black shadow-inner"
            style={{ backgroundColor: '#F7FAFC', color: '#1A202C', border: '1px solid #E2E8F0' }}
          >
            PAGE {page}
          </div>

          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
            style={{ 
                backgroundColor: '#1B254B', 
                color: '#FFFFFF',
                cursor: page >= Math.ceil(total / 10) ? 'not-allowed' : 'pointer',
                opacity: page >= Math.ceil(total / 10) ? 0.4 : 1
            }}
          >
            NEXT
          </button>
        </div>
      </div>

    </div>
  );
};

export default Tables;
