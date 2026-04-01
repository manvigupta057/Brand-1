import { useState, useEffect } from "react";
import axios from "axios";

const MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768",
  "gemma2-9b-it"
];

const defaultForm = { name: "", model: MODELS[0], prompt: "" };

export default function AISettings() {
  const [configs, setConfigs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const fetchConfigs = async () => {
    const res = await axios.get("http://localhost:8000/api/ai-configs");
    setConfigs(res.data);
  };

  useEffect(() => { fetchConfigs(); }, []);

  const handleSave = async () => {
    if (editId) {
      await axios.put(`http://localhost:8000/api/ai-configs/${editId}`, form);
    } else {
      await axios.post("http://localhost:8000/api/ai-configs", form);
    }
    setShowModal(false);
    setForm(defaultForm);
    setEditId(null);
    fetchConfigs();
  };

  const handleEdit = (config) => {
    setForm({ name: config.name, model: config.model, prompt: config.prompt });
    setEditId(config.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:8000/api/ai-configs/${id}`);
    fetchConfigs();
  };

  const handleActivate = async (id) => {
    await axios.patch(`http://localhost:8000/api/ai-configs/${id}/activate`);
    fetchConfigs();
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2>AI Settings</h2>
        <button onClick={() => { setShowModal(true); setForm(defaultForm); setEditId(null); }}>
          + Create New
        </button>
      </div>

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Model</th>
            <th>Prompt Preview</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.model}</td>
              <td>{c.prompt.substring(0, 80)}...</td>
              <td>{c.is_active ? "🟢 Active" : "⚪ Inactive"}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Edit</button>{" "}
                <button onClick={() => handleDelete(c.id)}>Delete</button>{" "}
                {!c.is_active && (
                  <button onClick={() => handleActivate(c.id)}>Activate</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", padding: "24px", width: "500px", borderRadius: "8px" }}>
            <h3>{editId ? "Edit Setup" : "Create New Setup"}</h3>

            <label>Name</label>
            <input style={{ display: "block", width: "100%", marginBottom: "12px" }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label>Model</label>
            <select style={{ display: "block", width: "100%", marginBottom: "12px" }}
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            >
              {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            <label>Routing Prompt</label>
            <textarea style={{ display: "block", width: "100%", height: "150px", marginBottom: "12px" }}
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            />

            <button onClick={handleSave}>Save</button>{" "}
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}