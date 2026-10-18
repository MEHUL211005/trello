// Teamwork and productivity quotes used across the app
export const QUOTES = [
  {
    text: "Alone we can do so little; together we can do so much.",
    author: "Helen Keller",
  },
  {
    text: "Coming together is a beginning, staying together is progress, and working together is success.",
    author: "Henry Ford",
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "Great things in business are never done by one person. They're done by a team of people.",
    author: "Steve Jobs",
  },
  {
    text: "Plans are nothing; planning is everything.",
    author: "Dwight D. Eisenhower",
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    text: "Productivity is never an accident. It is always the result of a commitment to excellence.",
    author: "Paul J. Meyer",
  },
];

// The same quote all day, a different one tomorrow
export const quoteOfTheDay = () => {
  const dayNumber = Math.floor(Date.now() / 86400000);
  return QUOTES[dayNumber % QUOTES.length];
};

// Short, action-focused lines for the sidebar. A separate pool from QUOTES
// (the dashboard banner), so the two can never show the same quote.
export const SIDEBAR_QUOTES = [
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  {
    text: "Efficiency is doing things right; effectiveness is doing the right things.",
    author: "Peter Drucker",
  },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
];

export const sidebarQuote = () => {
  const dayNumber = Math.floor(Date.now() / 86400000);
  return SIDEBAR_QUOTES[dayNumber % SIDEBAR_QUOTES.length];
};
