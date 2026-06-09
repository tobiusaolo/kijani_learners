import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle, Video, Mic, Info, Loader } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import { getMyStory, submitStory } from '../../api/cachedLearnerApi';
import { uploadFile } from '../../api/learnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { showSuccess, showError, showWarning, apiErrorMessage } from '../../utils/swal';
import { runGamificationEvent } from '../../utils/gamificationRunner';
import { celebrateStory } from '../../utils/celebrate';
import './Storytelling.css';

function storyPreviewKind(format, fileUrl) {
  if (format === 'video') return 'video';
  if (format === 'audio') return 'audio';
  if (format === 'visual') return 'image';
  const ext = fileUrl?.split('?')[0]?.split('.').pop()?.toLowerCase();
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext)) return 'audio';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image';
  return null;
}

function StoryFilePreview({ format, fileUrl, title }) {
  const src = resolveAssetUrl(fileUrl);
  const kind = storyPreviewKind(format, fileUrl);
  if (!src || !kind) return null;

  return (
    <div className="story-preview" aria-label="Uploaded story preview">
      <p className="story-preview-label">
        <CheckCircle size={16} /> Preview
        {title ? ` — ${title}` : ''}
      </p>
      {kind === 'video' && (
        <video className="story-preview-media" src={src} controls playsInline preload="metadata" />
      )}
      {kind === 'audio' && (
        <audio className="story-preview-audio" src={src} controls preload="metadata" />
      )}
      {kind === 'image' && (
        <img className="story-preview-media" src={src} alt={title || 'Story infographic preview'} />
      )}
    </div>
  );
}

export default function Storytelling() {
  const [submission, setSubmission] = useState({ title: '', format: 'text', content: '', file_url: '' });
  const [loading, setLoading] = useState(() => showPageLoading('story:mine', 'stories'));
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myStory, setMyStory] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const cached = cachedData('story:mine', 'stories');
    if (cached) {
      setMyStory(cached);
      setSubmission({
        title: cached.title || '',
        format: cached.format || 'text',
        content: cached.excerpt || cached.content || '',
        file_url: cached.file_url || '',
      });
    }

    getMyStory()
      .then(res => {
        if (res.data) {
          setMyStory(res.data);
          setSubmission({
            title: res.data.title || '',
            format: res.data.format || 'text',
            content: res.data.excerpt || res.data.content || '',
            file_url: res.data.file_url || '',
          });
        }
      })
      .catch(err => {
        if (err.response?.status !== 404) console.error('Failed to load story', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', submission.title || file.name);
      const res = await uploadFile(fd);
      setSubmission(s => ({ ...s, file_url: res.data.file_url }));
    } catch (err) {
      showError('Upload failed', apiErrorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = (status) => {
    const payload = {
      title: submission.title,
      format: submission.format,
      status,
    };
    if (submission.format === 'text') {
      payload.content = submission.content;
    } else if (submission.file_url) {
      payload.file_url = submission.file_url;
      payload.excerpt = submission.content || `Uploaded ${submission.format} story`;
    }
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submission.format !== 'text' && !submission.file_url) {
      showWarning('Upload required', 'Please upload your story file first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitStory(buildPayload('pending'));
      setMyStory(res.data);
      celebrateStory();
      runGamificationEvent('story_submit');
    } catch (err) {
      showError('Submission failed', apiErrorMessage(err, 'Failed to submit story.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    try {
      const res = await submitStory(buildPayload('draft'));
      setMyStory(res.data);
      showSuccess('Draft saved');
    } catch (err) {
      showError('Save failed', apiErrorMessage(err, 'Failed to save draft.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LearnerLayout title="Digital Storytelling Hub" subtitle="Module 6 · Synthesise & Advocate">
      <div className="storytelling-layout">
        <div className="story-main">
          <div className="card story-intro-card">
            <div className="story-intro-icon">✨</div>
            <div>
              <h3>Your Conservation Story</h3>
              <p>Translate systems thinking insights into public communication products for your context.</p>
            </div>
          </div>

          <div className="card">
            <h4 style={{ marginBottom: '1rem' }}>Submission Hub</h4>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><Loader size={24} className="spin" /></div>
            ) : myStory && myStory.status !== 'draft' ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--grey-50)', borderRadius: 'var(--r-md)' }}>
                <CheckCircle size={48} color="var(--g-500)" style={{ margin: '0 auto 1rem' }} />
                <h3>Story Submitted!</h3>
                <p style={{ color: 'var(--grey-600)', marginTop: '0.5rem' }}>
                  &quot;{myStory.title}&quot; — <strong>{myStory.status}</strong>
                </p>
                {myStory.file_url && myStory.format !== 'text' && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                    <StoryFilePreview format={myStory.format} fileUrl={myStory.file_url} title={myStory.title} />
                  </div>
                )}
                {myStory.file_url && (
                  <a href={resolveAssetUrl(myStory.file_url)} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                    Open in new tab
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Story Title</label>
                  <input className="form-input" value={submission.title}
                    onChange={e => setSubmission({ ...submission, title: e.target.value })} required />
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Format</label>
                  <div className="format-grid">
                    {[
                      { id: 'text', icon: FileText, label: 'Essay / Article' },
                      { id: 'audio', icon: Mic, label: 'Audio / Podcast' },
                      { id: 'video', icon: Video, label: 'Video Story' },
                      { id: 'visual', icon: ImageIcon, label: 'Infographic' },
                    ].map(f => (
                      <div key={f.id} className={`format-card ${submission.format === f.id ? 'active' : ''}`}
                        onClick={() => setSubmission(s => ({
                          ...s,
                          format: f.id,
                          ...(s.format !== f.id && f.id !== 'text' ? { file_url: '' } : {}),
                        }))}>
                        <f.icon size={20} /><span>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {submission.format === 'text' ? (
                  <div className="form-group">
                    <label className="form-label">Story Content</label>
                    <textarea className="form-input" style={{ minHeight: '200px' }}
                      value={submission.content} onChange={e => setSubmission({ ...submission, content: e.target.value })} required />
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Upload File</label>
                    <input ref={fileRef} type="file" accept=".pdf,.mp3,.mp4,.png,.jpg,.jpeg,.webp" style={{ display: 'none' }}
                      onChange={handleFileUpload} />
                    <div className="story-upload-zone" onClick={() => !uploading && fileRef.current?.click()} style={{ cursor: uploading ? 'wait' : 'pointer' }}>
                      <Upload size={32} color="var(--g-400)" />
                      <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                        {uploading ? 'Uploading…' : submission.file_url ? 'Upload another file' : 'Click to upload'}
                      </p>
                      <p className="text-sm text-muted">MP3, MP4, PNG, JPG, WEBP — max 25MB</p>
                    </div>
                    {submission.file_url && !uploading && (
                      <StoryFilePreview format={submission.format} fileUrl={submission.file_url} title={submission.title} />
                    )}
                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label className="form-label">Short description (optional)</label>
                      <textarea className="form-input" rows={3} value={submission.content}
                        onChange={e => setSubmission({ ...submission, content: e.target.value })} />
                    </div>
                  </div>
                )}

                <div className="story-actions" style={{ marginTop: '2rem' }}>
                  <span className="badge badge-grey">Status: {myStory?.status || 'Draft'}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-ghost" onClick={handleSaveDraft} disabled={submitting}>Save Draft</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
                      {submitting ? 'Submitting…' : 'Submit Story'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="story-sidebar">
          <div className="card">
            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={18} color="var(--g-500)" /> Guidelines
            </h4>
            <ul className="story-guidelines">
              <li>Integrate at least <strong>two</strong> curriculum themes.</li>
              <li>Use an accessible tone for general audiences.</li>
              <li>Include your name and cohort on the title page.</li>
            </ul>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
}
