export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Federation {
  id: string;
  name: string;
  shortName: string;
}

export interface Player {
  id: string;
  name: string;
  surname: string;
  teamId: string;
  position: string; // e.g., 'Extremo', 'Pivot', 'Armador'
  goals: number; // Total goals in tournament
  dorsal: number;
  dni?: string;
  memberId?: string; // Numero de asociado
  photoUrl?: string; // URL or Base64 image
}

export interface Team {
  id: string;
  name: string;
  city: string; 
  category: string; 
  gender: 'Masculino' | 'Femenino'; // New field for gender
  federationId: string; // Links team to a specific federation/association
  logoUrl?: string;
  points: number;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  goalDifference: number;
}

export interface Match {
  id: string;
  date: string;
  time: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  federationId: string;
  category: string;
  location: string;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string; 
  summary: string;
  imageUrl: string;
  publishDate: string;
  author: string;
  federationId?: string; // Optional: news specific to a fed
}

export type CategoryFilter = 'Mayores' | 'Juveniles' | 'Cadetes';