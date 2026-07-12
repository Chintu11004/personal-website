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
          description: `  The world tends to be a bit selfish and unfair – it takes and takes more of whatever work you put in it, only for you to get pennies on the dollar. People love underdog stories because they let you believe you can “win,” but most of the time you don’t. That’s normal. That’s life.
  “Dream Simulator” aims to tell the story of an unsuspecting traveler who spent too much time in the arboretum and has been pulled into the consciousness of the forest, simply because it was the forest’s nature and purpose to assimilate.`,
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
  { label: 'SWE', image: '/icons/23.png' },
  {
    label: 'Games',
    image: '/icons/06.png',
    items: [
      { label: 'Tron: Jump-Man' },
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
  { label: 'Friends', image: '/icons/08.png' },
];
