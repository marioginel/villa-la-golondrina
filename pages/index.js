import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { LucideUtensils, LucidePalmtree, LucideLock, LucideCheck } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE (PEGA TUS DATOS AQUÍ) ---
const firebaseConfig = {
  apiKey: "AIzaSyCkTjX-3LV4d2Ud7sQ_mlam2mSApMAbQPM",
  authDomain: "villa-javea-e5590.firebaseapp.com",
  projectId: "villa-javea-e5590",
  storageBucket: "villa-javea-e5590.firebasestorage.app",
  messagingSenderId: "1018497732551",
  appId: "1:1018497732551:web:2a70543dfdfa1373b9d3e2",
  measurementId: "G-G2ZQG9FP5M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ROOMS = [
  "Hab. Piso Inferior 1", "Hab. Piso Inferior 2", "Hab. Piso Superior", "Hab. Exterior 1", "Hab. Exterior 2"
];
const DAYS = Array.from({ length: 22 }, (_, i) => i + 8); // 8 al 29

export default function VillaApp() {
  const [pass, setPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms');
  const [data, setData] = useState({});

  // Leer datos en tiempo real de Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
      let bookingsObj = {};
      snapshot.forEach(doc => { bookingsObj[doc.id] = doc.data(); });
      setData(bookingsObj);
    });
    return () => unsub();
  }, []);

  const handleSave = async (id, currentText) => {
    const name = prompt("¿Quién reserva este hueco? (Escribe tu nombre o 'libre' para borrar)", currentText);
    if (name !== null) {
      await setDoc(doc(db, "bookings", id), { name: name });
    }
  };

  const checkPass = () => {
    if (pass === "Javea2026") setIsAuth(true);
    else alert("Contraseña incorrecta");
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <LucideLock className="mx-auto mb-4 text-blue-500" size={48} />
          <h1 className="text-2xl font-bold mb-6 italic text-blue-900">Villa La Golondrina</h1>
          <input 
            type="password" 
            placeholder="Contraseña del verano" 
            className="w-full p-3 border rounded-lg mb-4 text-center outline-blue-500"
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkPass()}
          />
          <button onClick={checkPass} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition">Entrar al Planning</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-blue-800 text-white p-6 shadow-xl flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-black tracking-tight">LA GOLONDRINA 🏠</h1>
            <p className="text-blue-200 text-sm">Agosto 2026 - Control de Estancias</p>
        </div>
      </div>

      <div className="flex justify-around bg-white border-b sticky top-0 z-10 shadow-sm">
        <button onClick={() => setActiveTab('rooms')} className={`p-4 flex-1 font-bold ${activeTab === 'rooms' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400'}`}>Dormir</button>
        <button onClick={() => setActiveTab('planning')} className={`p-4 flex-1 font-bold ${activeTab === 'planning' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-400'}`}>Planes / Comidas</button>
      </div>

      <main className="p-2 sm:p-4 max-w-5xl mx-auto">
        {activeTab === 'rooms' ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-2xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-wider">
                  <th className="p-3 border border-slate-700">Día</th>
                  {ROOMS.map(r => <th key={r} className="p-3 border border-slate-700">{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day} className="hover:bg-blue-50 transition-colors">
                    <td className="p-2 border font-bold bg-slate-100 text-slate-700 text-center text-sm">{day} Ago</td>
                    {ROOMS.map(r => {
                      const id = `${day}-${r.replace(/\s+/g, '')}`;
                      const occupant = data[id]?.name || "";
                      return (
                        <td 
                          key={r} 
                          onClick={() => handleSave(id, occupant)}
                          className={`p-2 border text-center cursor-pointer min-w-[100px] h-12 text-xs font-medium transition-all
                            ${occupant && occupant.toLowerCase() !== 'libre' ? 'bg-green-100 text-green-800' : 'text-gray-300 italic hover:bg-blue-100'}`}
                        >
                          {occupant && occupant.toLowerCase() !== 'libre' ? (
                            <div className="flex items-center justify-center gap-1"><LucideCheck size={12}/> {occupant}</div>
                          ) : 'vacio'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAYS.map(day => (
              <div key={day} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 rounded-bl-xl font-bold">{day} AGO</div>
                <h3 className="font-black text-gray-800 mb-4 border-b pb-2">Planning del día</h3>
                <div className="space-y-3">
                  <div onClick={() => handleSave(`plan-${day}-c`, data[`plan-${day}-c`]?.name)} className="flex items-start gap-3 p-2 hover:bg-orange-50 rounded-lg cursor-pointer">
                    <LucideUtensils className="text-orange-500 mt-1" size={18}/>
                    <div><p className="text-[10px] uppercase font-bold text-orange-400">Comida</p><p className="text-sm text-gray-700">{data[`plan-${day}-c`]?.name || "Toca en el lapiz para editar..."}</p></div>
                  </div>
                  <div onClick={() => handleSave(`plan-${day}-cn`, data[`plan-${day}-cn`]?.name)} className="flex items-start gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer">
                    <LucideUtensils className="text-indigo-500 mt-1" size={18}/>
                    <div><p className="text-[10px] uppercase font-bold text-indigo-400">Cena</p><p className="text-sm text-gray-700">{data[`plan-${day}-cn`]?.name || "Toca en el lapiz para editar..."}</p></div>
                  </div>
                  <div onClick={() => handleSave(`plan-${day}-p`, data[`plan-${day}-p`]?.name)} className="flex items-start gap-3 p-2 hover:bg-emerald-50 rounded-lg cursor-pointer">
                    <LucidePalmtree className="text-emerald-500 mt-1" size={18}/>
                    <div><p className="text-[10px] uppercase font-bold text-emerald-400">Plan del día</p><p className="text-sm text-gray-700">{data[`plan-${day}-p`]?.name || "Toca en el lapiz para editar..."}</p></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
