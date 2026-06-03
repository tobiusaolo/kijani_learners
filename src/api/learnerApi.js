// Centralized API service functions for the Learner portal
import apiClient from './client';
import { API_URL } from '../config/api';

// ─── Auth / Profile ──────────────────────────────────────────
export const getMe = () => apiClient.get('/profile/');
export const updateProfile = (data) => apiClient.patch('/profile/', data);

// ─── Modules ─────────────────────────────────────────────────
export const getModules = () => apiClient.get('/modules/');
export const getModuleDetail = (moduleId) => apiClient.get(`/modules/${moduleId}/detail`);
export const updateProgress = (moduleId, data) =>
  apiClient.post(`/modules/${moduleId}/progress`, data);
export const recordActivity = (moduleId, seconds = 30) =>
  apiClient.post(`/modules/${moduleId}/activity`, { seconds });
export const getOfflinePacks = () => apiClient.get('/modules/offline-packs');
export const getReadingPdfUrl = (moduleId) =>
  `${API_URL}/modules/${moduleId}/reading-pdf`;

// ─── Quizzes ─────────────────────────────────────────────────
export const getQuizForTake = (quizId) => apiClient.get(`/quizzes/${quizId}/take`);
export const getMyQuizAttempts = (quizId) => apiClient.get(`/quizzes/${quizId}/my-attempts`);
export const submitQuizAttempt = (quizId, answers) =>
  apiClient.post('/quizzes/attempt', { quiz_id: quizId, answers });
export const listModuleQuizzes = (moduleId, quizType) =>
  apiClient.get(`/quizzes/module/${moduleId}`, { params: quizType ? { quiz_type: quizType } : {} });
export const saveReflection = (moduleId, text) =>
  apiClient.post(`/modules/${moduleId}/reflection`, { reflection_text: text });

// ─── Applications ────────────────────────────────────────────
export const submitApplication = (data) => apiClient.post('/applications/', data);
export const getMyApplication = () => apiClient.get('/applications/mine');

// ─── Stories ─────────────────────────────────────────────────
export const getMyStory = () => apiClient.get('/stories/mine');
export const submitStory = (data) => apiClient.post('/stories/', data);
export const uploadFile = (formData) =>
  apiClient.post('/content/upload', formData);

// ─── Forum ───────────────────────────────────────────────────
export const getForumPosts = (moduleId) => {
  const url = moduleId ? `/forum/?module_id=${moduleId}` : '/forum/';
  return apiClient.get(url);
};
export const createForumPost = (data) => apiClient.post('/forum/', data);
export const replyToPost = (postId, data) =>
  apiClient.post(`/forum/${postId}/replies`, data);
export const getForumReplies = (postId) =>
  apiClient.get(`/forum/posts/${postId}/replies`);
export const reactToForumPost = (postId, reaction) =>
  apiClient.post(`/forum/${postId}/reaction`, { reaction });

// ─── Webinars ────────────────────────────────────────────────
export const getWebinars = () => apiClient.get('/webinars/');
export const rsvpWebinar = (id) => apiClient.post(`/webinars/${id}/rsvp`, {});

// ─── Assessments ─────────────────────────────────────────────
export const getAssessmentInstrument = (type) =>
  apiClient.get(`/assessments/instrument/${type}`);
export const getMyAssessments = () => apiClient.get('/assessments/my');
export const submitAssessment = (type, answers) =>
  apiClient.post(`/assessments/${type}`, { answers });

// ─── Certificate ─────────────────────────────────────────────
export const getCertificate = () => apiClient.get('/certificates/me');
export const getCertificatePdfUrl = () => `${API_URL}/certificates/me/pdf`;

// ─── Forum / Webinars / Assessments legacy aliases ───────────
export const getAssessments = (type) =>
  type ? getAssessmentInstrument(type) : getMyAssessments();

export default apiClient;
