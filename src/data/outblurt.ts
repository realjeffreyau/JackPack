/**
 * Outblurt content bank + timer-mode config.
 *
 * Outblurt = Hot Potato meets Taboo. The phone-holder describes the
 * `targetWord` out loud without saying any of the `bannedWords` (or rhyming /
 * spelling / "sounds like" hints). A hidden bomb timer decides who loses.
 */

export interface WordCard {
  id: string;
  targetWord: string;
  bannedWords: string[];
}

/** Hidden bomb-timer difficulty. The actual duration is randomized per cycle. */
export type TimerMode = 'short' | 'medium' | 'long' | 'chaos';

/** Inclusive [min, max] duration range per mode, in milliseconds. */
export const TIMER_RANGES: Record<TimerMode, readonly [number, number]> = {
  short: [30_000, 45_000],
  medium: [45_000, 75_000],
  long: [75_000, 120_000],
  chaos: [20_000, 120_000],
};

export interface TimerModeMeta {
  mode: TimerMode;
  label: string;
  range: string;
  blurb: string;
  icon: string;
}

export const TIMER_MODE_META: readonly TimerModeMeta[] = [
  { mode: 'short', label: 'Short', range: '30–45s', blurb: 'Quick, frantic rounds.', icon: '⚡️' },
  { mode: 'medium', label: 'Medium', range: '45–75s', blurb: 'The balanced default.', icon: '💣' },
  { mode: 'long', label: 'Long', range: '75–120s', blurb: 'Slow-burn tension.', icon: '🕰️' },
  { mode: 'chaos', label: 'Chaos', range: '20–120s', blurb: 'Total wildcard. Good luck.', icon: '🎲' },
];

/** Random duration (ms) inside the selected mode's range. */
export function randomBombDuration(mode: TimerMode): number {
  const [min, max] = TIMER_RANGES[mode];
  return Math.round(min + Math.random() * (max - min));
}

/**
 * Word bank — 110 general-audience cards. Each banned list is 4–6 closely
 * related words that make the target genuinely hard to describe.
 */
export const WORD_CARDS: readonly WordCard[] = [
  // ── Food ───────────────────────────────────────────────────────────────────
  { id: 'pizza', targetWord: 'Pizza', bannedWords: ['Cheese', 'Pepperoni', 'Slice', 'Crust', 'Italian'] },
  { id: 'hamburger', targetWord: 'Hamburger', bannedWords: ['Bun', 'Beef', 'Patty', 'Fries', 'Grill'] },
  { id: 'spaghetti', targetWord: 'Spaghetti', bannedWords: ['Pasta', 'Noodle', 'Sauce', 'Meatball', 'Italian'] },
  { id: 'pancake', targetWord: 'Pancake', bannedWords: ['Syrup', 'Breakfast', 'Flat', 'Flip', 'Batter'] },
  { id: 'sushi', targetWord: 'Sushi', bannedWords: ['Fish', 'Rice', 'Japanese', 'Roll', 'Seaweed'] },
  { id: 'taco', targetWord: 'Taco', bannedWords: ['Shell', 'Mexican', 'Tuesday', 'Filling', 'Fold'] },
  { id: 'icecream', targetWord: 'Ice Cream', bannedWords: ['Cold', 'Cone', 'Scoop', 'Vanilla', 'Dessert'] },
  { id: 'popcorn', targetWord: 'Popcorn', bannedWords: ['Movie', 'Corn', 'Butter', 'Kernel', 'Pop'] },
  { id: 'chocolate', targetWord: 'Chocolate', bannedWords: ['Candy', 'Cocoa', 'Sweet', 'Bar', 'Brown'] },
  { id: 'pancakehoney', targetWord: 'Honey', bannedWords: ['Bee', 'Sweet', 'Sticky', 'Golden', 'Hive'] },
  { id: 'donut', targetWord: 'Donut', bannedWords: ['Hole', 'Glaze', 'Sprinkles', 'Ring', 'Fried'] },
  { id: 'cheese', targetWord: 'Cheese', bannedWords: ['Milk', 'Cheddar', 'Yellow', 'Mouse', 'Dairy'] },
  { id: 'sandwich', targetWord: 'Sandwich', bannedWords: ['Bread', 'Lunch', 'Filling', 'Slice', 'Deli'] },
  { id: 'pickle', targetWord: 'Pickle', bannedWords: ['Cucumber', 'Sour', 'Jar', 'Brine', 'Green'] },
  { id: 'watermelon', targetWord: 'Watermelon', bannedWords: ['Fruit', 'Seeds', 'Summer', 'Green', 'Juicy'] },

  // ── Animals ──────────────────────────────────────────────────────────────────
  { id: 'elephant', targetWord: 'Elephant', bannedWords: ['Trunk', 'Big', 'Gray', 'Tusk', 'Africa'] },
  { id: 'penguin', targetWord: 'Penguin', bannedWords: ['Bird', 'Cold', 'Tuxedo', 'Antarctica', 'Waddle'] },
  { id: 'kangaroo', targetWord: 'Kangaroo', bannedWords: ['Pouch', 'Hop', 'Australia', 'Jump', 'Joey'] },
  { id: 'giraffe', targetWord: 'Giraffe', bannedWords: ['Neck', 'Tall', 'Spots', 'Africa', 'Leaves'] },
  { id: 'octopus', targetWord: 'Octopus', bannedWords: ['Eight', 'Tentacle', 'Ocean', 'Ink', 'Arms'] },
  { id: 'dolphin', targetWord: 'Dolphin', bannedWords: ['Ocean', 'Swim', 'Smart', 'Fin', 'Flipper'] },
  { id: 'butterfly', targetWord: 'Butterfly', bannedWords: ['Wings', 'Caterpillar', 'Flutter', 'Cocoon', 'Insect'] },
  { id: 'squirrel', targetWord: 'Squirrel', bannedWords: ['Nut', 'Tree', 'Tail', 'Acorn', 'Bushy'] },
  { id: 'owl', targetWord: 'Owl', bannedWords: ['Night', 'Hoot', 'Bird', 'Wise', 'Feathers'] },
  { id: 'frog', targetWord: 'Frog', bannedWords: ['Jump', 'Green', 'Pond', 'Ribbit', 'Lily'] },
  { id: 'snake', targetWord: 'Snake', bannedWords: ['Slither', 'Hiss', 'Venom', 'Scales', 'Reptile'] },
  { id: 'shark', targetWord: 'Shark', bannedWords: ['Fin', 'Teeth', 'Ocean', 'Jaws', 'Bite'] },
  { id: 'bee', targetWord: 'Bee', bannedWords: ['Sting', 'Honey', 'Buzz', 'Hive', 'Yellow'] },
  { id: 'horse', targetWord: 'Horse', bannedWords: ['Ride', 'Gallop', 'Saddle', 'Mane', 'Neigh'] },
  { id: 'turtle', targetWord: 'Turtle', bannedWords: ['Shell', 'Slow', 'Reptile', 'Ocean', 'Hide'] },

  // ── Objects ──────────────────────────────────────────────────────────────────
  { id: 'umbrella', targetWord: 'Umbrella', bannedWords: ['Rain', 'Open', 'Handle', 'Wet', 'Cover'] },
  { id: 'scissors', targetWord: 'Scissors', bannedWords: ['Cut', 'Sharp', 'Blade', 'Paper', 'Snip'] },
  { id: 'toothbrush', targetWord: 'Toothbrush', bannedWords: ['Teeth', 'Brush', 'Paste', 'Clean', 'Mouth'] },
  { id: 'pillow', targetWord: 'Pillow', bannedWords: ['Sleep', 'Bed', 'Soft', 'Head', 'Fluffy'] },
  { id: 'candle', targetWord: 'Candle', bannedWords: ['Wax', 'Flame', 'Light', 'Wick', 'Melt'] },
  { id: 'mirror', targetWord: 'Mirror', bannedWords: ['Reflect', 'Glass', 'Look', 'Image', 'Face'] },
  { id: 'ladder', targetWord: 'Ladder', bannedWords: ['Climb', 'Rungs', 'Tall', 'Steps', 'Up'] },
  { id: 'balloon', targetWord: 'Balloon', bannedWords: ['Air', 'Pop', 'Party', 'Float', 'Helium'] },
  { id: 'clock', targetWord: 'Clock', bannedWords: ['Time', 'Hands', 'Tick', 'Hours', 'Wall'] },
  { id: 'key', targetWord: 'Key', bannedWords: ['Lock', 'Door', 'Open', 'Metal', 'Unlock'] },
  { id: 'broom', targetWord: 'Broom', bannedWords: ['Sweep', 'Floor', 'Dust', 'Bristles', 'Clean'] },
  { id: 'glasses', targetWord: 'Glasses', bannedWords: ['Eyes', 'See', 'Lens', 'Vision', 'Frame'] },
  { id: 'backpack', targetWord: 'Backpack', bannedWords: ['Straps', 'Carry', 'School', 'Shoulder', 'Bag'] },
  { id: 'hammer', targetWord: 'Hammer', bannedWords: ['Nail', 'Tool', 'Hit', 'Build', 'Pound'] },
  { id: 'soap', targetWord: 'Soap', bannedWords: ['Wash', 'Bubbles', 'Clean', 'Bar', 'Lather'] },

  // ── Places ───────────────────────────────────────────────────────────────────
  { id: 'beach', targetWord: 'Beach', bannedWords: ['Sand', 'Ocean', 'Waves', 'Sun', 'Towel'] },
  { id: 'library', targetWord: 'Library', bannedWords: ['Books', 'Quiet', 'Read', 'Shelves', 'Borrow'] },
  { id: 'hospital', targetWord: 'Hospital', bannedWords: ['Doctor', 'Sick', 'Nurse', 'Patient', 'Emergency'] },
  { id: 'airport', targetWord: 'Airport', bannedWords: ['Plane', 'Fly', 'Gate', 'Luggage', 'Terminal'] },
  { id: 'zoo', targetWord: 'Zoo', bannedWords: ['Animals', 'Cage', 'Visit', 'Lion', 'Exhibit'] },
  { id: 'farm', targetWord: 'Farm', bannedWords: ['Cow', 'Crops', 'Barn', 'Tractor', 'Field'] },
  { id: 'museum', targetWord: 'Museum', bannedWords: ['Art', 'History', 'Exhibit', 'Tour', 'Display'] },
  { id: 'desert', targetWord: 'Desert', bannedWords: ['Sand', 'Dry', 'Hot', 'Cactus', 'Camel'] },
  { id: 'mountain', targetWord: 'Mountain', bannedWords: ['Tall', 'Climb', 'Peak', 'Snow', 'Hill'] },
  { id: 'kitchen', targetWord: 'Kitchen', bannedWords: ['Cook', 'Stove', 'Food', 'Sink', 'Counter'] },

  // ── Sports ───────────────────────────────────────────────────────────────────
  { id: 'basketball', targetWord: 'Basketball', bannedWords: ['Hoop', 'Dribble', 'Court', 'Dunk', 'Net'] },
  { id: 'soccer', targetWord: 'Soccer', bannedWords: ['Goal', 'Kick', 'Ball', 'Field', 'Football'] },
  { id: 'tennis', targetWord: 'Tennis', bannedWords: ['Racket', 'Net', 'Serve', 'Court', 'Ball'] },
  { id: 'swimming', targetWord: 'Swimming', bannedWords: ['Pool', 'Water', 'Stroke', 'Dive', 'Laps'] },
  { id: 'bowling', targetWord: 'Bowling', bannedWords: ['Pins', 'Strike', 'Alley', 'Ball', 'Roll'] },
  { id: 'skiing', targetWord: 'Skiing', bannedWords: ['Snow', 'Slope', 'Poles', 'Mountain', 'Slide'] },
  { id: 'boxing', targetWord: 'Boxing', bannedWords: ['Punch', 'Gloves', 'Ring', 'Fight', 'Knockout'] },
  { id: 'golf', targetWord: 'Golf', bannedWords: ['Club', 'Hole', 'Ball', 'Course', 'Putt'] },
  { id: 'surfing', targetWord: 'Surfing', bannedWords: ['Wave', 'Board', 'Ocean', 'Ride', 'Beach'] },
  { id: 'baseball', targetWord: 'Baseball', bannedWords: ['Bat', 'Pitch', 'Home', 'Glove', 'Diamond'] },

  // ── School ───────────────────────────────────────────────────────────────────
  { id: 'homework', targetWord: 'Homework', bannedWords: ['School', 'Assignment', 'Due', 'Study', 'Class'] },
  { id: 'teacher', targetWord: 'Teacher', bannedWords: ['Class', 'Students', 'Lesson', 'School', 'Teach'] },
  { id: 'pencil', targetWord: 'Pencil', bannedWords: ['Write', 'Eraser', 'Lead', 'Sharpen', 'Paper'] },
  { id: 'recess', targetWord: 'Recess', bannedWords: ['Break', 'Play', 'School', 'Outside', 'Kids'] },
  { id: 'exam', targetWord: 'Exam', bannedWords: ['Test', 'Study', 'Grade', 'Questions', 'Pass'] },
  { id: 'backpackschool', targetWord: 'Chalkboard', bannedWords: ['Write', 'Chalk', 'Eraser', 'Class', 'Wall'] },
  { id: 'graduation', targetWord: 'Graduation', bannedWords: ['Diploma', 'Cap', 'Gown', 'Ceremony', 'Degree'] },
  { id: 'globe', targetWord: 'Globe', bannedWords: ['World', 'Map', 'Earth', 'Spin', 'Round'] },
  { id: 'calculator', targetWord: 'Calculator', bannedWords: ['Math', 'Numbers', 'Buttons', 'Add', 'Solve'] },
  { id: 'notebook', targetWord: 'Notebook', bannedWords: ['Write', 'Pages', 'Paper', 'Notes', 'Spiral'] },

  // ── Travel ───────────────────────────────────────────────────────────────────
  { id: 'passport', targetWord: 'Passport', bannedWords: ['Travel', 'Country', 'Stamp', 'Photo', 'Border'] },
  { id: 'suitcase', targetWord: 'Suitcase', bannedWords: ['Pack', 'Travel', 'Luggage', 'Wheels', 'Trip'] },
  { id: 'map', targetWord: 'Map', bannedWords: ['Direction', 'Road', 'Location', 'Fold', 'Find'] },
  { id: 'train', targetWord: 'Train', bannedWords: ['Tracks', 'Station', 'Rail', 'Conductor', 'Locomotive'] },
  { id: 'hotel', targetWord: 'Hotel', bannedWords: ['Room', 'Stay', 'Bed', 'Lobby', 'Vacation'] },
  { id: 'compass', targetWord: 'Compass', bannedWords: ['North', 'Direction', 'Needle', 'Navigate', 'Point'] },
  { id: 'cruise', targetWord: 'Cruise', bannedWords: ['Ship', 'Ocean', 'Vacation', 'Sail', 'Deck'] },
  { id: 'camping', targetWord: 'Camping', bannedWords: ['Tent', 'Fire', 'Outdoors', 'Sleep', 'Woods'] },
  { id: 'taxi', targetWord: 'Taxi', bannedWords: ['Cab', 'Ride', 'Yellow', 'Fare', 'Driver'] },
  { id: 'tent', targetWord: 'Tent', bannedWords: ['Camp', 'Poles', 'Sleep', 'Outdoors', 'Stakes'] },

  // ── Technology ───────────────────────────────────────────────────────────────
  { id: 'smartphone', targetWord: 'Smartphone', bannedWords: ['Call', 'Apps', 'Screen', 'Text', 'Mobile'] },
  { id: 'laptop', targetWord: 'Laptop', bannedWords: ['Computer', 'Keyboard', 'Screen', 'Type', 'Portable'] },
  { id: 'headphones', targetWord: 'Headphones', bannedWords: ['Ears', 'Music', 'Listen', 'Sound', 'Wireless'] },
  { id: 'camera', targetWord: 'Camera', bannedWords: ['Photo', 'Picture', 'Lens', 'Snap', 'Flash'] },
  { id: 'robot', targetWord: 'Robot', bannedWords: ['Machine', 'Metal', 'Android', 'Program', 'Beep'] },
  { id: 'wifi', targetWord: 'Wifi', bannedWords: ['Internet', 'Signal', 'Wireless', 'Connect', 'Router'] },
  { id: 'charger', targetWord: 'Charger', bannedWords: ['Battery', 'Plug', 'Power', 'Cable', 'Phone'] },
  { id: 'drone', targetWord: 'Drone', bannedWords: ['Fly', 'Remote', 'Camera', 'Propeller', 'Hover'] },
  { id: 'keyboard', targetWord: 'Keyboard', bannedWords: ['Type', 'Keys', 'Computer', 'Letters', 'Press'] },
  { id: 'television', targetWord: 'Television', bannedWords: ['Watch', 'Screen', 'Remote', 'Channel', 'Show'] },

  // ── Entertainment ────────────────────────────────────────────────────────────
  { id: 'movie', targetWord: 'Movie', bannedWords: ['Film', 'Watch', 'Theater', 'Screen', 'Actor'] },
  { id: 'guitar', targetWord: 'Guitar', bannedWords: ['Strings', 'Strum', 'Music', 'Chord', 'Pluck'] },
  { id: 'magician', targetWord: 'Magician', bannedWords: ['Trick', 'Magic', 'Wand', 'Hat', 'Illusion'] },
  { id: 'circus', targetWord: 'Circus', bannedWords: ['Clown', 'Tent', 'Acrobat', 'Ring', 'Show'] },
  { id: 'cartoon', targetWord: 'Cartoon', bannedWords: ['Animation', 'Draw', 'Kids', 'Show', 'Characters'] },
  { id: 'concert', targetWord: 'Concert', bannedWords: ['Music', 'Band', 'Live', 'Stage', 'Crowd'] },
  { id: 'dancing', targetWord: 'Dancing', bannedWords: ['Move', 'Music', 'Steps', 'Rhythm', 'Floor'] },
  { id: 'puppet', targetWord: 'Puppet', bannedWords: ['Strings', 'Hand', 'Show', 'Control', 'Doll'] },
  { id: 'fireworks', targetWord: 'Fireworks', bannedWords: ['Explode', 'Sky', 'Colors', 'Boom', 'Sparks'] },
  { id: 'karaoke', targetWord: 'Karaoke', bannedWords: ['Sing', 'Microphone', 'Lyrics', 'Song', 'Screen'] },

  // ── Everyday actions ─────────────────────────────────────────────────────────
  { id: 'sneeze', targetWord: 'Sneeze', bannedWords: ['Nose', 'Achoo', 'Tissue', 'Cold', 'Blow'] },
  { id: 'yawn', targetWord: 'Yawn', bannedWords: ['Tired', 'Sleep', 'Mouth', 'Bored', 'Open'] },
  { id: 'whistle', targetWord: 'Whistle', bannedWords: ['Lips', 'Sound', 'Blow', 'Tune', 'Air'] },
  { id: 'laugh', targetWord: 'Laugh', bannedWords: ['Funny', 'Joke', 'Smile', 'Giggle', 'Haha'] },
  { id: 'tiptoe', targetWord: 'Tiptoe', bannedWords: ['Quiet', 'Sneak', 'Feet', 'Toes', 'Soft'] },

  // ── Holidays & Occupations ───────────────────────────────────────────────────
  { id: 'birthday', targetWord: 'Birthday', bannedWords: ['Cake', 'Candles', 'Party', 'Gift', 'Age'] },
  { id: 'halloween', targetWord: 'Halloween', bannedWords: ['Costume', 'Candy', 'Pumpkin', 'Spooky', 'October'] },
  { id: 'snowman', targetWord: 'Snowman', bannedWords: ['Snow', 'Carrot', 'Cold', 'Winter', 'Frosty'] },
  { id: 'firefighter', targetWord: 'Firefighter', bannedWords: ['Fire', 'Hose', 'Truck', 'Rescue', 'Hydrant'] },
  { id: 'chef', targetWord: 'Chef', bannedWords: ['Cook', 'Kitchen', 'Food', 'Hat', 'Restaurant'] },
  { id: 'astronaut', targetWord: 'Astronaut', bannedWords: ['Space', 'Rocket', 'Moon', 'Suit', 'Orbit'] },
  { id: 'dentist', targetWord: 'Dentist', bannedWords: ['Teeth', 'Drill', 'Mouth', 'Cavity', 'Floss'] },
  { id: 'pilot', targetWord: 'Pilot', bannedWords: ['Plane', 'Fly', 'Cockpit', 'Sky', 'Airline'] },
  { id: 'farmer', targetWord: 'Farmer', bannedWords: ['Crops', 'Field', 'Tractor', 'Harvest', 'Barn'] },
  { id: 'mailman', targetWord: 'Mail Carrier', bannedWords: ['Letters', 'Deliver', 'Post', 'Mail', 'Package'] },

  // ── Abstract / Feelings ──────────────────────────────────────────────────────
  { id: 'jealousy', targetWord: 'Jealousy', bannedWords: ['Envy', 'Green', 'Wanting', 'Covet', 'Desire'] },
  { id: 'nostalgia', targetWord: 'Nostalgia', bannedWords: ['Memory', 'Past', 'Remember', 'Feeling', 'Old'] },
  { id: 'embarrassed', targetWord: 'Embarrassed', bannedWords: ['Blush', 'Red', 'Shame', 'Awkward', 'Cringe'] },
  { id: 'nervous', targetWord: 'Nervous', bannedWords: ['Anxiety', 'Worry', 'Scared', 'Butterflies', 'Shaky'] },
  { id: 'boredom', targetWord: 'Boredom', bannedWords: ['Dull', 'Nothing', 'Yawn', 'Tired', 'Uninterested'] },
  { id: 'patience', targetWord: 'Patience', bannedWords: ['Wait', 'Calm', 'Time', 'Quiet', 'Virtue'] },
  { id: 'trust', targetWord: 'Trust', bannedWords: ['Believe', 'Faith', 'Rely', 'Honest', 'Confidence'] },
  { id: 'pride', targetWord: 'Pride', bannedWords: ['Proud', 'Achievement', 'Boast', 'Ego', 'Arrogant'] },
  { id: 'guilt', targetWord: 'Guilt', bannedWords: ['Wrong', 'Shame', 'Blame', 'Sorry', 'Regret'] },

  // ── Body language / Gestures ─────────────────────────────────────────────────
  { id: 'wink', targetWord: 'Wink', bannedWords: ['Eye', 'Blink', 'Flirt', 'Close', 'Signal'] },
  { id: 'shrug', targetWord: 'Shrug', bannedWords: ['Shoulders', 'Know', 'Maybe', 'Dunno', 'Gesture'] },
  { id: 'nod', targetWord: 'Nod', bannedWords: ['Head', 'Yes', 'Agree', 'Move', 'Up'] },
  { id: 'blush', targetWord: 'Blush', bannedWords: ['Red', 'Face', 'Embarrassed', 'Cheeks', 'Pink'] },
  { id: 'facepalm', targetWord: 'Facepalm', bannedWords: ['Hand', 'Face', 'Frustration', 'Cringe', 'Slap'] },
  { id: 'thumbsup', targetWord: 'Thumbs Up', bannedWords: ['Thumb', 'Good', 'Approve', 'Finger', 'Like'] },

  // ── Vehicles / Transport ─────────────────────────────────────────────────────
  { id: 'helicopter', targetWord: 'Helicopter', bannedWords: ['Rotor', 'Fly', 'Blades', 'Hover', 'Aircraft'] },
  { id: 'submarine', targetWord: 'Submarine', bannedWords: ['Underwater', 'Navy', 'Periscope', 'Ocean', 'Torpedo'] },
  { id: 'skateboard', targetWord: 'Skateboard', bannedWords: ['Wheels', 'Ride', 'Trick', 'Board', 'Ramp'] },
  { id: 'canoe', targetWord: 'Canoe', bannedWords: ['Paddle', 'Boat', 'Water', 'Row', 'River'] },
  { id: 'motorbike', targetWord: 'Motorcycle', bannedWords: ['Bike', 'Engine', 'Helmet', 'Wheels', 'Ride'] },
  { id: 'gondola', targetWord: 'Gondola', bannedWords: ['Venice', 'Italy', 'Boat', 'Canal', 'Row'] },
  { id: 'tractor2', targetWord: 'Forklift', bannedWords: ['Lift', 'Warehouse', 'Prongs', 'Pallet', 'Machine'] },
  { id: 'ambulance', targetWord: 'Ambulance', bannedWords: ['Siren', 'Emergency', 'Hospital', 'Patient', 'Medical'] },

  // ── Kitchen / Cooking ────────────────────────────────────────────────────────
  { id: 'blender', targetWord: 'Blender', bannedWords: ['Mix', 'Smoothie', 'Spin', 'Blade', 'Liquid'] },
  { id: 'microwave', targetWord: 'Microwave', bannedWords: ['Heat', 'Oven', 'Beep', 'Reheat', 'Electric'] },
  { id: 'colander', targetWord: 'Colander', bannedWords: ['Drain', 'Pasta', 'Holes', 'Strainer', 'Rinse'] },
  { id: 'whisk', targetWord: 'Whisk', bannedWords: ['Beat', 'Eggs', 'Mix', 'Wire', 'Stir'] },
  { id: 'spatula', targetWord: 'Spatula', bannedWords: ['Flip', 'Pan', 'Flat', 'Cook', 'Scrape'] },
  { id: 'corkscrew', targetWord: 'Corkscrew', bannedWords: ['Wine', 'Cork', 'Bottle', 'Twist', 'Open'] },
  { id: 'chopping', targetWord: 'Chopping Board', bannedWords: ['Cut', 'Knife', 'Wood', 'Chop', 'Kitchen'] },
  { id: 'simmer', targetWord: 'Simmer', bannedWords: ['Boil', 'Heat', 'Low', 'Bubble', 'Cook'] },
  { id: 'marinate', targetWord: 'Marinate', bannedWords: ['Soak', 'Flavor', 'Meat', 'Sauce', 'Cook'] },

  // ── Weather / Nature ─────────────────────────────────────────────────────────
  { id: 'thunderstorm', targetWord: 'Thunderstorm', bannedWords: ['Lightning', 'Rain', 'Thunder', 'Clouds', 'Loud'] },
  { id: 'blizzard', targetWord: 'Blizzard', bannedWords: ['Snow', 'Storm', 'Wind', 'Cold', 'Whiteout'] },
  { id: 'rainbow', targetWord: 'Rainbow', bannedWords: ['Colors', 'Rain', 'Arch', 'Sky', 'Spectrum'] },
  { id: 'fog', targetWord: 'Fog', bannedWords: ['Mist', 'Cloud', 'Visibility', 'Gray', 'Thick'] },
  { id: 'tornado', targetWord: 'Tornado', bannedWords: ['Spin', 'Wind', 'Funnel', 'Storm', 'Twister'] },
  { id: 'avalanche', targetWord: 'Avalanche', bannedWords: ['Snow', 'Mountain', 'Slide', 'Downhill', 'Danger'] },
  { id: 'quicksand', targetWord: 'Quicksand', bannedWords: ['Sand', 'Sink', 'Stuck', 'Trap', 'Swallow'] },
  { id: 'tide', targetWord: 'Tide', bannedWords: ['Ocean', 'Wave', 'Moon', 'Rise', 'Shore'] },
  { id: 'glacier', targetWord: 'Glacier', bannedWords: ['Ice', 'Slow', 'Mountain', 'Melt', 'Cold'] },
  { id: 'volcano', targetWord: 'Volcano', bannedWords: ['Lava', 'Erupt', 'Mountain', 'Magma', 'Ash'] },

  // ── Science / Space ──────────────────────────────────────────────────────────
  { id: 'magnet', targetWord: 'Magnet', bannedWords: ['Attract', 'Metal', 'Pull', 'Iron', 'Poles'] },
  { id: 'telescope', targetWord: 'Telescope', bannedWords: ['Stars', 'Look', 'Lens', 'Astronomy', 'Zoom'] },
  { id: 'microscope', targetWord: 'Microscope', bannedWords: ['Small', 'Slide', 'Lens', 'Lab', 'Tiny'] },
  { id: 'comet', targetWord: 'Comet', bannedWords: ['Space', 'Tail', 'Rock', 'Sky', 'Orbit'] },
  { id: 'blackhole', targetWord: 'Black Hole', bannedWords: ['Space', 'Gravity', 'Suck', 'Dark', 'Singularity'] },
  { id: 'meteor', targetWord: 'Meteor', bannedWords: ['Space', 'Rock', 'Shooting', 'Fall', 'Crater'] },
  { id: 'gravity', targetWord: 'Gravity', bannedWords: ['Fall', 'Pull', 'Force', 'Weight', 'Earth'] },
  { id: 'eclipse', targetWord: 'Eclipse', bannedWords: ['Moon', 'Sun', 'Shadow', 'Block', 'Dark'] },

  // ── Games / Entertainment extras ─────────────────────────────────────────────
  { id: 'charades', targetWord: 'Charades', bannedWords: ['Act', 'Mime', 'Guess', 'Silent', 'Perform'] },
  { id: 'frisbee', targetWord: 'Frisbee', bannedWords: ['Throw', 'Disc', 'Catch', 'Fly', 'Plastic'] },
  { id: 'treehouse', targetWord: 'Treehouse', bannedWords: ['Tree', 'Build', 'Kids', 'Climb', 'Wood'] },
  { id: 'trampoline', targetWord: 'Trampoline', bannedWords: ['Jump', 'Bounce', 'Spring', 'High', 'Elastic'] },
  { id: 'pinata', targetWord: 'Piñata', bannedWords: ['Hit', 'Candy', 'Blindfold', 'Stick', 'Party'] },
  { id: 'rolercoaster', targetWord: 'Roller Coaster', bannedWords: ['Ride', 'Fast', 'Drops', 'Loops', 'Scream'] },

  // ── Fashion / Clothing ───────────────────────────────────────────────────────
  { id: 'zipper', targetWord: 'Zipper', bannedWords: ['Jacket', 'Pull', 'Close', 'Metal', 'Teeth'] },
  { id: 'buckle', targetWord: 'Buckle', bannedWords: ['Belt', 'Strap', 'Fasten', 'Metal', 'Click'] },
  { id: 'sleeve', targetWord: 'Sleeve', bannedWords: ['Arm', 'Shirt', 'Fabric', 'Short', 'Long'] },
  { id: 'hoodie', targetWord: 'Hoodie', bannedWords: ['Hood', 'Sweatshirt', 'Pocket', 'Zip', 'Casual'] },
  { id: 'stiletto', targetWord: 'High Heels', bannedWords: ['Shoes', 'Tall', 'Women', 'Heel', 'Fancy'] },
  { id: 'beanie', targetWord: 'Beanie', bannedWords: ['Hat', 'Head', 'Wool', 'Winter', 'Knit'] },

  // ── Music ────────────────────────────────────────────────────────────────────
  { id: 'chorus', targetWord: 'Chorus', bannedWords: ['Song', 'Repeat', 'Sing', 'Hook', 'Music'] },
  { id: 'encore', targetWord: 'Encore', bannedWords: ['More', 'Concert', 'Again', 'Perform', 'Crowd'] },
  { id: 'melody', targetWord: 'Melody', bannedWords: ['Tune', 'Notes', 'Music', 'Hum', 'Song'] },
  { id: 'drumset', targetWord: 'Drum Kit', bannedWords: ['Beat', 'Sticks', 'Cymbals', 'Percussion', 'Hit'] },
  { id: 'bassguitar', targetWord: 'Bass Guitar', bannedWords: ['Low', 'Strings', 'Band', 'Pluck', 'Electric'] },
  { id: 'vinyl', targetWord: 'Vinyl Record', bannedWords: ['Music', 'Spin', 'Groove', 'Player', 'Disc'] },

  // ── Shopping / Everyday ──────────────────────────────────────────────────────
  { id: 'receipt', targetWord: 'Receipt', bannedWords: ['Paper', 'Buy', 'Store', 'Total', 'Proof'] },
  { id: 'coupon', targetWord: 'Coupon', bannedWords: ['Discount', 'Cut', 'Save', 'Deal', 'Price'] },
  { id: 'checkout', targetWord: 'Checkout', bannedWords: ['Pay', 'Store', 'Register', 'Line', 'Cashier'] },
  { id: 'shoppingcart', targetWord: 'Shopping Cart', bannedWords: ['Wheels', 'Store', 'Groceries', 'Push', 'Metal'] },
  { id: 'vending', targetWord: 'Vending Machine', bannedWords: ['Snack', 'Coins', 'Button', 'Dispense', 'Buy'] },

  // ── Medical / Health ─────────────────────────────────────────────────────────
  { id: 'bandage', targetWord: 'Bandage', bannedWords: ['Wound', 'Cover', 'Wrap', 'Injury', 'Stick'] },
  { id: 'stethoscope', targetWord: 'Stethoscope', bannedWords: ['Doctor', 'Heartbeat', 'Listen', 'Chest', 'Ears'] },
  { id: 'thermometer', targetWord: 'Thermometer', bannedWords: ['Temperature', 'Fever', 'Mouth', 'Hot', 'Measure'] },
  { id: 'crutches', targetWord: 'Crutches', bannedWords: ['Broken', 'Walk', 'Arm', 'Leg', 'Support'] },
  { id: 'xray', targetWord: 'X-Ray', bannedWords: ['Bones', 'Scan', 'Radiation', 'Doctor', 'Image'] },

  // ── Cleaning / Home ──────────────────────────────────────────────────────────
  { id: 'vacuum', targetWord: 'Vacuum Cleaner', bannedWords: ['Suck', 'Floor', 'Dust', 'Carpet', 'Electric'] },
  { id: 'mop', targetWord: 'Mop', bannedWords: ['Floor', 'Clean', 'Wet', 'Bucket', 'Sponge'] },
  { id: 'laundry', targetWord: 'Laundry', bannedWords: ['Clothes', 'Wash', 'Detergent', 'Spin', 'Dryer'] },
  { id: 'dustpan', targetWord: 'Dustpan', bannedWords: ['Broom', 'Sweep', 'Dirt', 'Collect', 'Brush'] },

  // ── Gardening / Outdoors ─────────────────────────────────────────────────────
  { id: 'compost', targetWord: 'Compost', bannedWords: ['Rot', 'Waste', 'Garden', 'Fertilize', 'Organic'] },
  { id: 'sprinkler', targetWord: 'Sprinkler', bannedWords: ['Water', 'Lawn', 'Spin', 'Wet', 'Garden'] },
  { id: 'lawnmower', targetWord: 'Lawn Mower', bannedWords: ['Grass', 'Cut', 'Engine', 'Push', 'Yard'] },
  { id: 'rake2', targetWord: 'Rake', bannedWords: ['Leaves', 'Garden', 'Drag', 'Teeth', 'Yard'] },
  { id: 'greenhouse', targetWord: 'Greenhouse', bannedWords: ['Plants', 'Glass', 'Grow', 'Warm', 'Garden'] },

  // ── Tools ────────────────────────────────────────────────────────────────────
  { id: 'wrench', targetWord: 'Wrench', bannedWords: ['Bolt', 'Turn', 'Tool', 'Metal', 'Tight'] },
  { id: 'screwdriver', targetWord: 'Screwdriver', bannedWords: ['Screw', 'Turn', 'Tool', 'Flat', 'Phillips'] },
  { id: 'drill', targetWord: 'Power Drill', bannedWords: ['Hole', 'Spin', 'Bit', 'Electric', 'Wall'] },
  { id: 'level', targetWord: 'Spirit Level', bannedWords: ['Straight', 'Bubble', 'Measure', 'Flat', 'Tool'] },

  // ── Math / School extras ─────────────────────────────────────────────────────
  { id: 'triangle', targetWord: 'Triangle', bannedWords: ['Three', 'Sides', 'Shape', 'Points', 'Angles'] },
  { id: 'fraction', targetWord: 'Fraction', bannedWords: ['Half', 'Math', 'Divide', 'Number', 'Part'] },
  { id: 'graph', targetWord: 'Graph', bannedWords: ['Chart', 'Data', 'Lines', 'Axis', 'Plot'] },

  // ── Night / Dreams ───────────────────────────────────────────────────────────
  { id: 'nightmare', targetWord: 'Nightmare', bannedWords: ['Dream', 'Scary', 'Sleep', 'Bad', 'Night'] },
  { id: 'sleepwalk', targetWord: 'Sleepwalk', bannedWords: ['Sleep', 'Walk', 'Asleep', 'Night', 'Unconscious'] },
  { id: 'moonlight', targetWord: 'Moonlight', bannedWords: ['Moon', 'Night', 'Glow', 'Silver', 'Dark'] },
  { id: 'stargazing', targetWord: 'Stargazing', bannedWords: ['Stars', 'Sky', 'Night', 'Look', 'Telescope'] },

  // ── Food extras ──────────────────────────────────────────────────────────────
  { id: 'avocado', targetWord: 'Avocado', bannedWords: ['Green', 'Guacamole', 'Toast', 'Pit', 'Creamy'] },
  { id: 'smore', targetWord: 'S\'more', bannedWords: ['Marshmallow', 'Chocolate', 'Graham', 'Fire', 'Campfire'] },
  { id: 'burrito', targetWord: 'Burrito', bannedWords: ['Wrap', 'Mexican', 'Rice', 'Beans', 'Roll'] },
  { id: 'pretzel', targetWord: 'Pretzel', bannedWords: ['Salt', 'Twist', 'Dough', 'Knot', 'Bake'] },
  { id: 'croissant', targetWord: 'Croissant', bannedWords: ['French', 'Buttery', 'Flaky', 'Pastry', 'Crescent'] },
  { id: 'waffle', targetWord: 'Waffle', bannedWords: ['Syrup', 'Grid', 'Iron', 'Breakfast', 'Square'] },
];
