import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { LucideLock, LucideUtensils, LucidePalmtree, LucideBedDouble, LucideX, LucideSave, LucideCalendarDays } from 'lucide-react';

// --- PEGA AQUÍ TUS CLAVES DE FIREBASE ---
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
  { id: 'inf1', name: "Hab. Piso Inferior 1", color: 'bg-blue-600' },
  { id: 'inf2', name: "Hab. Piso Inferior 2", color: 'bg-cyan-500' },
  { id: 'sup',  name: "Hab. Piso Superior",   color: 'bg-indigo-600' },
  { id: 'ext1', name: "Hab. Exterior 1",     color: 'bg-emerald-500' },
  { id: 'ext2', name: "Hab. Exterior 2",     color: 'bg-teal-600' }
];

const PLANS = [
  { id: 'comida', name: "Comida", icon: <LucideUtensils size={18}/>, color: 'text-orange-600', bg: 'bg-orange-100', bdr: 'border-orange-200' },
  { id: 'plan',   name: "Actividad", icon: <LucidePalmtree size={18}/>, color: 'text-sky-600', bg: 'bg-sky-100', bdr: 'border-sky-200' },
  { id: 'cena',   name: "Cena", icon: <LucideUtensils size={18}/>, color: 'text-purple-600', bg: 'bg-purple-100', bdr: 'border-purple-200' }
];

const DAYS = Array.from({ length: 22 }, (_, i) => i + 8);
const getDayName = (day) => {
  const date = new Date(2026, 7, day);
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
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
    for (let d = editing.day; d <= endDay; d++) {
      batch.set(doc(db, "bookings", `${d}-${editing.type}`), { val: tempVal });
    }
    await batch.commit();
    setEditing(null);
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 p-6 text-white font-sans">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md text-center border-b-[12px] border-blue-700">
          <h1 className="text-4xl font-black text-blue-900 mb-2 tracking-tighter">LA GOLONDRINA</h1>
          <p className="text-blue-400 font-bold mb-8 uppercase text-xs tracking-widest">Verano 2026</p>
          <input 
            type="password" 
            className="w-full p-6 bg-slate-100 border-none rounded-3xl mb-6 text-center focus:ring-4 ring-blue-200 transition-all outline-none text-2xl text-blue-900 font-bold"
            placeholder="Clave"
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && pass === "Javea2026" && setIsAuth(true)}
          />
          <button onClick={() => pass === "Javea2026" ? setIsAuth(true) : alert("Clave incorrecta")} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl font-black text-xl shadow-xl shadow-blue-200 transition-all active:scale-95">ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* CABECERA CON TU FOTO */}
      <div className="relative h-[450px] w-full overflow-hidden shadow-2xl">
        <img 
          src="/casa.jpg" 
          className="w-full h-full object-cover"
          alt="Villa La Golondrina"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000"}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
        <div className="absolute bottom-12 left-10 text-white">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none mb-2">La Golondrina</h1>
            <p className="font-bold text-blue-300 flex items-center gap-2 text-xl tracking-widest italic">
              <LucidePalmtree size={24}/> JÁVEA · AGOSTO 2026
            </p>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 sm:p-10 -mt-20 relative z-10">
        <div className="bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] rounded-[4rem] overflow-hidden border-[12px] border-white">
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed min-w-[1800px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="sticky left-0 z-30 bg-slate-900 p-10 w-72 text-left border-r border-slate-800">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Distribución</span>
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-8 border-r border-slate-800/50">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-blue-400 mb-1">{getDayName(day)}</span>
                        <span className="text-4xl font-black tracking-tighter leading-none">{day}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* HABITACIONES */}
                {ROOMS.map((room) => (
                  <tr key={room.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-100 p-8 font-black text-slate-800 flex items-center gap-5 shadow-2xl">
                      <div className={`${room.color} text-white p-4 rounded-[1.5rem] shadow-lg`}><LucideBedDouble size={24}/></div>
                      <span className="text-base leading-tight uppercase tracking-tighter">{room.name}</span>
                    </td>
                    {DAYS.map(day => {
                      const val = data[`${day}-${room.id}`]?.val || "";
                      return (
                        <td key={day} onClick={() => openEditor(day, room.id, room.name, val)} className="p-4 border-r border-slate-50">
                          <div className={`h-20 rounded-[2rem] flex items-center justify-center text-sm font-black transition-all cursor-pointer border-4
                            ${val ? 'bg-blue-600 text-white border-blue-200 shadow-xl shadow-blue-100 scale-[1.05]' : 'bg-slate-50 border-dashed border-slate-200 text-slate-300 hover:border-blue-400 hover:bg-white'}`}>
                            {val ? val.toUpperCase() : '—'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* PLANNING */}
                <tr className="bg-slate-900"><td colSpan={DAYS.length + 1} className="p-5 text-center font-black text-blue-400 text-xs uppercase tracking-[0.8em]">Agenda Diaria</td></tr>
                {PLANS.map(plan => (
                  <tr key={plan.id} className="bg-white">
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-100 p-8 font-black text-slate-800 flex items-center gap-5 shadow-2xl">
                      <div className={`${plan.bg} ${plan.color} p-4 rounded-[1.5rem] shadow-inner`}>{plan.icon}</div>
                      <span className="text-base uppercase tracking-tighter">{plan.name}</span>
                    </td>
                    {DAYS.map(day => {
                      const val = data[`${day}-${plan.id}`]?.val || "";
                      return (
                        <td key={day} onClick={() => openEditor(day, plan.id, plan.name, val)} className="p-4 border-r border-slate-50">
                          <div className={`h-28 rounded-[2rem] p-5 text-xs font-bold leading-snug transition-all cursor-pointer border-4 overflow-hidden
                            ${val ? `${plan.bg} ${plan.color} ${plan.bdr} shadow-lg shadow-slate-100` : 'bg-white border-dashed border-slate-100 text-slate-200 flex items-center justify-center hover:bg-slate-50'}`}>
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

      {/* POP-UP (MODAL) CENTRALIZADO */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl transition-all">
          <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border-t-[16px] border-blue-600 animate-in zoom-in-95 duration-200">
            <div className="p-12">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 italic">{editing.typeName}</h2>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    <LucideCalendarDays size={14}/> Del {editing.day} al {endDay} de agosto
                  </div>
                </div>
                <button onClick={() => setEditing(null)} className="p-4 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><LucideX size={32}/></button>
              </div>

              <div className="bg-slate-50 p-8 rounded-[3rem] mb-10 border-2 border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-[0.2em]">Ajustar periodo de estancia</p>
                <div className="flex items-center gap-8">
                  <input 
                    type="range" min={editing.day} max={29} value={endDay} 
                    onChange={(e) => setEndDay(parseInt(e.target.value))}
                    className="flex-1 h-4 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="bg-blue-600 text-white text-4xl font-black w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200 italic">{endDay}</div>
                </div>
              </div>

              <textarea 
                autoFocus
                className="w-full p-10 bg-slate-50 border-none rounded-[3rem] mb-10 text-3xl font-bold outline-none focus:ring-[12px] ring-blue-50 transition-all h-56 resize-none text-slate-800 placeholder:text-slate-200"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                placeholder="Nombre o Plan..."
              />
              
              <button onClick={saveChange} className="w-full p-10 rounded-[3rem] font-black bg-blue-600 text-white flex items-center justify-center gap-5 text-3xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:bg-black transition-all active:scale-95">
                <LucideSave size={36}/> GUARDAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
