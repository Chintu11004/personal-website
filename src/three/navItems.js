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
        thumbnail: 'custom',
        widthOfTB: 1,
        heightOfTB: 1,
        image: '/images/kincapsule/kc-thumbnail.png',
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
        thumbnail: 'custom',
        widthOfTB: 1.11,
        heightOfTB: 1,
        image: '/images/jungle_warriors/thumbnail.png',
        content: {
          title: 'Jungle Warriors',
          description:
            'A Game Boy game created for the Games for Change Game Jam. Explore the rainforest, free animals, and learn about the threats rainforests face around the world.',
          background: '/images/jungle_warriors/thumbnail.png',
          images: [
            '/images/jungle_warriors/img1.png',
            '/images/jungle_warriors/img2.png',
            '/images/jungle_warriors/img3.png',
          ],
        },
      },
    ],
  },
  {
    label: 'Contact Me',
    image: '/icons/07.png',
    items: [
      {
        label: 'Gmail',
        type: 'launcher',
        href: 'mailto:tejassrinivasan04@gmail.com',
        thumbnail: 'custom',
        widthOfTB: 1.33,
        heightOfTB: 1,
        image: '/images/contact_me/gmail.svg.png',
      },
      {
        label: 'LinkedIn',
        type: 'launcher',
        href: 'https://www.linkedin.com/in/tejas-c-srinivasan/',
        thumbnail: 'custom',
        widthOfTB: 1,
        heightOfTB: 1,
        image: '/images/contact_me/linkedin.svg.png',
      },
      {
        label: 'Discord',
        type: 'launcher',
        href: 'https://discord.com/users/308950517554348032',
        thumbnail: 'custom',
        widthOfTB: 1,
        heightOfTB: 1,
        image: '/images/contact_me/discord.png',
      },
      {
        label: 'Instagram',
        type: 'launcher',
        href: 'https://www.instagram.com/chintu11004/',
        thumbnail: 'custom',
        widthOfTB: 1,
        heightOfTB: 1,
        image: '/images/contact_me/instagram.png',
      },
    ],
  },
];
