import { useState, useEffect, useMemo } from 'react';
import { getModules, getMyAssessments, getMyStory, getCertificate } from '../api/cachedLearnerApi';
import { cachedData } from '../utils/staleLoad';
import { buildJourneyNodes, getPhase, getNextMission } from '../utils/journeyState';
import { getMasterySnapshot } from '../utils/masteryStorage';

export function useGamification(modules = []) {
  const [assessments, setAssessments] = useState(() => {
    const c = cachedData('assessments:my', 'assessments');
    return c?.data ?? c ?? [];
  });
  const [story, setStory] = useState(() => cachedData('story:mine', 'stories'));
  const [certificate, setCertificate] = useState(() => cachedData('certificate:me', 'certificate'));

  useEffect(() => {
    getMyAssessments()
      .then((res) => {
        const data = res?.data ?? res;
        setAssessments(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    getMyStory()
      .then((res) => setStory(res?.data ?? res ?? null))
      .catch(() => {});
    getCertificate()
      .then((res) => setCertificate(res?.data ?? res ?? null))
      .catch(() => {});
  }, []);

  const ctx = useMemo(
    () => ({ modules, assessments, story, certificate }),
    [modules, assessments, story, certificate]
  );

  const journeyNodes = useMemo(() => buildJourneyNodes(ctx), [ctx]);
  const phase = useMemo(() => getPhase(ctx), [ctx]);
  const mission = useMemo(() => getNextMission(ctx), [ctx]);
  const mastery = useMemo(() => getMasterySnapshot(), [modules]);

  return { journeyNodes, phase, mission, mastery, assessments, story, certificate };
}
