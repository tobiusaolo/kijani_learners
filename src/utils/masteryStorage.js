const KEY = 'kijani_mastery';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { quizBest: {}, totalSeconds: 0 };
  } catch {
    return { quizBest: {}, totalSeconds: 0 };
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function recordQuizScore(quizId, score) {
  const data = read();
  const id = String(quizId);
  const prev = data.quizBest[id];
  if (prev === undefined || score > prev) {
    data.quizBest[id] = score;
    write(data);
  }
}

export function recordActivitySeconds(seconds = 30) {
  const data = read();
  data.totalSeconds = (data.totalSeconds || 0) + Math.max(0, seconds);
  write(data);
}

export function getMasterySnapshot() {
  const data = read();
  const scores = Object.values(data.quizBest || {});
  const avgQuiz =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;
  const totalMinutes = Math.round((data.totalSeconds || 0) / 60);
  return { avgQuiz, totalMinutes, quizCount: scores.length };
}
