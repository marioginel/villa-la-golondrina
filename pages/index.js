import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { LucideLock, LucideUtensils, LucidePalmtree, LucideBedDouble, LucideX, LucideSave, LucideCalendarDays } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
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
  { id: 'inf1', name: "Hab. Piso Inferior 1", color: 'bg-blue-500' },
  { id: 'inf2', name: "Hab. Piso Inferior 2", color: 'bg-blue-400' },
  { id: 'sup',  name: "Hab. Piso Superior",   color: 'bg-indigo-500' },
  { id: 'ext1', name: "Hab. Exterior 1",     color: 'bg-teal-500' },
  { id: 'ext2', name: "Hab. Exterior 2",     color: 'bg-emerald-500' }
];

const PLANS = [
  { id: 'comida', name: "Comida", icon: <LucideUtensils size={18}/>, color: 'text-orange-600', bg: 'bg-orange-100' },
  { id: 'plan',   name: "Actividad", icon: <LucidePalmtree size={18}/>, color: 'text-sky-600', bg: 'bg-sky-100' },
  { id: 'cena',   name: "Cena", icon: <LucideUtensils size={18}/>, color: 'text-purple-600', bg: 'bg-purple-100' }
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-sky-600 p-6 text-white">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-b-8 border-sky-800">
          <h1 className="text-4xl font-black text-sky-900 text-center mb-8 tracking-tighter">VILLA<br/>GOLONDRINA</h1>
          <input 
            type="password" 
            className="w-full p-5 bg-sky-50 border-2 border-sky-100 rounded-3xl mb-4 text-center focus:ring-4 ring-sky-200 transition-all outline-none text-2xl text-sky-900 font-bold"
            placeholder="Clave Javea"
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && pass === "Javea2026" && setIsAuth(true)}
          />
          <button onClick={() => pass === "Javea2026" ? setIsAuth(true) : alert("Clave incorrecta")} className="w-full bg-orange-500 hover:bg-orange-600 text-white p-5 rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95">ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 font-sans pb-20">
      {/* SECCIÓN FOTO HERO */}
      <div className="relative h-80 w-full overflow-hidden shadow-2xl">
        <img 
          src="https://alojamientos.marhenhomes.com/fotos/alojamientos/1/1709115795499298f244199c086f691656e9f2a0df.jpg" 
          className="w-full h-full object-cover"
          alt="Villa La Golondrina"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/90 via-sky-900/20 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
          <div className="text-white">
            <span className="bg-orange-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">Premium Villa</span>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">La Golondrina</h1>
            <p className="font-bold opacity-80 flex items-center gap-2"><LucidePalmtree size={18}/> JÁVEA · AGOSTO 2026</p>
          </div>
        </div>
      </div>

      <main className="max-w-[1500px] mx-auto p-4 sm:p-8 -mt-12 relative z-10">
        <div className="bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] rounded-[4rem] overflow-hidden border-8 border-white">
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse table-fixed min-w-[1600px]">
              <thead>
                <tr className="bg-sky-900 text-white">
                  <th className="sticky left-0 z-30 bg-sky-950 p-8 w-64 text-left border-r border-sky-800">
                    <span className="text-xs font-black uppercase tracking-widest text-sky-400">Distribución</span>
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-6 border-r border-sky-800/50">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-sky-400 mb-1">{getDayName(day)}</span>
                        <span className="text-3xl font-black tracking-tighter leading-none">{day}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* FILAS DE HABITACIONES */}
                {ROOMS.map((room, idx) => (
                  <tr key={room.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="sticky left-0 z-20 bg-inherit border-r border-slate-100 p-6 font-black text-slate-800 flex items-center gap-4 shadow-xl">
                      <div className={`${room.color} text-white p-3 rounded-2xl shadow-lg`}><LucideBedDouble size={20}/></div>
                      <span className="text-sm leading-tight">{room.name}</span>
                    </td>
                    {DAYS.map(day => {
                      const val = data[`${day}-${room.id}`]?.val || "";
                      return (
                        <td key={day} onClick={() => openEditor(day, room.id, room.name, val)} className="p-3 border-r border-slate-100 border-b">
                          <div className={`h-16 rounded-[1.5rem] flex items-center justify-center text-xs font-black transition-all cursor-pointer border-2
                            ${val ? 'bg-sky-500 text-white border-sky-200 shadow-md scale-[1.02]' : 'bg-white border-dashed border-slate-200 text-slate-300 hover:border-sky-300 hover:bg-sky-50'}`}>
                            {val ? val.toUpperCase() : '—'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* FILAS DE PLANNING */}
                <tr className="bg-orange-50"><td colSpan={DAYS.length + 1} className="p-4 text-center font-black text-orange-600 text-xs uppercase tracking-[0.5em]">Planning de Comidas y Planes</td></tr>
                {PLANS.map(plan => (
                  <tr key={plan.id} className="bg-white">
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-100 p-6 font-black text-slate-800 flex items-center gap-4 shadow-xl">
                      <div className={`${plan.bg} ${plan.color} p-3 rounded-2xl shadow-inner`}>{plan.icon}</div>
                      <span className="text-sm">{plan.name}</span>
                    </td>
                    {DAYS.map(day => {
                      const val = data[`${day}-${plan.id}`]?.val || "";
                      return (
                        <td key={day} onClick={() => openEditor(day, plan.id, plan.name, val)} className="p-3 border-r border-slate-100 border-b">
                          <div className={`h-24 rounded-[1.5rem] p-4 text-[11px] font-bold leading-tight transition-all cursor-pointer border-2 overflow-hidden
                            ${val ? `${plan.bg} ${plan.color} border-transparent` : 'bg-white border-dashed border-slate-100 text-slate-300 flex items-center justify-center hover:bg-slate-50'}`}>
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

      {/* POP-UP CENTRAL (MODAL) */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-sky-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border-t-8 border-orange-500 transform transition-all scale-100">
            <div className="p-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-1 leading-none">{editing.typeName}</h2>
                  <p className="text-orange-500 font-black text-xs uppercase tracking-widest">Reserva / Información</p>
                </div>
                <button onClick={() => setEditing(null)} className="p-4 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><LucideX size={24}/></button>
              </div>

              <div className="bg-sky-50 p-6 rounded-[2.5rem] mb-8">
                <label className="text-[10px] font-black text-sky-900/40 uppercase mb-4 flex items-center gap-2 italic">
                  <LucideCalendarDays size={14}/> ¿Cuántos días se queda? (Del {editing.day} al {endDay})
                </label>
                <div className="flex items-center gap-6">
                  <input 
                    type="range" min={editing.day} max={29} value={endDay} 
                    onChange={(e) => setEndDay(parseInt(e.target.value))}
                    className="flex-1 h-3 bg-sky-200 rounded-full appearance-none cursor-pointer accent-orange-500"
                  />
                  <span className="text-3xl font-black text-sky-900 w-12 text-center">{endDay}</span>
                </div>
              </div>

              <textarea 
                autoFocus
                className="w-full p-8 bg-slate-50 border-3 border-transparent rounded-[2.5rem] mb-8 text-2xl font-bold outline-none focus:ring-8 ring-sky-100 h-40 resize-none text-slate-800 placeholder:text-slate-200 shadow-inner"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                placeholder="Nombre o Plan..."
              />
              
              <button onClick={saveChange} className="w-full p-8 rounded-[2.5rem] font-black bg-sky-900 text-white flex items-center justify-center gap-4 text-2xl shadow-2xl shadow-sky-300 hover:bg-black active:scale-95 transition-all">
                <LucideSave size={28}/> GUARDAR TODO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
