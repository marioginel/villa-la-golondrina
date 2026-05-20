import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { LucideLock, LucideChevronRight, LucideChevronLeft, LucideUtensils, LucidePalmtree, LucideBedDouble, LucideX, LucideSave } from 'lucide-react';

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
  { id: 'inf1', name: "Hab. Piso Inferior 1", icon: <LucideBedDouble size={16}/> },
  { id: 'inf2', name: "Hab. Piso Inferior 2", icon: <LucideBedDouble size={16}/> },
  { id: 'sup',  name: "Hab. Piso Superior", icon: <LucideBedDouble size={16}/> },
  { id: 'ext1', name: "Hab. Exterior 1", icon: <LucideBedDouble size={16}/> },
  { id: 'ext2', name: "Hab. Exterior 2", icon: <LucideBedDouble size={16}/> }
];

const PLANS = [
  { id: 'comida', name: "Comida", icon: <LucideUtensils size={16}/>, color: 'bg-orange-50 text-orange-700' },
  { id: 'plan',   name: "Actividad", icon: <LucidePalmtree size={16}/>, color: 'bg-emerald-50 text-emerald-700' },
  { id: 'cena',   name: "Cena", icon: <LucideUtensils size={16}/>, color: 'bg-indigo-50 text-indigo-700' }
];

const DAYS = Array.from({ length: 22 }, (_, i) => i + 8);

export default function VillaApp() {
  const [pass, setPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [data, setData] = useState({});
  const [editing, setEditing] = useState(null); // { id, title, currentVal }
  const [tempVal, setTempVal] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
      let b = {};
      snapshot.forEach(doc => { b[doc.id] = doc.data(); });
      setData(b);
    });
    return () => unsub();
  }, []);

  const openEditor = (id, title, currentVal) => {
    setEditing({ id, title });
    setTempVal(currentVal || "");
  };

  const saveChange = async () => {
    await setDoc(doc(db, "bookings", editing.id), { val: tempVal });
    setEditing(null);
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] p-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-sm border border-blue-50">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <LucideLock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">La Golondrina</h1>
          <p className="text-slate-400 text-center mb-8">Introduce la clave para entrar</p>
          <input 
            type="password" 
            className="w-full p-4 bg-slate-50 border-none rounded-2xl mb-4 text-center focus:ring-2 ring-blue-500 transition-all outline-none"
            placeholder="Clave"
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && pass === "Javea2026" && setIsAuth(true)}
          />
          <button 
            onClick={() => pass === "Javea2026" ? setIsAuth(true) : alert("Error")}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans">
      {/* HEADER */}
      <header className="p-6 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-extrabold tracking-tight text-blue-900">LA GOLONDRINA <span className="text-blue-500">2026</span></h1>
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Agosto</div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full border-collapse table-fixed min-w-[1200px]">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-slate-50 border-r border-slate-200 p-4 w-48 text-left text-xs font-black uppercase text-slate-400">Concepto</th>
                  {DAYS.map(day => (
                    <th key={day} className="p-4 border-b border-slate-100 bg-white">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Ago</span>
                        <span className="text-lg font-black text-slate-700">{day}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* SECCIÓN HABITACIONES */}
                <tr className="bg-slate-50/50"><td colSpan={DAYS.length + 1} className="px-4 py-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">Alojamiento</td></tr>
                {ROOMS.map(room => (
                  <tr key={room.id} className="group">
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-200 p-4 font-bold text-slate-700 flex items-center gap-2 text-sm shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                      <div className="text-blue-500 bg-blue-50 p-1.5 rounded-lg">{room.icon}</div>
                      {room.name}
                    </td>
                    {DAYS.map(day => {
                      const id = `${day}-${room.id}`;
                      const val = data[id]?.val || "";
                      return (
                        <td key={id} onClick={() => openEditor(id, `${room.name} - ${day} Ago`, val)} className="p-1 border-b border-slate-50">
                          <div className={`h-12 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${val ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}>
                            {val || '+'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* SECCIÓN PLANNING */}
                <tr className="bg-slate-50/50"><td colSpan={DAYS.length + 1} className="px-4 py-6 text-[10px] font-black text-orange-500 uppercase tracking-widest">Planning Diario</td></tr>
                {PLANS.map(plan => (
                  <tr key={plan.id}>
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-200 p-4 font-bold text-slate-700 flex items-center gap-2 text-sm shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                      <div className="text-orange-500 bg-orange-50 p-1.5 rounded-lg">{plan.icon}</div>
                      {plan.name}
                    </td>
                    {DAYS.map(day => {
                      const id = `${day}-${plan.id}`;
                      const val = data[id]?.val || "";
                      return (
                        <td key={id} onClick={() => openEditor(id, `${plan.name} - ${day} Ago`, val)} className="p-1 border-b border-slate-50">
                          <div className={`h-16 rounded-xl p-2 text-[10px] overflow-hidden leading-tight transition-all cursor-pointer border-2 ${val ? `${plan.color} border-transparent font-medium` : 'bg-white border-dashed border-slate-200 text-slate-300 flex items-center justify-center hover:border-slate-400'}`}>
                            {val || 'Sin plan'}
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

      {/* MODAL DE EDICIÓN (USER FRIENDLY) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-black text-slate-800 tracking-tight">{editing.title}</h2>
              <button onClick={() => setEditing(null)} className="p-2 bg-slate-100 rounded-full text-slate-400"><LucideX size={20}/></button>
            </div>
            <div className="p-6">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Información / Nombre</label>
              <textarea 
                autoFocus
                className="w-full p-4 bg-slate-50 border-none rounded-2xl mb-6 text-lg outline-none focus:ring-2 ring-blue-500 h-32 resize-none"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                placeholder="Escribe aquí..."
              />
              <div className="flex gap-3">
                <button onClick={() => setEditing(null)} className="flex-1 p-4 rounded-2xl font-bold text-slate-400 bg-slate-100">Cancelar</button>
                <button onClick={saveChange} className="flex-1 p-4 rounded-2xl font-bold bg-blue-600 text-white flex items-center justify-center gap-2">
                  <LucideSave size={18}/> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
