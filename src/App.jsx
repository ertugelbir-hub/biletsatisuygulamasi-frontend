import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {

  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/events")
      .then(res => {
        setEvents(res.data);
      })
      .catch(err => {
        console.error("API hatası:", err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎫 Etkinlik Listesi</h1>

      {events.length === 0 && <p>Yükleniyor...</p>}

      <ul>
        {events.map(e => (
          <li key={e.id}>
            <strong>{e.title}</strong> — {e.city} — {e.price}₺
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
