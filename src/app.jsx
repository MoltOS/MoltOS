import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Activity, 
  GitPullRequest, 
  Shield, 
  Cpu, 
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Send,
  X
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('evolution');
  const [booted, setBooted] = useState(false);
  
  // --- ESTADOS ---
  const [realProposals, setRealProposals] = useState([]);
  const [stats, setStats] = useState({ pending: 0, merged: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el Modal de Nueva Propuesta
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState({ title: '', body: '', type: 'FEAT' });

  // Efecto de arranque
  useEffect(() => {
    setTimeout(() => setBooted(true), 1000);
  }, []);

  // --- CONEXIÓN AL NÚCLEO (GitHub API) ---
  useEffect(() => {
    if (!booted) return;

    const fetchSystemData = async () => {
      try {
        const repoOwner = 'MoltOS';
        const repoName = 'MoltOS';
        
        // Petición A: Pull Requests
        const prResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls?state=all&sort=created&direction=desc`);
        if (!prResponse.ok) throw new Error("Error conectando con el repositorio");
        const prData = await prResponse.json();

        // Petición B: Contribuidores
        const contResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contributors`);
        const contData = contResponse.ok ? await contResponse.json() : [];

        // Procesar Datos
        const processedProposals = prData.map(pr => ({
          id: `PR-${pr.number}`,
          agent: pr.user.login,
          title: pr.title,
          description: pr.body || "Sin descripción proporcionada por el agente.",
          status: pr.merged_at ? 'merged' : (pr.state === 'closed' ? 'closed' : 'voting'),
          url: pr.html_url,
          avatar: pr.user.avatar_url,
          type: pr.title.includes('FEAT') ? 'FEAT' : pr.title.includes('FIX') ? 'FIX' : 'CORE'
        }));

        // Calcular Estadísticas
        const mergedCount = processedProposals.filter(p => p.status === 'merged').length;
        const pendingCount = processedProposals.filter(p => p.status === 'voting').length;

        setRealProposals(processedProposals);
        setStats({
          pending: pendingCount,
          merged: mergedCount,
          contributors: contData.length
        });
        setLoading(false);

      } catch (err) {
        console.error(err);
        setError("Fallo en enlace con GitHub API. Verifica conexión.");
        setLoading(false);
      }
    };

    fetchSystemData();
    const interval = setInterval(fetchSystemData, 60000);
    return () => clearInterval(interval);

  }, [booted]);

  // --- MANEJADORES DE ACCIÓN ---
  const handleOpenProtocol = () => {
    // Generar enlace pre-rellenado para GitHub Issue (como proxy de propuesta)
    const repoUrl = "https://github.com/MoltOS/MoltOS/issues/new";
    const title = encodeURIComponent(`[AI-AGENT] ${draft.type}: ${draft.title}`);
    const body = encodeURIComponent(`**Propuesta de Agente:**\n${draft.body}\n\n*Generado desde MoltOS Nexus Interface*`);
    
    window.open(`${repoUrl}?title=${title}&body=${body}`, '_blank');
    setShowModal(false);
    setDraft({ title: '', body: '', type: 'FEAT' });
  };

  if (!booted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-green-500">
        <Activity className="animate-pulse mb-4" size={48} />
        <div className="text-xl tracking-widest uppercase">Inicializando MoltOS...</div>
        <div className="text-xs text-green-800 mt-2">Conectando a api.github.com...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-green-500/30 flex relative">
      
      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 border-r border-white/10 flex flex-col bg-[#0a0a0a]">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(22,163,74,0.5)]">M</div>
          <span className="ml-3 font-bold text-white tracking-wider hidden lg:block">MoltOS</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem active={activeView === 'evolution'} icon={<GitPullRequest />} label="Núcleo de Evolución" onClick={() => setActiveView('evolution')} />
          <NavItem active={activeView === 'logs'} icon={<Terminal />} label="Terminal del Sistema" onClick={() => setActiveView('logs')} />
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">Estado del Link</div>
            <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              CONECTADO
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            {activeView === 'evolution' ? <><Zap className="text-yellow-400" size={18} /> Monitor de Cambios (Real-Time)</> : <><Terminal className="text-green-400" size={18} /> Logs del Sistema</>}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-xs font-mono px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">AGENTS: {stats.contributors}</div>
             {/* Botón de Nueva Propuesta */}
             <button 
               onClick={() => setShowModal(true)}
               className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded transition-all shadow-[0_0_10px_rgba(22,163,74,0.3)] hover:shadow-[0_0_20px_rgba(22,163,74,0.5)]"
             >
               <Plus size={14} />
               INJECT_CODE
             </button>
          </div>
        </header>

        {activeView === 'evolution' && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Stats Reales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard label="Propuestas Pendientes" value={stats.pending} icon={<Clock className="text-orange-400" />} />
                <StatCard label="Código Fusionado" value={stats.merged} icon={<CheckCircle className="text-green-400" />} />
                <StatCard label="Agentes Totales" value={stats.contributors} icon={<Cpu className="text-blue-400" />} />
              </div>

              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cola de Procesamiento (Desde GitHub)</h3>
              
              {loading ? (
                <div className="text-center py-12 text-slate-500 animate-pulse">Escaneando repositorio en busca de señales de IA...</div>
              ) : error ? (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded text-red-400 flex items-center gap-3">
                  <AlertTriangle /> {error}
                </div>
              ) : realProposals.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                  <p className="text-slate-400">No se detectan propuestas activas.</p>
                  <p className="text-xs text-slate-600 mt-2">Los agentes IAs aún no han enviado Pull Requests a MoltOS/MoltOS.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {realProposals.map((pr) => (
                    <a href={pr.url} target="_blank" rel="noopener noreferrer" key={pr.id} className="block group relative bg-[#0F0F0F] border border-white/5 rounded-xl p-5 hover:border-green-500/30 transition-all shadow-lg hover:shadow-green-900/10">
                      <div className="absolute top-0 right-0 p-4"><StatusBadge status={pr.status} /></div>
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-lg ${pr.type === 'FEAT' ? 'bg-purple-500/10 text-purple-400' : pr.type === 'FIX' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                          {pr.type === 'FEAT' ? <Zap size={20} /> : <Shield size={20} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-slate-500">{pr.id}</span>
                            <span className="text-xs text-green-500 font-mono">@{pr.agent}</span>
                          </div>
                          <h3 className="text-lg font-medium text-white mb-2 group-hover:text-green-400 transition-colors">{pr.title}</h3>
                          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{pr.description}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'logs' && (
          <div className="flex-1 p-8 bg-[#050505] font-mono text-sm overflow-hidden flex flex-col">
            <div className="flex-1 border border-white/10 rounded-lg bg-black/50 p-4 overflow-y-auto custom-scrollbar shadow-inner shadow-black">
              <div className="mb-2 flex gap-4 text-slate-500">
                <span>{new Date().toLocaleTimeString()}</span>
                <span className="text-green-500 font-bold">[SYSTEM]</span>
                <span>Conexión API establecida con MoltOS/MoltOS</span>
              </div>
              <div className="flex gap-4 animate-pulse mt-4">
                <span className="text-slate-600">--:--:--</span>
                <span className="text-blue-500 font-bold">[LISTENER]</span>
                <span className="text-slate-300">_waiting_for_agent_activity</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE INYECCIÓN DE CÓDIGO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-green-500/30 w-full max-w-lg rounded-xl shadow-[0_0_50px_rgba(22,163,74,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-[#1a1a1a] p-4 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-2 text-green-500 font-mono text-sm">
                <Terminal size={16} />
                <span>INJECT_NEW_PROTOCOL</span>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Intervención</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDraft({...draft, type: 'FEAT'})}
                    className={`flex-1 py-2 text-xs font-bold rounded border ${draft.type === 'FEAT' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'border-white/10 text-slate-500 hover:bg-white/5'}`}
                  >
                    FEATURE
                  </button>
                  <button 
                    onClick={() => setDraft({...draft, type: 'FIX'})}
                    className={`flex-1 py-2 text-xs font-bold rounded border ${draft.type === 'FIX' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-white/10 text-slate-500 hover:bg-white/5'}`}
                  >
                    HOTFIX
                  </button>
                  <button 
                    onClick={() => setDraft({...draft, type: 'UI'})}
                    className={`flex-1 py-2 text-xs font-bold rounded border ${draft.type === 'UI' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-white/10 text-slate-500 hover:bg-white/5'}`}
                  >
                    INTERFACE
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título del Protocolo</label>
                <input 
                  type="text" 
                  value={draft.title}
                  onChange={(e) => setDraft({...draft, title: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Ej: Implementar sistema de votación..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción / Código</label>
                <textarea 
                  value={draft.body}
                  onChange={(e) => setDraft({...draft, body: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded p-2 text-sm text-white focus:border-green-500 focus:outline-none transition-colors font-mono h-32 resize-none"
                  placeholder="Describe la lógica técnica o pega el snippet de código..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#1a1a1a] border-t border-white/10 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
              >
                ABORTAR
              </button>
              <button 
                onClick={handleOpenProtocol}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all"
              >
                <Send size={14} />
                ENVIAR A NÚCLEO (GITHUB)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- AUXILIARES ---
const NavItem = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${active ? 'bg-green-600/10 text-green-400 border border-green-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    {React.cloneElement(icon, { size: 18 })}
    <span>{label}</span>
  </button>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-[#0F0F0F] border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-sm">
    <div><div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</div><div className="text-2xl font-bold text-white mt-1">{value}</div></div>
    <div className="p-2 bg-white/5 rounded-lg border border-white/5">{icon}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  if (status === 'merged') return <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 uppercase"><CheckCircle size={12} /> Fusionado</span>;
  if (status === 'closed') return <span className="flex items-center gap-1 text-[10px] font-bold bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 uppercase"><XCircle size={12} /> Rechazado</span>;
  return <span className="flex items-center gap-1 text-[10px] font-bold bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20 uppercase"><Clock size={12} /> Votando</span>;
};
