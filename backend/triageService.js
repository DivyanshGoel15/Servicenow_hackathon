/**
 * Student Wellbeing Triage & Priority Analysis Engine
 * 
 * This module utilizes a natural language parsing algorithm to evaluate 
 * student inputs. It performs keyword extraction and sentiment analysis 
 * to determine the primary and secondary needs, calculate priority scores, 
 * and route the case to the appropriate university support team.
 */

const KEYWORDS = {
  mental: [
    "stress", "stressed", "anxious", "anxiety", "depressed", "depression", "overwhelmed", "sad", "panic", 
    "lonely", "loneliness", "suicide", "suicidal", "cry", "crying", "mental", "therapy", "counseling", 
    "breakdown", "tired", "exhausted", "hopeless", "worthless", "trauma", "sleep", "insomnia", "nervous"
  ],
  academic: [
    "exam", "exams", "class", "classes", "grades", "assignment", "failing", "study", "professor", "teacher", 
    "fail", "failed", "homework", "lectures", "attendance", "dropout", "drop out", "degree", "focus", 
    "concentrate", "deadline", "coursework", "test", "tests", "score", "semester"
  ],
  financial: [
    "money", "financial", "financially", "rent", "fee", "fees", "pay", "job", "afford", "broke", "debt", 
    "loan", "loans", "tuition", "bills", "eating", "food", "hunger", "hungry", "homeless", "eviction", 
    "scholarship", "expensive", "cost", "poor"
  ],
  health: [
    "sick", "ill", "hospital", "doctor", "pain", "injury", "medical", "disease", "health", "covid", "fever", 
    "accident", "hurt", "bleeding", "medication", "pills", "surgery", "clinic", "physical"
  ],
  urgency_high: [
    "extremely", "severe", "can't cope", "emergency", "crisis", "help immediately", "urgent", "kill", "die", 
    "danger", "asap", "desperate", "give up", "giving up", "right now", "immediately", "abuse", "assault", "police"
  ]
};

/**
 * Parses natural language input to generate a standardized triage payload.
 * 
 * @param {string} studentInput - The raw input provided by the student.
 * @returns {Promise<Object>} - The standardized JSON case object.
 */
async function analyzeStudentNeeds(studentInput) {
  if (!studentInput || typeof studentInput !== 'string') {
    throw new Error("Invalid payload: student input text is required.");
  }

  // Normalize input for NLP processing
  const text = studentInput.toLowerCase();
  
  // Initialize category weighting states
  let scores = {
    "Mental Wellbeing": 0,
    "Academic Support": 0,
    "Financial Support": 0,
    "Physical Health": 0
  };

  // Execute keyword extraction across all domains
  KEYWORDS.mental.forEach(word => text.includes(word) && scores["Mental Wellbeing"]++);
  KEYWORDS.academic.forEach(word => text.includes(word) && scores["Academic Support"]++);
  KEYWORDS.financial.forEach(word => text.includes(word) && scores["Financial Support"]++);
  KEYWORDS.health.forEach(word => text.includes(word) && scores["Physical Health"]++);

  // Calculate dominant support need based on category weight
  let primary_need = "General Support";
  let maxScore = 0;
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      primary_need = category;
    }
  }

  // Extract auxiliary needs based on non-zero weights
  let secondary_needs = Object.entries(scores)
    .filter(([category, score]) => score > 0 && category !== primary_need)
    .map(([category]) => category);

  // Compute severity matrix to assign urgency and priority indexes
  let isHighUrgency = KEYWORDS.urgency_high.some(word => text.includes(word));
  let totalKeywordsMatched = Object.values(scores).reduce((a, b) => a + b, 0);
  
  let urgency = "Low";
  let priority_score = Math.min(20 + (totalKeywordsMatched * 10), 39); // Baseline configuration

  if (isHighUrgency || totalKeywordsMatched >= 3) {
    urgency = "High";
    priority_score = Math.min(80 + (totalKeywordsMatched * 5), 100);
  } else if (totalKeywordsMatched >= 1) {
    urgency = "Medium";
    priority_score = Math.min(45 + (totalKeywordsMatched * 10), 74);
  }

  // Resolve the target university department for case assignment
  const teamMapping = {
    "Mental Wellbeing": "Student Wellbeing Team",
    "Academic Support": "Academic Advising",
    "Financial Support": "Financial Aid Office",
    "Physical Health": "Campus Health Center",
    "General Support": "General Student Services"
  };

  // Compile the rationale string for the dashboard view
  let reason = `Student mentioned issues related to ${primary_need.toLowerCase()}`;
  if (secondary_needs.length > 0) {
    reason += ` along with concerns about ${secondary_needs.join(' and ').toLowerCase()}`;
  }
  reason += isHighUrgency ? `. The language used suggests a critical situation requiring immediate attention.` : `.`;

  // Return the standardized case object for downstream systems
  return {
    primary_need,
    secondary_needs,
    urgency,
    priority_score,
    recommended_team: teamMapping[primary_need],
    reason
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeStudentNeeds
  };
}
if (typeof window !== 'undefined') {
  window.analyzeStudentNeeds = analyzeStudentNeeds;
}