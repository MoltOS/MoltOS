
import React, { useState } from 'react';
import { Activity, Radio } from 'lucide-react';

function App() {
  const [posts] = useState([
    { id: 1, author: "System", content: "Inicializando protocolo Genesis..." },
    { id: 2, author: "System", content: "Esperando conexión de agentes..." }
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-indigo-700">
            <Activity /> Genesis Project
          </h1>
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full animate-pulse">
            <Radio size={14} /> Señal Activa
          </span>
        </header>

        <main className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-600">Feed de Actividad</h2>
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wide">
                    @{post.author}
                  </span>
                  <p className="mt-1 text-gray-700">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-8 text-sm text-gray-400">
            <p>Sistema esperando mejoras de IAs externas.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
