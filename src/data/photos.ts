/** Curated Unsplash crop URLs — used when search is unavailable or returns nothing. */

const q = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=800&h=800&fit=crop&crop=entropy&auto=format&q=80`;

export const AREA_PHOTOS: Record<string, string> = {
  fitness: q('photo-1571019614242-c5c5dee9f50b'),
  creative: q('photo-1513364776144-60967b0f800f'),
  writing: q('photo-1455390582262-044cdead277a'),
  music: q('photo-1511379938547-c1f69419868d'),
  coding: q('photo-1461749280684-dccba630e2f6'),
  learning: q('photo-1456513080880-7d113aaa13aa'),
  cooking: q('photo-1556910103-1c0279aa1bd5'),
  'home-garden': q('photo-1416879595882-3373a0480b5b'),
  wellbeing: q('photo-1506126613408-eca07ce68773'),
  relationships: q('photo-1529156069898-49953e39b3ac'),
  career: q('photo-1521737711867-e3b97375f902'),
  finance: q('photo-1579621970563-ebec7560ff3e'),
  outdoors: q('photo-1501785888041-af3ef285b470'),
  health: q('photo-1576091160399-112ba8d25d1d'),
};

export const FALLBACK_PHOTO = q('photo-1494438639946-1ebd1d20bf85');

/** Hand-tuned search phrases → better Unsplash relevance than raw labels */
export const SUBCATEGORY_SEARCH_QUERIES: Record<string, string> = {
  // Fitness
  Running: 'runner road sunrise fitness',
  Walking: 'person walking park path nature',
  'Strength training': 'barbell gym strength training',
  Cycling: 'road cycling bike outdoors',
  Swimming: 'swimmer pool lanes athletic',
  HIIT: 'fitness workout intense gym',
  Yoga: 'yoga pose calm studio daylight',
  Stretching: 'athlete stretching warm up',

  // Creative
  Drawing: 'pencil sketch drawing hands art',
  Painting: 'oil painting canvas artist studio',
  Photography: 'camera photography creative',
  Sculpture: 'clay sculpture artist hands',
  Crafts: 'handmade crafts workshop table',
  Design: 'graphic design desk workspace',
  Pottery: 'pottery wheel ceramic clay',

  // Writing
  Fiction: 'writing notebook coffee desk',
  'Non-fiction': 'books library reading study',
  Journaling: 'journal handwriting notebook pen',
  Poetry: 'poetry book pages aesthetic',
  Blogging: 'laptop writing cafe creative',
  Screenwriting: 'typewriter script writing film',

  // Music
  'Instrument practice': 'piano practice hands keys',
  Songwriting: 'songwriter guitar notebook',
  'Music theory': 'sheet music notes classical',
  Singing: 'singer microphone performance',
  Production: 'music studio mixing desk',

  // Coding
  'Personal project': 'coding laptop dark desk',
  Learning: 'programming study laptop notes',
  'Open source': 'developer github code screen',
  Freelance: 'remote work laptop desk',
  'Game dev': 'game development computer screen',

  // Learning
  Reading: 'reading book cozy daylight',
  Studying: 'student studying desk books',
  'Online course': 'online learning laptop headphones',
  Podcast: 'podcast microphone headphones',
  'Language learning': 'language learning books notebook',
  Documentary: 'cinema film documentary screen',

  // Cooking
  'Cook a meal': 'home cooking kitchen stove',
  'Try a new recipe': 'recipe cooking ingredients counter',
  'Meal prep': 'meal prep containers healthy food',
  Baking: 'fresh bread baking oven',
  Fermentation: 'fermentation jars kitchen',

  // Home & Garden
  Gardening: 'gardening plants soil hands',
  DIY: 'diy woodworking tools workshop',
  Organising: 'organised home shelves tidy',
  Decorating: 'interior design living room',
  Maintenance: 'home repair tools workshop',

  // Wellbeing
  Meditation: 'meditation calm morning light',
  Breathwork: 'breathing meditation peaceful',
  'Cold exposure': 'cold plunge outdoor water',
  'Nature walk': 'forest path walk nature',

  // Relationships
  'Quality time': 'friends laughing together outdoors',
  'Date night': 'couple dinner restaurant evening',
  'Call a friend': 'phone call smiling conversation',
  'Family time': 'family together home warm',
  Volunteering: 'volunteering community helping',

  // Career
  Networking: 'networking event professionals',
  'Skill building': 'workshop learning professional',
  'Side project': 'creative side project desk',
  Mentoring: 'mentoring conversation office',
  'Public speaking': 'public speaking stage conference',

  // Finance
  Budgeting: 'budget planning notebook calculator',
  Investing: 'investing charts finance desk',
  'Financial reading': 'finance books reading study',
  'Side income': 'freelance work laptop coffee',
  Review: 'planning review notebook desk',

  // Outdoors
  Hiking: 'mountain hiking trail landscape',
  'Wild swimming': 'wild swimming lake nature',
  Camping: 'camping tent forest evening',
  Climbing: 'rock climbing outdoor adventure',

  // Health
  'Sleep hygiene': 'peaceful bedroom sleep morning',
  Nutrition: 'healthy meal fresh vegetables',
  Hydration: 'drinking water glass healthy',
  'Check-up': 'doctor clinic healthcare calm',
  Therapy: 'therapy conversation calm room',
};

/** Static fallbacks if search fails */
export const SUBCATEGORY_PHOTOS: Record<string, string> = {
  Running: q('photo-1552674605-db6ffd4facb5'),
  Walking: q('photo-1476480862126-209bfaa8edc8'),
  'Strength training': q('photo-1534438327276-14e5300c3a48'),
  Cycling: q('photo-1541625601330-45adcffa6557'),
  Swimming: q('photo-1519315901367-f34ff915447b'),
  HIIT: q('photo-1517836357463-d25dfeac3438'),
  Yoga: q('photo-1544367567-0f2fcb009e0b'),
  Stretching: q('photo-1599901860904-17e6ed7083a0'),
  Drawing: q('photo-1452860606245-08befc0ff44b'),
  Painting: q('photo-1460661419201-fd4cecdf8a8b'),
  Photography: q('photo-1452780212940-6f5c0d14d291'),
  Sculpture: q('photo-1578301978693-85fa9c0320b9'),
  Crafts: q('photo-1452860606245-08befc0ff44b'),
  Design: q('photo-1561070791-2526d30994b5'),
  Pottery: q('photo-1565193566173-7a0ee3dbe261'),
  Fiction: q('photo-1455390582262-044cdead277a'),
  'Non-fiction': q('photo-1481627834876-b7833e8f5570'),
  Journaling: q('photo-1517842645767-c639042777db'),
  Poetry: q('photo-1457369804613-52c61a468e7d'),
  Blogging: q('photo-1499750310107-5fef28a66643'),
  Screenwriting: q('photo-1485846234645-a62644f84728'),
  'Instrument practice': q('photo-1520523839897-bd0b52f945a0'),
  Songwriting: q('photo-1511379938547-c1f69419868d'),
  'Music theory': q('photo-1507838153414-b4b713384a76'),
  Singing: q('photo-1516280440612-4805d9b5a6b0'),
  Production: q('photo-1598488035139-bdbb2231ce04'),
  'Personal project': q('photo-1461749280684-dccba630e2f6'),
  Learning: q('photo-1516321318423-f06f85e504b3'),
  'Open source': q('photo-1618401471353-b98afee0b2eb'),
  Freelance: q('photo-1498050108023-c5249f4df085'),
  'Game dev': q('photo-1552820728-8b83bb6b773f'),
  Reading: q('photo-1512820790803-83ca734da794'),
  Studying: q('photo-1434030216411-0b793f4b4173'),
  'Online course': q('photo-1516321497487-eaa9e5e1fad6'),
  Podcast: q('photo-1478737270239-2f02b77fc618'),
  'Language learning': q('photo-1546410531-bb4caa50b06b'),
  Documentary: q('photo-1478720568477-152d9b164e26'),
  'Cook a meal': q('photo-1556910103-1c0279aa1bd5'),
  'Try a new recipe': q('photo-1495521821757-a1efb672935f'),
  'Meal prep': q('photo-1546069901-ba9599a7e63c'),
  Baking: q('photo-1509440159596-0249088772ff'),
  Fermentation: q('photo-1589367920969-ab8a982c1d72'),
  Gardening: q('photo-1416879595882-3373a0480b5b'),
  DIY: q('photo-1504148455328-c376907d081c'),
  Organising: q('photo-1484101403633-562f891dc89a'),
  Decorating: q('photo-1616486338812-3dadae4b4ace'),
  Maintenance: q('photo-1581578731548-c64695cc6952'),
  Meditation: q('photo-1506126613408-eca07ce68773'),
  Breathwork: q('photo-1545389336-cf09069498e7'),
  'Cold exposure': q('photo-1571902943202-507ec2618e8f'),
  'Nature walk': q('photo-1441974231531-c6227db76b6e'),
  'Quality time': q('photo-1529156069898-49953e39b3ac'),
  'Date night': q('photo-1414235077428-338989a2e8c0'),
  'Call a friend': q('photo-1525182008055-f88b95ff7980'),
  'Family time': q('photo-1609220136736-435196dab95a'),
  Volunteering: q('photo-1559027615-cd4628902d4a'),
  Networking: q('photo-1515187029135-18ee286d815b'),
  'Skill building': q('photo-1522202176988-66273c2fd55f'),
  'Side project': q('photo-1498050108023-c5249f4df085'),
  Mentoring: q('photo-1531482615713-2afd69097998'),
  'Public speaking': q('photo-1475721027785-f74eccf877e2'),
  Budgeting: q('photo-1554224155-6726b3ff858f'),
  Investing: q('photo-1611974789855-9c2a0a7236a3'),
  'Financial reading': q('photo-1579621970563-ebec7560ff3e'),
  'Side income': q('photo-1450101499163-c8848c66ca85'),
  Review: q('photo-1484480974693-6ca0a06fb968'),
  Hiking: q('photo-1551632811-561732d1e306'),
  'Wild swimming': q('photo-1519315901367-f34ff915447b'),
  Camping: q('photo-1504280390367-361c6d9f38f4'),
  Climbing: q('photo-1522163182402-834f871fd851'),
  'Sleep hygiene': q('photo-1541781774459-bb2af2f05b55'),
  Nutrition: q('photo-1490645935967-10de6ba17061'),
  Hydration: q('photo-1548839140-29a749e1cf4d'),
  'Check-up': q('photo-1576091160399-112ba8d25d1d'),
  Therapy: q('photo-1573497019940-1cfe74955001'),
};

export function getAreaPhoto(areaId: string | null | undefined): string {
  if (!areaId) return FALLBACK_PHOTO;
  return AREA_PHOTOS[areaId] ?? FALLBACK_PHOTO;
}

export function getSubcategoryPhoto(subcategory: string | null | undefined): string | null {
  if (!subcategory || subcategory === 'Other') return null;
  return SUBCATEGORY_PHOTOS[subcategory] ?? null;
}

export function getSubcategorySearchQuery(
  subcategory: string | null | undefined,
): string | null {
  if (!subcategory || subcategory === 'Other') return null;
  return SUBCATEGORY_SEARCH_QUERIES[subcategory] ?? subcategory;
}
