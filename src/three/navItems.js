import dreamSimulatorDescription from '../content/dream-simulator.txt?raw';
import kinCapsuleDescription from '../content/kincapsule-coop.txt?raw';

export const navItems = [
  { label: 'User', image: '/icons/01.png' },
  { label: 'Settings', image: '/icons/02.png' },
  {
    label: 'Photo Projects',
    image: '/icons/03.png',
    items: [
      {
        label: 'University of Wisocnsin-Madison Campus',
        type: 'folder',
        photos: Array.from({ length: 40 }, (_, i) => {
          const n = i + 1;
          const images = [
            '/images/photos/dream_sim/01.jpg',
            '/images/photos/dream_sim/05.jpg',
            '/images/photos/dream_sim/06.jpg',
            '/images/photos/dream_sim/test.png',
          ];
          const dates = [
            '21/8/2010 9:39',
            '21/8/2010 10:15',
            '21/8/2010 11:22',
            '22/8/2010 14:33',
            '22/8/2010 15:18',
            '23/8/2010 9:05',
          ];
          return {
            src: images[i % images.length],
            title: `Campus View ${String(n).padStart(2, '0')}`,
            date: dates[i % dates.length],
          };
        }),
      },
      {
        label: 'Dream Simulator',
        type: 'launcher',
        thumbnail: 'custom',
        widthOfTB: 1.8,
        heightOfTB: 1,
        image: '/images/photos/dream_sim/artist-card.jpg',
        content: {
          title: 'Dream Simulator',
          description: dreamSimulatorDescription.trimEnd(),
          background: '/images/photos/dream_sim/artist-card.jpg',
          images: [
            '/images/photos/dream_sim/01.jpg',
            '/images/photos/dream_sim/05.jpg',
            '/images/photos/dream_sim/06.jpg',
          ],
        },
      },
      {
        label: 'UW Arboretum',
        type: 'folder',
        photos: [
          { src: '/images/photos/dream_sim/06.jpg', title: 'Arboretum 01', date: '15/7/2010 8:12' },
          { src: '/images/photos/dream_sim/01.jpg', title: 'Arboretum 02', date: '15/7/2010 9:45' },
          { src: '/images/photos/dream_sim/05.jpg', title: 'Arboretum 03', date: '15/7/2010 11:30' },
        ],
      },
    ],
  },
  { label: 'SWE', image: '/icons/23.png',
    items: [
      {
        label: 'KinCapsule Co-op',
        type: 'describe',
        content: {
          title: 'KinCapsule Co-op',
          description: kinCapsuleDescription.trimEnd(),
        },
      },
    ]
   },
  {
    label: 'Games',
    image: '/icons/06.png',
    items: [
      {
        label: 'Tron: Jump-Man',
        type: 'launcher',
        href: '/games/tron-jump-man/index.html',
        thumbnail: 'custom',
        widthOfTB: 1.8,
        heightOfTB: 1,
        image: '/images/tron_game/thumbnail.png',
        content: {
          title: 'Tron: Jump-Man',
          description:
            'Oh no! CLU is going to kill the ISOs. I must parkour and wall-jump my way up the network tower and stop CLU.\n\nI fight for the Users.\n\n--------------------------\n\nCredits for music:\n\nGeneric Future Hero\'s theme by marcriver29: https://freesound.org/people/marcriver29/sounds/645691/\n\nTron World by RokZRooM: https://freesound.org/people/RokZRooM/sounds/444082/',
          background: '/images/tron_game/bg.png',
        },
      },
      {
        label: 'Jungle Warriors',
        type: 'launcher',
        href: '/games/jungle-warrior/index.html',
        content: {
          title: 'Jungle Warriors',
          description:
            'A Game Boy game created for the Games for Change Game Jam. Explore the rainforest, free animals, and learn about the threats rainforests face around the world.',
        },
      },
    ],
  },
  { label: 'Contact Me', image: '/icons/07.png' },
  {
    label: 'Friends',
    image: '/icons/08.png',
    items: [
      {
        label: 'Campus Sunset',
        type: 'photo',
        thumbnail: 'custom',
        widthOfTB: 1.4,
        heightOfTB: 1,
        src: '/images/photos/dream_sim/01.jpg',
        title: 'Campus Sunset',
        date: '21/8/2010 9:39',
      },
      {
        label: 'Arboretum Walk',
        type: 'photo',
        thumbnail: 'custom',
        widthOfTB: 1.4,
        heightOfTB: 1,
        src: '/images/photos/dream_sim/06.jpg',
        title: 'Arboretum Walk',
        date: '15/7/2010 8:12',
      },
    ],
  },
];
