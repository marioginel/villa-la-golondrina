import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { LucideLock, LucideUtensils, LucidePalmtree, LucideBedDouble, LucideX, LucideSave, LucideCalendarRange } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE (PEGA TUS DATOS AQUÍ) ---
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_DOMINIO.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ROOMS = [
  { id: 'inf1', name: "Hab. Piso Inferior 1" },
  { id: 'inf2', name: "Hab. Piso Inferior 2" },
  { id: 'sup',  name: "Hab. Piso Superior" },
  { id: 'ext1', name: "Hab. Exterior 1" },
  { id: 'ext2', name: "Hab. Exterior 2" }
];

const PLANS = [
  { id: 'comida', name: "Comida", icon: <LucideUtensils size={18}/>, color: 'bg-orange-500', bg: 'bg-orange-50' },
  { id: 'plan',   name: "Actividad", icon: <LucidePalmtree size={18}/>, color: 'bg-teal-500', bg: 'bg-teal-50' },
  { id: 'cena',   name: "Cena", icon: <LucideUtensils size={18}/>, color: 'bg-indigo-600', bg: 'bg-indigo-50' }
];

const DAYS = Array.from({ length: 22 }, (_, i) => i + 8);

// Función para obtener el nombre del día de la semana
const getDayName = (day) => {
  const date = new Date(2026, 7, day); // Agosto es el mes 7 (0-index)
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', '');
};

export default function VillaApp() {
  const [pass, setPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [data, setData] = useState({});
  const [editing, setEditing] = useState(null); 
  const [tempVal, setTempVal] = useState("");
  const [endDay, setEndDay] = useState(8);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
      let b = {};
      snapshot.forEach(doc => { b[doc.id] = doc.data(); });
      setData(b);
    });
    return () => unsub();
  }, []);

  const openEditor = (day, type, typeName, currentVal) => {
    setEditing({ day, type, typeName });
    setTempVal(currentVal || "");
    setEndDay(day);
  };

  const saveChange = async () => {
    const batch = writeBatch(db);
    // Guardar desde el día de inicio hasta el día de fin seleccionado
    for (let d = editing.day; d <= endDay; d++) {
      const id = `${d}-${editing.type}`;
      const docRef = doc(db, "bookings", id);
      batch.set(docRef, { val: tempVal });
    }
    await batch.commit();
    setEditing(null);
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cyan-900 p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm border-4 border-cyan-400">
          <h1 className="text-4xl font-black text-cyan-900 text-center mb-2 tracking-tighter">HOLA 👋</h1>
          <p className="text-cyan-600 text-center mb-8 font-medium">Villa La Golondrina 2026</p>
          <input 
            type="password" 
            className="w-full p-5 bg-cyan-50 border-2 border-cyan-100 rounded-2xl mb-4 text-center focus:ring-4 ring-cyan-200 transition-all outline-none text-2xl"
            placeholder="••••"
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && pass === "Javea2026" && setIsAuth(true)}
          />
          <button 
            onClick={() => pass === "Javea2026" ? setIsAuth(true) : alert("Clave incorrecta")}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white p-5 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all"
          >
            ENTRAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      {/* FOTO Y HEADER */}
      <div className="relative h-64 sm:h-80 overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover"
          alt="Villa La Golondrina"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-4xl font-black tracking-tighter uppercase">La Golondrina</h1>
          <p className="flex items-center gap-2 text-cyan-300 font-bold uppercase text-sm tracking-widest">
            <LucidePalmtree size={18}/> Jávea · Agosto 2026
          </p>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto sm:p-6 -mt-10 relative z-10">
        <div className="bg-white/90 backdrop-blur shadow-2xl sm:rounded-[3rem] overflow-hidden border border-white">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full border-collapse table-fixed min-w-[1400px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="sticky left-0 z-20 bg-slate-900 p-6 w-56 text-left border-r border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Distribución</span>
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-4 border-r border-slate-800">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-cyan-400">{getDayName(day)}</span>
                        <span className="text-2xl font-black tracking-tighter">{day}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* HABITACIONES */}
                <tr className="bg-cyan-500/10"><td colSpan={DAYS.length + 1} className="px-6 py-3 text-xs font-black text-cyan-700 uppercase tracking-widest">Dormitorios</td></tr>
                {ROOMS.map(room => (
                  <tr key={room.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-100 p-4 font-bold text-slate-700 flex items-center gap-3 text-sm shadow-[10px_0_15px_-10px_rgba(0,0,0,0.1)]">
                      <div className="bg-slate-100 p-2 rounded-xl text-slate-400 group-hover:bg-cyan-500 group-hover:text-white transition-all"><LucideBedDouble size={20}/></div>
                      {room.name}
                    </td>
                    {DAYS.map(day => {
                      const id = `${day}-${room.id}`;
                      const val = data[id]?.val || "";
                      return (
                        <td key={id} onClick={() => openEditor(day, room.id, room.name, val)} className="p-2 border-b border-slate-100">
                          <div className={`h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all cursor-pointer shadow-sm
                            ${val ? 'bg-cyan-500 text-white ring-4 ring-cyan-100' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 border-2 border-dashed border-slate-200'}`}>
                            {val || '—'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* PLANNING */}
                <tr className="bg-orange-500/10"><td colSpan={DAYS.length + 1} className="px-6 py-6 text-xs font-black text-orange-700 uppercase tracking-widest">Planning & Comidas</td></tr>
                {PLANS.map(plan => (
                  <tr key={plan.id}>
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-100 p-4 font-bold text-slate-700 flex items-center gap-3 text-sm shadow-[10px_0_15px_-10px_rgba(0,0,0,0.1)]">
                      <div className={`${plan.color} text-white p-2 rounded-xl`}>{plan.icon}</div>
                      {plan.name}
                    </td>
                    {DAYS.map(day => {
                      const id = `${day}-${plan.id}`;
                      const val = data[id]?.val || "";
                      return (
                        <td key={id} onClick={() => openEditor(day, plan.id, plan.name, val)} className="p-2 border-b border-slate-100">
                          <div className={`h-20 rounded-2xl p-3 text-[11px] font-bold leading-tight transition-all cursor-pointer border-2
                            ${val ? `${plan.bg} border-transparent text-slate-700` : 'bg-white border-dashed border-slate-200 text-slate-300 flex items-center justify-center hover:border-slate-400'}`}>
                            {val || '—'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL DE EDICIÓN CON RANGO DE DÍAS */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600 mb-1">{editing.typeName}</p>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter italic">Editar estancia</h2>
              </div>
              <button onClick={() => setEditing(null)} className="p-3 bg-white border border-slate-200 rounded-full text-slate-400 hover:rotate-90 transition-all"><LucideX size={24}/></button>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-xs font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <LucideCalendarRange size={14}/> Rango de días: {editing.day} al {endDay} de agosto
                </label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl">
                   <span className="font-bold text-slate-400 text-sm">Fin:</span>
                   <input 
                    type="range" 
                    min={editing.day} 
                    max={29} 
                    value={endDay} 
                    onChange={(e) => setEndDay(parseInt(e.target.value))}
                    className="flex-1 accent-cyan-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                   />
                   <span className="bg-cyan-500 text-white px-3 py-1 rounded-lg font-black">{endDay}</span>
                </div>
              </div>

              <label className="block text-xs font-black uppercase text-slate-400 mb-3">Nombre del responsable / Plan</label>
              <textarea 
                autoFocus
                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] mb-8 text-xl font-bold outline-none focus:ring-4 ring-cyan-100 h-32 resize-none"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                placeholder="Escribe aquí..."
              />
              
              <button onClick={saveChange} className="w-full p-6 rounded-3xl font-black bg-cyan-500 text-white flex items-center justify-center gap-3 text-xl shadow-xl shadow-cyan-200 active:scale-95 transition-all">
                <LucideSave size={24}/> GUARDAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
