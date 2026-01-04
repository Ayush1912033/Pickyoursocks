
import { Feature, SportCategory, AthleteProfile } from './types';

export const FRAME_COUNT = 2; // 0, 1, 2 = 3 images
export const SCROLL_HEIGHT_MULTIPLIER = 5;

export const FEATURES: Feature[] = [
  {
    id: 'elo',
    title: 'Fair Skill Ratings',
    description: 'Stop playing mismatched games. Our ranking algorithm finds you opponents at your exact skill level for every sport.',
    icon: 'target'
  },
  {
    id: 'recruit',
    title: 'Verified Athlete Profile',
    description: 'Your digital sports career. Track your win rates, upload highlight reels, and get discovered by local teams/scouts.',
    icon: 'user-check'
  },
  {
    id: 'venue',
    title: 'Instant Court Booking',
    description: 'No more "where are we playing?" Secure high-quality courts instantly through our network of partner venues.',
    icon: 'map-pin'
  }
];

export const SPORTS: SportCategory[] = [
  {
    id: 'mma',
    name: 'MMA',
    image: '/conor_mcgregor.jpeg',
    description: 'Find sparring partners and local gyms.'
  },
  {
    id: 'tennis',
    name: 'Tennis',
    image: '/Tennis.jpg',
    description: 'Find local courts and players at your skill level.'
  },
  {
    id: 'football',
    name: 'Football',
    image: '/cristiano_ronaldo.png',
    description: 'Organize 5-a-side matches with ELO ratings.'
  },
  {
    id: 'fitness',
    name: 'Gym & Fitness',
    image: '/Crossfit.JPG',
    description: 'Connect with training partners for maximum gains.'
  }
];

export const ATHLETES: AthleteProfile[] = [
  {
    id: '1',
    name: 'User_7721',
    sport: 'Boxing',
    rating: 2450,
    image: '/avatar-1.png',
    bio: 'Heavyweight metrics: Top 5% punch velocity in region.'
  },
  {
    id: '2',
    name: 'User_9904',
    sport: 'Sprinting',
    rating: 2100,
    image: '/avatar-2.png',
    bio: 'Track split times verified. 98th percentile acceleration.'
  },
  {
    id: '3',
    name: 'User_3382',
    sport: 'Football',
    rating: 1850,
    image: '/avatar-3.png',
    bio: 'Midfield playmaker stats: 88% pass accuracy average.'
  }
];
