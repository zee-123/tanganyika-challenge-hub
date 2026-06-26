export function getReadingPoints(yearKey) {
  const pts = { Reception: 10, 'Year 1-2': 15, 'Year 3-4': 20, 'Year 5-6': 25, 'Year 7-8': 30 };
  return pts[yearKey] || 15;
}

export const readingPool = {
  Reception: [
    {
      id: 'r_rec_1',
      title: 'The Red Ball',
      passage: 'Tom has a red ball. He plays with it every day. The ball is big and round. Tom kicks the ball to his dog. The dog runs after the ball. They play in the garden.',
      questions: [
        { q: 'What colour is the ball?', options: ['Blue', 'Red', 'Green', 'Yellow'], answer: 'Red' },
        { q: 'Who does Tom kick the ball to?', options: ['His cat', 'His friend', 'His dog', 'His mum'], answer: 'His dog' },
        { q: 'Where do they play?', options: ['At school', 'In the park', 'In the garden', 'At the beach'], answer: 'In the garden' },
        { q: 'What shape is the ball?', options: ['Square', 'Round', 'Flat', 'Long'], answer: 'Round' },
        { q: 'What does Tom do with the ball every day?', options: ['Reads it', 'Eats it', 'Plays with it', 'Sleeps with it'], answer: 'Plays with it' },
      ],
    },
    {
      id: 'r_rec_2',
      title: 'My Cat',
      passage: 'I have a cat. Her name is Mia. She is white with black spots. Mia likes to sleep on my bed. She drinks milk and eats fish. I love my cat very much.',
      questions: [
        { q: "What is the cat's name?", options: ['Lily', 'Mia', 'Dot', 'Snow'], answer: 'Mia' },
        { q: 'What colours is the cat?', options: ['All black', 'All white', 'White with black spots', 'Brown'], answer: 'White with black spots' },
        { q: 'Where does Mia like to sleep?', options: ['On the floor', 'On the sofa', 'On my bed', 'Outside'], answer: 'On my bed' },
        { q: 'What does Mia drink?', options: ['Water', 'Juice', 'Milk', 'Tea'], answer: 'Milk' },
        { q: 'What does Mia eat?', options: ['Chicken', 'Rice', 'Vegetables', 'Fish'], answer: 'Fish' },
      ],
    },
  ],
  'Year 1-2': [
    {
      id: 'r_y12_1',
      title: 'The Seasons',
      passage: 'There are four seasons in a year. They are spring, summer, autumn and winter. In spring, flowers bloom and birds sing. Summer is hot and sunny. Autumn brings red and yellow leaves. Winter is cold, and sometimes it snows. Each season is special in its own way.',
      questions: [
        { q: 'How many seasons are there in a year?', options: ['Two', 'Three', 'Four', 'Five'], answer: 'Four' },
        { q: 'What happens in spring?', options: ['It snows', 'Flowers bloom', 'Leaves fall', 'It is very hot'], answer: 'Flowers bloom' },
        { q: 'Which season is hot and sunny?', options: ['Spring', 'Summer', 'Autumn', 'Winter'], answer: 'Summer' },
        { q: 'What colour are autumn leaves?', options: ['Blue and green', 'Pink and purple', 'Red and yellow', 'Black and white'], answer: 'Red and yellow' },
        { q: 'What sometimes happens in winter?', options: ['Rain', 'Thunder', 'Snow', 'Wind'], answer: 'Snow' },
      ],
    },
    {
      id: 'r_y12_2',
      title: 'A Trip to the Market',
      passage: 'On Saturday, Amina went to the market with her mother. The market was busy and colourful. They bought tomatoes, onions and mangoes. Amina saw a man selling fish. The fish smelled very fresh. Her mother bought two big fish for dinner. Amina enjoyed the trip very much.',
      questions: [
        { q: 'Who did Amina go to the market with?', options: ['Her father', 'Her friend', 'Her mother', 'Her teacher'], answer: 'Her mother' },
        { q: 'What day did they go to the market?', options: ['Sunday', 'Monday', 'Friday', 'Saturday'], answer: 'Saturday' },
        { q: 'Which fruit did they buy?', options: ['Bananas', 'Mangoes', 'Oranges', 'Apples'], answer: 'Mangoes' },
        { q: 'What did her mother buy from the fish seller?', options: ['One small fish', 'Three fish', 'Two big fish', 'A packet of fish'], answer: 'Two big fish' },
        { q: 'How did the fish smell?', options: ['Bad', 'Sweet', 'Very fresh', 'Strange'], answer: 'Very fresh' },
      ],
    },
  ],
  'Year 3-4': [
    {
      id: 'r_y34_1',
      title: 'The Water Cycle',
      passage: 'The water cycle is the journey water takes as it moves around the Earth. The sun heats water in oceans, rivers and lakes. This water evaporates and rises into the sky as water vapour. High up in the atmosphere, water vapour cools and forms clouds through a process called condensation. When clouds become heavy with water droplets, rain or snow falls back to Earth — this is called precipitation. The water then flows into rivers and oceans, and the cycle begins again.',
      questions: [
        { q: 'What heats water in the water cycle?', options: ['Wind', 'The moon', 'The sun', 'Fire'], answer: 'The sun' },
        { q: 'What is it called when water rises into the sky as vapour?', options: ['Condensation', 'Precipitation', 'Evaporation', 'Irrigation'], answer: 'Evaporation' },
        { q: 'What forms when water vapour cools in the atmosphere?', options: ['Rain', 'Ice', 'Clouds', 'Steam'], answer: 'Clouds' },
        { q: 'What is precipitation?', options: ['Water heating up', 'Rain or snow falling', 'Water flowing in rivers', 'Clouds forming'], answer: 'Rain or snow falling' },
        { q: 'Where does water flow after it falls as rain?', options: ['Into the sky', 'Underground only', 'Into rivers and oceans', 'Into clouds'], answer: 'Into rivers and oceans' },
      ],
    },
    {
      id: 'r_y34_2',
      title: 'Endangered Animals',
      passage: 'Many animals around the world are in danger of disappearing forever. These animals are called endangered species. The main causes are habitat loss, pollution, hunting and climate change. In Africa, elephants are threatened because people hunt them for their ivory tusks. Mountain gorillas are endangered because forests are being cut down. Governments and conservation groups are working hard to protect these animals by creating nature reserves and passing strict laws against poaching.',
      questions: [
        { q: 'What does "endangered" mean?', options: ['Very fast animals', 'Animals in danger of disappearing', 'Very large animals', 'Animals that attack humans'], answer: 'Animals in danger of disappearing' },
        { q: 'Why are elephants threatened?', options: ['Because of floods', 'Because people hunt them for ivory', 'Because they eat too much', 'Because of disease'], answer: 'Because people hunt them for ivory' },
        { q: 'Why are mountain gorillas endangered?', options: ['Pollution in water', 'Forests being cut down', 'Hunting for fur', 'Climate change only'], answer: 'Forests being cut down' },
        { q: 'What is one way to protect endangered animals?', options: ['Moving them to zoos only', 'Ignoring the problem', 'Creating nature reserves', 'Reducing food supply'], answer: 'Creating nature reserves' },
        { q: 'What is poaching?', options: ['Legal hunting', 'Cooking eggs', 'Illegal hunting of animals', 'Feeding wild animals'], answer: 'Illegal hunting of animals' },
      ],
    },
  ],
  'Year 5-6': [
    {
      id: 'r_y56_1',
      title: 'The Rise of AI',
      passage: 'Artificial Intelligence, or AI, refers to computer systems that can perform tasks that normally require human intelligence. These tasks include recognising speech, translating languages, identifying images and making decisions. AI is already part of our daily lives through virtual assistants like Siri, recommendation systems on streaming platforms, and facial recognition on smartphones. While AI offers enormous benefits — from medical diagnosis to climate modelling — it also raises serious concerns about privacy, job displacement and ethical decision-making. As AI develops rapidly, society must decide how to harness its power responsibly.',
      questions: [
        { q: 'What does AI stand for?', options: ['Automatic Instruction', 'Artificial Intelligence', 'Advanced Internet', 'Automated Interface'], answer: 'Artificial Intelligence' },
        { q: 'Which of these is an example of AI in daily life?', options: ['A bicycle', 'A pencil', 'Virtual assistants like Siri', 'A cooking pot'], answer: 'Virtual assistants like Siri' },
        { q: 'What is one benefit of AI mentioned in the passage?', options: ['Creating more traffic', 'Medical diagnosis', 'Replacing governments', 'Reducing food production'], answer: 'Medical diagnosis' },
        { q: 'What is one concern about AI?', options: ['It is too slow', 'It cannot use electricity', 'Job displacement', 'It does not speak English'], answer: 'Job displacement' },
        { q: 'According to the passage, what must society decide?', options: ['How to ban AI', 'How to use AI responsibly', 'How to slow down technology', 'How to build robots'], answer: 'How to use AI responsibly' },
      ],
    },
    {
      id: 'r_y56_2',
      title: 'Tanzania: A Nation of Diversity',
      passage: "Tanzania is one of Africa's most diverse nations, home to more than 120 different ethnic groups. It lies on the eastern coast of Africa, bordered by Kenya, Uganda, Rwanda, Burundi, the Democratic Republic of Congo, Zambia, Malawi and Mozambique. Tanzania's geography is equally remarkable — from the vast Serengeti plains and the peaks of Mount Kilimanjaro (Africa's highest mountain at 5,895 metres) to the pristine beaches of Zanzibar. The official languages are Swahili and English. The country gained independence from British rule in 1961, led by Julius Nyerere, who became the nation's first president.",
      questions: [
        { q: 'How many ethnic groups does Tanzania have?', options: ['More than 50', 'Exactly 100', 'More than 120', 'Fewer than 80'], answer: 'More than 120' },
        { q: 'What is the height of Mount Kilimanjaro?', options: ['4,200 metres', '5,895 metres', '6,500 metres', '3,950 metres'], answer: '5,895 metres' },
        { q: "What are Tanzania's official languages?", options: ['French and English', 'Swahili and Arabic', 'Swahili and English', 'English and Portuguese'], answer: 'Swahili and English' },
        { q: 'When did Tanzania gain independence?', options: ['1945', '1955', '1961', '1975'], answer: '1961' },
        { q: "Who was Tanzania's first president?", options: ['Nelson Mandela', 'Julius Nyerere', 'Jomo Kenyatta', 'Kwame Nkrumah'], answer: 'Julius Nyerere' },
      ],
    },
  ],
  'Year 7-8': [
    {
      id: 'r_y78_1',
      title: 'Climate Change and Africa',
      passage: 'Africa is considered one of the most vulnerable continents to the effects of climate change, despite contributing least to global greenhouse gas emissions. Rising temperatures are intensifying droughts in the Sahel region, threatening food security for millions. Coastal cities like Dar es Salaam and Mombasa face growing risks from sea-level rise and increasingly severe storm surges. Scientists warn that without immediate action to reduce carbon emissions globally, African nations will experience more frequent extreme weather events, reduced agricultural yields and mass displacement of populations. African leaders have repeatedly called on industrialised nations to take greater responsibility and provide climate finance for adaptation measures.',
      questions: [
        { q: 'Why is Africa particularly affected by climate change?', options: ['Because it is the largest continent', 'Despite contributing least to emissions', 'Because it has the most people', 'Because it is near the equator'], answer: 'Despite contributing least to emissions' },
        { q: 'What threat does rising temperature pose in the Sahel?', options: ['Too much rainfall', 'Food security through drought', 'Flooding of cities', 'Deforestation only'], answer: 'Food security through drought' },
        { q: 'Which African cities are mentioned as facing sea-level rise?', options: ['Cairo and Lagos', 'Nairobi and Kigali', 'Dar es Salaam and Mombasa', 'Accra and Abuja'], answer: 'Dar es Salaam and Mombasa' },
        { q: 'What are African leaders calling for?', options: ['Military support', 'More tourism', 'Climate finance from industrialised nations', 'Trade agreements'], answer: 'Climate finance from industrialised nations' },
        { q: 'What does "adaptation measures" likely mean?', options: ['Ignoring climate change', 'Actions to cope with the effects of climate change', 'Building more factories', 'Stopping all farming'], answer: 'Actions to cope with the effects of climate change' },
      ],
    },
    {
      id: 'r_y78_2',
      title: 'The Swahili Coast',
      passage: "The Swahili Coast stretches along East Africa's Indian Ocean shoreline, spanning modern-day Somalia, Kenya, Tanzania and Mozambique. For over a thousand years, it was a thriving hub of maritime trade connecting Africa, the Arabian Peninsula, Persia, India and China. Merchants traded gold, ivory, enslaved people, spices and textiles. The Swahili language itself is evidence of this cultural exchange — a Bantu language enriched with Arabic, Persian and Portuguese loanwords. Great city-states such as Kilwa Kisiwani, Mombasa and Zanzibar rose to power through control of trade routes. Kilwa, at its height, was described by the explorer Ibn Battuta as one of the most beautiful cities in the world.",
      questions: [
        { q: 'Which ocean borders the Swahili Coast?', options: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean'], answer: 'Indian Ocean' },
        { q: 'The Swahili language is based on which language family?', options: ['Arabic', 'Bantu', 'Persian', 'Portuguese'], answer: 'Bantu' },
        { q: 'Which explorer described Kilwa as beautiful?', options: ['Vasco da Gama', 'Ibn Battuta', 'Marco Polo', 'Christopher Columbus'], answer: 'Ibn Battuta' },
        { q: 'Which of these was NOT mentioned as a trade good?', options: ['Gold', 'Ivory', 'Cotton cloth', 'Spices'], answer: 'Cotton cloth' },
        { q: 'What does the passage suggest about the Swahili language?', options: ['It was invented in Arabia', 'It was a pure African language', 'It shows influence from many cultures', 'It was recently created'], answer: 'It shows influence from many cultures' },
      ],
    },
  ],
};

export function getRandomPassage(pool) {
  const arr = pool || [];
  return arr[Math.floor(Math.random() * arr.length)];
}
