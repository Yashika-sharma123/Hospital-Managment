// Base weight per priority type. Emergency jumps furthest ahead,
// normal tokens get 0 extra weight — pure FIFO among themselves.
// Step 7 will extend this with a "waiting time" bonus so normal
// tokens are never starved indefinitely by a stream of priority ones.
const PRIORITY_WEIGHTS = {
  normal: 0,
  'senior-citizen': 50,
  pregnant: 60,
  emergency: 100,
};

function getBasePriorityScore(priorityType) {
  return PRIORITY_WEIGHTS[priorityType] ?? 0;
}

module.exports = { getBasePriorityScore, PRIORITY_WEIGHTS };
