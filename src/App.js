import React, { useEffect, useState } from "react";
import './App.css';
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

function App() {
  const [businesses, setBusinesses] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", description: "", location: { lat: "", lng: "" } });
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/business").then(res => setBusinesses(res.data));
    socket.on("new-business", (data) => {
      setBusinesses(prev => [data, ...prev]);
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", auth);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setMessage("Logged in successfully");
    } catch (err) {
      setMessage("Login failed: " + err.response?.data);
    }
  };

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/business", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: "", phone: "", description: "", location: { lat: "", lng: "" } });
      setMessage("Business added!");
    } catch (err) {
      setMessage("Add failed: " + err.response?.data);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Live Business Directory</h1>

      {!token && (
        <form onSubmit={handleLogin} style={{ marginBottom: "2rem" }}>
          <h3>Producer Login</h3>
          <input placeholder="Email" onChange={(e) => setAuth({ ...auth, email: e.target.value })} />
          <input placeholder="Password" type="password" onChange={(e) => setAuth({ ...auth, password: e.target.value })} />
          <button type="submit">Login</button>
        </form>
      )}

      {token && (
        <form onSubmit={handleAddBusiness} style={{ marginBottom: "2rem" }}>
          <h3>Add Business (Producers Only)</h3>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Latitude" value={form.location.lat} onChange={(e) => setForm({ ...form, location: { ...form.location, lat: e.target.value } })} />
          <input placeholder="Longitude" value={form.location.lng} onChange={(e) => setForm({ ...form, location: { ...form.location, lng: e.target.value } })} />
          <button type="submit">Add Business</button>
        </form>
      )}

      <p>{message}</p>

      <h2>Available Businesses</h2>
      {businesses.map((biz, i) => (
        <div key={i} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <h3>{biz.name}</h3>
          <p>{biz.description}</p>
          <p>📞 {biz.phone}</p>
          <a href={`https://maps.google.com/?q=${biz.location.lat},${biz.location.lng}`} target="_blank" rel="noreferrer">
            📍 View on Map
          </a>
        </div>
      ))}
    </div>
  );
}

export default App;
