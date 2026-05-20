import React, { useState, useEffect } from 'react';
import { LucideCalendar, LucideUtensils, LucidePalmtree, LucideUser, LucideLock } from 'lucide-react';

const ROOMS = [
  "Hab. Piso Inferior 1",
  "Hab. Piso Inferior 2",
  "Hab. Piso Superior",
  "Hab. Exterior 1",
  "Hab. Exterior 2"
];

const DAYS = Array.from({ length: 22 }, (_, i) => i + 8); // Del 8 al 29

export default function VillaApp() {
  const [pass, setPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms');

  const checkPass = () => {
    if (pass === "Javea2026") setIsAuth(true);
    else alert("Contraseña incorrecta");
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <LucideLock className="mx-auto mb-4 text-blue-500" size={48} />
          <h1 className="text-2xl font-bold mb-6">Villa La Golondrina</h1>
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-3 border rounded-lg mb-4 text-center"
            onChange={(e) => setPass(e.target.value)}
          />
          <button onClick={checkPass} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 shadow-md">
        <h1 className="text-2xl font-bold">La Golondrina 🏠</h1>
        <p className="opacity-80">Gestión de Verano 2026</p>
      </div>

      {/* Navegación Simple */}
      <div className="flex justify-around bg-white border-b sticky top-0 z-10">
        <button onClick={() => setActiveTab('rooms')} className={`p-4 flex-1 font-bold ${activeTab === 'rooms' ? 'border-b-4 border-blue-600 text-blue-600' : ''}`}>Habitaciones</button>
        <button onClick={() => setActiveTab('planning')} className={`p-4 flex-1 font-bold ${activeTab === 'planning' ? 'border-b-4 border-blue-600 text-blue-600' : ''}`}>Planning</button>
      </div>

      <main className="p-4 max-w-4xl mx-auto">
        {activeTab === 'rooms' ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Día</th>
                  {ROOMS.map(r => <th key={r} className="p-2 border text-[10px] sm:text-xs leading-tight">{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  <tr key={day}>
                    <td className="p-2 border font-bold bg-blue-50 text-center">{day} Ago</td>
                    {ROOMS.map(r => (
                      <td key={r} className="p-2 border text-center cursor-pointer hover:bg-green-50">
                        <span className="text-gray-300 text-xs">+</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS.map(day => (
              <div key={day} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-400">
                <h3 className="font-bold text-lg mb-2">{day} de Agosto</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded text-sm"><LucideUtensils size={16}/> <b>Comida:</b> <span className="text-gray-500 italic">Libre</span></div>
                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded text-sm"><LucideUtensils size={16}/> <b>Cena:</b> <span className="text-gray-500 italic">Libre</span></div>
                  <div className="flex items-center gap-2 bg-green-50 p-2 rounded text-sm"><LucidePalmtree size={16}/> <b>Plan:</b> <span className="text-gray-500 italic">Cala o Piscina</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
