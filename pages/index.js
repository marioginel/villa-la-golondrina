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
    setEditing(null);
  };

  // Función para calcular si debemos mostrar el nombre en esta celda (centro de la estancia)
  const shouldShowName = (day, roomId, name) => {
    if (!name) return false;
    let stayDays = [];
    DAYS.forEach(d => {
      if (data[`${d}-${roomId}`]?.val === name) stayDays.push(d);
    });
    const middleIndex = Math.floor((stayDays.length - 1) / 2);
    return day === stayDays[middleIndex];
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-6">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-6 italic tracking-tighter">GOLONDRINA</h1>
          <input 
            type="password" 
            className="w-full p-6 bg-slate-100 border-none rounded-3xl mb-6 text-center text-slate-900 font-bold outline-none focus:ring-4 ring-blue-500 transition-all"
            placeholder="Clave"
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && pass === "Javea2026" && setIsAuth(true)}
          />
          <button onClick={() => pass === "Javea2026" ? setIsAuth(true) : alert("Clave incorrecta")} className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black text-xl hover:bg-blue-700 transition-all">ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* CABECERA */}
      <div className="relative h-[550px] w-full overflow-hidden shadow-2xl">
        <img 
          src="/casa.jpg" 
          className="w-full h-full object-cover"
          alt="Villa"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000"}}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        <div className="absolute bottom-20 left-12">
            <h1 className="text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.8] mb-4">La Golondrina</h1>
            <p className="text-blue-300 font-black text-2xl tracking-tighter italic flex items-center gap-3"><LucidePalmtree size={28}/> JÁVEA · AGOSTO 2026</p>
        </div>
      </div>

      <main className="max-w-full px-4 sm:px-10 -mt-32 relative z-10">
        <div className="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] rounded-[4rem] overflow-hidden border-[16px] border-white">
          
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full border-separate border-spacing-0 min-w-[2600px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="sticky left-0 z-40 bg-slate-950 p-12 w-80 text-left shadow-xl border-r border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Habitaciones</span>
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-8 w-64 border-r border-slate-800/50">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-blue-400 mb-1 tracking-widest">{getDayName(day)}</span>
                        <span className="text-6xl font-black tracking-tighter leading-none">{day}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROOMS.map((room) => (
                  <tr key={room.id} className="group">
                    {/* Nombre Habitación con separación blanca abajo */}
                    <td className="sticky left-0 z-30 bg-white p-10 font-black text-slate-800 flex items-center gap-6 shadow-2xl border-b-[15px] border-white">
                      <div className={`${room.color} text-white p-5 rounded-3xl shadow-xl`}><LucideBedDouble size={32}/></div>
                      <span className="text-xl uppercase tracking-tighter font-black italic">{room.name}</span>
                    </td>
                    
                    {DAYS.map((day, idx) => {
                      const val = data[`${day}-${room.id}`]?.val || "";
                      const prevVal = idx > 0 ? data[`${DAYS[idx-1]}-${room.id}`]?.val : null;
                      const nextVal = idx < DAYS.length - 1 ? data[`${DAYS[idx+1]}-${room.id}`]?.val : null;
                      
                      const isContinuing = val && val === prevVal;
                      const hasNext = val && val === nextVal;
                      const showName = shouldShowName(day, room.id, val);

                      return (
                        <td 
                          key={day} 
                          onClick={() => openEditor(day, room.id, room.name, val, true)}
                          className={`h-40 cursor-pointer transition-all border-b-[15px] border-white relative
                            ${val ? `${room.color}` : 'bg-slate-50 p-4'}
                            ${isContinuing ? 'border-l-0' : 'rounded-l-[2.5rem] ml-2'}
                            ${hasNext ? 'border-r-0' : 'rounded-r-[2.5rem] mr-2'}
                          `}
                        >
                          <div className="flex items-center justify-center h-full w-full">
                            {val ? (
                                showName && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white text-4xl font-black tracking-tighter whitespace-nowrap z-10 drop-shadow-md uppercase italic">
                                        {val}
                                    </span>
                                )
                            ) : (
                                <div className="w-full h-full border-4 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-200 text-2xl font-black">—</div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* ESPACIADOR PLANNING */}
                <tr className="bg-slate-900">
                    <td colSpan={DAYS.length + 1} className="p-8 text-center font-black text-slate-500 text-xs uppercase tracking-[2em]">Planning de Comidas y Agenda</td>
                </tr>

                {PLANS.map(plan => (
                  <tr key={plan.id}>
                    <td className="sticky left-0 z-30 bg-white p-10 font-black text-slate-800 flex items-center gap-6 shadow-2xl border-b-[15px] border-white">
                      <div className={`${plan.bg} ${plan.color} p-5 rounded-3xl shadow-inner`}>{plan.icon}</div>
                      <span className="text-xl uppercase tracking-tighter font-black italic">{plan.name}</span>
                    </td>
                    {DAYS.map(day => {
                      const val = data[`${day}-${plan.id}`]?.val || "";
                      return (
                        <td 
                          key={day} 
                          onClick={() => openEditor(day, plan.id, plan.name, val, false)} 
                          className="p-4 border-b-[15px] border-white bg-white"
                        >
                          <div className={`h-56 w-full rounded-[3rem] p-8 flex items-center justify-center text-center text-xl font-black leading-tight transition-all border-4
                            ${val ? `${plan.bg} ${plan.color} ${plan.bdr} shadow-xl scale-[0.98]` : 'bg-slate-50 border-dashed border-slate-200 text-slate-100'}`}>
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

        {/* MAPA */}
        <div className="mt-20 bg-white rounded-[5rem] p-12 sm:p-20 shadow-2xl border-[20px] border-white flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 w-full overflow-hidden rounded-[4rem] shadow-2xl border-8 border-slate-50">
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3113.824707172837!2d0.10193687661559132!3d38.77409097175143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129e05006b578ce3%3A0x540f2b3023582c80!2sLa%20Golondrina!5e0!3m2!1ses!2ses!4v1715870000000!5m2!1ses!2ses" 
                    width="100%" height="500" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                ></iframe>
            </div>
            <div className="flex-1 space-y-8 text-center md:text-left">
                <div className="bg-blue-50 p-12 rounded-[4rem]">
                    <LucideMapPin className="text-blue-600 mb-6 mx-auto md:mx-0" size={64}/>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 italic">¿Cómo llegar?</h2>
                    <p className="text-2xl font-bold text-slate-600 leading-relaxed uppercase tracking-tighter">
                        Villa La Golondrina<br/>
                        C. de la Golondrina, 42<br/>
                        03730 Xàbia, Alicante
                    </p>
                </div>
                <a href="https://www.google.com/maps/dir//La+Golondrina/@38.7740867,0.1045118,17z" target="_blank" 
                   className="block w-full bg-slate-900 text-white py-10 rounded-[4rem] text-center font-black text-3xl shadow-2xl hover:bg-blue-600 transition-all uppercase italic">
                    Abrir en Google Maps
                </a>
            </div>
        </div>
      </main>

      {/* POP-UP (MODAL) */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl transition-all">
          <div className="bg-white w-full max-w-2xl rounded-[5rem] shadow-2xl overflow-hidden border-t-[24px] border-blue-600 animate-in zoom-in-95 duration-200">
            <div className="p-16">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic mb-2 leading-none">{editing.typeName}</h2>
                  <p className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-sm font-black uppercase inline-block">Gestión de estancia</p>
                </div>
                <button onClick={() => setEditing(null)} className="p-5 bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all"><LucideX size={40}/></button>
              </div>

              {editing.isRoom && (
                <div className="bg-slate-50 p-12 rounded-[4rem] mb-12 border-2 border-slate-100 shadow-inner text-center">
                  <p className="text-xs font-black text-slate-400 uppercase mb-8 tracking-widest italic flex items-center justify-center gap-2"><LucideCalendarDays size={20}/> Seleccionar hasta el día:</p>
                  <div className="flex items-center gap-12">
                    <input type="range" min={editing.day} max={29} value={endDay} onChange={(e) => setEndDay(parseInt(e.target.value))}
                           className="flex-1 h-6 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600"/>
                    <div className="bg-blue-600 text-white text-6xl font-black w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl italic">{endDay}</div>
                  </div>
                </div>
              )}

              <textarea autoFocus className="w-full p-12 bg-slate-50 border-none rounded-[4rem] mb-12 text-4xl font-bold outline-none focus:ring-[20px] ring-blue-50 transition-all h-72 resize-none text-slate-800 placeholder:text-slate-200"
                        value={tempVal} onChange={(e) => setTempVal(e.target.value)} placeholder="Escribe el nombre..."/>
              
              <button onClick={saveChange} className="w-full py-12 rounded-[4rem] font-black bg-slate-900 text-white flex items-center justify-center gap-8 text-4xl shadow-2xl hover:bg-blue-600 transition-all uppercase italic">
                <LucideSave size={48}/> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
