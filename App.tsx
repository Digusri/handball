import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Team, Match, NewsArticle, User, UserRole, Federation, Player } from './types';
import { MOCK_TEAMS, MOCK_MATCHES, MOCK_NEWS, MOCK_USERS, FEDERATIONS, MOCK_PLAYERS } from './constants';
import { generateNewsArticle, analyzeMatchSheet, generateHandballImage } from './services/geminiService';
import { Calendar, Trophy, Newspaper, TrendingUp, MapPin, Clock, Search, Shield, Plus, Trash2, Wand2, Users, Medal, User as UserIcon, Upload, FileText, CheckCircle, Loader2, ArrowLeft, Save, Pencil, X, Camera, Sparkles, AlertCircle } from 'lucide-react';

// --- SUB-COMPONENTS ---

const NewsCard: React.FC<{ article: NewsArticle; onClick: () => void }> = ({ article, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md hover:border-green-200 transition-all hover:-translate-y-1 flex flex-col h-full"
  >
    <div className="h-48 w-full overflow-hidden relative">
      <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <span className="text-xs font-semibold text-white bg-green-600/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
          {article.federationId ? FEDERATIONS.find(f => f.id === article.federationId)?.shortName : 'FeChuBa'}
        </span>
      </div>
    </div>
    <div className="p-5 flex-grow flex flex-col">
      <div className="text-xs text-slate-500 mb-2 flex justify-between">
        <span>{new Date(article.publishDate).toLocaleDateString()}</span>
        <span>{article.author}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-700 transition-colors">
        {article.title}
      </h3>
      <p className="text-sm text-slate-600 line-clamp-3 mb-4">{article.summary}</p>
    </div>
  </div>
);

const MatchRow: React.FC<{ match: Match; teams: Team[] }> = ({ match, teams }) => {
  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);
  const fed = FEDERATIONS.find(f => f.id === match.federationId);

  return (
    <div className="bg-white rounded-lg border border-slate-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:border-green-300 hover:shadow-md transition-all">
      <div className="flex flex-col items-center md:items-start min-w-[140px]">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{fed?.shortName}</span>
          <div className="flex gap-2">
             <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{match.category}</span>
             <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{homeTeam?.gender === 'Femenino' ? 'Fem' : 'Masc'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
          <Calendar size={14} />
          <span>{new Date(match.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-sm">
          <Clock size={14} />
          <span>{match.time}</span>
        </div>
      </div>

      <div className="flex items-center flex-1 justify-center gap-4 md:gap-8 w-full md:w-auto">
        <div className="flex flex-col items-center text-center w-1/3">
          <img src={homeTeam?.logoUrl} alt={homeTeam?.name} className="w-14 h-14 rounded-full bg-slate-100 mb-2 object-cover border-2 border-slate-50 shadow-sm" />
          <span className="font-semibold text-sm md:text-base text-slate-800 leading-tight">{homeTeam?.name}</span>
        </div>

        <div className="flex flex-col items-center">
          {match.status === 'FINISHED' ? (
            <div className="text-2xl font-bold text-slate-900 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
              {match.homeScore} - {match.awayScore}
            </div>
          ) : match.status === 'LIVE' ? (
            <div className="flex flex-col items-center animate-pulse">
                <span className="text-red-600 font-bold text-xs uppercase tracking-widest mb-1">En Vivo</span>
                <div className="text-xl font-bold text-slate-900 bg-red-50 border border-red-100 px-4 py-1 rounded-lg">
                  {match.homeScore ?? 0} - {match.awayScore ?? 0}
                </div>
            </div>
          ) : (
            <div className="text-sm font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
              VS
            </div>
          )}
          {match.status !== 'LIVE' && (
            <span className={`text-xs mt-1 font-medium ${match.status === 'FINISHED' ? 'text-slate-400' : 'text-green-600'}`}>
                {match.status === 'FINISHED' ? 'Finalizado' : 'Programado'}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center text-center w-1/3">
          <img src={awayTeam?.logoUrl} alt={awayTeam?.name} className="w-14 h-14 rounded-full bg-slate-100 mb-2 object-cover border-2 border-slate-50 shadow-sm" />
          <span className="font-semibold text-sm md:text-base text-slate-800 leading-tight">{awayTeam?.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-slate-400 text-xs min-w-[140px] justify-center md:justify-end">
        <MapPin size={12} />
        <span>{match.location}</span>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  // Application State
  const [currentView, setCurrentView] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);
  const [heroImage, setHeroImage] = useState<string>("https://images.unsplash.com/photo-1516475429286-465d815a0df4?q=80&w=2070&auto=format&fit=crop");
  const [isGeneratingHero, setIsGeneratingHero] = useState(false);
  
  // Data State
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [news, setNews] = useState<NewsArticle[]>(MOCK_NEWS);
  const [players, setPlayers] = useState<Player[]>(MOCK_PLAYERS);
  
  // Filter State
  const [selectedFederation, setSelectedFederation] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'Masculino' | 'Femenino'>('Masculino');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Admin State
  const [isGenerating, setIsGenerating] = useState(false);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  
  // Admin: Team Management State
  const [selectedAdminTeam, setSelectedAdminTeam] = useState<Team | null>(null);
  
  // Admin: Team Editing/Creation
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState<Partial<Team>>({});

  // Admin: Match Management State
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchForm, setMatchForm] = useState<Partial<Match>>({});

  // Admin: Player Management State
  const [newPlayer, setNewPlayer] = useState<{ name: string; surname: string; dorsal: string; position: string; dni: string; memberId: string; photoUrl?: string }>({ 
    name: '', surname: '', dorsal: '', position: 'Jugador', dni: '', memberId: '', photoUrl: '' 
  });
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  
  // Admin: Image Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Auth Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Initial Load Simulation
  useEffect(() => {
    const storedUser = localStorage.getItem('hc_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // --- Helpers ---
  const getFilteredTeams = (overrideGender?: boolean) => {
    let filtered = teams;
    if (selectedFederation !== 'all') {
      filtered = filtered.filter(t => t.federationId === selectedFederation);
    }
    // For admin view we might want to see all or filter differently, but for public views:
    if (overrideGender === undefined || overrideGender === true) {
        filtered = filtered.filter(t => t.gender === selectedGender);
    }
    return filtered;
  };

  const getFilteredMatches = () => {
    let filtered = matches;
    if (selectedFederation !== 'all') {
      filtered = filtered.filter(m => m.federationId === selectedFederation);
    }
    // Filter matches by gender of the home team (assuming single gender matches)
    filtered = filtered.filter(m => {
        const home = teams.find(t => t.id === m.homeTeamId);
        return home?.gender === selectedGender;
    });
    return filtered;
  };

  const getFilteredNews = () => {
    if (selectedFederation === 'all') return news;
    return news.filter(n => !n.federationId || n.federationId === selectedFederation);
  };

  const getFilteredPlayers = () => {
    const filteredTeams = getFilteredTeams(); // Already filters by gender/federation
    const teamIds = filteredTeams.map(t => t.id);
    return players.filter(p => teamIds.includes(p.teamId));
  };

  const getFederationName = () => {
    if (selectedFederation === 'all') return 'FeChuBa';
    return FEDERATIONS.find(f => f.id === selectedFederation)?.name || '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = MOCK_USERS.find(u => u.email === loginEmail);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('hc_user', JSON.stringify(foundUser));
      setCurrentView('home');
    } else {
      alert('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hc_user');
    setCurrentView('home');
  };

  const handleGenerateNews = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateNewsArticle(newArticleTitle);
      const newArticle: NewsArticle = {
        id: Date.now().toString(),
        title: generated.title,
        summary: generated.summary,
        content: generated.content,
        imageUrl: `https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&fit=crop`, // Use generic handball image
        publishDate: new Date().toISOString(),
        author: 'IA Assistant',
        federationId: selectedFederation === 'all' ? undefined : selectedFederation
      };
      setNews([newArticle, ...news]);
      alert('Noticia generada exitosamente!');
    } catch (error) {
      alert('Error al generar noticia.');
    } finally {
      setIsGenerating(false);
      setNewArticleTitle('');
    }
  };

  const handleGenerateHero = async () => {
    setIsGeneratingHero(true);
    try {
        const imageUrl = await generateHandballImage();
        setHeroImage(imageUrl);
    } catch (error) {
        alert("Error al generar imagen con IA. Ver consola.");
    } finally {
        setIsGeneratingHero(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsAnalyzing(true);
      setAnalysisResult(null);
      try {
        const file = e.target.files[0];
        const base64 = await fileToBase64(file);
        const result = await analyzeMatchSheet(base64);
        setAnalysisResult(result);
      } catch (error) {
        alert('Error al analizar la planilla. Intenta de nuevo.');
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleApplyAnalysis = () => {
    if (!analysisResult) return;
    // In a real app, this would update database. 
    // For now we check if players match existing ones in the roster to simulate "comparing"
    
    // Simple alert summary
    const foundPlayers = analysisResult.players?.filter((p: any) => 
        players.some(existing => 
            (existing.name.toLowerCase().includes(p.name.toLowerCase()) || 
             p.name.toLowerCase().includes(existing.surname.toLowerCase()))
        )
    ).length;

    alert(`Planilla procesada.\n\nResultado: ${analysisResult.homeScore} - ${analysisResult.awayScore}\nSe detectaron ${analysisResult.players?.length || 0} anotadores.\n${foundPlayers} coinciden con la base de datos actual.`);
    setAnalysisResult(null);
  };

  // --- PLAYER MANAGEMENT HANDLERS ---

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminTeam) return;

    if (editingPlayerId) {
        // Update existing player
        setPlayers(players.map(p => 
            p.id === editingPlayerId 
            ? {
                ...p,
                name: newPlayer.name,
                surname: newPlayer.surname,
                dorsal: parseInt(newPlayer.dorsal) || 0,
                position: newPlayer.position,
                dni: newPlayer.dni,
                memberId: newPlayer.memberId,
                photoUrl: newPlayer.photoUrl
              }
            : p
        ));
        setEditingPlayerId(null);
    } else {
        // Create new player
        const newP: Player = {
            id: Date.now().toString(),
            name: newPlayer.name,
            surname: newPlayer.surname,
            teamId: selectedAdminTeam.id,
            position: newPlayer.position,
            goals: 0,
            dorsal: parseInt(newPlayer.dorsal) || 0,
            dni: newPlayer.dni,
            memberId: newPlayer.memberId,
            photoUrl: newPlayer.photoUrl
        };
        setPlayers([...players, newP]);
    }
    
    // Reset form
    setNewPlayer({ name: '', surname: '', dorsal: '', position: 'Jugador', dni: '', memberId: '', photoUrl: '' });
  };

  const handleEditPlayerClick = (player: Player) => {
      setNewPlayer({
          name: player.name,
          surname: player.surname,
          dorsal: player.dorsal.toString(),
          position: player.position,
          dni: player.dni || '',
          memberId: player.memberId || '',
          photoUrl: player.photoUrl || ''
      });
      setEditingPlayerId(player.id);
  };

  const handleDeletePlayer = (playerId: string) => {
      if(confirm('¿Estás seguro de eliminar este jugador?')) {
          setPlayers(players.filter(p => p.id !== playerId));
          if (editingPlayerId === playerId) {
              setEditingPlayerId(null);
              setNewPlayer({ name: '', surname: '', dorsal: '', position: 'Jugador', dni: '', memberId: '', photoUrl: '' });
          }
      }
  };

  const handlePlayerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setNewPlayer(prev => ({ ...prev, photoUrl: base64 }));
      } catch (err) {
        console.error("Error converting file", err);
      }
    }
  };

  // --- TEAM MANAGEMENT HANDLERS ---

  const openTeamModal = (team?: Team) => {
      if (team) {
          setTeamForm({ ...team });
      } else {
          setTeamForm({
              name: '',
              city: '',
              category: 'Mayores',
              federationId: 'f2',
              gender: 'Masculino',
              logoUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=200&h=200&fit=crop'
          });
      }
      setIsTeamModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
      e.preventDefault();
      if (!teamForm.name) return;

      if (teamForm.id) {
          // Edit existing
          setTeams(teams.map(t => t.id === teamForm.id ? { ...t, ...teamForm } as Team : t));
      } else {
          // Add new
          const newTeam: Team = {
              ...(teamForm as Team),
              id: Date.now().toString(),
              gender: teamForm.gender || 'Masculino',
              points: 0,
              played: 0,
              won: 0,
              lost: 0,
              drawn: 0,
              goalDifference: 0
          };
          setTeams([...teams, newTeam]);
      }
      setIsTeamModalOpen(false);
  };

  const handleTeamLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setTeamForm(prev => ({ ...prev, logoUrl: base64 }));
      } catch (err) {
        console.error("Error converting file", err);
      }
    }
  };

  // --- MATCH MANAGEMENT HANDLERS ---

  const openMatchModal = (match?: Match) => {
    if (match) {
      setMatchForm({ ...match });
    } else {
      setMatchForm({
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        category: 'Mayores',
        federationId: 'f2',
        location: '',
        status: 'SCHEDULED',
        homeScore: 0,
        awayScore: 0
      });
    }
    setIsMatchModalOpen(true);
  };

  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchForm.homeTeamId || !matchForm.awayTeamId) {
      alert("Selecciona ambos equipos");
      return;
    }

    if (matchForm.id) {
      setMatches(matches.map(m => m.id === matchForm.id ? { ...m, ...matchForm } as Match : m));
    } else {
      const newMatch: Match = {
        ...(matchForm as Match),
        id: Date.now().toString(),
      };
      setMatches([...matches, newMatch]);
    }
    setIsMatchModalOpen(false);
  };

  const handleDeleteMatch = (matchId: string) => {
    if (confirm("¿Seguro de eliminar este partido?")) {
      setMatches(matches.filter(m => m.id !== matchId));
    }
  };

  // --- SHARED UI ---
  const GenderToggle = () => (
      <div className="flex bg-slate-100 p-1 rounded-lg mb-6 w-fit">
          <button 
              onClick={() => setSelectedGender('Masculino')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${selectedGender === 'Masculino' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
          >
              Masculino
          </button>
          <button 
              onClick={() => setSelectedGender('Femenino')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${selectedGender === 'Femenino' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
          >
              Femenino
          </button>
      </div>
  );

  // --- Views ---

  const renderHome = () => (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative bg-blue-900 rounded-3xl overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800/80 to-green-900/40 mix-blend-multiply z-10"></div>
        {/* Updated Image for a more professional handball look - Specifc Handball Shot */}
        <img 
          src={heroImage} 
          className="w-full h-[500px] object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
          alt="Handball player jumping to shoot"
        />
        <div className="absolute top-4 right-4 z-30">
            <button 
                onClick={handleGenerateHero} 
                disabled={isGeneratingHero}
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-bold py-2 px-4 rounded-full border border-white/30 flex items-center gap-2 transition-all"
            >
                {isGeneratingHero ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                {isGeneratingHero ? 'Generando...' : 'Generar Portada IA'}
            </button>
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-blue-950 via-transparent to-transparent z-20">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                Oficial
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider border border-white/30">
                {getFederationName()}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
              El Handball de Chubut <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">en un solo lugar</span>
            </h1>
            <p className="text-slate-200 text-lg mb-8 max-w-2xl font-light leading-relaxed">
              Noticias, resultados y estadísticas de la <strong>Federación Chubutense de Balonmano</strong> y sus asociaciones afiliadas: Valle, Comodoro y Cordillera.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setCurrentView('calendar')}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-green-600/30 hover:shadow-green-500/50 flex items-center gap-2 transform hover:-translate-y-1"
              >
                <Calendar size={20} />
                Ver Fixture
              </button>
              <button 
                onClick={() => setCurrentView('standings')}
                className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 font-bold py-3 px-8 rounded-full transition-all border border-white/30 flex items-center gap-2"
              >
                <Trophy size={20} />
                Posiciones
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section>
        <div className="flex justify-between items-end mb-6 border-b border-slate-200 pb-4">
          <div>
             <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
               <Newspaper className="text-blue-600" />
               Últimas Noticias
             </h2>
             <p className="text-slate-500 text-sm mt-1">Actualidad de {selectedFederation === 'all' ? 'la provincia' : getFederationName()}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getFilteredNews().map(article => (
            <NewsCard 
              key={article.id} 
              article={article} 
              onClick={() => {
                setSelectedArticle(article);
                setCurrentView('article');
              }} 
            />
          ))}
          {getFilteredNews().length === 0 && (
             <p className="text-slate-500 col-span-3 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">No hay noticias para esta asociación.</p>
          )}
        </div>
      </section>

      {/* Quick Matches */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-green-100 rounded-lg text-green-700">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Partidos Destacados
          </h2>
        </div>
        <div className="space-y-4">
          {getFilteredMatches().slice(0, 3).map(match => (
            <MatchRow key={match.id} match={match} teams={teams} />
          ))}
           {getFilteredMatches().length === 0 && (
             <p className="text-slate-500 text-center py-10">No hay partidos programados.</p>
          )}
        </div>
      </section>
    </div>
  );

  const renderStandings = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-blue-900 p-6 rounded-2xl text-white shadow-lg">
        <div>
           <h2 className="text-2xl font-bold">Tabla de Posiciones</h2>
           <p className="text-blue-200 text-sm mt-1 flex items-center gap-2">
              <MapPin size={14}/>
              Región: <span className="font-semibold text-white">{getFederationName()}</span>
           </p>
        </div>
        <div className="flex gap-2 p-1 bg-blue-800/50 rounded-lg">
           {['Mayores', 'Juveniles', 'Cadetes'].map(cat => (
             <button key={cat} className={`px-4 py-2 text-sm rounded-md transition-all font-medium ${cat === 'Mayores' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-blue-700/50'}`}>
               {cat}
             </button>
           ))}
        </div>
      </div>
      
      <GenderToggle />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-10">#</th>
                <th className="px-6 py-4">Equipo</th>
                <th className="px-6 py-4 text-center">J</th>
                <th className="px-6 py-4 text-center">G</th>
                <th className="px-6 py-4 text-center">E</th>
                <th className="px-6 py-4 text-center">P</th>
                <th className="px-6 py-4 text-center">Dif</th>
                <th className="px-6 py-4 text-center font-bold text-slate-900">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {getFilteredTeams().sort((a, b) => b.points - a.points).map((team, index) => (
                <tr key={team.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index < 3 ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={team.logoUrl} alt="" className="w-10 h-10 rounded-full bg-slate-200 object-cover border border-slate-200" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{team.name}</span>
                      <span className="text-xs text-slate-500">{team.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">{team.played}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{team.won}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{team.drawn}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{team.lost}</td>
                  <td className={`px-6 py-4 text-center font-medium ${team.goalDifference > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-blue-700 text-lg">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {getFilteredTeams().length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
            <Shield size={48} className="text-slate-200 mb-4" />
            <p>No hay equipos registrados en esta asociación/categoría.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTopScorers = () => {
    const sortedPlayers = getFilteredPlayers().sort((a, b) => b.goals - a.goals);
    
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <Medal className="text-yellow-400" size={32} />
              Goleadores
            </h2>
            <p className="text-blue-200 mt-2 text-lg">
              Los máximos artilleros de <span className="font-semibold text-white">{getFederationName()}</span>
            </p>
          </div>
        </div>

        <GenderToggle />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-10">#</th>
                <th className="px-6 py-4">Jugador</th>
                <th className="px-6 py-4">Equipo</th>
                <th className="px-6 py-4 text-center">Goles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPlayers.map((player, index) => {
                const team = teams.find(t => t.id === player.teamId);
                return (
                  <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm ${
                         index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                         index === 1 ? 'bg-slate-300 text-slate-800' :
                         index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-slate-100 text-slate-500'
                       }`}>
                         {index + 1}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                            <Users size={20} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-base">{player.name} {player.surname}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                             {player.position}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {team?.logoUrl && <img src={team.logoUrl} className="w-6 h-6 rounded-full object-cover" />}
                        <span className="text-slate-700 font-medium">{team?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-white bg-blue-600 px-4 py-1 rounded-full shadow-sm">{player.goals}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sortedPlayers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No hay estadísticas de jugadores disponibles para esta selección.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="text-blue-600" /> Fixture
        </h2>
        <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          {getFederationName()}
        </span>
      </div>
      
      <GenderToggle />

      <div className="grid gap-4">
        {getFilteredMatches().map(match => (
          <MatchRow key={match.id} match={match} teams={teams} />
        ))}
        {getFilteredMatches().length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <Calendar className="text-slate-400" size={32} />
             </div>
             <p className="text-slate-900 font-medium">No hay partidos programados</p>
             <p className="text-slate-500 text-sm mt-1">Intenta seleccionar otra asociación o vuelve más tarde.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Equipos Registrados</h2>
           <p className="text-slate-500 text-sm">Clubes afiliados a {getFederationName()}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar equipo..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      <GenderToggle />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredTeams().map(team => (
          <div key={team.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all hover:border-blue-200 group">
            <div className="flex items-center gap-4">
              <img src={team.logoUrl} alt={team.name} className="w-16 h-16 rounded-full bg-slate-100 object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{team.name}</h3>
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1"><MapPin size={12}/> {team.city}</p>
                <div className="flex gap-2">
                   <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                     {team.category}
                   </span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-50">
               <div className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex justify-between items-center">
                 <span>Jugadores Destacados</span>
                 <Users size={12}/>
               </div>
               <div className="space-y-2">
                 {players.filter(p => p.teamId === team.id).slice(0, 3).map(p => (
                   <div key={p.id} className="text-sm text-slate-700 flex justify-between items-center bg-slate-50 p-2 rounded-md">
                     <span className="font-medium flex items-center gap-2">
                       {p.photoUrl && <img src={p.photoUrl} className="w-5 h-5 rounded-full object-cover" />}
                       {p.name} {p.surname}
                     </span>
                     <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-100 text-slate-500">{p.position}</span>
                   </div>
                 ))}
                 {players.filter(p => p.teamId === team.id).length > 3 && (
                   <div className="text-xs text-blue-600 font-medium text-center pt-1 cursor-pointer hover:underline">
                     Ver {players.filter(p => p.teamId === team.id).length - 3} más...
                   </div>
                 )}
                 {players.filter(p => p.teamId === team.id).length === 0 && (
                   <div className="text-xs text-slate-400 italic text-center py-2">Sin plantilla confirmada</div>
                 )}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderArticle = () => {
    if (!selectedArticle) return null;
    return (
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="relative h-96 w-full">
           <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
           <div className="absolute bottom-0 left-0 p-8 text-white">
              <span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-md mb-3 shadow-sm">
               {selectedArticle.federationId ? FEDERATIONS.find(f => f.id === selectedArticle.federationId)?.shortName : 'FeChuBa'}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight drop-shadow-md">{selectedArticle.title}</h1>
           </div>
        </div>
        
        <div className="p-8 md:p-12">
          <button onClick={() => setCurrentView('home')} className="text-blue-600 font-medium mb-8 hover:text-blue-800 flex items-center gap-1 transition-colors">
             &larr; Volver al inicio
          </button>
          
          <div className="flex items-center gap-4 text-slate-500 text-sm mb-8 pb-8 border-b border-slate-100">
            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(selectedArticle.publishDate).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><UserIcon size={14}/> {selectedArticle.author}</span>
          </div>
          
          <div className="prose prose-slate lg:prose-lg text-slate-700 max-w-none">
            <p className="font-medium text-xl text-slate-900 mb-8 leading-relaxed border-l-4 border-green-500 pl-4">
              {selectedArticle.summary}
            </p>
            <div className="whitespace-pre-wrap leading-relaxed">
              {selectedArticle.content}
            </div>
          </div>
        </div>
      </article>
    );
  };

  const renderAdmin = () => (
    <div className="space-y-8">
      
      {/* --- Image/PDF Analyzer Section --- */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 rounded-2xl shadow-xl border border-slate-700 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
             <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
               <FileText className="text-green-400" />
               Cargar Planilla de Partido
             </h2>
             <p className="text-blue-200 mb-6">
               Sube una foto o <strong>PDF</strong> de la planilla oficial. La IA analizará la imagen para extraer el resultado y comparará con la plantilla de jugadores en la base de datos.
             </p>
             
             <div className="flex items-center gap-4">
               <label className="cursor-pointer bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-green-600/30 flex items-center gap-2">
                 <Upload size={20} />
                 Subir Archivo
                 <input type="file" accept="image/*,application/pdf" onChange={handleImageUpload} className="hidden" />
               </label>
               {isAnalyzing && (
                 <div className="flex items-center gap-2 text-blue-200 animate-pulse">
                   <Loader2 size={20} className="animate-spin" />
                   Analizando archivo...
                 </div>
               )}
             </div>
          </div>

          <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-sm min-h-[200px] flex flex-col justify-center">
             {!analysisResult && !isAnalyzing && (
               <div className="text-center text-slate-400">
                 <Upload size={48} className="mx-auto mb-2 opacity-50" />
                 <p>Sube una imagen o PDF para ver la vista previa de los datos extraídos.</p>
               </div>
             )}

             {analysisResult && (
               <div className="space-y-4 animate-in fade-in zoom-in-95">
                 <div className="flex justify-between items-center border-b border-white/10 pb-2">
                   <div className="font-bold text-lg">{analysisResult.homeTeam || 'Local'}</div>
                   <div className="bg-white/20 px-3 py-1 rounded font-mono font-bold">
                     {analysisResult.homeScore ?? '-'} - {analysisResult.awayScore ?? '-'}
                   </div>
                   <div className="font-bold text-lg">{analysisResult.awayTeam || 'Visitante'}</div>
                 </div>
                 
                 <div className="space-y-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                   {analysisResult.players?.map((p: any, i: number) => (
                     <div key={i} className="flex justify-between text-sm text-slate-300">
                       <span>{p.name} <span className="text-xs text-slate-500">({p.team})</span></span>
                       <span className="text-green-400 font-bold">+{p.goals} goles</span>
                     </div>
                   ))}
                   {(!analysisResult.players || analysisResult.players.length === 0) && (
                     <p className="text-xs text-slate-400 italic">No se detectaron goles individuales.</p>
                   )}
                 </div>

                 <button 
                   onClick={handleApplyAnalysis}
                   className="w-full bg-blue-500 hover:bg-blue-400 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 mt-2 transition-colors"
                 >
                   <CheckCircle size={16} />
                   Confirmar y Guardar Datos
                 </button>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Wand2 className="text-purple-600" />
          Asistente IA para Noticias
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Título / Tema</label>
              <input 
                type="text" 
                value={newArticleTitle}
                onChange={(e) => setNewArticleTitle(e.target.value)}
                placeholder="Ej: Final del torneo entre Municipal y Muzio..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-shadow"
              />
            </div>
          </div>
          <button 
            onClick={handleGenerateNews}
            disabled={isGenerating || !newArticleTitle}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-all ${
              isGenerating ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20'
            }`}
          >
            {isGenerating ? 'Generando...' : 'Generar Noticia con IA'}
            {!isGenerating && <Wand2 size={18} />}
          </button>
        </div>
      </div>

      {/* --- MATCH (FIXTURE) MANAGEMENT --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="text-blue-600" size={24} /> Gestión de Fixture (Partidos)
          </h2>
          <button onClick={() => openMatchModal()} className="flex items-center gap-2 text-sm text-white bg-green-600 font-bold hover:bg-green-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
            <Plus size={16} /> Nuevo Partido
          </button>
        </div>
        
        {/* Simple filters for admin match list */}
        <div className="mb-4 flex gap-4">
            <select className="border border-slate-200 rounded px-2 py-1 text-sm text-slate-600 focus:outline-none" onChange={(e) => setSelectedFederation(e.target.value)} value={selectedFederation}>
                <option value="all">Todas las Asociaciones</option>
                {FEDERATIONS.map(f => <option key={f.id} value={f.id}>{f.shortName}</option>)}
            </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500 font-medium border-b border-slate-100 bg-slate-50/50">
              <tr>
                <th className="py-3 px-4">Fecha/Hora</th>
                <th className="py-3 px-4">Encuentro</th>
                <th className="py-3 px-4">Lugar</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {getFilteredMatches().map(match => {
                 const home = teams.find(t => t.id === match.homeTeamId);
                 const away = teams.find(t => t.id === match.awayTeamId);
                 return (
                    <tr key={match.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                          <div className="flex flex-col text-xs">
                              <span className="font-semibold text-slate-700">{new Date(match.date).toLocaleDateString()}</span>
                              <span className="text-slate-500">{match.time}</span>
                          </div>
                      </td>
                      <td className="py-3 px-4">
                          <div className="flex flex-col">
                              <div className="flex items-center gap-2 font-medium text-slate-900">
                                  <span>{home?.name}</span>
                                  <span className="text-xs text-slate-400">vs</span>
                                  <span>{away?.name}</span>
                              </div>
                              <div className="text-xs text-slate-500 flex gap-2">
                                  <span>{match.category}</span>
                                  <span>•</span>
                                  <span>{home?.gender}</span>
                              </div>
                          </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{match.location}</td>
                      <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              match.status === 'FINISHED' ? 'bg-slate-100 text-slate-600' :
                              match.status === 'LIVE' ? 'bg-red-100 text-red-600 animate-pulse' :
                              'bg-blue-100 text-blue-600'
                          }`}>
                              {match.status === 'FINISHED' ? 'Finalizado' : match.status === 'LIVE' ? 'En Vivo' : 'Programado'}
                          </span>
                      </td>
                      <td className="py-3 px-4 text-right flex justify-end gap-2">
                          <button onClick={() => openMatchModal(match)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar"><Pencil size={16}/></button>
                          <button onClick={() => handleDeleteMatch(match.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Team & Player Management --- */}
      {selectedAdminTeam ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-8">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedAdminTeam(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                          <ArrowLeft size={20} />
                      </button>
                      <div className="flex items-center gap-3">
                          <img src={selectedAdminTeam.logoUrl} className="w-10 h-10 rounded-full bg-slate-100" />
                          <div>
                              <h2 className="text-xl font-bold text-slate-900">{selectedAdminTeam.name}</h2>
                              <p className="text-sm text-slate-500">Gestión de Plantilla</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Add/Edit Player Form */}
                  <div className="lg:col-span-1 bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit sticky top-20">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          {editingPlayerId ? <Pencil size={16} className="text-orange-500"/> : <Plus size={16} className="text-blue-600"/>} 
                          {editingPlayerId ? 'Editar Jugador' : 'Nuevo Jugador'}
                      </h3>
                      <form onSubmit={handleSavePlayer} className="space-y-4">
                          <div className="flex flex-col items-center justify-center mb-4">
                             <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden mb-2 relative group cursor-pointer border-2 border-slate-300">
                                {newPlayer.photoUrl ? (
                                   <img src={newPlayer.photoUrl} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center text-slate-400">
                                      <Camera size={24}/>
                                   </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Camera size={20} className="text-white"/>
                                </div>
                                <input type="file" accept="image/*" onChange={handlePlayerPhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                             </div>
                             <span className="text-xs text-slate-500 font-medium">Foto de Perfil</span>
                          </div>

                          <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre</label>
                              <input required type="text" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre"/>
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Apellido</label>
                              <input required type="text" value={newPlayer.surname} onChange={e => setNewPlayer({...newPlayer, surname: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Apellido"/>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">DNI</label>
                                  <input type="text" value={newPlayer.dni} onChange={e => setNewPlayer({...newPlayer, dni: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12.345.678"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nº Asoc.</label>
                                  <input type="text" value={newPlayer.memberId} onChange={e => setNewPlayer({...newPlayer, memberId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CAH-0000"/>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dorsal</label>
                                  <input required type="number" value={newPlayer.dorsal} onChange={e => setNewPlayer({...newPlayer, dorsal: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="#"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Posición</label>
                                  <select value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                      <option>Arquero</option>
                                      <option>Extremo Izq</option>
                                      <option>Lateral Izq</option>
                                      <option>Central</option>
                                      <option>Lateral Der</option>
                                      <option>Extremo Der</option>
                                      <option>Pivot</option>
                                      <option>Jugador</option>
                                  </select>
                              </div>
                          </div>
                          <div className="flex gap-2">
                            {editingPlayerId && (
                              <button 
                                type="button" 
                                onClick={() => {
                                  setEditingPlayerId(null);
                                  setNewPlayer({ name: '', surname: '', dorsal: '', position: 'Jugador', dni: '', memberId: '', photoUrl: '' });
                                }}
                                className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors"
                              >
                                Cancelar
                              </button>
                            )}
                            <button type="submit" className={`flex-1 ${editingPlayerId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2`}>
                                <Save size={16} /> {editingPlayerId ? 'Actualizar' : 'Guardar'}
                            </button>
                          </div>
                      </form>
                  </div>

                  {/* Player List */}
                  <div className="lg:col-span-2">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Users size={16} className="text-blue-600"/> Plantilla Actual
                      </h3>
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                  <tr>
                                      <th className="px-4 py-3 w-16 text-center">#</th>
                                      <th className="px-4 py-3">Jugador</th>
                                      <th className="px-4 py-3 hidden sm:table-cell">DNI / Asoc.</th>
                                      <th className="px-4 py-3">Posición</th>
                                      <th className="px-4 py-3 text-right">Acciones</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {players.filter(p => p.teamId === selectedAdminTeam.id).map(player => (
                                      <tr key={player.id} className={`hover:bg-slate-50 ${editingPlayerId === player.id ? 'bg-blue-50/70' : ''}`}>
                                          <td className="px-4 py-3 text-center font-bold text-slate-700 bg-slate-50/50">{player.dorsal}</td>
                                          <td className="px-4 py-3 font-medium text-slate-900">
                                            <div className="flex items-center gap-3">
                                               {player.photoUrl ? (
                                                  <img src={player.photoUrl} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                               ) : (
                                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                                                    <UserIcon size={14} />
                                                  </div>
                                               )}
                                               <span>{player.surname}, {player.name}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 hidden sm:table-cell">
                                            <div className="flex flex-col text-xs text-slate-500">
                                              <span>{player.dni || '-'}</span>
                                              <span className="text-blue-600 font-semibold">{player.memberId}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 text-slate-500">{player.position}</td>
                                          <td className="px-4 py-3 text-right">
                                              <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleEditPlayerClick(player)} className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors" title="Editar">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDeletePlayer(player.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Eliminar">
                                                    <Trash2 size={16} />
                                                </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                                  {players.filter(p => p.teamId === selectedAdminTeam.id).length === 0 && (
                                      <tr>
                                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                                              No hay jugadores registrados en este equipo.
                                          </td>
                                      </tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          </div>
      ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Gestión de Equipos</h2>
              <button onClick={() => openTeamModal()} className="flex items-center gap-2 text-sm text-white bg-blue-600 font-bold hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
                <Plus size={16} /> Agregar Equipo
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Ciudad</th>
                    <th className="py-3 px-4">Asociación</th>
                    <th className="py-3 px-4">Rama</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredTeams(false).map(team => (
                    <tr key={team.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                          <img src={team.logoUrl} className="w-6 h-6 rounded-full bg-slate-200 object-cover" />
                          {team.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{team.city}</td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-semibold">
                          {FEDERATIONS.find(f => f.id === team.federationId)?.shortName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${team.gender === 'Femenino' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                          {team.gender || 'Masculino'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openTeamModal(team)}
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors"
                          title="Editar Equipo"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                            onClick={() => setSelectedAdminTeam(team)}
                            className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-md text-xs font-bold border border-blue-200 transition-colors"
                        >
                            Ver Jugadores
                        </button>
                        <button className="text-red-500 hover:bg-red-50 p-2 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      )}

      {/* --- Team Edit/Add Modal --- */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {teamForm.id ? 'Editar Equipo' : 'Nuevo Equipo'}
              </h3>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveTeam} className="p-6 space-y-4">
              <div className="flex flex-col items-center justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden mb-2 relative group cursor-pointer border-2 border-slate-200 shadow-sm">
                    <img 
                      src={teamForm.logoUrl || 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=200&h=200&fit=crop'} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white"/>
                    </div>
                    <input type="file" accept="image/*" onChange={handleTeamLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Escudo del Club</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Equipo</label>
                <input required type="text" value={teamForm.name || ''} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
                    <input required type="text" value={teamForm.city || ''} onChange={e => setTeamForm({...teamForm, city: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                    <select value={teamForm.category || 'Mayores'} onChange={e => setTeamForm({...teamForm, category: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                       <option>Mayores</option>
                       <option>Juveniles</option>
                       <option>Cadetes</option>
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Asociación (Federación)</label>
                    <select value={teamForm.federationId || 'f2'} onChange={e => setTeamForm({...teamForm, federationId: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {FEDERATIONS.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rama (Género)</label>
                    <select value={teamForm.gender || 'Masculino'} onChange={e => setTeamForm({...teamForm, gender: e.target.value as 'Masculino'|'Femenino'})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                       <option value="Masculino">Masculino</option>
                       <option value="Femenino">Femenino</option>
                    </select>
                  </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsTeamModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">Guardar Equipo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MATCH (FIXTURE) MODAL --- */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">
                {matchForm.id ? 'Editar Partido' : 'Nuevo Partido'}
              </h3>
              <button onClick={() => setIsMatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-6 space-y-6">
              
              {/* Federation & Category Selection to Filter Teams */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Asociación</label>
                    <select 
                      value={matchForm.federationId || 'f2'} 
                      onChange={e => setMatchForm({...matchForm, federationId: e.target.value})} 
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      {FEDERATIONS.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoría</label>
                    <select 
                        value={matchForm.category || 'Mayores'} 
                        onChange={e => setMatchForm({...matchForm, category: e.target.value})} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    >
                       <option>Mayores</option>
                       <option>Juveniles</option>
                       <option>Cadetes</option>
                    </select>
                  </div>
              </div>

              {/* Team Selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Shield size={16}/> Equipos</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Equipo Local</label>
                        <select 
                            required
                            value={matchForm.homeTeamId || ''} 
                            onChange={e => setMatchForm({...matchForm, homeTeamId: e.target.value})} 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Seleccionar Equipo</option>
                            {teams.filter(t => t.federationId === matchForm.federationId).map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.gender})</option>
                            ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Equipo Visitante</label>
                        <select 
                            required
                            value={matchForm.awayTeamId || ''} 
                            onChange={e => setMatchForm({...matchForm, awayTeamId: e.target.value})} 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Seleccionar Equipo</option>
                            {teams.filter(t => t.federationId === matchForm.federationId && t.id !== matchForm.homeTeamId).map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.gender})</option>
                            ))}
                        </select>
                     </div>
                 </div>
              </div>

              {/* Date, Time, Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha</label>
                    <input 
                        required
                        type="date" 
                        value={matchForm.date || ''} 
                        onChange={e => setMatchForm({...matchForm, date: e.target.value})} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Hora</label>
                    <input 
                        required
                        type="time" 
                        value={matchForm.time || ''} 
                        onChange={e => setMatchForm({...matchForm, time: e.target.value})} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Lugar (Gimnasio)</label>
                    <input 
                        required
                        type="text" 
                        placeholder="Ej: Gimnasio Municipal N1"
                        value={matchForm.location || ''} 
                        onChange={e => setMatchForm({...matchForm, location: e.target.value})} 
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
              </div>

              {/* Status & Score */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><TrendingUp size={16}/> Estado y Resultado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Estado</label>
                        <select 
                            value={matchForm.status || 'SCHEDULED'} 
                            onChange={e => setMatchForm({...matchForm, status: e.target.value as any})} 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="SCHEDULED">Programado</option>
                            <option value="LIVE">En Vivo</option>
                            <option value="FINISHED">Finalizado</option>
                        </select>
                      </div>
                      
                      {matchForm.status !== 'SCHEDULED' && (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Goles Local</label>
                            <input 
                                type="number" 
                                value={matchForm.homeScore ?? 0} 
                                onChange={e => setMatchForm({...matchForm, homeScore: parseInt(e.target.value) || 0})} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Goles Visitante</label>
                            <input 
                                type="number" 
                                value={matchForm.awayScore ?? 0} 
                                onChange={e => setMatchForm({...matchForm, awayScore: parseInt(e.target.value) || 0})} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-center"
                            />
                          </div>
                        </>
                      )}
                  </div>
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white border-t border-slate-100 pb-2">
                <button type="button" onClick={() => setIsMatchModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors">Guardar Partido</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  const renderLogin = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Bienvenido</h2>
          <p className="text-slate-500 mt-2">Ingresa a tu cuenta para gestionar el torneo.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="admin@handball.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
            Iniciar Sesión
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-400">
          <p>Credenciales demo: admin@handball.com / (cualquiera)</p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout 
      user={user} 
      onNavigate={setCurrentView} 
      onLogout={handleLogout}
      currentView={currentView}
      federations={FEDERATIONS}
      selectedFederation={selectedFederation}
      onSelectFederation={setSelectedFederation}
    >
      {currentView === 'home' && renderHome()}
      {currentView === 'standings' && renderStandings()}
      {currentView === 'scorers' && renderTopScorers()}
      {currentView === 'calendar' && renderCalendar()}
      {currentView === 'teams' && renderTeams()}
      {currentView === 'article' && renderArticle()}
      {currentView === 'login' && renderLogin()}
      {currentView === 'admin' && (user?.role === UserRole.ADMIN ? renderAdmin() : renderLogin())}
    </Layout>
  );
};

export default App;