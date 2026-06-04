import { showSuccess } from './swal';
import { pushNotification } from './notifications';

export function celebrateBadge(badge) {
  if (!badge) return;
  pushNotification({ title: badge.label, body: badge.desc, emoji: badge.emoji });
  showSuccess(`${badge.emoji} ${badge.label}`, badge.desc);
}

export function celebrateBadges(badges) {
  (badges || []).forEach((b, i) => {
    setTimeout(() => celebrateBadge(b), i * 400);
  });
}

export function celebrateQuizPass(score) {
  showSuccess('Quiz passed!', score != null ? `You scored ${score}%. On to the next step.` : 'Great work—keep going.');
}

export function celebrateModuleComplete(moduleTitle) {
  showSuccess('Chapter complete!', moduleTitle ? `${moduleTitle} is done.` : 'Module complete.');
}

export function celebrateStory() {
  showSuccess('Story submitted!', 'Your capstone is in review. Check your certificate path.');
}

export function celebrateGraduate() {
  showSuccess('Terrascape Graduate!', 'Your certificate is ready to download.');
}
