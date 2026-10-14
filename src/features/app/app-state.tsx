import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Profile = {
  name: string;
  age: number;
  city: string;
  distance: string;
  work: string;
  bio: string;
  image: string;
  interests: string[];
  verified: boolean;
};

export const profiles: Profile[] = [
  {
    name: 'Maya',
    age: 28,
    city: 'Brooklyn, New York',
    distance: '4 miles away',
    work: 'Creative director',
    bio: 'Usually planning my next trip, cooking for friends, or looking for the best little bookshop in the city.',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
    interests: ['Art & design', 'Weekend trips', 'Good food'],
    verified: true,
  },
  {
    name: 'Theo',
    age: 30,
    city: 'Williamsburg, New York',
    distance: '2 miles away',
    work: 'Architect',
    bio: 'Building thoughtful spaces, making a very long playlist, and always up for a Sunday walk.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85',
    interests: ['Architecture', 'Live music', 'Coffee'],
    verified: true,
  },
  {
    name: 'Leila',
    age: 27,
    city: 'Greenpoint, New York',
    distance: '5 miles away',
    work: 'Writer & ceramicist',
    bio: 'I like slow mornings, big questions, and people who are kind to waiters.',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=85',
    interests: ['Ceramics', 'Film', 'Long walks'],
    verified: true,
  },
];

export const sampleMatches = [
  {
    name: 'Nina',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=160&q=80',
    color: '#EAD8D1',
  },
  {
    name: 'Alex',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
    color: '#D5DDD6',
  },
  {
    name: 'Sam',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80',
    color: '#E8D8B8',
  },
];

export const sampleChats = [
  { name: 'Nina', message: 'That little bookstore sounds perfect.', time: '10:42', unread: true },
  { name: 'Alex', message: 'I know a great place for that.', time: 'Yesterday', unread: false },
];

export type HomeTab = 'discover' | 'likes' | 'chats' | 'profile';

type AppState = {
  profileIndex: number;
  setProfileIndex: (value: React.SetStateAction<number>) => void;
  likedProfiles: Profile[];
  setLikedProfiles: (value: React.SetStateAction<Profile[]>) => void;
  incomingLikes: Profile[];
  setIncomingLikes: (value: React.SetStateAction<Profile[]>) => void;
  mutualProfiles: Profile[];
  setMutualProfiles: (value: React.SetStateAction<Profile[]>) => void;
  profileName: string;
  setProfileName: (value: string) => void;
  profileBio: string;
  setProfileBio: (value: string) => void;
  selectedInterests: string[];
  setSelectedInterests: (value: React.SetStateAction<string[]>) => void;
  ageRange: '25–30' | '28–35' | 'Any age';
  setAgeRange: (value: '25–30' | '28–35' | 'Any age') => void;
  distance: '10' | '25' | '50';
  setDistance: (value: '10' | '25' | '50') => void;
  intention: string;
  setIntention: (value: string) => void;
  notice: string;
  setNotice: (value: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profileIndex, setProfileIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([]);
  const [incomingLikes, setIncomingLikes] = useState<Profile[]>([profiles[1], profiles[2]]);
  const [mutualProfiles, setMutualProfiles] = useState<Profile[]>([]);
  const [profileName, setProfileName] = useState('Jordan Parker');
  const [profileBio, setProfileBio] = useState(
    'Looking for something real, with someone who makes the ordinary feel a little more interesting.',
  );
  const [selectedInterests, setSelectedInterests] = useState(['Art & design', 'Travel', 'Cooking']);
  const [ageRange, setAgeRange] = useState<'25–30' | '28–35' | 'Any age'>('25–30');
  const [distance, setDistance] = useState<'10' | '25' | '50'>('25');
  const [intention, setIntention] = useState('Long-term relationship');
  const [notice, setNotice] = useState('');

  const value = useMemo(
    () => ({
      profileIndex,
      setProfileIndex,
      likedProfiles,
      setLikedProfiles,
      incomingLikes,
      setIncomingLikes,
      mutualProfiles,
      setMutualProfiles,
      profileName,
      setProfileName,
      profileBio,
      setProfileBio,
      selectedInterests,
      setSelectedInterests,
      ageRange,
      setAgeRange,
      distance,
      setDistance,
      intention,
      setIntention,
      notice,
      setNotice,
    }),
    [
      ageRange,
      distance,
      incomingLikes,
      intention,
      likedProfiles,
      notice,
      mutualProfiles,
      profileBio,
      profileIndex,
      profileName,
      selectedInterests,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const state = useContext(AppStateContext);
  if (!state) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return state;
}
