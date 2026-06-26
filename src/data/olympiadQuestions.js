export function getOlympiadPoints(yearKey) {
  const pts = { Reception: 15, 'Year 1-2': 20, 'Year 3-4': 25, 'Year 5-6': 35, 'Year 7-8': 50 };
  return pts[yearKey] || 25;
}

const basePool = {
  Reception: [
    { q: 'What comes next in the pattern: 2, 4, 6, 8, ___?', options: ['9', '10', '11', '12'], answer: '10', cat: '📐 Maths' },
    { q: 'Tom has 5 apples. He gives 2 to his friend. How many does he have left?', options: ['2', '3', '4', '7'], answer: '3', cat: '📐 Maths' },
    { q: 'Which word rhymes with "cat"?', options: ['Dog', 'Hat', 'Car', 'Bed'], answer: 'Hat', cat: '📖 English' },
    { q: 'How many shapes have 4 corners? A square and a triangle.', options: ['0', '1', '2', '3'], answer: '1', cat: '🧠 Reasoning' },
    { q: 'A snail is SLOW. A cheetah is...?', options: ['Small', 'Fast', 'Blue', 'Quiet'], answer: 'Fast', cat: '🧠 Reasoning' },
    { q: 'There are 3 red balls and 2 blue balls. How many balls altogether?', options: ['4', '5', '6', '7'], answer: '5', cat: '📐 Maths' },
    { q: 'Which word is the ODD ONE OUT: Apple, Banana, Chair, Mango?', options: ['Apple', 'Banana', 'Chair', 'Mango'], answer: 'Chair', cat: '🧠 Reasoning' },
    { q: 'The sun rises in the East. In which direction does it set?', options: ['North', 'South', 'East', 'West'], answer: 'West', cat: '🔬 Science' },
    { q: 'Which number is missing? 1, 3, 5, ___, 9', options: ['6', '7', '8', '4'], answer: '7', cat: '📐 Maths' },
    { q: 'A book has a COVER and PAGES. What comes at the end of a book?', options: ['The cover', 'The index / back', 'The title', 'The pictures'], answer: 'The index / back', cat: '📖 English' },
    { q: 'If today is Monday, what day was it yesterday?', options: ['Tuesday', 'Sunday', 'Friday', 'Saturday'], answer: 'Sunday', cat: '🧠 Reasoning' },
    { q: 'What is the opposite of "hot"?', options: ['Warm', 'Cold', 'Bright', 'Soft'], answer: 'Cold', cat: '📖 English' },
    { q: 'Sam has 10 sweets. He eats 4. His friend gives him 2 more. How many does he have?', options: ['6', '7', '8', '9'], answer: '8', cat: '📐 Maths' },
    { q: 'Which living thing makes its own food from sunlight?', options: ['Dog', 'Fish', 'Plant', 'Bird'], answer: 'Plant', cat: '🔬 Science' },
    { q: 'Choose the correct sentence: "She __ to school every day."', options: ['go', 'goes', 'going', 'gone'], answer: 'goes', cat: '📖 English' },
  ],
  'Year 1-2': [
    { q: 'What is 25% of 80?', options: ['15', '20', '25', '30'], answer: '20', cat: '📐 Maths' },
    { q: 'A clock shows 3:45. How many minutes until 4:00?', options: ['10', '12', '15', '20'], answer: '15', cat: '📐 Maths' },
    { q: 'Which word is spelled correctly?', options: ['Freind', 'Friend', 'Frend', 'Friand'], answer: 'Friend', cat: '📖 English' },
    { q: 'All roses are flowers. Some flowers fade quickly. Which conclusion MUST be true?', options: ['All roses fade quickly', 'Some roses may fade quickly', 'No roses fade', 'Flowers are not beautiful'], answer: 'Some roses may fade quickly', cat: '🧠 Reasoning' },
    { q: 'A train leaves at 09:20 and arrives at 11:05. How long is the journey?', options: ['1 hr 35 min', '1 hr 45 min', '2 hrs 05 min', '2 hrs 15 min'], answer: '1 hr 45 min', cat: '📐 Maths' },
    { q: 'Why do we see lightning before we hear thunder?', options: ['Thunder is louder than lightning', 'Light travels faster than sound', 'Sound travels faster than light', 'Lightning is closer to us'], answer: 'Light travels faster than sound', cat: '🔬 Science' },
    { q: 'Choose the best word: "The runner was so tired that he could __ finish the race."', options: ['easily', 'barely', 'always', 'quickly'], answer: 'barely', cat: '📖 English' },
    { q: 'If 5 pens cost $2.50, how much do 8 pens cost?', options: ['$3.50', '$4.00', '$4.50', '$5.00'], answer: '$4.00', cat: '📐 Maths' },
    { q: 'Complete the analogy: Fish : Water :: Bird : ___', options: ['Feathers', 'Nest', 'Air', 'Tree'], answer: 'Air', cat: '🧠 Reasoning' },
    { q: 'What is 3/4 expressed as a percentage?', options: ['34%', '65%', '75%', '80%'], answer: '75%', cat: '📐 Maths' },
    { q: 'A plant is placed in a dark cupboard for a week. What will most likely happen?', options: ['It will grow faster', 'Its leaves will turn yellow and wilt', 'It will produce more flowers', 'Nothing will change'], answer: 'Its leaves will turn yellow and wilt', cat: '🔬 Science' },
    { q: 'Which punctuation ends an exclamatory sentence?', options: ['.', ',', '?', '!'], answer: '!', cat: '📖 English' },
    { q: 'Look at the sequence: 3, 6, 12, 24, ___. What comes next?', options: ['36', '42', '48', '52'], answer: '48', cat: '🧠 Reasoning' },
    { q: 'A rectangle has a perimeter of 26 cm. Its length is 8 cm. What is its width?', options: ['3 cm', '5 cm', '8 cm', '10 cm'], answer: '5 cm', cat: '📐 Maths' },
    { q: 'Which word correctly completes: "She is ___ than her sister."', options: ['tall', 'more tall', 'taller', 'tallest'], answer: 'taller', cat: '📖 English' },
  ],
  'Year 3-4': [
    { q: 'What is the value of 2⁴ + 3²?', options: ['24', '25', '28', '34'], answer: '25', cat: '📐 Maths' },
    { q: 'A shop sells apples for $0.35 each. How many apples can you buy for $5.00, and how much change do you get?', options: ['14 apples, $0.10', '14 apples, $0.05', '13 apples, $0.45', '15 apples, $0.25'], answer: '14 apples, $0.10', cat: '📐 Maths' },
    { q: 'Which literary device is used in: "The wind whispered through the trees"?', options: ['Simile', 'Metaphor', 'Personification', 'Alliteration'], answer: 'Personification', cat: '📖 English' },
    { q: 'If X = 4 and Y = 7, what is 3X² - 2Y?', options: ['32', '34', '34', '34'], answer: '34', cat: '📐 Maths' },
    { q: 'If all Blups are Gloops and all Gloops are Zings, are all Blups definitely Zings?', options: ['Yes', 'No', 'Maybe', 'Cannot be determined'], answer: 'Yes', cat: '🧠 Reasoning' },
    { q: 'A solution turns blue litmus paper red. Is it an acid or a base?', options: ['Base', 'Neutral', 'Acid', 'Cannot tell'], answer: 'Acid', cat: '🔬 Science' },
    { q: 'What is the correct passive voice of: "The dog bit the postman"?', options: ['The postman was biting the dog', 'The postman was bitten by the dog', 'The dog was bitten by the postman', 'The postman has bitten the dog'], answer: 'The postman was bitten by the dog', cat: '📖 English' },
    { q: 'The first 5 terms of a sequence are 7, 11, 15, 19, 23. What is the nth term?', options: ['4n + 3', '4n + 7', '3n + 4', '5n + 2'], answer: '4n + 3', cat: '📐 Maths' },
    { q: 'A car uses 6 litres of fuel per 100 km. How many litres are needed for 450 km?', options: ['24 L', '27 L', '30 L', '36 L'], answer: '27 L', cat: '🧠 Reasoning' },
    { q: 'What happens to the resistance in a circuit if the voltage doubles but the current stays the same?', options: ['Resistance halves', 'Resistance doubles', 'Resistance stays the same', 'Resistance quadruples'], answer: 'Resistance doubles', cat: '🔬 Science' },
    { q: 'Which of these words contains a prefix meaning "not"?', options: ['Preview', 'Prepaid', 'Informal', 'Submerge'], answer: 'Informal', cat: '📖 English' },
    { q: 'In a class of 30 students, 18 play football, 14 play basketball, and 6 play both. How many play neither?', options: ['2', '4', '6', '8'], answer: '4', cat: '📐 Maths' },
    { q: 'If it always rains when Maria carries an umbrella, but today she left it at home, does it mean it will not rain?', options: ['Yes, definitely', 'No, it might still rain', 'Only if it is sunny', 'Cannot happen at all'], answer: 'No, it might still rain', cat: '🧠 Reasoning' },
    { q: 'What is the difference between speed and velocity?', options: ['They are the same', 'Speed has direction; velocity does not', 'Velocity has direction; speed does not', 'Speed is measured in km; velocity in m'], answer: 'Velocity has direction; speed does not', cat: '🔬 Science' },
    { q: 'Choose the sentence with correct subject-verb agreement: ', options: ['The team are playing well today', 'The team is playing well today', 'The team plays good today', 'The team were playing well today'], answer: 'The team is playing well today', cat: '📖 English' },
  ],
  'Year 5-6': [
    { q: 'Simplify: (3x²y)(4xy³)', options: ['7x³y⁴', '12x³y⁴', '12x²y³', '7x²y³'], answer: '12x³y⁴', cat: '📐 Maths' },
    { q: 'A cyclist completes 3 laps of a 2.4 km circuit in 18 minutes. What is her speed in km/h?', options: ['20 km/h', '22 km/h', '24 km/h', '26 km/h'], answer: '24 km/h', cat: '📐 Maths' },
    { q: 'Analyse this argument: "Our school should ban phones because they distract students." What type of reasoning is this?', options: ['Deductive reasoning', 'Inductive reasoning', 'Logical fallacy', 'Circular reasoning'], answer: 'Inductive reasoning', cat: '🧠 Reasoning' },
    { q: 'What is meant by "osmosis" in biology?', options: ['Movement of solutes across a membrane', 'Movement of water from high to low concentration through a semipermeable membrane', 'Movement of water from low to high concentration', 'Chemical reaction in the cell'], answer: 'Movement of water from high to low concentration through a semipermeable membrane', cat: '🔬 Science' },
    { q: 'A water tank is 3/5 full. After adding 120 litres it is 4/5 full. What is the full capacity of the tank?', options: ['400 L', '500 L', '600 L', '700 L'], answer: '600 L', cat: '📐 Maths' },
    { q: 'Which technique does this sentence use: "It was the best of times, it was the worst of times"?', options: ['Alliteration', 'Oxymoron', 'Antithesis', 'Hyperbole'], answer: 'Antithesis', cat: '📖 English' },
    { q: 'Which of these is an example of a logical fallacy?', options: ['The study used 1000 participants', 'You must agree — everyone else does', 'The results were repeated 3 times', 'The control group showed no change'], answer: 'You must agree — everyone else does', cat: '🧠 Reasoning' },
    { q: 'What is the sum of the interior angles of a pentagon?', options: ['360°', '450°', '540°', '720°'], answer: '540°', cat: '📐 Maths' },
    { q: 'What is the difference between mitosis and meiosis?', options: ['Both produce 2 identical cells', 'Mitosis produces 4 cells; meiosis produces 2', 'Mitosis produces 2 identical cells; meiosis produces 4 genetically unique cells', 'They are the same process'], answer: 'Mitosis produces 2 identical cells; meiosis produces 4 genetically unique cells', cat: '🔬 Science' },
    { q: 'A product costs $480 after a 20% discount. What was the original price?', options: ['$560', '$576', '$600', '$620'], answer: '$600', cat: '📐 Maths' },
    { q: 'What is the subjunctive mood used for?', options: ['Statements of fact', 'Hypothetical, wishful or doubtful situations', 'Commands only', 'Describing past events'], answer: 'Hypothetical, wishful or doubtful situations', cat: '📖 English' },
    { q: 'Five athletes finish a race. In how many different orders can they finish?', options: ['25', '60', '120', '240'], answer: '120', cat: '📐 Maths' },
    { q: 'A candle is lit in a sealed jar. What happens over time and why?', options: ['It burns brighter as CO₂ fuels it', 'It goes out because oxygen is used up', 'It burns forever in a sealed space', 'It gets brighter then explodes'], answer: 'It goes out because oxygen is used up', cat: '🔬 Science' },
    { q: 'Which word best replaces "said" in: "I will not do it!" she ___ angrily.', options: ['whispered', 'mumbled', 'declared', 'giggled'], answer: 'declared', cat: '📖 English' },
    { q: 'If P(A) = 0.4 and P(B) = 0.3 and events are independent, what is P(A and B)?', options: ['0.07', '0.12', '0.7', '0.34'], answer: '0.12', cat: '📐 Maths' },
  ],
  'Year 7-8': [
    { q: 'Solve for x: log₂(x) = 5', options: ['x = 10', 'x = 25', 'x = 32', 'x = 64'], answer: 'x = 32', cat: '📐 Maths' },
    { q: 'A train travels from A to B at 60 km/h and returns at 90 km/h. What is the average speed for the whole journey?', options: ['72 km/h', '75 km/h', '78 km/h', '80 km/h'], answer: '72 km/h', cat: '📐 Maths' },
    { q: 'Evaluate the rhetorical effect of anaphora. Which example demonstrates it?', options: ['"He was tired, cold, and hungry"', '"We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields"', '"The fire roared like a lion"', '"He smiled a mile-wide smile"'], answer: '"We shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields"', cat: '📖 English' },
    { q: 'What is the remainder when 2¹⁰⁰ is divided by 3?', options: ['0', '1', '2', '3'], answer: '1', cat: '📐 Maths' },
    { q: 'Three people can complete a task in 12 days. How many days will it take 4 people to complete the same task?', options: ['7 days', '8 days', '9 days', '16 days'], answer: '9 days', cat: '🧠 Reasoning' },
    { q: 'Explain the Hardy-Weinberg principle. What does it predict?', options: ['Species always evolve over time', 'Allele frequencies stay constant in a large, non-evolving population', 'Dominant alleles always increase in frequency', 'Mutations are the main driver of evolution'], answer: 'Allele frequencies stay constant in a large, non-evolving population', cat: '🔬 Science' },
    { q: 'Which logical structure is this? "If A then B. A is true. Therefore B is true."', options: ['Modus tollens', 'Modus ponens', 'Ad hominem', 'Reductio ad absurdum'], answer: 'Modus ponens', cat: '🧠 Reasoning' },
    { q: 'What is the integral of 2x with respect to x?', options: ['2', 'x²', 'x² + C', '2x² + C'], answer: 'x² + C', cat: '📐 Maths' },
    { q: 'How does Le Chatelier\'s Principle apply when pressure is increased in a gas equilibrium?', options: ['The reaction shifts to produce more moles of gas', 'The reaction shifts to produce fewer moles of gas', 'The equilibrium constant increases', 'No change occurs'], answer: 'The reaction shifts to produce fewer moles of gas', cat: '🔬 Science' },
    { q: 'In the sentence "Having finished the exam, the papers were collected by the teacher" — what is wrong?', options: ['Passive voice error', 'Dangling modifier — "having finished" refers to the teacher not the papers', 'Tense error', 'Subject-verb disagreement'], answer: 'Dangling modifier — "having finished" refers to the teacher not the papers', cat: '📖 English' },
    { q: 'How many prime numbers are between 50 and 70?', options: ['3', '4', '5', '6'], answer: '4', cat: '📐 Maths' },
    { q: 'What is the significance of the p-value in statistical testing?', options: ['It tells us the sample size needed', 'It measures the probability of getting results as extreme as observed if null hypothesis is true', 'It confirms the alternative hypothesis', 'It shows the mean of the data'], answer: 'It measures the probability of getting results as extreme as observed if null hypothesis is true', cat: '🧠 Reasoning' },
    { q: 'What is the Doppler Effect?', options: ['The bending of light around objects', 'The change in wave frequency observed when source and observer move relative to each other', 'The reflection of sound waves off surfaces', 'The decrease in sound as distance increases'], answer: 'The change in wave frequency observed when source and observer move relative to each other', cat: '🔬 Science' },
    { q: 'A bag has 4 red and 6 blue marbles. Two are drawn without replacement. What is P(both red)?', options: ['4/25', '2/15', '6/25', '8/45'], answer: '2/15', cat: '📐 Maths' },
    { q: 'Critically evaluate: "This painkiller must be effective — athletes use it." What logical flaw does this contain?', options: ['False dilemma', 'Straw man', 'Appeal to authority / Ad verecundiam', 'Post hoc fallacy'], answer: 'Appeal to authority / Ad verecundiam', cat: '📖 English' },
  ],
};

export function getRandomOlympiadQuestions(yearKey, count = 15) {
  const pool = basePool[yearKey] || basePool['Year 3-4'];
  const pts = getOlympiadPoints(yearKey);
  const tagged = pool.map(q => ({ ...q, points: pts }));
  const shuffled = [...tagged].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(q => ({
    ...q,
    options: [...q.options].sort(() => Math.random() - 0.5),
  }));
}
