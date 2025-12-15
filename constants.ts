import { Team, Match, NewsArticle, User, UserRole, Federation, Player } from './types';

export const FEDERATIONS: Federation[] = [
  { id: 'f1', name: 'Asociación del Valle', shortName: 'Del Valle' },
  { id: 'f2', name: 'Asociación Comodorense', shortName: 'Comodoro' },
  { id: 'f3', name: 'Asociación Cordillerana', shortName: 'Cordillera' }
];

// --- DATABASE: TEAMS ---
export const MOCK_TEAMS: Team[] = [
  // --- F2: COMODORO (MASCULINO) ---
  { id: 't1', name: 'Nueva Generación', city: 'Comodoro Rivadavia', category: 'Mayores', gender: 'Masculino', federationId: 'f2', points: 15, played: 5, won: 5, lost: 0, drawn: 0, goalDifference: 25, logoUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=200&h=200&fit=crop' },
  { id: 't2', name: 'Petroquímica', city: 'Comodoro Rivadavia', category: 'Mayores', gender: 'Masculino', federationId: 'f2', points: 12, played: 5, won: 4, lost: 1, drawn: 0, goalDifference: 18, logoUrl: 'https://images.unsplash.com/photo-1516475429286-465d815a0df4?w=200&h=200&fit=crop' },
  { id: 't3', name: 'Municipal Km 5', city: 'Comodoro Rivadavia', category: 'Mayores', gender: 'Masculino', federationId: 'f2', points: 9, played: 5, won: 3, lost: 2, drawn: 0, goalDifference: 5, logoUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&h=200&fit=crop' },
  { id: 't4', name: 'Portugués', city: 'Comodoro Rivadavia', category: 'Mayores', gender: 'Masculino', federationId: 'f2', points: 3, played: 5, won: 1, lost: 4, drawn: 0, goalDifference: -12, logoUrl: 'https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=200&h=200&fit=crop' },

  // --- F2: COMODORO (FEMENINO) ---
  { id: 't12', name: 'Nueva Generación Fem', city: 'Comodoro Rivadavia', category: 'Mayores', gender: 'Femenino', federationId: 'f2', points: 12, played: 4, won: 4, lost: 0, drawn: 0, goalDifference: 20, logoUrl: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=200&h=200&fit=crop' },
  { id: 't13', name: 'Municipal Km 5 Fem', city: 'Comodoro Rivadavia', category: 'Mayores', gender: 'Femenino', federationId: 'f2', points: 9, played: 4, won: 3, lost: 1, drawn: 0, goalDifference: 10, logoUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&h=200&fit=crop' },

  // --- F1: VALLE (MASCULINO) ---
  { id: 't5', name: 'Muzio Handball', city: 'Trelew', category: 'Mayores', gender: 'Masculino', federationId: 'f1', points: 13, played: 5, won: 4, lost: 0, drawn: 1, goalDifference: 22, logoUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=200&h=200&fit=crop' },
  { id: 't6', name: 'CIEF', city: 'Trelew', category: 'Mayores', gender: 'Masculino', federationId: 'f1', points: 12, played: 5, won: 4, lost: 1, drawn: 0, goalDifference: 15, logoUrl: 'https://images.unsplash.com/photo-1504454449875-92cfa39e1315?w=200&h=200&fit=crop' },
  { id: 't7', name: 'Independiente', city: 'Trelew', category: 'Mayores', gender: 'Masculino', federationId: 'f1', points: 7, played: 5, won: 2, lost: 2, drawn: 1, goalDifference: -2, logoUrl: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=200&h=200&fit=crop' },
  { id: 't8', name: 'Racing de Trelew', city: 'Trelew', category: 'Mayores', gender: 'Masculino', federationId: 'f1', points: 0, played: 5, won: 0, lost: 5, drawn: 0, goalDifference: -35, logoUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=200&h=200&fit=crop' },

  // --- F3: CORDILLERA (MASCULINO) ---
  { id: 't9', name: 'Escuela Esquel', city: 'Esquel', category: 'Mayores', gender: 'Masculino', federationId: 'f3', points: 12, played: 4, won: 4, lost: 0, drawn: 0, goalDifference: 20, logoUrl: 'https://images.unsplash.com/photo-1590556409324-aa80729e9020?w=200&h=200&fit=crop' },
  { id: 't10', name: 'Trevelin Handball', city: 'Trevelin', category: 'Mayores', gender: 'Masculino', federationId: 'f3', points: 9, played: 4, won: 3, lost: 1, drawn: 0, goalDifference: 8, logoUrl: 'https://images.unsplash.com/photo-1519766304807-3f25cb520688?w=200&h=200&fit=crop' },
  { id: 't11', name: 'El Bolsón', city: 'El Bolsón', category: 'Mayores', gender: 'Masculino', federationId: 'f3', points: 3, played: 4, won: 1, lost: 3, drawn: 0, goalDifference: -10, logoUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=200&fit=crop' },
];

// --- DATABASE: PLAYERS ---
export const MOCK_PLAYERS: Player[] = [
  // Nueva Generación (t1) - Masc
  { id: 'p1', name: 'Marcos', surname: 'Pérez', teamId: 't1', position: 'Armador Central', goals: 45, dorsal: 10, dni: '35.123.456', memberId: 'CAH-9981' },
  { id: 'p2', name: 'Lucas', surname: 'García', teamId: 't1', position: 'Extremo Izq', goals: 32, dorsal: 7, dni: '40.234.567', memberId: 'CAH-1234' },
  { id: 'p3', name: 'Esteban', surname: 'Soto', teamId: 't1', position: 'Pivot', goals: 28, dorsal: 15, dni: '38.999.000', memberId: 'CAH-5512' },
  
  // Petroquímica (t2) - Masc
  { id: 'p4', name: 'Agustín', surname: 'Alvarez', teamId: 't2', position: 'Lateral Izq', goals: 38, dorsal: 9, dni: '41.000.111', memberId: 'CAH-2231' },
  { id: 'p5', name: 'Daniel', surname: 'Ruiz', teamId: 't2', position: 'Armador', goals: 30, dorsal: 5, dni: '32.444.555', memberId: 'CAH-8821' },

  // Nueva Generación Fem (t12) - Fem
  { id: 'p12', name: 'Lucía', surname: 'Martínez', teamId: 't12', position: 'Armadora', goals: 35, dorsal: 10, dni: '40.111.222', memberId: 'CAH-7777' },
  { id: 'p13', name: 'Camila', surname: 'Fernández', teamId: 't12', position: 'Extremo', goals: 25, dorsal: 4, dni: '41.222.333', memberId: 'CAH-8888' },

  // Muzio (t5) - Masc
  { id: 'p6', name: 'Federico', surname: 'López', teamId: 't5', position: 'Lateral Der', goals: 51, dorsal: 11, dni: '36.777.888', memberId: 'CAH-1111' }, 
  { id: 'p7', name: 'Javier', surname: 'Torres', teamId: 't5', position: 'Extremo Der', goals: 22, dorsal: 3, dni: '39.222.333', memberId: 'CAH-2222' },

  // CIEF (t6) - Masc
  { id: 'p8', name: 'Matías', surname: 'González', teamId: 't6', position: 'Armador', goals: 40, dorsal: 14, dni: '42.555.666', memberId: 'CAH-3333' },
  
  // Escuela Esquel (t9) - Masc
  { id: 'p9', name: 'Ignacio', surname: 'Roberts', teamId: 't9', position: 'Armador Central', goals: 35, dorsal: 10, dni: '37.888.999', memberId: 'CAH-4444' },
  { id: 'p10', name: 'Pablo', surname: 'Arias', teamId: 't9', position: 'Pivot', goals: 18, dorsal: 20, dni: '31.111.222', memberId: 'CAH-5555' },
  
  // Trevelin (t10) - Masc
  { id: 'p11', name: 'Sergio', surname: 'Mendoza', teamId: 't10', position: 'Lateral Izq', goals: 25, dorsal: 8, dni: '33.444.111', memberId: 'CAH-6666' },
];

export const MOCK_MATCHES: Match[] = [
  { id: '101', date: '2023-11-10', time: '18:00', homeTeamId: 't1', awayTeamId: 't2', homeScore: 28, awayScore: 25, category: 'Mayores', federationId: 'f2', location: 'Gimnasio Municipal N1', status: 'FINISHED' },
  { id: '102', date: '2023-11-10', time: '20:00', homeTeamId: 't5', awayTeamId: 't6', category: 'Mayores', federationId: 'f1', location: 'Gimnasio Heroes de Malvinas', status: 'SCHEDULED' },
  { id: '103', date: '2023-11-11', time: '16:00', homeTeamId: 't9', awayTeamId: 't10', category: 'Mayores', federationId: 'f3', location: 'SUM Escuela 713', status: 'SCHEDULED' },
  { id: '104', date: '2023-11-11', time: '14:30', homeTeamId: 't3', awayTeamId: 't4', category: 'Mayores', federationId: 'f2', location: 'Gimnasio Municipal N2', status: 'LIVE' },
  // Fem match
  { id: '105', date: '2023-11-12', time: '15:00', homeTeamId: 't12', awayTeamId: 't13', category: 'Mayores', federationId: 'f2', location: 'Gimnasio Municipal N1', status: 'SCHEDULED' },
];

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Nueva Generación lidera el torneo en Comodoro',
    summary: 'El equipo venció a su clásico rival y se posiciona como único puntero de la Asociación Comodorense.',
    content: 'En un partido vibrante disputado en el Municipal N1, Nueva Generación demostró por qué es el candidato al título. Con una defensa sólida y contragolpes letales, lograron imponerse ante Petroquímica.',
    publishDate: '2023-11-09',
    imageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3043f6?q=80&w=2070&auto=format&fit=crop', // Actual Handball shot
    author: 'Redacción',
    federationId: 'f2'
  },
  {
    id: '2',
    title: 'Muzio imparable en el Valle',
    summary: 'El equipo de Trelew sigue invicto tras vencer a CIEF en un partido ajustado.',
    content: 'Gran actuación del conjunto trelewense que domina la liga de la Asociación del Valle. Federico López fue la figura del encuentro con 8 tantos.',
    publishDate: '2023-11-08',
    imageUrl: 'https://images.unsplash.com/photo-1628779238951-be2c9f25b2e4?q=80&w=1000&auto=format&fit=crop', // Handball action
    author: 'Prensa FeChuBa',
    federationId: 'f1'
  },
  {
    id: '3',
    title: 'Esquel se hace fuerte de local',
    summary: 'La Escuela Municipal de Esquel derrotó a Trevelin en el clásico cordillerano.',
    content: 'Ante un gimnasio repleto, los locales supieron manejar los tiempos del partido y se llevaron una victoria clave para la clasificación al provincial.',
    publishDate: '2023-11-07',
    imageUrl: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?q=80&w=1000&auto=format&fit=crop', // Indoor sports generic/handball
    author: 'Corresponsal Cordillera',
    federationId: 'f3'
  }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Administrador', email: 'admin@handball.com', role: UserRole.ADMIN },
  { id: 'u2', name: 'Usuario Fan', email: 'user@handball.com', role: UserRole.USER },
];