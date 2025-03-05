document.addEventListener('DOMContentLoaded', function() {
  // Initialize multiplayer room connection
  const room = new WebsimSocket();
  
  // Global state
  const state = {
    currentTheme: 'neon-city',
    currentPersonality: 'glitch-ai',
    currentMode: '5-question',
    currentCategory: 'anything', 
    currentQuestion: 1,
    totalQuestions: 5,
    confidence: 12,
    responses: [],
    creatorUsername: null,
    users: {},
    questions: [],
    possibleAnswers: [],
    currentAnswer: null,
    gameState: 'not-started', 
    previousGuesses: [], // Track previous guesses
    wrongGuesses: 0, // Track number of wrong guesses
  };
  
  // Element references
  const elements = {
    screens: {
      splash: document.getElementById('splash-screen'),
      game: document.getElementById('game-screen'),
      result: document.getElementById('result-screen')
    },
    question: {
      number: document.getElementById('question-number'),
      text: document.getElementById('question-text')
    },
    confidence: {
      meter: document.querySelector('.confidence-fill'),
      value: document.getElementById('confidence-value'),
      circle: document.querySelector('.confidence-circle'),
      percentage: document.querySelector('.confidence-percentage')
    },
    buttons: {
      start: document.getElementById('start-game'),
      yes: document.querySelector('.yes-button'),
      maybe: document.querySelector('.maybe-button'),
      no: document.querySelector('.no-button'),
      correct: document.getElementById('correct-button'),
      wrong: document.getElementById('wrong-button'),
      share: document.getElementById('share-result'),
      playAgain: document.getElementById('play-again'),
      returnHome: document.getElementById('return-home')
    },
    result: {
      answer: document.getElementById('result-answer')
    },
    background: {
      gradient: document.getElementById('background-gradient'),
      particles: document.getElementById('background-particles')
    },
    themeOptions: document.querySelectorAll('.theme-option'),
    personalityOptions: document.querySelectorAll('.personality-option'),
    modeOptions: document.querySelectorAll('.mode-option'),
    categoryOptions: document.querySelectorAll('.category-option') 
  };
  
  // Theme definitions
  const themes = {
    'neon-city': {
      primary: '#00eeff',
      secondary: '#ff00dd',
      tertiary: '#ffcc00',
      background: '#090922',
      primaryRGB: '0, 238, 255',
      secondaryRGB: '255, 0, 221'
    },
    'y2k-cyber': {
      primary: '#00ff9e',
      secondary: '#0066ff',
      tertiary: '#ff6600',
      background: '#000033',
      primaryRGB: '0, 255, 158',
      secondaryRGB: '0, 102, 255'
    },
    'glitch-mode': {
      primary: '#ff0055',
      secondary: '#00ffaa',
      tertiary: '#0088ff',
      background: '#1a0033',
      primaryRGB: '255, 0, 85',
      secondaryRGB: '0, 255, 170'
    },
    'glass-holo': {
      primary: '#ffffff',
      secondary: '#00aaff',
      tertiary: '#ffaa00',
      background: '#001133',
      primaryRGB: '255, 255, 255',
      secondaryRGB: '0, 170, 255'
    }
  };
  
  // Personality definitions for AI responses
  const personalities = {
    'glitch-ai': {
      prefix: [
        "Analyzing data stream...",
        "Processing neural patterns...",
        "Scanning thought matrix...",
        "Calculating probability vectors..."
      ],
      questions: {
        general: [
          "Is your entity capable of autonomous movement?",
          "Does your concept exist primarily in digital space?",
          "Is this entity known to more than 50% of humans?",
          "Was this entity created after the year 2000?",
          "Does this entity have a physical manifestation?",
          "Would this entity be classified as dangerous?",
          "Is this concept associated with entertainment?",
          "Does this entity consume energy to function?",
          "Is this entity larger than a standard microwave?",
          "Can this entity be found in a typical household?",
          "Does this entity make audible sounds?",
          "Is this entity primarily made of organic materials?",
          "Would this entity be considered valuable by most people?",
          "Is this entity created by humans?",
          "Can this entity be controlled remotely?",
          "Does this entity have multiple distinct parts?",
          "Does this entity serve a specific function or purpose?",
          "Is this entity older than 50 years?",
          "Does this entity change its appearance over time?",
          "Is this entity used daily by many people?",
          "Would finding this in your bed be scary?",
          "Is this entity available globally?",
          "Does this entity require special knowledge to use?"
        ],
        person: [
          "Is this person currently alive?",
          "Is this person female?",
          "Is this person known primarily for entertainment?",
          "Is this person from North America?",
          "Has this person been famous for more than 20 years?",
          "Is this person associated with politics?",
          "Is this person under 40 years old?",
          "Is this person known for their scientific contributions?",
          "Did this person become famous in the last decade?",
          "Does this person have notable facial hair?",
          "Is this person an athlete or known for sports?",
          "Does this person have children?",
          "Has this person won major awards in their field?",
          "Is this person controversial?",
          "Does this person speak English as their primary language?",
          "Does this person have a distinctive style of dress?",
          "Is this person frequently in the news?",
          "Does this person have significant social media presence?",
          "Is this person known for creating something specific?",
          "Does this person have a recognizable logo or symbol?",
          "Is this person associated with a specific company or brand?",
          "Does this person appear in movies or TV shows?",
          "Is this person known for their wealth?",
          "Does this person have a unique physical characteristic?",
          "Has this person written books or published works?"
        ],
        object: [
          "Is this object smaller than a bread box?",
          "Is this object electronic?",
          "Is this object primarily used for entertainment?",
          "Does this object serve a practical function?",
          "Is this object typically found in kitchens?",
          "Can this object be carried by one person?",
          "Does this object require electricity to function?",
          "Is this object made primarily of metal?",
          "Is this object manufactured in large quantities?",
          "Has this object existed for more than 100 years?",
          "Is this object typically used outdoors?",
          "Does this object have moving parts?",
          "Is this object available in different colors?",
          "Would this object be considered expensive?",
          "Is this object fragile or easily broken?",
          "Is this object used primarily by adults?",
          "Does this object make noise when used?",
          "Is this object associated with a specific season?",
          "Can this object be consumed or is it edible?",
          "Is this object sold in supermarkets?",
          "Does this object need regular maintenance?",
          "Is this object waterproof?",
          "Is this object considered fashionable?",
          "Is this object associated with a specific hobby?",
          "Would this object be considered dangerous?"
        ]
      },
      guessPrefix: [
        "Neural algorithms converging on...",
        "Pattern recognition complete...",
        "Datapoints indicate high probability of...",
        "Quantum analysis suggests..."
      ]
    },
    'playful': {
      prefix: [
        "Hmm, let me think...",
        "Oh, this is interesting!",
        "Let's see what you're hiding...",
        "My brain cells are tingling..."
      ],
      questions: {
        general: [
          "Is this thing something you could fit in a backpack?",
          "Would you invite this to a dinner party?",
          "If this thing could talk, would it be annoying?",
          "Does this thing make people happy generally?",
          "Would finding this in your bed be scary?",
          "Could a child understand what this is?",
          "Is this something your grandparents would recognize?",
          "If this thing disappeared forever, would people panic?",
          "Would this thing be welcome at a fancy restaurant?",
          "Does this thing have a smell?",
          "If you dropped this thing, would it break?",
          "Is this thing something you'd show off to friends?",
          "Could this thing fit through a standard doorway?",
          "Would this thing be useful during a zombie apocalypse?",
          "Does this thing make a good gift?",
          "Would your pet be interested in this thing?",
          "If this thing cost $1000, would people still buy it?",
          "Is this thing something people argue about?",
          "Could you take a selfie with this thing?",
          "Would finding this in your food be disturbing?",
          "Does this thing have fans or enthusiasts?",
          "Would aliens be confused by this thing?",
          "Is this thing mentioned in pop songs?"
        ],
        person: [
          "Would you want this person at your birthday party?",
          "Does this person make you laugh?",
          "Would your parents approve of this person?",
          "Does this person have a distinctive hairstyle?",
          "Would you recognize this person in pajamas?",
          "Is this person someone kids look up to?",
          "Would this person be good in a crisis?",
          "Does this person have catchphrases people quote?",
          "Would this person be fun on a road trip?",
          "Does this person have haters?",
          "Is this person someone you'd want to take a selfie with?",
          "Would you trust this person with a secret?",
          "Does this person post too much on social media?",
          "Would this person be good at karaoke?",
          "Does this person have a signature look?",
          "Would you want this person as your boss?",
          "Is this person someone your grandma would recognize?",
          "Does this person have merchandise with their face on it?",
          "Would this person be interesting at a dinner party?",
          "Does this person have a memorable voice?",
          "Would this person survive in a horror movie?",
          "Is this person considered attractive by many people?",
          "Does this person have a rags-to-riches story?",
          "Would this person be good at giving advice?",
          "Is this person someone people dress up as for Halloween?"
        ],
        object: [
          "Would this object make a funny hat?",
          "Is this object something parents hide from their kids?",
          "Does this object spark joy?",
          "Would finding this in your soup be concerning?",
          "Is this object something you'd rescue from a fire?",
          "Does this object make interesting noises?",
          "Would this object be useful on a desert island?",
          "Is this object something you'd be embarrassed to buy?",
          "Does this object have a funny or weird name?",
          "Would this object make a good pet toy?",
          "Is this object something people collect?",
          "Would this object look good on a t-shirt?",
          "Does this object have a specific smell?",
          "Would this object be good for pranking someone?",
          "Is this object featured in memes?",
          "Would your grandma be confused by this object?",
          "Does this object come in fun colors?",
          "Would dropping this object make a big mess?",
          "Is this object something people argue about how to use?",
          "Does this object have knock-off versions?",
          "Would this object be funny if it were giant-sized?",
          "Is this object mentioned in song lyrics?",
          "Does this object have a seasonal version?",
          "Would this object be confusing to someone from 100 years ago?",
          "Is this object something you'd find in a treasure chest?"
        ]
      },
      guessPrefix: [
        "Aha! I bet you're thinking of...",
        "My crystal ball says it's...",
        "Drumroll please! It's...",
        "Let me amaze you! It's..."
      ]
    },
    'classic': {
      prefix: [
        "Considering the possibilities...",
        "Analyzing your responses...",
        "Evaluating the information...",
        "Interpreting the data..."
      ],
      questions: {
        general: [
          "Is the entity you're thinking of alive?",
          "Is this something used in everyday life?",
          "Is this larger than a microwave oven?",
          "Is this associated with a specific country?",
          "Would you find this indoors typically?",
          "Has this existed for more than 100 years?",
          "Is this related to technology?",
          "Is this something that many people own?",
          "Is this entity made of multiple materials?",
          "Does this entity serve a specific purpose?",
          "Is this entity available worldwide?",
          "Is this entity manufactured by humans?",
          "Does this entity have cultural significance?",
          "Is this entity affected by weather?",
          "Does this entity require maintenance?",
          "Is this entity associated with a specific profession?",
          "Does this entity come in different varieties?",
          "Is this entity used more often than weekly?",
          "Does this entity make noise?",
          "Is this entity considered valuable?",
          "Does this entity change over time?",
          "Is this entity heavier than 5 kilograms?",
          "Would this entity be found in a museum?"
        ],
        person: [
          "Is this person currently living?",
          "Is this person female?",
          "Is this person over 40 years old?",
          "Is this person known internationally?",
          "Is this person involved in entertainment?",
          "Is this person considered controversial?",
          "Has this person been famous for more than 10 years?",
          "Does this person have children?",
          "Is this person known for a specific achievement?",
          "Does this person appear frequently in media?",
          "Is this person associated with a specific country?",
          "Does this person have a distinctive physical feature?",
          "Is this person involved in politics?",
          "Has this person written books?",
          "Is this person associated with a specific organization?",
          "Does this person perform in front of audiences?",
          "Is this person considered wealthy?",
          "Has this person won major awards?",
          "Is this person active on social media?",
          "Is this person known for their opinions or ideas?",
          "Does this person have siblings in the public eye?",
          "Is this person considered a role model?",
          "Has this person faced significant public challenges?",
          "Is this person's appearance part of their public image?",
          "Does this person have a documented personal history?"
        ],
        object: [
          "Is this object smaller than a shoebox?",
          "Is this object electronic or electrical?",
          "Is this object used for practical purposes?",
          "Is this object typically found in homes?",
          "Is this object made primarily of plastic?",
          "Does this object require power to function?",
          "Is this object manufactured industrially?",
          "Has this object existed for more than 50 years?",
          "Is this object used by people of all ages?",
          "Does this object serve a single main purpose?",
          "Is this object sold in stores?",
          "Does this object require skill to use properly?",
          "Is this object considered necessary for modern life?",
          "Does this object have moving parts?",
          "Can this object be personalized or customized?",
          "Is this object disposable?",
          "Does this object come with instructions?",
          "Is this object used in professional settings?",
          "Does this object improve quality of life?",
          "Is this object regulated by standards?",
          "Does this object require maintenance?",
          "Is this object available in different designs?",
          "Does this object interact with other objects?",
          "Is this object considered expensive?",
          "Could this object be considered collectible?"
        ]
      },
      guessPrefix: [
        "Based on your answers, I believe it's...",
        "My analysis indicates it's...",
        "The most likely answer is...",
        "I've determined that it's..."
      ]
    }
  };
  
  // Predefined answers database 
  const answersDatabase = [
    { name: "Smartphone", tags: ["technology", "electronic", "small", "modern", "communication"], category: "object" },
    { name: "Elon Musk", tags: ["person", "male", "billionaire", "tech", "entrepreneur", "famous"], category: "person" },
    { name: "Pizza", tags: ["food", "italian", "popular", "round", "takeout", "cheese"], category: "object" },
    { name: "Bitcoin", tags: ["digital", "currency", "investment", "technology", "modern"], category: "object" },
    { name: "Coffee", tags: ["drink", "hot", "caffeine", "brown", "popular", "morning"], category: "object" },
    { name: "Dog", tags: ["animal", "pet", "mammal", "loyal", "furry", "domesticated"], category: "object" },
    { name: "Amazon", tags: ["company", "online", "shopping", "tech", "global", "service"], category: "object" },
    { name: "Taj Mahal", tags: ["building", "monument", "india", "white", "historic", "tourist"], category: "object" },
    { name: "Moon", tags: ["celestial", "night", "space", "round", "natural", "silver"], category: "object" },
    { name: "Spider-Man", tags: ["fictional", "superhero", "marvel", "comics", "character", "red"], category: "person" },
    { name: "Taylor Swift", tags: ["person", "female", "singer", "famous", "musician", "american"], category: "person" },
    { name: "Skateboard", tags: ["sports", "equipment", "transportation", "youth", "wooden", "wheels"], category: "object" },
    { name: "Sunflower", tags: ["plant", "flower", "yellow", "tall", "seeds", "garden"], category: "object" },
    { name: "The Mona Lisa", tags: ["art", "painting", "famous", "historic", "museum", "smile"], category: "object" },
    { name: "YouTube", tags: ["website", "video", "platform", "entertainment", "online", "social"], category: "object" },
    { name: "Chocolate", tags: ["food", "sweet", "brown", "dessert", "cocoa", "candy"], category: "object" },
    { name: "Great Wall of China", tags: ["structure", "historic", "long", "china", "stone", "ancient"], category: "object" },
    { name: "Harry Potter", tags: ["fictional", "wizard", "book", "character", "magic", "british"], category: "person" },
    { name: "Mount Everest", tags: ["mountain", "tallest", "nature", "snow", "climb", "nepal"], category: "object" },
    { name: "Bicycle", tags: ["vehicle", "transportation", "wheels", "pedals", "exercise", "eco-friendly"], category: "object" },
    
    { name: "Barack Obama", tags: ["person", "male", "politics", "president", "american", "famous"], category: "person" },
    { name: "Beyoncé", tags: ["person", "female", "singer", "performer", "famous", "music"], category: "person" },
    { name: "Leonardo DiCaprio", tags: ["person", "male", "actor", "hollywood", "famous", "movies"], category: "person" },
    { name: "Albert Einstein", tags: ["person", "male", "scientist", "physics", "historic", "genius"], category: "person" },
    { name: "Oprah Winfrey", tags: ["person", "female", "tv", "media", "billionaire", "american"], category: "person" },
    { name: "Cristiano Ronaldo", tags: ["person", "male", "sports", "soccer", "athlete", "famous"], category: "person" },
    { name: "Bill Gates", tags: ["person", "male", "tech", "microsoft", "billionaire", "philanthropy"], category: "person" },
    { name: "Lady Gaga", tags: ["person", "female", "singer", "performer", "fashion", "music"], category: "person" },
    { name: "Stephen Hawking", tags: ["person", "male", "scientist", "physics", "wheelchair", "author"], category: "person" },
    { name: "Queen Elizabeth II", tags: ["person", "female", "royalty", "british", "monarch", "historic"], category: "person" },
    { name: "Michael Jordan", tags: ["person", "male", "sports", "basketball", "athlete", "iconic"], category: "person" },
    { name: "Cleopatra", tags: ["person", "female", "historic", "queen", "egyptian", "ancient"], category: "person" },
    { name: "Steve Jobs", tags: ["person", "male", "tech", "apple", "entrepreneur", "innovator"], category: "person" },
    { name: "Madonna", tags: ["person", "female", "singer", "icon", "music", "performer"], category: "person" },
    { name: "Nelson Mandela", tags: ["person", "male", "politics", "activist", "south african", "leader"], category: "person" },
    { name: "Meryl Streep", tags: ["person", "female", "actor", "hollywood", "award-winning", "movies"], category: "person" },
    { name: "Dwayne Johnson", tags: ["person", "male", "actor", "wrestler", "the rock", "movies"], category: "person" },
    { name: "Marie Curie", tags: ["person", "female", "scientist", "physics", "chemistry", "nobel"], category: "person" },
    { name: "Muhammad Ali", tags: ["person", "male", "sports", "boxing", "activist", "champion"], category: "person" },
    { name: "Adele", tags: ["person", "female", "singer", "british", "music", "grammy"], category: "person" },
    
    { name: "Refrigerator", tags: ["appliance", "kitchen", "cold", "food", "storage", "electric"], category: "object" },
    { name: "Book", tags: ["object", "reading", "paper", "literature", "information", "portable"], category: "object" },
    { name: "Television", tags: ["electronic", "entertainment", "screen", "media", "device", "living room"], category: "object" },
    { name: "Guitar", tags: ["instrument", "music", "strings", "wood", "entertainment", "acoustic"], category: "object" },
    { name: "Airplane", tags: ["vehicle", "transportation", "flying", "travel", "large", "sky"], category: "object" },
    { name: "Camera", tags: ["device", "photography", "images", "electronic", "lens", "memory"], category: "object" },
    { name: "Diamond", tags: ["gem", "jewelry", "valuable", "clear", "hard", "rare"], category: "object" },
    { name: "Soccer Ball", tags: ["sports", "equipment", "round", "game", "football", "outdoor"], category: "object" },
    { name: "Umbrella", tags: ["accessory", "rain", "weather", "protection", "portable", "handle"], category: "object" },
    { name: "Clock", tags: ["device", "time", "measurement", "wall", "hours", "minutes"], category: "object" },
    { name: "Headphones", tags: ["device", "audio", "music", "electronic", "ears", "sound"], category: "object" },
    { name: "Toothbrush", tags: ["hygiene", "bathroom", "teeth", "cleaning", "daily", "small"], category: "object" },
    { name: "Sword", tags: ["weapon", "metal", "historic", "blade", "war", "sharp"], category: "object" },
    { name: "Microscope", tags: ["scientific", "instrument", "magnification", "laboratory", "research", "small"], category: "object" },
    { name: "Chair", tags: ["furniture", "sitting", "wood", "legs", "back", "indoor"], category: "object" },
    { name: "Piano", tags: ["instrument", "music", "keys", "large", "classical", "sound"], category: "object" },
    { name: "Lightbulb", tags: ["electric", "light", "glass", "invention", "edison", "illumination"], category: "object" },
    { name: "Shoes", tags: ["clothing", "footwear", "walking", "fashion", "feet", "pair"], category: "object" },
    { name: "Backpack", tags: ["accessory", "storage", "travel", "school", "portable", "straps"], category: "object" },
    { name: "Wine", tags: ["beverage", "alcohol", "grape", "bottle", "social", "glass"], category: "object" }
  ];
  
  // Initialize particles
  let scene, camera, renderer, particles;
  
  function initParticles() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    elements.background.particles.appendChild(renderer.domElement);
    
    // Create particles
    const particleCount = 500;
    const particles_geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color = new THREE.Color();
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim();
    color.set(themeColor || '#00eeff');
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    particles_geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles_geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particles_material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    particles = new THREE.Points(particles_geometry, particles_material);
    scene.add(particles);
    
    camera.position.z = 5;
    
    animate();
  }
  
  function animate() {
    requestAnimationFrame(animate);
    
    particles.rotation.x += 0.0003;
    particles.rotation.y += 0.0005;
    
    renderer.render(scene, camera);
  }
  
  // Apply theme
  function applyTheme(themeName) {
    const theme = themes[themeName];
    
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
    document.documentElement.style.setProperty('--theme-tertiary', theme.tertiary);
    document.documentElement.style.setProperty('--theme-background', theme.background);
    document.documentElement.style.setProperty('--theme-primary-rgb', theme.primaryRGB);
    document.documentElement.style.setProperty('--theme-secondary-rgb', theme.secondaryRGB);
    
    // Update particles color
    if (particles) {
      const color = new THREE.Color();
      color.set(theme.primary);
      
      const colors = particles.geometry.attributes.color.array;
      for (let i = 0; i < colors.length; i += 3) {
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }
      particles.geometry.attributes.color.needsUpdate = true;
    }
    
    state.currentTheme = themeName;
  }
  
  // Show screen
  function showScreen(screenName) {
    Object.keys(elements.screens).forEach(key => {
      elements.screens[key].classList.remove('active');
    });
    elements.screens[screenName].classList.add('active');
  }
  
  // Update confidence meter
  function updateConfidence(value) {
    state.confidence = value;
    elements.confidence.meter.style.width = `${value}%`;
    elements.confidence.value.textContent = `${value}%`;
    
    if (elements.confidence.circle) {
      const circumference = 2 * Math.PI * 45; 
      const dashoffset = circumference - (circumference * value / 100);
      elements.confidence.circle.style.strokeDashoffset = dashoffset;
      elements.confidence.percentage.textContent = `${value}%`;
    }
    
    // Update background color based on confidence
    const theme = themes[state.currentTheme];
    const r1 = parseInt(theme.background.slice(1, 3), 16);
    const g1 = parseInt(theme.background.slice(3, 5), 16);
    const b1 = parseInt(theme.background.slice(5, 7), 16);
    
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim();
    const r2 = parseInt(primaryColor.slice(1, 3), 16);
    const g2 = parseInt(primaryColor.slice(3, 5), 16);
    const b2 = parseInt(primaryColor.slice(5, 7), 16);
    
    const intensity = value / 100 * 0.3; 
    const r = Math.floor(r1 + (r2 - r1) * intensity);
    const g = Math.floor(g1 + (g2 - g1) * intensity);
    const b = Math.floor(b1 + (b2 - b1) * intensity);
    
    elements.background.gradient.style.background = `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, 0.8) 0%, ${theme.background} 70%, ${theme.background} 100%)`;
  }
  
  // Start the game
  function startGame() {
    state.currentQuestion = 1;
    state.confidence = 12;
    state.responses = [];
    state.gameState = 'in-progress';
    
    // Choose questions based on personality
    generateQuestionPool();
    
    // Update UI
    elements.question.number.textContent = `Question ${state.currentQuestion}/${state.totalQuestions}`;
    elements.question.text.textContent = getNextQuestion();
    updateConfidence(state.confidence);
    
    showScreen('game');
    
    // Notify other players
    room.send({
      type: 'game-started',
      mode: state.currentMode,
      player: room.party.client.username
    });
  }
  
  // Generate a pool of questions
  function generateQuestionPool() {
    state.questions = [];
    state.possibleAnswers = [...answersDatabase];
    
    // Filter answers by category if needed
    if (state.currentCategory !== 'anything') {
      state.possibleAnswers = state.possibleAnswers.filter(
        answer => answer.category === state.currentCategory
      );
    }
    
    // Choose questions based on personality and category
    const personalityQuestions = personalities[state.currentPersonality].questions;
    let questionPool;
    
    if (state.currentCategory === 'person') {
      questionPool = personalityQuestions.person;
    } else if (state.currentCategory === 'object') {
      questionPool = personalityQuestions.object;
    } else {
      questionPool = personalityQuestions.general;
    }
    
    // Shuffle and select questions
    const shuffled = questionPool.sort(() => 0.5 - Math.random());
    state.questions = shuffled.slice(0, state.totalQuestions);
  }
  
  // Get the next question
  function getNextQuestion() {
    const personality = personalities[state.currentPersonality];
    const prefix = personality.prefix[Math.floor(Math.random() * personality.prefix.length)];
    
    // If we have previous responses, try to ask a more targeted question
    if (state.responses.length > 0) {
      // Find common tags among remaining possible answers
      const tagFrequency = {};
      state.possibleAnswers.forEach(answer => {
        answer.tags.forEach(tag => {
          if (!tagFrequency[tag]) tagFrequency[tag] = 0;
          tagFrequency[tag]++;
        });
      });
      
      // Sort tags by frequency
      const sortedTags = Object.keys(tagFrequency).sort((a, b) => tagFrequency[b] - tagFrequency[a]);
      
      // Generate a targeted question based on common tags
      if (sortedTags.length > 0) {
        const topTag = sortedTags[0];
        
        // Find questions that might be related to this tag
        const personalityQuestions = personalities[state.currentPersonality].questions;
        let questionPool;
        
        if (state.currentCategory === 'person') {
          questionPool = personalityQuestions.person;
        } else if (state.currentCategory === 'object') {
          questionPool = personalityQuestions.object;
        } else {
          questionPool = personalityQuestions.general;
        }
        
        // Find questions related to the top tag
        const relatedQuestions = questionPool.filter(q => 
          q.toLowerCase().includes(topTag) || 
          Object.keys(keywordMap).some(key => 
            keywordMap[key].includes(topTag) && q.toLowerCase().includes(key)
          )
        );
        
        // If we have a related question, use it; otherwise use a question from the original pool
        if (relatedQuestions.length > 0) {
          // Avoid repeating questions
          const unusedQuestions = relatedQuestions.filter(q => 
            !state.questions.slice(0, state.currentQuestion - 1).includes(q)
          );
          
          if (unusedQuestions.length > 0) {
            // Replace the current question with a more targeted one
            state.questions[state.currentQuestion - 1] = unusedQuestions[0];
          }
        }
      }
    }
    
    return `${prefix} ${state.questions[state.currentQuestion - 1]}`;
  }
  
  // Process answer
  function processAnswer(answer) {
    state.responses.push({
      question: state.questions[state.currentQuestion - 1],
      answer: answer
    });
    
    // Filter possible answers based on the response
    filterPossibleAnswers(answer);
    
    // Update confidence based on remaining possibilities
    const newConfidence = Math.min(98, Math.max(5, Math.round(100 - (state.possibleAnswers.length * 5))));
    
    // Animate confidence meter
    let currentConfidence = state.confidence;
    const interval = setInterval(() => {
      if (currentConfidence < newConfidence) {
        currentConfidence++;
        updateConfidence(currentConfidence);
      } else if (currentConfidence > newConfidence) {
        currentConfidence--;
        updateConfidence(currentConfidence);
      } else {
        clearInterval(interval);
      }
    }, 30);
    
    // Notify other players
    room.send({
      type: 'answer-given',
      question: state.currentQuestion,
      answer: answer,
      confidence: newConfidence
    });
    
    // Move to next question or result
    if (state.currentQuestion < state.totalQuestions) {
      state.currentQuestion++;
      elements.question.number.textContent = `Question ${state.currentQuestion}/${state.totalQuestions}`;
      elements.question.text.textContent = getNextQuestion();
    } else {
      setTimeout(showResult, 1000);
    }
  }
  
  // Filter possible answers based on the response
  function filterPossibleAnswers(answer) {
    const question = state.questions[state.currentQuestion - 1].toLowerCase();
    const keywordMap = {
      'alive': ['living', 'alive', 'living being', 'life'],
      'movement': ['move', 'movement', 'autonomous'],
      'digital': ['digital', 'virtual', 'online', 'internet', 'electronic'],
      'famous': ['known', 'famous', 'popular', 'recognizable'],
      'modern': ['modern', 'recent', 'new', 'after'],
      'physical': ['physical', 'tangible', 'material', 'solid'],
      'dangerous': ['dangerous', 'harmful', 'hazardous', 'risky'],
      'entertainment': ['entertainment', 'fun', 'leisure', 'amusement'],
      'small': ['small', 'tiny', 'compact', 'fit', 'backpack'],
      'likeable': ['invite', 'dinner', 'party', 'likeable', 'pleasant'],
      'annoying': ['annoying', 'irritating', 'bothersome'],
      'happy': ['happy', 'joy', 'pleasant', 'positive'],
      'scary': ['scary', 'frightening', 'terrifying', 'bed'],
      'simple': ['child', 'understand', 'simple', 'basic'],
      'old': ['grandparents', 'recognize', 'old', 'traditional'],
      'everyday': ['everyday', 'daily', 'common', 'regular'],
      'large': ['larger', 'big', 'size', 'microwave'],
      'country': ['country', 'nation', 'geographic', 'location'],
      'indoors': ['indoors', 'inside', 'home', 'building'],
      'historic': ['existed', 'years', 'historic', 'ancient', 'old'],
      'technology': ['technology', 'tech', 'electronic', 'digital']
    };
    
    // Determine keywords in the question
    let relevantTags = [];
    for (const key in keywordMap) {
      if (keywordMap[key].some(keyword => question.includes(keyword))) {
        relevantTags.push(key);
      }
    }
    
    // For questions we couldn't categorize, use some fallback logic
    if (relevantTags.length === 0) {
      // Default filtering - keep 75% of answers for 'maybe', reduce by 40% for yes/no
      const randomFactor = answer === 'maybe' ? 0.75 : 0.6;
      state.possibleAnswers = state.possibleAnswers
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.max(1, Math.floor(state.possibleAnswers.length * randomFactor)));
      return;
    }
    
    // Create a map of relevant tag weights
    const tagWeights = {};
    answersDatabase.forEach(a => {
      a.tags.forEach(tag => {
        if (!tagWeights[tag]) tagWeights[tag] = 0;
        tagWeights[tag]++;
      });
    });
    
    // Score each possible answer
    state.possibleAnswers.forEach(a => {
      a.score = a.score || 0;
      let matchesFound = false;
      
      // Check for tag matches
      relevantTags.forEach(relevantTag => {
        // Find synonymous tags
        const synonyms = Object.keys(keywordMap).flatMap(k => 
          relevantTag === k ? keywordMap[k] : []
        );
        
        a.tags.forEach(tag => {
          if (tag === relevantTag || synonyms.includes(tag)) {
            matchesFound = true;
            // Positive answer boosts relevant tags, negative reduces them
            if (answer === 'yes') a.score += 2;
            else if (answer === 'no') a.score -= 3;
            else a.score += 0.5; // 'maybe' gives a small boost
          }
        });
      });
      
      // If no matches found, adjust score based on answer
      if (!matchesFound) {
        if (answer === 'yes') a.score -= 1;
        else if (answer === 'no') a.score += 0.5;
        // For 'maybe', no change
      }
    });
    
    // Filter based on scores
    state.possibleAnswers = state.possibleAnswers
      .filter(a => a.score >= -3) 
      .sort((a, b) => b.score - a.score); 
    
    // Limit to a reasonable number
    const limit = Math.max(1, Math.min(10, Math.floor(state.possibleAnswers.length * 0.7)));
    state.possibleAnswers = state.possibleAnswers.slice(0, limit);
  }
  
  // Show the result screen
  function showResult() {
    state.gameState = 'guessing';
    
    // Select the most likely answer that hasn't been guessed before
    let topAnswer;
    if (state.previousGuesses.length > 0) {
      // Filter out previously guessed answers
      const remainingAnswers = state.possibleAnswers.filter(
        answer => !state.previousGuesses.includes(answer.name)
      );
      
      topAnswer = remainingAnswers.length > 0 
        ? remainingAnswers[0].name 
        : answersDatabase.filter(a => !state.previousGuesses.includes(a.name))[0]?.name || "I give up!";
    } else {
      topAnswer = state.possibleAnswers.length > 0 
        ? state.possibleAnswers[0].name 
        : answersDatabase[Math.floor(Math.random() * answersDatabase.length)].name;
    }
    
    state.currentAnswer = topAnswer;
    state.previousGuesses.push(topAnswer);
    
    // Animation for revealing the answer
    const personality = personalities[state.currentPersonality];
    const prefix = personality.guessPrefix[Math.floor(Math.random() * personality.guessPrefix.length)];
    elements.result.answer.textContent = '';
    
    // Update result screen
    elements.confidence.percentage.textContent = `${state.confidence}%`;
    const circumference = 2 * Math.PI * 45;
    elements.confidence.circle.style.strokeDashoffset = circumference - (circumference * state.confidence / 100);
    
    // Text typing animation
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < topAnswer.length) {
        elements.result.answer.textContent += topAnswer.charAt(i);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);
    
    // If this is a subsequent guess, update the UI to show it's another attempt
    if (state.wrongGuesses > 0) {
      document.getElementById('result-title').textContent = `Let me try again! Is it...`;
    } else {
      document.getElementById('result-title').textContent = `I think you're thinking of...`;
    }
    
    showScreen('result');
    
    // Notify other players
    room.send({
      type: 'game-result',
      answer: topAnswer,
      confidence: state.confidence,
      attempt: state.wrongGuesses + 1
    });
  }
  
  // Event listeners
  function setupEventListeners() {
    // Theme selection
    elements.themeOptions.forEach(option => {
      option.addEventListener('click', function() {
        elements.themeOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        applyTheme(this.dataset.theme);
      });
    });
    
    // Personality selection
    elements.personalityOptions.forEach(option => {
      option.addEventListener('click', function() {
        elements.personalityOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        state.currentPersonality = this.dataset.personality;
      });
    });
    
    // Game mode selection
    elements.modeOptions.forEach(option => {
      option.addEventListener('click', function() {
        elements.modeOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        state.currentMode = this.dataset.mode;
        
        // Adjust total questions based on mode
        if (state.currentMode === '5-question') {
          state.totalQuestions = 5;
        } else if (state.currentMode === 'classic') {
          state.totalQuestions = 20; 
        } else {
          state.totalQuestions = 10; 
        }
      });
    });
    
    // Category selection
    elements.categoryOptions.forEach(option => {
      option.addEventListener('click', function() {
        elements.categoryOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        state.currentCategory = this.dataset.category;
      });
    });
    
    // Start game button
    elements.buttons.start.addEventListener('click', startGame);
    
    // Answer buttons
    elements.buttons.yes.addEventListener('click', () => processAnswer('yes'));
    elements.buttons.maybe.addEventListener('click', () => processAnswer('maybe'));
    elements.buttons.no.addEventListener('click', () => processAnswer('no'));
    
    // Result buttons
    elements.buttons.correct.addEventListener('click', () => {
      room.send({
        type: 'user-feedback',
        wasCorrect: true,
        answer: state.currentAnswer,
        attempts: state.wrongGuesses + 1
      });
      // Reset wrong guesses count
      state.wrongGuesses = 0;
      state.previousGuesses = [];
      showScreen('splash');
    });
    
    elements.buttons.wrong.addEventListener('click', () => {
      state.wrongGuesses++;
      
      if (state.wrongGuesses < 3) {
        // Try another guess by removing the current answer from possibles
        state.possibleAnswers = state.possibleAnswers.filter(
          answer => answer.name !== state.currentAnswer
        );
        
        // Add an additional question if available
        if (state.currentQuestion < 10) {  // Cap at 10 questions max
          state.currentQuestion++;
          state.totalQuestions++;
          elements.question.number.textContent = `Question ${state.currentQuestion}/${state.totalQuestions}`;
          
          // Get an additional question from the personality's questions
          const personalityQuestions = personalities[state.currentPersonality].questions;
          let questionPool;
          
          if (state.currentCategory === 'person') {
            questionPool = personalityQuestions.person;
          } else if (state.currentCategory === 'object') {
            questionPool = personalityQuestions.object;
          } else {
            questionPool = personalityQuestions.general;
          }
          
          // Find unused questions
          const usedQuestions = new Set(state.questions);
          const unusedQuestions = questionPool.filter(q => !usedQuestions.has(q));
          
          if (unusedQuestions.length > 0) {
            // Add a new question
            state.questions.push(unusedQuestions[0]);
            
            // Return to game screen for one more question
            showScreen('game');
            elements.question.text.textContent = getNextQuestion();
            return;
          }
        }
        
        // If we can't add a new question or we've reached the limit, try another guess
        showResult();
      } else {
        // After 3 wrong guesses, give up
        room.send({
          type: 'user-feedback',
          wasCorrect: false,
          answer: state.currentAnswer,
          attempts: state.wrongGuesses,
          gaveUp: true
        });
        // Reset for next game
        state.wrongGuesses = 0;
        state.previousGuesses = [];
        showScreen('splash');
      }
    });
    
    elements.buttons.playAgain.addEventListener('click', startGame);
    elements.buttons.returnHome.addEventListener('click', () => showScreen('splash'));
    
    // Share button
    elements.buttons.share.addEventListener('click', () => {
      room.send({
        type: 'shared-result',
        answer: state.currentAnswer,
        confidence: state.confidence,
        correct: null 
      });
    });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      if (renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }
  
  // Setup multiplayer events
  function setupMultiplayer() {
    // Handle messages from other users
    room.onmessage = (event) => {
      const data = event.data;
      
      switch (data.type) {
        case 'connected':
          console.log(`${data.username} connected`);
          break;
          
        case 'disconnected':
          console.log(`${data.username} disconnected`);
          break;
          
        case 'game-started':
          console.log(`${data.player} started a new game in ${data.mode} mode`);
          break;
          
        case 'answer-given':
          console.log(`Question ${data.question}: ${data.answer} (Confidence: ${data.confidence}%)`);
          break;
          
        case 'game-result':
          console.log(`Game ended. Answer: ${data.answer} (Confidence: ${data.confidence}%)`);
          break;
          
        case 'user-feedback':
          console.log(`User feedback: ${data.wasCorrect ? 'Correct' : 'Wrong'} (Answer: ${data.answer})`);
          break;
          
        case 'shared-result':
          console.log(`${data.username} shared their result: ${data.answer} (${data.confidence}%)`);
          break;
      }
    };
    
    // Keep track of connected users
    room.party.subscribe((peers) => {
      for (const clientId in peers) {
        const { username } = peers[clientId];
        state.users[clientId] = { username };
      }
    });
  }
  
  // Initialize
  async function init() {
    try {
      state.creatorUsername = (await window.websim.getCreatedBy()).username;
    } catch (e) {
      console.log("Couldn't get creator username", e);
    }
    
    initParticles();
    applyTheme(state.currentTheme);
    setupEventListeners();
    setupMultiplayer();
  }
  
  // Start the app
  init();
});

// Define keyword mapping for adaptive questions
const keywordMap = {
  'alive': ['living', 'alive', 'living being', 'life'],
  'movement': ['move', 'movement', 'autonomous'],
  'digital': ['digital', 'virtual', 'online', 'internet', 'electronic'],
  'famous': ['known', 'famous', 'popular', 'recognizable'],
  'modern': ['modern', 'recent', 'new', 'after'],
  'physical': ['physical', 'tangible', 'material', 'solid'],
  'dangerous': ['dangerous', 'harmful', 'hazardous', 'risky'],
  'entertainment': ['entertainment', 'fun', 'leisure', 'amusement'],
  'small': ['small', 'tiny', 'compact', 'fit', 'backpack'],
  'likeable': ['invite', 'dinner', 'party', 'likeable', 'pleasant'],
  'annoying': ['annoying', 'irritating', 'bothersome'],
  'happy': ['happy', 'joy', 'pleasant', 'positive'],
  'scary': ['scary', 'frightening', 'terrifying', 'bed'],
  'simple': ['child', 'understand', 'simple', 'basic'],
  'old': ['grandparents', 'recognize', 'old', 'traditional'],
  'everyday': ['everyday', 'daily', 'common', 'regular'],
  'large': ['larger', 'big', 'size', 'microwave'],
  'country': ['country', 'nation', 'geographic', 'location'],
  'indoors': ['indoors', 'inside', 'home', 'building'],
  'historic': ['existed', 'years', 'historic', 'ancient', 'old'],
  'technology': ['technology', 'tech', 'electronic', 'digital']
};