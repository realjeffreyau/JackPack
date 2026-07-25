export interface WitlashPrompt {
  id: string;
  text: string;
  category: string;
}

export const WITLASH_PROMPTS: readonly WitlashPrompt[] = [
  // weird
  { id: 'w-001', text: 'A weird feature on a cursed smartphone.', category: 'weird' },
  { id: 'w-002', text: "The strangest thing you'd find in a wizard's junk drawer.", category: 'weird' },
  { id: 'w-003', text: 'A new Olympic sport nobody asked for.', category: 'weird' },
  { id: 'w-004', text: 'The weirdest thing to say to a vending machine.', category: 'weird' },
  { id: 'w-005', text: "A rule at a raccoon's dinner party.", category: 'weird' },
  { id: 'w-006', text: 'The strangest item on a mermaid menu.', category: 'weird' },
  { id: 'w-007', text: 'A weird new holiday and how to celebrate it.', category: 'weird' },

  // roast-lite
  { id: 'w-008', text: "A backhanded compliment for someone's cooking.", category: 'roast-lite' },
  { id: 'w-009', text: 'The nicest way to say someone has bad taste in music.', category: 'roast-lite' },
  { id: 'w-010', text: 'A gentle insult you could put on a birthday card.', category: 'roast-lite' },
  { id: 'w-011', text: 'A polite way to tell someone their plan is terrible.', category: 'roast-lite' },
  { id: 'w-012', text: 'The kindest way to roast a bad haircut.', category: 'roast-lite' },
  { id: 'w-013', text: "A review of someone's karaoke performance.", category: 'roast-lite' },
  { id: 'w-014', text: 'A soft insult for someone who always shows up late.', category: 'roast-lite' },

  // hypothetical
  { id: 'w-015', text: 'What would happen if gravity took weekends off.', category: 'hypothetical' },
  { id: 'w-016', text: "The first thing you'd do if you woke up as mayor.", category: 'hypothetical' },
  { id: 'w-017', text: 'What pets would do if they could vote.', category: 'hypothetical' },
  { id: 'w-018', text: 'A new rule if the moon suddenly had wifi.', category: 'hypothetical' },
  { id: 'w-019', text: 'What would change if clouds charged rent.', category: 'hypothetical' },
  { id: 'w-020', text: 'The first law passed in a world run by toddlers.', category: 'hypothetical' },
  { id: 'w-021', text: 'What everyone would do if naps were mandatory at noon.', category: 'hypothetical' },

  // workplace
  { id: 'w-022', text: 'The worst thing to say during a job interview.', category: 'workplace' },
  { id: 'w-023', text: 'A terrible excuse for being late to a meeting.', category: 'workplace' },
  { id: 'w-024', text: 'The worst possible reply-all email.', category: 'workplace' },
  { id: 'w-025', text: 'A bad idea for the office holiday party.', category: 'workplace' },
  { id: 'w-026', text: 'The least convincing excuse for missing a deadline.', category: 'workplace' },
  { id: 'w-027', text: 'A terrible slogan for a company retreat.', category: 'workplace' },
  { id: 'w-028', text: 'The worst thing to whisper during a performance review.', category: 'workplace' },

  // party
  { id: 'w-029', text: 'A terrible party game idea.', category: 'party' },
  { id: 'w-030', text: 'The worst thing to bring to a potluck.', category: 'party' },
  { id: 'w-031', text: 'A bad excuse for leaving a party early.', category: 'party' },
  { id: 'w-032', text: 'The worst icebreaker question ever asked.', category: 'party' },
  { id: 'w-033', text: 'A terrible theme for a birthday party.', category: 'party' },
  { id: 'w-034', text: 'The worst dance move to debut at a wedding.', category: 'party' },
  { id: 'w-035', text: 'A bad toast to give at a party you crashed.', category: 'party' },

  // fantasy
  { id: 'w-036', text: 'A terrible name for a dragon with low self-esteem.', category: 'fantasy' },
  { id: 'w-037', text: 'The worst spell a beginner wizard could learn.', category: 'fantasy' },
  { id: 'w-038', text: 'A weak superpower nobody would want.', category: 'fantasy' },
  { id: 'w-039', text: 'A terrible name for a superhero who only mildly helps.', category: 'fantasy' },
  { id: 'w-040', text: "The worst item in a knight's inventory.", category: 'fantasy' },
  { id: 'w-041', text: 'A disappointing prize from a treasure chest.', category: 'fantasy' },
  { id: 'w-042', text: 'The least threatening villain origin story.', category: 'fantasy' },

  // awkward
  { id: 'w-043', text: 'The most awkward thing to say during a handshake.', category: 'awkward' },
  { id: 'w-044', text: 'A cringe-worthy thing to text your crush by accident.', category: 'awkward' },
  { id: 'w-045', text: 'The most awkward way to end a phone call.', category: 'awkward' },
  { id: 'w-046', text: 'A weird thing to say when you both reach for the same item.', category: 'awkward' },
  { id: 'w-047', text: 'The most awkward thing to blurt out during an elevator ride.', category: 'awkward' },
  { id: 'w-048', text: 'A cringey thing to say when introducing yourself twice.', category: 'awkward' },
  { id: 'w-049', text: 'The worst thing to say after tripping in public.', category: 'awkward' },

  // dramatic
  { id: 'w-050', text: 'The most dramatic way to quit a board game.', category: 'dramatic' },
  { id: 'w-051', text: 'An overly dramatic reaction to losing a parking spot.', category: 'dramatic' },
  { id: 'w-052', text: 'The most theatrical way to announce you found the remote.', category: 'dramatic' },
  { id: 'w-053', text: 'A dramatic exit line for leaving a group chat.', category: 'dramatic' },
  { id: 'w-054', text: 'The most over-the-top way to react to bad wifi.', category: 'dramatic' },
  { id: 'w-055', text: 'A soap-opera line to use when the pizza arrives late.', category: 'dramatic' },
  { id: 'w-056', text: 'The most dramatic way to announce leftovers are gone.', category: 'dramatic' },

  // cursed object
  { id: 'w-057', text: 'The powers of a cursed toaster.', category: 'cursed object' },
  { id: 'w-058', text: 'What a haunted umbrella whispers during a storm.', category: 'cursed object' },
  { id: 'w-059', text: 'The warning label on a cursed pair of socks.', category: 'cursed object' },
  { id: 'w-060', text: 'What happens if you plug in a cursed lamp.', category: 'cursed object' },
  { id: 'w-061', text: 'The one rule for owning a cursed garden gnome.', category: 'cursed object' },
  { id: 'w-062', text: 'What a cursed vending machine demands in return.', category: 'cursed object' },
  { id: 'w-063', text: 'The side effect of wearing a cursed pair of shoes.', category: 'cursed object' },

  // bad advice
  { id: 'w-064', text: 'The worst advice for a first date.', category: 'bad advice' },
  { id: 'w-065', text: 'Terrible advice for surviving a job interview.', category: 'bad advice' },
  { id: 'w-066', text: 'The worst tip for making friends at a new school.', category: 'bad advice' },
  { id: 'w-067', text: 'Bad advice for winning an argument.', category: 'bad advice' },
  { id: 'w-068', text: 'The worst way to ask for a raise.', category: 'bad advice' },
  { id: 'w-069', text: 'Terrible advice for hosting your first dinner party.', category: 'bad advice' },
  { id: 'w-070', text: 'The worst tip for staying calm under pressure.', category: 'bad advice' },

  // rejected slogan
  { id: 'w-071', text: 'A rejected slogan for a haunted bakery.', category: 'rejected slogan' },
  { id: 'w-072', text: 'A rejected slogan for a gym that closes at noon.', category: 'rejected slogan' },
  { id: 'w-073', text: 'A rejected slogan for a dentist who hates teeth.', category: 'rejected slogan' },
  { id: 'w-074', text: 'A rejected slogan for a airline with no snacks.', category: 'rejected slogan' },
  { id: 'w-075', text: 'A rejected slogan for a library that whispers back.', category: 'rejected slogan' },
  { id: 'w-076', text: 'A rejected slogan for a car wash in the desert.', category: 'rejected slogan' },
  { id: 'w-077', text: 'A rejected slogan for a school for underachieving wizards.', category: 'rejected slogan' },

  // fake product
  { id: 'w-078', text: 'A fake product that solves a problem nobody has.', category: 'fake product' },
  { id: 'w-079', text: 'A gadget that makes mornings worse on purpose.', category: 'fake product' },
  { id: 'w-080', text: 'A subscription box nobody would ever want.', category: 'fake product' },
  { id: 'w-081', text: 'A kitchen appliance that does the opposite of its job.', category: 'fake product' },
  { id: 'w-082', text: 'An app that only makes your day more confusing.', category: 'fake product' },
  { id: 'w-083', text: 'A toy that actively ruins playtime.', category: 'fake product' },
  { id: 'w-084', text: 'A snack that nobody would ever finish.', category: 'fake product' },

  // alien misunderstanding
  { id: 'w-085', text: "An alien's confused review of a birthday party.", category: 'alien misunderstanding' },
  { id: 'w-086', text: 'What an alien thinks a stapler is for.', category: 'alien misunderstanding' },
  { id: 'w-087', text: "An alien's theory about why humans wear shoes.", category: 'alien misunderstanding' },
  { id: 'w-088', text: 'What an alien assumes a traffic light means.', category: 'alien misunderstanding' },
  { id: 'w-089', text: "An alien's explanation for why humans nap.", category: 'alien misunderstanding' },
  { id: 'w-090', text: 'What an alien thinks a handshake is actually for.', category: 'alien misunderstanding' },
  { id: 'w-091', text: "An alien's guess about why humans clap.", category: 'alien misunderstanding' },

  // courtroom nonsense
  { id: 'w-092', text: 'The weakest excuse ever given in a courtroom.', category: 'courtroom nonsense' },
  { id: 'w-093', text: 'A ridiculous piece of evidence presented at trial.', category: 'courtroom nonsense' },
  { id: 'w-094', text: 'The worst closing argument a lawyer could give.', category: 'courtroom nonsense' },
  { id: 'w-095', text: 'A silly law that somehow got passed.', category: 'courtroom nonsense' },
  { id: 'w-096', text: 'The most unconvincing alibi in courtroom history.', category: 'courtroom nonsense' },
  { id: 'w-097', text: 'A nonsense objection a lawyer could shout in court.', category: 'courtroom nonsense' },

  // social disaster
  { id: 'w-098', text: 'The worst thing to say at a family reunion.', category: 'social disaster' },
  { id: 'w-099', text: 'A social disaster waiting to happen at a wedding.', category: 'social disaster' },
  { id: 'w-100', text: 'The worst way to introduce your plus-one to your parents.', category: 'social disaster' },

  // dating
  { id: 'w-101', text: 'The worst opening line on a dating app.', category: 'dating' },
  { id: 'w-102', text: 'A red flag you would absolutely ignore for good chemistry.', category: 'dating' },
  { id: 'w-103', text: 'The worst thing to say right after a first kiss.', category: 'dating' },
  { id: 'w-104', text: 'A terrible excuse for stalking your ex\'s new partner online.', category: 'dating' },
  { id: 'w-105', text: 'The most unhinged thing to bring up on a first date.', category: 'dating' },
  { id: 'w-106', text: 'A lie people tell on a dating profile that always gets caught.', category: 'dating' },
  { id: 'w-107', text: 'The worst nickname to give a situationship.', category: 'dating' },
  { id: 'w-108', text: 'A terrible way to find out you\'re being ghosted.', category: 'dating' },
  { id: 'w-109', text: 'The most chaotic thing to whisper during a slow dance.', category: 'dating' },
  { id: 'w-110', text: 'A dating app bio that guarantees zero matches.', category: 'dating' },
  { id: 'w-111', text: 'The worst thing to text someone the morning after.', category: 'dating' },
  { id: 'w-112', text: 'A cursed pickup line that somehow works anyway.', category: 'dating' },
  { id: 'w-113', text: 'The most embarrassing thing to yell out during a makeout session.', category: 'dating' },
  { id: 'w-114', text: 'A terrible reason to swipe right.', category: 'dating' },

  // hookup regret
  { id: 'w-115', text: 'The most awkward thing to say during a walk of shame.', category: 'hookup regret' },
  { id: 'w-116', text: 'A terrible excuse for sneaking out before breakfast.', category: 'hookup regret' },
  { id: 'w-117', text: 'The worst thing to realize the morning after a hookup.', category: 'hookup regret' },
  { id: 'w-118', text: 'A cursed thing to find in someone\'s bedroom the next morning.', category: 'hookup regret' },
  { id: 'w-119', text: 'The most chaotic way to run into your hookup\'s roommate.', category: 'hookup regret' },
  { id: 'w-120', text: 'A terrible thing to accidentally say mid-hookup.', category: 'hookup regret' },
  { id: 'w-121', text: 'The worst way to find out you hooked up with your friend\'s crush.', category: 'hookup regret' },
  { id: 'w-122', text: 'A regretful drunk decision that seemed genius at 2am.', category: 'hookup regret' },
  { id: 'w-123', text: 'The most awkward thing to text your one-night stand the next day.', category: 'hookup regret' },
  { id: 'w-124', text: 'A terrible nickname your hookup gave you that stuck.', category: 'hookup regret' },

  // drunk texts
  { id: 'w-125', text: 'The worst text sent at 2am under the influence.', category: 'drunk texts' },
  { id: 'w-126', text: 'A drunk voicemail nobody should ever have to hear sober.', category: 'drunk texts' },
  { id: 'w-127', text: 'The most unhinged thing to post after three drinks.', category: 'drunk texts' },
  { id: 'w-128', text: 'A drunk confession that ruined a group chat.', category: 'drunk texts' },
  { id: 'w-129', text: 'The worst person to accidentally drunk-dial.', category: 'drunk texts' },
  { id: 'w-130', text: 'A drunk promise you immediately regretted the next morning.', category: 'drunk texts' },
  { id: 'w-131', text: 'The most chaotic thing to order at last call.', category: 'drunk texts' },
  { id: 'w-132', text: 'A drunk text that somehow got you back together with an ex.', category: 'drunk texts' },

  // breakup
  { id: 'w-133', text: 'The worst way to get dumped.', category: 'breakup' },
  { id: 'w-134', text: 'A petty way to get revenge on an ex.', category: 'breakup' },
  { id: 'w-135', text: 'The most dramatic way to announce a breakup on social media.', category: 'breakup' },
  { id: 'w-136', text: 'A terrible excuse for texting an ex at midnight.', category: 'breakup' },
  { id: 'w-137', text: 'The worst thing to say while getting back together.', category: 'breakup' },
  { id: 'w-138', text: 'A breakup gift that was clearly a mistake.', category: 'breakup' },
  { id: 'w-139', text: 'The most unhinged thing to do with an ex\'s stuff.', category: 'breakup' },
  { id: 'w-140', text: 'A red flag you spot immediately after a breakup rebound.', category: 'breakup' },

  // roast-lite (spicier)
  { id: 'w-141', text: 'A savage but loving roast of someone\'s ex.', category: 'roast-lite' },
  { id: 'w-142', text: 'The most brutal thing to say about someone\'s flirting game.', category: 'roast-lite' },
  { id: 'w-143', text: 'A backhanded compliment about someone\'s hookup history.', category: 'roast-lite' },
  { id: 'w-144', text: 'The kindest way to roast someone\'s taste in partners.', category: 'roast-lite' },
  { id: 'w-145', text: 'A gentle insult about someone\'s dance floor moves.', category: 'roast-lite' },
  { id: 'w-146', text: 'The nicest way to say someone peaked in high school.', category: 'roast-lite' },
  { id: 'w-147', text: 'A savage nickname for someone who overshares.', category: 'roast-lite' },
  { id: 'w-148', text: 'The most polite way to call someone a red flag.', category: 'roast-lite' },

  // party (spicier)
  { id: 'w-149', text: 'The worst game to suggest at a college party.', category: 'party' },
  { id: 'w-150', text: 'A terrible dare that somehow became a house tradition.', category: 'party' },
  { id: 'w-151', text: 'The most chaotic thing to happen at a house party.', category: 'party' },
  { id: 'w-152', text: 'A regrettable costume choice for a themed party.', category: 'party' },
  { id: 'w-153', text: 'The worst rumor started at a party and never denied.', category: 'party' },
  { id: 'w-154', text: 'A bad idea for spicing up a boring pregame.', category: 'party' },
  { id: 'w-155', text: 'The most unhinged thing to do during beer pong.', category: 'party' },
  { id: 'w-156', text: 'A terrible party trick that always backfires.', category: 'party' },

  // hypothetical (spicier)
  { id: 'w-157', text: 'What would happen if everyone\'s search history went public for a day.', category: 'hypothetical' },
  { id: 'w-158', text: 'The first thing you\'d do if flirting became mandatory by law.', category: 'hypothetical' },
  { id: 'w-159', text: 'What dating would look like if honesty was forced.', category: 'hypothetical' },
  { id: 'w-160', text: 'A new rule if hookups required a permission slip.', category: 'hypothetical' },
  { id: 'w-161', text: 'What would happen if exes got a rating system.', category: 'hypothetical' },
  { id: 'w-162', text: 'The first law passed if hangovers became a public holiday excuse.', category: 'hypothetical' },

  // awkward (spicier)
  { id: 'w-163', text: 'The most awkward thing to say when you run into a hookup at brunch.', category: 'awkward' },
  { id: 'w-164', text: 'A cringe-worthy thing to say mid-flirt.', category: 'awkward' },
  { id: 'w-165', text: 'The most awkward way to introduce a situationship to your friends.', category: 'awkward' },
  { id: 'w-166', text: 'A weird thing to say when you match with your friend\'s ex.', category: 'awkward' },
  { id: 'w-167', text: 'The most awkward thing to blurt out during a slow dance.', category: 'awkward' },
  { id: 'w-168', text: 'A cringey thing to text before realizing it went to the wrong person.', category: 'awkward' },
  { id: 'w-169', text: 'The worst thing to say when your hookup meets your parents by accident.', category: 'awkward' },

  // dramatic (spicier)
  { id: 'w-170', text: 'The most dramatic way to announce you\'re "taking a break" with your partner.', category: 'dramatic' },
  { id: 'w-171', text: 'An overly dramatic reaction to being left on read.', category: 'dramatic' },
  { id: 'w-172', text: 'The most theatrical way to confront a cheater.', category: 'dramatic' },
  { id: 'w-173', text: 'A dramatic exit line for leaving a bad date.', category: 'dramatic' },
  { id: 'w-174', text: 'The most over-the-top way to react to a bad hookup story.', category: 'dramatic' },
  { id: 'w-175', text: 'A soap-opera line to use during a jealous moment.', category: 'dramatic' },

  // fake product (spicier)
  { id: 'w-176', text: 'A fake dating app feature that would ruin everyone\'s love life.', category: 'fake product' },
  { id: 'w-177', text: 'A subscription box for people who make terrible dating choices.', category: 'fake product' },
  { id: 'w-178', text: 'An app that only exists to expose red flags.', category: 'fake product' },
  { id: 'w-179', text: 'A gadget that makes hangovers ten times worse.', category: 'fake product' },
  { id: 'w-180', text: 'A terrible product pitched at a singles mixer.', category: 'fake product' },

  // bad advice (spicier)
  { id: 'w-181', text: 'The worst advice for texting your crush back.', category: 'bad advice' },
  { id: 'w-182', text: 'Terrible advice for surviving a walk of shame.', category: 'bad advice' },
  { id: 'w-183', text: 'The worst tip for getting over a breakup fast.', category: 'bad advice' },
  { id: 'w-184', text: 'Bad advice for winning back an ex.', category: 'bad advice' },
  { id: 'w-185', text: 'The worst way to make someone jealous on purpose.', category: 'bad advice' },
  { id: 'w-186', text: 'Terrible advice for flirting at a bar.', category: 'bad advice' },

  // social disaster (spicier)
  { id: 'w-187', text: 'The worst thing to say when your date and your ex show up at the same bar.', category: 'social disaster' },
  { id: 'w-188', text: 'A social disaster waiting to happen at a college reunion.', category: 'social disaster' },
  { id: 'w-189', text: 'The worst way to introduce a rebound to your friend group.', category: 'social disaster' },
  { id: 'w-190', text: 'A disaster caused by accidentally liking an old photo while stalking someone.', category: 'social disaster' },
  { id: 'w-191', text: 'The worst thing to overhear your date say to their friends about you.', category: 'social disaster' },

  // workplace (spicier)
  { id: 'w-192', text: 'The worst thing to accidentally reply-all about a coworker crush.', category: 'workplace' },
  { id: 'w-193', text: 'A terrible excuse for being hungover at a morning meeting.', category: 'workplace' },
  { id: 'w-194', text: 'The worst thing to say during an office happy hour.', category: 'workplace' },
  { id: 'w-195', text: 'A bad idea for flirting with a coworker at the holiday party.', category: 'workplace' },
  { id: 'w-196', text: 'The least convincing excuse for a hickey at work.', category: 'workplace' },

  // weird (spicier)
  { id: 'w-197', text: 'The weirdest thing to say to a bartender to get a free drink.', category: 'weird' },
  { id: 'w-198', text: 'A strange rule for surviving a situationship.', category: 'weird' },
  { id: 'w-199', text: 'The weirdest thing someone has said to you while flirting.', category: 'weird' },
  { id: 'w-200', text: 'A bizarre ritual couples do that nobody understands.', category: 'weird' },
  { id: 'w-201', text: 'The strangest thing to find in your hookup\'s search history.', category: 'weird' },

  // courtroom nonsense (spicier)
  { id: 'w-202', text: 'The weakest excuse ever given for a cheating scandal in court.', category: 'courtroom nonsense' },
  { id: 'w-203', text: 'A ridiculous piece of evidence presented in a breakup lawsuit.', category: 'courtroom nonsense' },
  { id: 'w-204', text: 'The worst closing argument for why you texted your ex.', category: 'courtroom nonsense' },
  { id: 'w-205', text: 'The most unconvincing alibi for a drunk text sent at 3am.', category: 'courtroom nonsense' },

  // rejected slogan (spicier)
  { id: 'w-206', text: 'A rejected slogan for a dating app for people with bad judgment.', category: 'rejected slogan' },
  { id: 'w-207', text: 'A rejected slogan for a bar that only serves regret.', category: 'rejected slogan' },
  { id: 'w-208', text: 'A rejected slogan for a hangover cure that doesn\'t work.', category: 'rejected slogan' },
  { id: 'w-209', text: 'A rejected slogan for a matchmaking service run by exes.', category: 'rejected slogan' },

  // fantasy (spicier)
  { id: 'w-210', text: 'A terrible pickup line for a dragon trying to flirt.', category: 'fantasy' },
  { id: 'w-211', text: 'The worst love potion side effect a wizard forgot to mention.', category: 'fantasy' },
  { id: 'w-212', text: 'A cursed dating app for mythical creatures.', category: 'fantasy' },
  { id: 'w-213', text: 'The least romantic thing a vampire could say on a first date.', category: 'fantasy' },

  // cursed object (spicier)
  { id: 'w-214', text: 'What a cursed dating app does to your matches.', category: 'cursed object' },
  { id: 'w-215', text: 'The side effect of texting an ex with a cursed phone.', category: 'cursed object' },
  { id: 'w-216', text: 'What a haunted mirror says about your flirting technique.', category: 'cursed object' },

  // alien misunderstanding (spicier)
  { id: 'w-217', text: 'An alien\'s confused theory about why humans go on dates.', category: 'alien misunderstanding' },
  { id: 'w-218', text: 'What an alien thinks flirting is actually for.', category: 'alien misunderstanding' },
  { id: 'w-219', text: 'An alien\'s explanation for why humans get hangovers.', category: 'alien misunderstanding' },

  // more weird / party / social mashups to round it out
  { id: 'w-220', text: 'The worst thing to say to a bouncer to get back into a club.', category: 'social disaster' },
  { id: 'w-221', text: 'A terrible excuse for texting "u up?" at 1am.', category: 'dating' },
  { id: 'w-222', text: 'The most unhinged thing to do to win someone back.', category: 'breakup' },
  { id: 'w-223', text: 'A regretful tattoo idea inspired by a hookup.', category: 'hookup regret' },
  { id: 'w-224', text: 'The worst nickname a group chat gave your situationship.', category: 'dating' },
  { id: 'w-225', text: 'A drunk decision that ended a friendship.', category: 'drunk texts' },
  { id: 'w-226', text: 'The most chaotic thing to happen during a game of spin the bottle.', category: 'party' },
  { id: 'w-227', text: 'A terrible thing to whisper to distract someone on a date.', category: 'dating' },
  { id: 'w-228', text: 'The worst way to find out your date has a secret partner.', category: 'social disaster' },
  { id: 'w-229', text: 'A cursed thing to say during a game of truth or dare.', category: 'party' },
  { id: 'w-230', text: 'The worst excuse for missing your own hookup\'s birthday.', category: 'hookup regret' },
  { id: 'w-231', text: 'A terrible reason to slide into someone\'s DMs.', category: 'dating' },
  { id: 'w-232', text: 'The most chaotic thing to happen during a game of never have I ever.', category: 'party' },
  { id: 'w-233', text: 'A drunk text that got someone fired.', category: 'drunk texts' },
  { id: 'w-234', text: 'The worst thing to admit during a game of truth or dare.', category: 'party' },
  { id: 'w-235', text: 'A terrible reason to stay friends with an ex.', category: 'breakup' },
  { id: 'w-236', text: 'The most unhinged excuse for a hickey in a work Zoom call.', category: 'workplace' },
  { id: 'w-237', text: 'A red flag disguised as a compliment.', category: 'dating' },
  { id: 'w-238', text: 'The worst thing to text a group chat about a first date.', category: 'dating' },
  { id: 'w-239', text: 'A terrible excuse for liking your ex\'s new partner\'s photo.', category: 'social disaster' },
  { id: 'w-240', text: 'The most chaotic thing to happen at a wedding after-party.', category: 'party' },
  { id: 'w-241', text: 'A drunk apology that made things worse.', category: 'drunk texts' },
  { id: 'w-242', text: 'The worst thing to say when caught mid-flirt by your partner.', category: 'social disaster' },
  { id: 'w-243', text: 'A terrible pickup line used unironically and it worked.', category: 'dating' },
  { id: 'w-244', text: 'The most unhinged thing to do after seeing your ex with someone new.', category: 'breakup' },
  { id: 'w-245', text: 'A cursed thing to overhear on a first date at the next table.', category: 'weird' },
  { id: 'w-246', text: 'The worst way to respond to "we need to talk."', category: 'breakup' },
  { id: 'w-247', text: 'A terrible excuse for being caught stalking someone\'s Instagram.', category: 'social disaster' },
  { id: 'w-248', text: 'The most chaotic thing to happen during a couples costume party.', category: 'party' },
  { id: 'w-249', text: 'A drunk confession made at the worst possible moment.', category: 'drunk texts' },
  { id: 'w-250', text: 'The worst thing to whisper to distract someone during a toast.', category: 'social disaster' },
  { id: 'w-251', text: 'A terrible reason to break up over text.', category: 'breakup' },
  { id: 'w-252', text: 'The most unhinged thing a wingman could say to help you flirt.', category: 'party' },
  { id: 'w-253', text: 'A cursed rule for surviving a group hookup weekend at the beach.', category: 'party' },
  { id: 'w-254', text: 'The worst thing to say when someone asks about your body count.', category: 'awkward' },
  { id: 'w-255', text: 'A terrible excuse for being caught in your ex\'s Venmo history.', category: 'social disaster' },
  { id: 'w-256', text: 'The most chaotic thing to happen at a bachelor or bachelorette party.', category: 'party' },
  { id: 'w-257', text: 'A drunk text that revealed a secret crush.', category: 'drunk texts' },
  { id: 'w-258', text: 'The worst thing to say to justify a one-night stand the next morning.', category: 'hookup regret' },
  { id: 'w-259', text: 'A terrible pep talk before approaching your crush.', category: 'dating' },
  { id: 'w-260', text: 'The most unhinged excuse for missing a date because of a hangover.', category: 'dating' },
  { id: 'w-261', text: 'A cursed thing to say while meeting your partner\'s parents for the first time.', category: 'awkward' },
  { id: 'w-262', text: 'The worst thing to overhear your roommate say about your hookup.', category: 'social disaster' },
  { id: 'w-263', text: 'A terrible reason to text "I miss you" to the wrong person.', category: 'dating' },
  { id: 'w-264', text: 'The most chaotic thing to happen during a game of seven minutes in heaven.', category: 'party' },
  { id: 'w-265', text: 'A drunk decision that started a situationship nobody asked for.', category: 'drunk texts' },
  { id: 'w-266', text: 'The worst thing to say when your hookup calls you the wrong name.', category: 'hookup regret' },
  { id: 'w-267', text: 'A terrible excuse for showing up to a date still drunk from the night before.', category: 'dating' },
  { id: 'w-268', text: 'The most unhinged thing to text an ex during a full moon.', category: 'breakup' },
  { id: 'w-269', text: 'A cursed karaoke song choice for a first date.', category: 'dating' },
  { id: 'w-270', text: 'The worst thing to say when you realize you\'re both seeing the same person.', category: 'social disaster' },
  { id: 'w-271', text: 'A terrible reason to keep a situationship going for way too long.', category: 'dating' },
  { id: 'w-272', text: 'The most chaotic thing to happen during a game of flip cup.', category: 'party' },
  { id: 'w-273', text: 'A drunk text confessing to a crush on the wrong friend.', category: 'drunk texts' },
  { id: 'w-274', text: 'The worst thing to say to justify ghosting someone.', category: 'dating' },
  { id: 'w-275', text: 'A terrible excuse for a suspicious hallway noise at a house party.', category: 'party' },
  { id: 'w-276', text: 'The most unhinged thing to do after getting left on delivered.', category: 'dating' },
  { id: 'w-277', text: 'A cursed nickname an ex still uses for you.', category: 'breakup' },
  { id: 'w-278', text: 'The worst thing to say when your date brings up their ex first.', category: 'awkward' },
  { id: 'w-279', text: 'A terrible reason to add your hookup on every social platform immediately.', category: 'hookup regret' },
  { id: 'w-280', text: 'The most chaotic thing to happen during a game of kings cup.', category: 'party' },
  { id: 'w-281', text: 'A drunk decision to give an ex a "one more chance."', category: 'drunk texts' },
  { id: 'w-282', text: 'The worst thing to say while trying to make an entrance at a party.', category: 'party' },
  { id: 'w-283', text: 'A terrible excuse for being caught checking out someone at a party.', category: 'social disaster' },
  { id: 'w-284', text: 'The most unhinged thing to whisper while slow dancing with a stranger.', category: 'party' },
  { id: 'w-285', text: 'A cursed thing to say when your friend catches you mid-flirt with their crush.', category: 'social disaster' },
  { id: 'w-286', text: 'The worst thing to say to end an awkward silence on a date.', category: 'awkward' },
  { id: 'w-287', text: 'A terrible reason to break the ice with a stranger at a bar.', category: 'dating' },
  { id: 'w-288', text: 'The most chaotic thing to happen during a late-night diner run after the bars close.', category: 'party' },
  { id: 'w-289', text: 'A drunk text that accidentally revealed the group chat name.', category: 'drunk texts' },
  { id: 'w-290', text: 'The worst thing to say to talk your way out of a bad first date early.', category: 'dating' },
  { id: 'w-291', text: 'A terrible excuse for texting your crush\'s best friend for gossip.', category: 'dating' },
  { id: 'w-292', text: 'The most unhinged thing to do when you see your hookup in public with someone else.', category: 'hookup regret' },
  { id: 'w-293', text: 'A cursed way to find out you and your roommate like the same person.', category: 'social disaster' },
  { id: 'w-294', text: 'The worst thing to say when asked "so what are we?"', category: 'dating' },
  { id: 'w-295', text: 'A terrible reason to stay at a party way past when you should\'ve left.', category: 'party' },
  { id: 'w-296', text: 'The most chaotic thing to happen while pregaming before a date.', category: 'party' },
  { id: 'w-297', text: 'A drunk decision to text an entire group chat "who wants to hook up."', category: 'drunk texts' },
  { id: 'w-298', text: 'The worst thing to say when your parents ask about your love life.', category: 'awkward' },
  { id: 'w-299', text: 'A terrible excuse for still having your ex\'s hoodie.', category: 'breakup' },
  { id: 'w-300', text: 'The most unhinged toast to give at a friend\'s wedding about their dating history.', category: 'social disaster' },
] as const;
