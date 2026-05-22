import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { LucideX, LucideSave, LucideCalendarDays, LucideBedDouble, LucideUtensils, LucidePalmtree } from 'lucide-react';

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

const ROOMS =[
  { id: 'inf1', name: "Hab.1" }, { id: 'inf2', name: "Hab.2" }, 
  { id: 'sup',  name: "Hab.3" }, { id: 'ext1', name: "Hab.4" }, { id: 'ext2', name: "Hab.5" }
];

const DAYS = Array.from({ length: 22 }, (_, i) => i + 8);

export default function VillaApp() {
  const [data, setData] = useState({});
  const [editing, setEditing] = useState(null);
  const [inDate, setInDate] = useState(8);
  const[outDate, setOutDate] = useState(8);
  const [name, setName] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "bookings"), (snapshot) => {
      let b = {};
      snapshot.forEach(doc => { b[doc.id] = doc.data(); });
      setData(b);
    });
    return () => unsub();
  },[]);

  const openEditor = (day, room) => {
    setEditing({ day, room });
    setInDate(day);
    setOutDate(day);
    setName("");
  };

  const saveBooking = async () => {
    const batch = writeBatch(db);
    // Marcamos los días de reserva. 
    // Nota: Para permitir coincidencia de salida/entrada, la reserva termina el día anterior a la salida.
    for (let d = parseInt(inDate); d < parseInt(outDate); d++) {
      batch.set(doc(db, "bookings", `${d}-${editing.room}`), { val: name });
    }
    await batch.commit();
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="p-6 bg-slate-900 text-white font-black text-xl italic tracking-tighter">GOLONDRINA 2026</div>

      {/* TABLA CON SCROLL HORIZONTAL */}
      <div className="overflow-x-auto pb-10">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-20 w-16"></th>
              {DAYS.map(d => (
                <th key={d} className="min-w-[40px] text-[10px] font-black text-slate-400 py-2">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROOMS.map(r => (
              <tr key={r.id}>
                <td className="sticky left-0 z-20 bg-white font-black text-[10px] uppercase border-r border-slate-100">{r.name}</td>
                {DAYS.map(d => (
                  <td key={d} onClick={() => openEditor(d, r.id)} className="p-0.5">
                    <div className={`h-12 w-full rounded-md ${data[`${d}-${r.id}`]?.val ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE RESERVA MEJORADO */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-8 rounded-[3rem] shadow-2xl">
            <div className="flex justify-between mb-6">
              <h2 className="font-black text-2xl uppercase">Nueva Reserva</h2>
              <button onClick={() => setEditing(null)}><LucideX/></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[10px] font-bold uppercase">Entrada</label>
                <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold" value={inDate} onChange={(e) => setInDate(e.target.value)}>
                    {DAYS.map(d => <option key={d} value={d}>{d} Agosto</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase">Salida</label>
                <select className="w-full p-4 bg-slate-100 rounded-2xl font-bold" value={outDate} onChange={(e) => setOutDate(e.target.value)}>
                    {DAYS.map(d => d >= inDate && <option key={d} value={d+1}>{d+1} Agosto</option>)}
                </select>
              </div>
            </div>

            <input type="text" placeholder="Nombre del huésped" className="w-full p-4 bg-slate-100 rounded-2xl mb-6 font-bold" onChange={(e) => setName(e.target.value)}/>
            
            <button onClick={saveBooking} className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest">Confirmar Reserva</button>
          </div>
        </div>
      )}
    </div>
  );
}
