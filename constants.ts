import { Board } from './types';

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'b1',
    title: 'Product Roadmap',
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        tasks: [
          { id: 't1', content: 'Research competitors', priority: 'high', tags: ['Strategy'] },
          { id: 't2', content: 'Draft initial concepts', priority: 'medium', tags: ['Design'] },
        ],
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: [
          { id: 't3', content: 'Wireframe dashboard', priority: 'high', tags: ['UX'] },
        ],
      },
      {
        id: 'done',
        title: 'Completed',
        tasks: [
          { id: 't4', content: 'Client kickoff meeting', priority: 'low', tags: ['Meeting'] },
        ],
      },
    ]
  },
  {
    id: 'b2',
    title: 'Marketing Campaign',
    columns: [
      {
        id: 'ideas',
        title: 'Content Ideas',
        tasks: [
           { id: 'm1', content: 'Viral tweet thread', priority: 'high', tags: ['Social'] },
           { id: 'm2', content: 'Product launch video', priority: 'medium', tags: ['Video'] },
        ]
      },
      {
        id: 'scheduled',
        title: 'Scheduled',
        tasks: []
      }
    ]
  }
];

export const THEME = {
  // Lighter gradient: Purple to Indigo (lighter than previous)
  bg: "bg-gradient-to-br from-[#a78bfa] to-[#6366f1]", 
  // Trello's specific dark mode list background color
  list: "bg-[#101204]", 
  // Trello's specific dark mode card background color
  card: "bg-[#22272b]",
  cardHover: "hover:bg-[#2c333a]",
  text: "text-[#B6C2CF]", // Trello's subtle text color
  textMain: "text-[#DCDFE4]", // Trello's main text color
};

export const TAG_COLORS: Record<string, string> = {
  'high': 'bg-red-500 text-white',
  'medium': 'bg-yellow-500 text-black',
  'low': 'bg-green-500 text-white',
  'default': 'bg-blue-500 text-white',
};

export const COLUMN_COLORS = [
  { name: 'Default', value: '#101204' },
  { name: 'Red', value: '#380808' },
  { name: 'Orange', value: '#382208' },
  { name: 'Yellow', value: '#383308' },
  { name: 'Green', value: '#083818' },
  { name: 'Teal', value: '#082538' },
  { name: 'Blue', value: '#0a152a' },
  { name: 'Purple', value: '#220838' },
  { name: 'Pink', value: '#380828' },
];