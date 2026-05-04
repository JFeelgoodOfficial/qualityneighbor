export interface PollOption {
  id: string;
  label: string;
  votes?: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export const poll: Poll = {
  id: 'may-2026-park',
  question: 'Which amenity would you most like to see at the new community park?',
  options: [
    { id: 'opt-shade',    label: 'Shade structures over the playground', votes: 28 },
    { id: 'opt-dogpark',  label: 'Fenced dog park',                       votes: 41 },
    { id: 'opt-walking',  label: 'Lighted walking loop',                  votes: 33 },
    { id: 'opt-pavilion', label: 'Covered pavilion for events',           votes: 19 },
  ],
};
