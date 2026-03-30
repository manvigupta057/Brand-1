import { useState, useEffect } from "react";
import axios from "axios";

const Tables = () => {
  const [brands, setBrands] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    brand_name: "",
    type_of_brand: "Consumer Goods",
    market_share: 0,
    seo_score: 50,
    sentiment_score: 0,
    years_in_market: 1,
    audience_reach: 0,
    reviews: 0
  });

  const [editData, setEditData] = useState(null);
  const [originalBrandName, setOriginalBrandName] = useState("");

  const fetchBrands = () => {
    axios.get(`http://localhost:8000/api/brands?page=${page}&search=${search}`)
      .then(res => {
        setBrands(res.data.data || []);
        setTotal(res.data.total || 0);
      })
      .catch(err => console.error("Table API error:", err));
  };

  useEffect(() => {
    fetchBrands();
  }, [page, search]);

  const handleDelete = async (brandName) => {
    if (window.confirm(`Are you sure you want to delete ${brandName}?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/brands/${brandName}`);
        fetchBrands();
      } catch (err) {
        alert("Error deleting brand");
      }
    }
  };

  const handleEditClick = (brand) => {
    setEditData({ ...brand });
    setOriginalBrandName(brand.brand_name);
    setShowEditModal(true);
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/brands/${originalBrandName}`, editData);
      setShowEditModal(false);
      fetchBrands();
    } catch (err) {
      alert("Error updating brand");
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/brands", formData);
      setShowModal(false);
      setFormData({ brand_name: "", type_of_brand: "Consumer Goods", market_share: 0, seo_score: 50, sentiment_score: 0, years_in_market: 1, audience_reach: 0, reviews: 0 });
      fetchBrands();
    } catch (err) {
      alert("Error adding brand");
    }
  };

  return (
    <div className="mt-5 p-6 bg-white rounded-2xl shadow-md min-h-[600px] border border-gray-100 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#1B254B' }}>Brands Database</h2>
          <p className="text-sm text-gray-400 mt-1">Manage and monitor all brands in the dataset</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-md text-sm"
          >
            + ADD BRAND
          </button>
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className="text-blue-600 font-bold text-lg">{total}</span>
            <span className="text-blue-400 text-xs ml-2 uppercase font-semibold">Total Records</span>
          </div>
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
              <th className="px-5 py-4">Actions</th>
              <th className="px-5 py-4">Market Share</th>
              <th className="px-5 py-4">SEO Score</th>
              <th className="px-5 py-4">Sentiment</th>
              <th className="px-5 py-4">Market Years</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {brands.map((b, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors border-b border-gray-50">
                <td className="px-5 py-4 font-bold" style={{ color: '#1B254B' }}>{b.brand_name}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded-md text-[11px] font-bold text-gray-600 uppercase">
                    {b.type_of_brand}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(b)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 shadow-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(b.brand_name)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-600 shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-700">{b.market_share}%</td>
                <td className="px-5 py-4 font-bold text-green-500">{b.seo_score}%</td>
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
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase border"
            style={{ backgroundColor: '#EDF2F7', color: page === 1 ? '#CBD5E0' : '#2D3748' }}
          >
            PREVIOUS
          </button>
          <div className="px-4 py-2 rounded-xl text-xs font-black" style={{ backgroundColor: '#F7FAFC' }}>
            PAGE {page}
          </div>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase text-white"
            style={{ backgroundColor: '#1B254B', opacity: page >= Math.ceil(total / 10) ? 0.4 : 1 }}
          >
            NEXT
          </button>
        </div>
      </div>

      {/* Add Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6" style={{ color: '#1B254B' }}>Add New Brand</h3>
            <form onSubmit={handleAddBrand} className="space-y-4">
              <input required placeholder="Brand Name" className="w-full p-3 border rounded-xl"
                onChange={e => setFormData({...formData, brand_name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Market Share %" className="p-3 border rounded-xl"
                  onChange={e => setFormData({...formData, market_share: parseFloat(e.target.value)})} />
                <input type="number" placeholder="SEO Score" className="p-3 border rounded-xl"
                  onChange={e => setFormData({...formData, seo_score: parseInt(e.target.value)})} />
              </div>
              <input required placeholder="Industry" className="w-full p-3 border rounded-xl"
                onChange={e => setFormData({...formData, type_of_brand: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.1" placeholder="Sentiment (-100 to 100)" className="p-3 border rounded-xl"
                  onChange={e => setFormData({...formData, sentiment_score: parseFloat(e.target.value)})} />
                <input type="number" placeholder="Market Years" className="p-3 border rounded-xl"
                  onChange={e => setFormData({...formData, years_in_market: parseInt(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Audience Reach" className="p-3 border rounded-xl"
                  onChange={e => setFormData({...formData, audience_reach: parseInt(e.target.value)})} />
                <input type="number" placeholder="Reviews Count" className="p-3 border rounded-xl"
                  onChange={e => setFormData({...formData, reviews: parseInt(e.target.value)})} />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 font-bold text-gray-500">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-6" style={{ color: '#1B254B' }}>Edit Brand: {originalBrandName}</h3>
            <form onSubmit={handleUpdateBrand} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Brand Name</label>
                <input required placeholder="Brand Name" className="w-full p-3 border rounded-xl"
                  value={editData.brand_name}
                  onChange={e => setEditData({...editData, brand_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Market Share %</label>
                  <input type="number" step="0.01" placeholder="Market Share %" className="w-full p-3 border rounded-xl"
                    value={editData.market_share}
                    onChange={e => setEditData({...editData, market_share: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">SEO Score</label>
                  <input type="number" placeholder="SEO Score" className="w-full p-3 border rounded-xl"
                    value={editData.seo_score}
                    onChange={e => setEditData({...editData, seo_score: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Industry</label>
                <input required placeholder="Industry" className="w-full p-3 border rounded-xl"
                  value={editData.type_of_brand}
                  onChange={e => setEditData({...editData, type_of_brand: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Sentiment</label>
                  <input type="number" step="0.1" placeholder="Sentiment (-100 to 100)" className="w-full p-3 border rounded-xl"
                    value={editData.sentiment_score}
                    onChange={e => setEditData({...editData, sentiment_score: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Market Years</label>
                  <input type="number" placeholder="Market Years" className="w-full p-3 border rounded-xl"
                    value={editData.years_in_market}
                    onChange={e => setEditData({...editData, years_in_market: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Audience Reach</label>
                  <input type="number" placeholder="Audience Reach" className="w-full p-3 border rounded-xl"
                    value={editData.audience_reach}
                    onChange={e => setEditData({...editData, audience_reach: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Reviews Count</label>
                  <input type="number" placeholder="Reviews Count" className="w-full p-3 border rounded-xl"
                    value={editData.reviews}
                    onChange={e => setEditData({...editData, reviews: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 font-bold text-gray-500">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
