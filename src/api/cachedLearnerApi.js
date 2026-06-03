/**
 * Cached learner API — returns cached data immediately, refreshes in the background.
 */
import * as learnerApi from './learnerApi';

const cache = new Map();
const cacheTimestamps = new Map();

export const CACHE_DURATIONS = {
  modules: 5 * 60 * 1000,
  profile: 3 * 60 * 1000,
  forum: 2 * 60 * 1000,
  webinars: 5 * 60 * 1000,
  stories: 3 * 60 * 1000,
  certificate: 3 * 60 * 1000,
  offline: 10 * 60 * 1000,
  assessments: 5 * 60 * 1000,
  default: 5 * 60 * 1000,
};

function getDuration(type) {
  return CACHE_DURATIONS[type] || CACHE_DURATIONS.default;
}

export function isCacheValid(key, type = 'default') {
  if (!cache.has(key)) return false;
  const ts = cacheTimestamps.get(key);
  return Date.now() - ts < getDuration(type);
}

export function peekCache(key, type = 'default') {
  return isCacheValid(key, type) ? cache.get(key) : null;
}

export function unwrapResponse(response) {
  return response?.data !== undefined ? response.data : response;
}

function setCacheEntry(key, data) {
  cache.set(key, data);
  cacheTimestamps.set(key, Date.now());
}

function revalidateInBackground(key, apiFunction) {
  apiFunction()
    .then((response) => setCacheEntry(key, response))
    .catch(() => {});
}

export async function fetchCached(key, apiFunction, type = 'default', options = {}) {
  const { force = false } = options;
  if (!force && isCacheValid(key, type)) {
    const hit = cache.get(key);
    revalidateInBackground(key, apiFunction);
    return hit;
  }
  const response = await apiFunction();
  setCacheEntry(key, response);
  return response;
}

export function invalidateCache(pattern) {
  if (pattern === '*') {
    cache.clear();
    cacheTimestamps.clear();
    return;
  }
  for (const key of [...cache.keys()]) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
}

export function prefetchLearnerData() {
  const jobs = [
    ['modules:list', learnerApi.getModules, 'modules'],
    ['webinars:list', learnerApi.getWebinars, 'webinars'],
    ['certificate:me', learnerApi.getCertificate, 'certificate'],
    ['offline:packs', learnerApi.getOfflinePacks, 'offline'],
    ['forum:posts:all', () => learnerApi.getForumPosts(''), 'forum'],
    ['profile:me', learnerApi.getMe, 'profile'],
    ['story:mine', learnerApi.getMyStory, 'stories'],
    ['assessments:my', learnerApi.getMyAssessments, 'assessments'],
    ['assessments:instrument:baseline', () => learnerApi.getAssessmentInstrument('baseline'), 'assessments'],
    ['assessments:instrument:endline', () => learnerApi.getAssessmentInstrument('endline'), 'assessments'],
  ];
  jobs.forEach(([key, fn, type]) => {
    if (!isCacheValid(key, type)) {
      revalidateInBackground(key, fn);
    }
  });
}

// ─── Read endpoints (cached) ─────────────────────────────────
export const getMe = () => fetchCached('profile:me', learnerApi.getMe, 'profile');
export const getModules = () => fetchCached('modules:list', learnerApi.getModules, 'modules');
export const getModuleDetail = (moduleId) =>
  fetchCached(`modules:detail:${moduleId}`, () => learnerApi.getModuleDetail(moduleId), 'modules');
export const getOfflinePacks = () => fetchCached('offline:packs', learnerApi.getOfflinePacks, 'offline');
export const getMyStory = () => fetchCached('story:mine', learnerApi.getMyStory, 'stories');
export const getForumPosts = (moduleId = '') => {
  const key = `forum:posts:${moduleId || 'all'}`;
  return fetchCached(key, () => learnerApi.getForumPosts(moduleId), 'forum');
};
export const getForumReplies = (postId) =>
  fetchCached(`forum:replies:${postId}`, () => learnerApi.getForumReplies(postId), 'forum');
export const getWebinars = () => fetchCached('webinars:list', learnerApi.getWebinars, 'webinars');
export const getCertificate = () => fetchCached('certificate:me', learnerApi.getCertificate, 'certificate');
export const getAssessmentInstrument = (type) =>
  fetchCached(`assessments:instrument:${type}`, () => learnerApi.getAssessmentInstrument(type), 'assessments');
export const getMyAssessments = () => fetchCached('assessments:my', learnerApi.getMyAssessments, 'assessments');
export const getQuizForTake = (quizId) =>
  fetchCached(`quizzes:take:${quizId}`, () => learnerApi.getQuizForTake(quizId), 'modules');
export const getMyQuizAttempts = (quizId) =>
  fetchCached(`quizzes:attempts:${quizId}`, () => learnerApi.getMyQuizAttempts(quizId), 'modules');

// ─── Mutations (invalidate + call API) ───────────────────────
export const updateProfile = async (data) => {
  const res = await learnerApi.updateProfile(data);
  invalidateCache('profile');
  return res;
};
export const updateProgress = async (moduleId, data) => {
  const res = await learnerApi.updateProgress(moduleId, data);
  invalidateCache('modules');
  return res;
};
export const submitStory = async (data) => {
  const res = await learnerApi.submitStory(data);
  invalidateCache('story');
  invalidateCache('certificate');
  return res;
};
export const createForumPost = async (data) => {
  const res = await learnerApi.createForumPost(data);
  invalidateCache('forum');
  return res;
};
export const replyToPost = async (postId, data) => {
  const res = await learnerApi.replyToPost(postId, data);
  invalidateCache('forum');
  return res;
};
export const reactToForumPost = async (postId, reaction) => {
  const res = await learnerApi.reactToForumPost(postId, reaction);
  invalidateCache('forum');
  return res;
};
export const rsvpWebinar = async (id) => {
  const res = await learnerApi.rsvpWebinar(id);
  invalidateCache('webinars');
  return res;
};
export const submitAssessment = async (type, answers) => {
  const res = await learnerApi.submitAssessment(type, answers);
  invalidateCache('assessments');
  return res;
};
export const submitQuizAttempt = async (quizId, answers) => {
  const res = await learnerApi.submitQuizAttempt(quizId, answers);
  invalidateCache('quizzes');
  invalidateCache('modules');
  return res;
};
export const saveReflection = async (moduleId, text) => {
  const res = await learnerApi.saveReflection(moduleId, text);
  invalidateCache(`modules:detail:${moduleId}`);
  invalidateCache('modules');
  return res;
};

export { learnerApi };
