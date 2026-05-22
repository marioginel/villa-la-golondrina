import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { LucideUtensils, LucidePalmtree, LucideX, LucideSave } from 'lucide-react';

// --- CONFIGURACIÓN FIREBASE ---
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

const ROOMS =[
  { id: 'inf1', name: "Hab.1" }, { id: 'inf2', name: "Hab.2" }, 
  { id: 'sup',  name: "Hab.3" }, { id: 'ext1', name: "Hab.4" }, 
  { id: 'ext2', name: "Hab.5" }
];

const PLANS =[
  { id: 'comida', name: "Comida", icon: <LucideUtensils size={14}/> },
  { id: 'plan',   name: "Plan", icon: <LucidePalmtree size={14}/> },
  { id: 'cena',   name: "Cena", icon: <LucideUtensils size={14}/> }
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
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-10">
      <div className="p-4 bg-slate-900 text-white font-black text-lg italic tracking-tighter">GOLONDRINA 2026</div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border-spacing-0">
          <tbody>
            {ROOMS.map(r => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="sticky left-0 z-10 bg-white p-2 text-[10px] font-black uppercase border-r border-slate-200 w-16">{r.name}</td>
                {DAYS.map(d => {
                  const val = data[`${d}-${r.id}`]?.val;
                  return (
                    <td key={d} onClick={() => openEditor(d, r.id, r.name, val, true)} className="border-r border-slate-50 w-10 h-10">
                      <div className={`w-full h-full ${val ? 'bg-blue-600' : 'bg-slate-50'}`}></div>
                    </td>
                  )
                })}
              </tr>
            ))}
            
            <tr><td colSpan={DAYS.length + 1} className="h-6 bg-slate-50"></td></tr>

            {PLANS.map(p => (
              <tr key={p.id} className="border-b border-slate-100 h-20">
                <td className="sticky left-0 z-10 bg-white p-2 text-[10px] font-black uppercase border-r border-slate-200 flex flex-col items-center justify-center h-20">
                   {p.icon} {p.name}
                </td>
                {DAYS.map(d => {
                  const val = data[`${d}-${p.id}`]?.val;
                  return (
                    <td key={d} onClick={() => openEditor(d, p.id, p.name, val, false)} className="border-r border-slate-50 min-w-[50px] p-1">
                      <div className="flex items-center justify-center h-full w-full bg-slate-50 rounded text-[9px] font-bold text-center p-1 leading-none">
                        {val ? val.substring(0, 10) : d}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white w-full p-6 rounded-3xl">
            <div className="flex justify-between mb-4">
                <h2 className="font-black text-lg uppercase">{editing.typeName}</h2>
                <button onClick={() => setEditing(null)}><LucideX/></button>
            </div>
            {editing.isRoom && (
                <input type="range" min={editing.day} max={29} value={endDay} onChange={(e) => setEndDay(parseInt(e.target.value))} className="w-full mb-4"/>
            )}
            <textarea autoFocus className="w-full h-32 p-4 bg-slate-100 rounded-xl mb-4" value={tempVal} onChange={(e) => setTempVal(e.target.value)}/>
            <button onClick={saveChange} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black">GUARDAR</button>
          </div>
        </div>
      )}
    </div>
  );
}
