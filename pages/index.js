import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { LucideUtensils, LucidePalmtree, LucideX, LucideSave, LucideMapPin, LucideBedDouble, LucideCalendarDays } from 'lucide-react';

const firebaseConfig = 
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

const ROOMS =[
  { id: 'inf1', name: "Hab.1", color: 'bg-blue-600' },
  { id: 'inf2', name: "Hab.2", color: 'bg-cyan-500' },
  { id: 'sup',  name: "Hab.3", color: 'bg-indigo-600' },
  { id: 'ext1', name: "Hab.4", color: 'bg-emerald-500' },
  { id: 'ext2', name: "Hab.5", color: 'bg-teal-600' }
];

const PLANS =[
  { id: 'comida', name: "Comida", icon: <LucideUtensils size={18}/>, bg: 'bg-orange-100', text: 'text-orange-700' },
  { id: 'plan',   name: "Plan", icon: <LucidePalmtree size={18}/>, bg: 'bg-sky-100', text: 'text-sky-700' },
  { id: 'cena',   name: "Cena", icon: <LucideUtensils size={18}/>, bg: 'bg-purple-100', text: 'text-purple-700' }
];

const DAYS = Array.from({ length: 22 }, (_, i) => i + 8);

export default function VillaApp() {
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
  },[]);

  const openEditor = (day, type, typeName, currentVal, isRoom) => {
    setEditing({ day, type, typeName, isRoom });
    setTempVal(currentVal || "");
    setEndDay(day);
  };

  const saveChange = async () => {
    const batch = writeBatch(db);
    const limit = editing.isRoom ? endDay : editing.day;
    for (let d = editing.day; d <= limit; d++) {
      batch.set(doc(db, "bookings", `${d}-${editing.type}`), { val: tempVal });
    }
    await batch.commit();
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* HEADER PREMIUM */}
      <div className="relative h-60 w-full overflow-hidden shadow-2xl">
        <img src="/casa.jpg" className="w-full h-full object-cover" alt="Villa" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-6">
          <h1 className="text-3xl font-black text-white italic tracking-tighter">La Golondrina</h1>
        </div>
      </div>

      {/* TABLA DE RESERVAS */}
      <div className="p-4 -mt-6">
        <div className="bg-white rounded-[2rem] shadow-xl p-4 overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <tbody>
              {ROOMS.map(r => (
                <tr key={r.id}>
                  <td className="w-16 text-[10px] font-black uppercase text-slate-400">{r.name}</td>
                  {DAYS.map(d => {
                    const val = data[`${d}-${r.id}`]?.val;
                    const isStart = val && val !== data[`${d-1}-${r.id}`]?.val;
                    const isEnd = val && val !== data[`${d+1}-${r.id}`]?.val;
                    return (
                      <td key={d} onClick={() => openEditor(d, r.id, r.name, val, true)} className="p-0.5">
                        <div className={`h-12 flex items-center justify-center text-[10px] font-bold text-white transition-all
                          ${val ? `${r.color} ${isStart ? 'rounded-l-2xl' : ''} ${isEnd ? 'rounded-r-2xl' : ''}` : 'bg-slate-100 rounded-lg'}`}>
                          {isStart ? val.substring(0,6) : ''}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AGENDA DIARIA */}
        <h2 className="font-black mt-8 mb-4 text-slate-800 uppercase tracking-widest text-sm">Agenda diaria</h2>
        <div className="space-y-4">
          {PLANS.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3 text-sm font-bold">{p.icon} {p.name}</div>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map(d => {
                    const val = data[`${d}-${p.id}`]?.val;
                    return (
                        <div key={d} onClick={() => openEditor(d, p.id, p.name, val, false)} 
                             className={`h-12 rounded-xl flex items-center justify-center text-[9px] font-bold text-center ${val ? `${p.bg} ${p.text}` : 'bg-slate-100'}`}>
                             {val ? '✅' : d}
                        </div>
                    )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* MAPA Y DIRECCIÓN */}
        <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm">
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-4">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.824707172837!2d0.10193687661559132!3d38.77409097175143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129e05006b578ce3%3A0x540f2b3023582c80!2sLa%20Golondrina!5e0!3m2!1ses!2ses!4v1715870000000!5m2!1ses!2ses" className="w-full h-full border-0"></iframe>
            </div>
            <div className="flex items-center gap-3">
                <LucideMapPin className="text-blue-600"/>
                <p className="text-xs font-bold text-slate-500 italic">C. de la Golondrina, 42, 03730 Xàbia, Alicante</p>
            </div>
        </div>
      </div>

      {/* MODAL MODERNO */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm p-6 rounded-[2rem] shadow-2xl">
                <h2 className="font-black text-xl mb-4 italic uppercase">{editing.typeName}</h2>
                {editing.isRoom && <input type="range" min={editing.day} max={29} value={endDay} onChange={(e) => setEndDay(parseInt(e.target.value))} className="w-full mb-6 accent-blue-600"/>}
                <textarea autoFocus className="w-full h-32 p-4 bg-slate-100 rounded-2xl mb-4" value={tempVal} onChange={(e) => setTempVal(e.target.value)}/>
                <button onClick={saveChange} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black">GUARDAR</button>
            </div>
        </div>
      )}
    </div>
  );
}
