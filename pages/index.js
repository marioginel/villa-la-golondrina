import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { LucideLock, LucideUtensils, LucidePalmtree, LucideBedDouble, LucideX, LucideSave, LucideCalendarDays, LucideMapPin } from 'lucide-react';

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
  { id: 'inf1', name: "Hab. Piso Inferior 1", color: 'bg-blue-600' },
  { id: 'inf2', name: "Hab. Piso Inferior 2", color: 'bg-cyan-500' },
  { id: 'sup',  name: "Hab. Piso Superior",   color: 'bg-indigo-600' },
  { id: 'ext1', name: "Hab. Exterior 1",     color: 'bg-emerald-500' },
  { id: 'ext2', name: "Hab. Exterior 2",     color: 'bg-teal-600' }
];

const PLANS = [
  { id: 'comida', name: "Comida", icon: <LucideUtensils size={20}/>, color: 'text-orange-600', bg: 'bg-orange-50', bdr: 'border-orange-100' },
  { id: 'plan',   name: "Actividad", icon: <LucidePalmtree size={20}/>, color: 'text-sky-600', bg: 'bg-sky-50', bdr: 'border-sky-100' },
  { id: 'cena',   name: "Cena", icon: <LucideUtensils size={20}/>, color: 'text-purple-600', bg: 'bg-purple-50', bdr: 'border-purple-100' }
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
    setEditing(null); // Esto cierra el desplegable automáticamente
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6 text-white">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-2 italic">GOLONDRINA</h1>
          <input 
            type="password" 
            className="w-full p-6 bg-slate-100 border-none rounded-3xl mb-6 text-center text-slate-900 font-bold outline-none ring-blue-500 focus:ring-4 transition-all"
            placeholder="Clave"
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && pass === "Javea2026" && setIsAuth(true)}
          />
          <button onClick={() => pass === "Javea2026" ? setIsAuth(true) : alert("Clave incorrecta")} className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black text-xl">ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans pb-20">
      {/* CABECERA */}
      <div className="relative h-[550px] w-full overflow-hidden shadow-2xl">
        <img 
          src="/casa.jpg" 
          className="w-full h-full object-cover"
          alt="Villa La Golondrina"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000"}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent"></div>
        <div className="absolute bottom-20 left-12">
            <h1 className="text-7xl font-black tracking-tighter text-white uppercase italic leading-[0.8] mb-4">La Golondrina</h1>
            <p className="text-blue-300 font-black text-xl tracking-tighter italic flex items-center gap-2"><LucidePalmtree size={24}/> JÁVEA · AGOSTO 2026</p>
        </div>
      </div>

      <main className="max-w-full px-4 sm:px-10 -mt-32 relative z-10">
        <div className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] rounded-[4rem] overflow-hidden border-[16px] border-white">
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-collapse table-fixed min-w-[2400px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="sticky left-0 z-30 bg-slate-950 p-12 w-80 text-left border-r border-slate-800 shadow-xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Distribución</span>
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-8 border-r border-slate-800/50 w-56">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-blue-400 mb-1 tracking-widest leading-none">{getDayName(day)}</span>
                        <span className="text-5xl font-black tracking-tighter leading-none">{day}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* HABITACIONES CON BLOQUE CONTINUO */}
                {ROOMS.map((room) => (
                  <tr key={room.id}>
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-100 p-10 font-black text-slate-800 flex items-center gap-6 shadow-2xl">
                      <div className={`${room.color} text-white p-5 rounded-3xl shadow-xl`}><LucideBedDouble size={28}/></div>
                      <span className="text-lg uppercase tracking-tighter font-black leading-tight italic">{room.name}</span>
                    </td>
                    {DAYS.map((day, idx) => {
                      const val = data[`${day}-${room.id}`]?.val || "";
                      const prevVal = idx > 0 ? data[`${DAYS[idx-1]}-${room.id}`]?.val : null;
                      const nextVal = idx < DAYS.length - 1 ? data[`${DAYS[idx+1]}-${room.id}`]?.val : null;
                      
                      const isStart = val && val !== prevVal;
                      const isContinuing = val && val === prevVal;
                      const hasNext = val && val === nextVal;

                      return (
                        <td key={day} onClick={() => openEditor(day, room.id, room.name, val, true)} className={`p-0 h-32 ${!val ? 'p-3' : ''}`}>
                          <div className={`h-full flex items-center justify-center text-sm font-black transition-all cursor-pointer
                            ${val ? `${room.color} text-white` : 'bg-slate-50 border-4 border-dashed border-slate-200 text-slate-200 rounded-[2rem] hover:bg-white'}
                            ${isStart ? 'rounded-l-[2rem] ml-2' : ''}
                            ${!hasNext && val ? 'rounded-r-[2rem] mr-2' : ''}
                            ${val && hasNext ? 'border-r-0' : ''}
                          `}>
                            {isStart ? <span className="px-4 text-center w-full truncate">{val.toUpperCase()}</span> : ''}
                            {!val && '—'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* PLANNING - CENTRADO Y GRANDE */}
                <tr className="bg-slate-900"><td colSpan={DAYS.length + 1} className="p-6 text-center font-black text-slate-600 text-[10px] uppercase tracking-[1.5em]">Planning de Comidas y Planes</td></tr>
                {PLANS.map(plan => (
                  <tr key={plan.id} className="bg-white">
                    <td className="sticky left-0 z-20 bg-white border-r border-slate-100 p-10 font-black text-slate-800 flex items-center gap-6 shadow-2xl">
                      <div className={`${plan.bg} ${plan.color} p-5 rounded-3xl shadow-inner`}>{plan.icon}</div>
                      <span className="text-lg uppercase tracking-tighter font-black italic">{plan.name}</span>
                    </td>
                    {DAYS.map(day => {
                      const val = data[`${day}-${plan.id}`]?.val || "";
                      return (
                        <td key={day} onClick={() => openEditor(day, plan.id, plan.name, val, false)} className="p-3">
                          <div className={`h-48 w-full rounded-[2.5rem] p-6 flex items-center justify-center text-center text-sm font-black leading-tight transition-all cursor-pointer border-4
                            ${val ? `${plan.bg} ${plan.color} ${plan.bdr} shadow-xl` : 'bg-white border-dashed border-slate-100 text-slate-100 hover:bg-slate-50'}`}>
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

        {/* MAPA Y DIRECCIÓN AL FINAL */}
        <div className="mt-20 bg-white rounded-[4rem] p-10 sm:p-16 shadow-2xl border-[16px] border-white">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 w-full overflow-hidden rounded-[3rem] shadow-inner border-4 border-slate-50">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.824707172837!2d0.10193687661559132!3d38.77409097175143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129e05006b578ce3%3A0x540f2b3023582c80!2sLa%20Golondrina!5e0!3m2!1ses!2ses!4v1715870000000!5m2!1ses!2ses" 
                        width="100%" 
                        height="450" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
                <div className="flex-1 space-y-6">
                    <div className="bg-blue-50 p-8 rounded-[3rem]">
                        <LucideMapPin className="text-blue-600 mb-4" size={48}/>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">Ubicación</h2>
                        <p className="text-xl font-bold text-slate-600 leading-relaxed uppercase">
                            Villa La Golondrina<br/>
                            C. de la Golondrina, 42<br/>
                            03730 Xàbia, Alicante, España
                        </p>
                    </div>
                    <a 
                        href="https://www.google.com/maps/dir//La+Golondrina/@38.7740867,0.1045118,17z" 
                        target="_blank" 
                        className="block w-full bg-slate-900 text-white p-8 rounded-[3rem] text-center font-black text-2xl shadow-xl hover:bg-blue-600 transition-all"
                    >
                        ABRIR EN GPS
                    </a>
                </div>
            </div>
        </div>
      </main>

      {/* POP-UP (MODAL) */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden border-t-[20px] border-blue-600">
            <div className="p-14">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic mb-2 leading-none">{editing.typeName}</h2>
                  <p className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-black uppercase inline-block">Día {editing.day} de Agosto</p>
                </div>
                <button onClick={() => setEditing(null)} className="p-4 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all"><LucideX size={32}/></button>
              </div>

              {editing.isRoom && (
                <div className="bg-slate-50 p-10 rounded-[3rem] mb-10 border-2 border-slate-100 shadow-inner">
                  <p className="text-xs font-black text-slate-400 uppercase mb-8 tracking-widest italic flex items-center gap-2"><LucideCalendarDays size={16}/> Seleccionar estancia (hasta el día {endDay})</p>
                  <div className="flex items-center gap-10">
                    <input 
                        type="range" min={editing.day} max={29} value={endDay} 
                        onChange={(e) => setEndDay(parseInt(e.target.value))}
                        className="flex-1 h-4 bg-blue-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="bg-blue-600 text-white text-5xl font-black w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 italic">{endDay}</div>
                  </div>
                </div>
              )}

              <textarea 
                autoFocus
                className="w-full p-10 bg-slate-50 border-none rounded-[3rem] mb-10 text-3xl font-bold outline-none focus:ring-[16px] ring-blue-50 transition-all h-64 resize-none text-slate-800 placeholder:text-slate-200 shadow-inner"
                value={tempVal}
                onChange={(e) => setTempVal(e.target.value)}
                placeholder={editing.isRoom ? "Nombre de la persona..." : "Escribe el menú o el pl
