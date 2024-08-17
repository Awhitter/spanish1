// Function to normalize text (remove extra spaces, lowercase, and remove accents)
export function normalizeText(text) {
  return text.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Function to check if the answer is correct
export function isAnswerCorrect(userAnswer, acceptableAnswers, keywords) {
  const normalizedUserAnswer = normalizeText(userAnswer);
  
  // Check if the user's answer matches any of the acceptable answers
  const exactMatch = acceptableAnswers.some(answer => normalizeText(answer) === normalizedUserAnswer);
  if (exactMatch) return true;

  // Check if all keywords are present in the user's answer
  const allKeywordsPresent = keywords.every(keyword => 
    normalizedUserAnswer.includes(normalizeText(keyword))
  );

  return allKeywordsPresent;
}