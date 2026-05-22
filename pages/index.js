import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { LucideUtensils, LucidePalmtree, LucideBedDouble, LucideX, LucideSave, LucideCalendarDays, LucideMapPin, LucideMenu } from 'lucide-react';

const firebaseConfig = { /* TUS DATOS DE FIREBASE AQUÍ */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ROOMS =[
  { id: 'inf1', name: "Piso Inf. 1", color: 'bg-blue-600' },
  { id: 'inf2', name: "Piso Inf. 2", color: 'bg-cyan-500' },
  { id: 'sup',  name: "Piso Sup.",   color: 'bg-indigo-600' },
  { id: 'ext1', name: "Ext. 1",     color: 'bg-emerald-500' },
  { id: 'ext2', name: "Ext. 2",     color: 'bg-teal-600' }
];

const PLANS =[
  { id: 'comida', name: "Comida", icon: <LucideUtensils size={18}/>, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'plan',   name: "Plan", icon: <LucidePalmtree size={18}/>, color: 'text-sky-600', bg: 'bg-sky-50' },
  { id: 'cena',   name: "Cena", icon: <LucideUtensils size={18}/>, color: 'text-purple-600', bg: 'bg-purple-50' }
];

const DAYS = Array.from({ length: 22 }, (_, i) => i + 8);

export default function VillaApp() {
  const [pass, setPass] = useState("");
  const[isAuth, setIsAuth] = useState(false);
  const [data, setData] = useState({});
  const [editing, setEditing] = useState(null); 
  const [tempVal, setTempVal] = useState("");
  const[endDay, setEndDay] = useState(8);

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

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-sm p-8 rounded-[2rem] shadow-2xl">
          <h1 className="text-3xl font-black mb-6 italic text-center">GOLONDRINA</h1>
          <input type="password" className="w-full p-4 mb-4 rounded-2xl bg-slate-100 text-center text-xl font-bold" placeholder="Clave" onChange={(e) => setPass(e.target.value)}/>
          <button onClick={() => pass === "Javea2026" ? setIsAuth(true) : alert("Error")} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black">ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {/* HEADER MOBILE */}
      <div className="relative h-64 w-full">
        <img src="/casa.jpg" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent"></div>
        <div className="absolute bottom-4 left-6">
            <h1 className="text-4xl font-black italic tracking-tighter">La Golondrina</h1>
        </div>
      </div>

      <div className="px-4 -mt-10">
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden p-2">
            <div className="overflow-x-auto pb-4 hide-scrollbar">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr>
                            <th className="w-24 text-[10px] text-slate-400 font-bold uppercase">Hab.</th>
                            {DAYS.map(d => <th key={d} className="w-16 text-center text-xs font-black">{d}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {ROOMS.map(r => (
                            <tr key={r.id}>
                                <td className="text-xs font-bold py-2">{r.name}</td>
                                {DAYS.map(d => {
                                    const val = data[`${d}-${r.id}`]?.val;
                                    return (
                                        <td key={d} onClick={() => openEditor(d, r.id, r.name, val, true)} className="p-0.5">
                                            <div className={`h-10 w-full rounded-lg ${val ? r.color : 'bg-slate-100'}`}></div>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* AGENDA MOBILE */}
        <div className="mt-8 space-y-4">
            <h2 className="font-black text-lg uppercase tracking-widest text-slate-400">Agenda diaria</h2>
            {PLANS.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold flex items-center gap-2 mb-2">{p.icon} {p.name}</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {DAYS.map(d => {
                             const val = data[`${d}-${p.id}`]?.val;
                             return (
                                <button key={d} onClick={() => openEditor(d, p.id, p.name, val, false)} className={`min-w-[60px] h-16 rounded-xl text-[10px] p-1 font-bold ${val ? p.bg : 'bg-slate-100'}`}>
                                    {d} Ago <br/> {val ? '✅' : '—'}
                                </button>
                             )
                        })}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4">
            <div className="bg-white w-full p-8 rounded-[2rem]">
                <h2 className="text-2xl font-black mb-4">{editing.typeName}</h2>
                {editing.isRoom && (
                    <input type="range" min={editing.day} max={29} value={endDay} onChange={(e) => setEndDay(parseInt(e.target.value))} className="w-full mb-6 accent-blue-600"/>
                )}
                <textarea autoFocus className="w-full h-32 p-4 bg-slate-100 rounded-2xl mb-4" value={tempVal} onChange={(e) => setTempVal(e.target.value)}/>
                <button onClick={saveChange} className="w-full bg-black text-white p-4 rounded-2xl font-black">GUARDAR</button>
            </div>
        </div>
      )}
    </div>
  );
}
