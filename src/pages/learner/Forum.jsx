import { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, ThumbsUp, ThumbsDown, Reply, MoreVertical, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import {
  getForumPosts,
  createForumPost,
  getForumReplies,
  replyToPost,
  reactToForumPost,
} from '../../api/cachedLearnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import { useAuth } from '../../contexts/AuthContext';
import LearnerAvatar from '../../components/LearnerAvatar';
import { useLearnerAvatar } from '../../hooks/useLearnerAvatar';
import { runGamificationEvent } from '../../utils/gamificationRunner';
import { incrementForumReplies, getForumReplyCount } from '../../utils/forumStats';
import { showError } from '../../utils/swal';
import './Forum.css';

const categories = ['All Modules', 'Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5', 'Module 6', 'General'];

export default function Forum() {
  const [activeCategory, setActiveCategory] = useState('All Modules');
  const [posts, setPosts] = useState(() => cachedData('forum:posts:all', 'forum') || []);
  const [loading, setLoading] = useState(() => showPageLoading('forum:posts:all', 'forum'));
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', module_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(null);
  const [reactingPostId, setReactingPostId] = useState(null);

  const { user, profile } = useAuth();
  const { avatarId } = useLearnerAvatar();

  const isMyPost = (post) => {
    if (user?.email && post.author_email) return post.author_email === user.email;
    const name = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
    return name && post.author_name === name;
  };

  const forumCacheKey = (modId) => `forum:posts:${modId || 'all'}`;

  const fetchPosts = () => {
    let modId = '';
    if (activeCategory.startsWith('Module')) {
      modId = activeCategory.split(' ')[1];
    } else if (activeCategory === 'General') {
      modId = '0';
    }
    const queryMod = modId !== '0' && modId ? modId : '';
    const key = forumCacheKey(queryMod);
    const cached = cachedData(key, 'forum');
    if (cached) {
      setPosts(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }

    getForumPosts(queryMod)
      .then((res) => setPosts(res.data || []))
      .catch((err) => console.error('Failed to load forum posts', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    setSubmitting(true);
    try {
      await createForumPost({
        ...newPost,
        module_id: newPost.module_id || null,
      });
      setShowNewPost(false);
      setNewPost({ title: '', content: '', module_id: '' });
      fetchPosts();
      runGamificationEvent('forum_post');
    } catch (err) {
      console.error('Failed to submit post', err);
      showError('Could not post', 'Failed to submit post.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReplies = async (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    if (!replies[postId]) {
      setLoadingReplies(postId);
      try {
        const res = await getForumReplies(postId);
        setReplies(prev => ({ ...prev, [postId]: res.data || [] }));
      } catch (err) {
        console.error('Failed to load replies', err);
      } finally {
        setLoadingReplies(null);
      }
    }
  };

  const handleReaction = async (postId, reaction) => {
    if (reactingPostId) return;
    setReactingPostId(postId);
    try {
      const res = await reactToForumPost(postId, reaction);
      const updated = res.data;
      setPosts((prev) => {
        const next = prev.map((p) => (p.id === postId ? { ...p, ...updated } : p));
        if ((updated?.likes_count || 0) >= 5) {
          runGamificationEvent('forum_reaction', { forumPosts: next });
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to react to post', err);
      showError('Could not update vote', 'Please try again.');
    } finally {
      setReactingPostId(null);
    }
  };

  const handleReplySubmit = async (postId) => {
    const content = replyText[postId]?.trim();
    if (!content) return;
    setReplying(postId);
    try {
      await replyToPost(postId, { content });
      const res = await getForumReplies(postId);
      setReplies(prev => ({ ...prev, [postId]: res.data || [] }));
      setReplyText(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
      const count = incrementForumReplies();
      runGamificationEvent('forum_reply', { forumReplies: count });
    } catch (err) {
      console.error('Failed to post reply', err);
      showError('Could not reply', 'Failed to post reply.');
    } finally {
      setReplying(null);
    }
  };

  const getInitials = (userId) => (userId ? userId.substring(0, 2).toUpperCase() : '??');

  return (
    <LearnerLayout title="Discussion Forum" subtitle="Connect, reflect, and learn with your peers">
      <div className="forum-layout">
        <div className="forum-sidebar">
          <div className="card forum-filters">
            <h4 style={{ marginBottom: '1rem', fontSize: '.9rem', textTransform: 'uppercase', color: 'var(--grey-500)', letterSpacing: '.05em' }}>Categories</h4>
            <div className="category-list">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: '1.5rem', background: 'var(--g-800)', color: 'var(--white)' }}>
            <h4 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Guidelines</h4>
            <ul className="forum-rules">
              <li>Be respectful and constructive</li>
              <li>Keep discussions relevant to the modules</li>
              <li>Search before asking a question</li>
            </ul>
          </div>
        </div>

        <div className="forum-main">
          <div className="forum-top-actions">
            <div className="search-wrap">
              <Search size={18} className="search-icon" />
              <input type="text" className="form-input" placeholder="Search discussions..." />
            </div>
            <button className="btn btn-outline btn-sm">
              <Filter size={16} /> Filter
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowNewPost(!showNewPost)}>
              {showNewPost ? 'Cancel' : 'New Topic'}
            </button>
          </div>

          {showNewPost && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Create New Topic</h4>
              <form onSubmit={handlePostSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <input
                    className="form-input"
                    placeholder="Topic Title"
                    value={newPost.title}
                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <select
                    className="form-input"
                    value={newPost.module_id}
                    onChange={e => setNewPost({ ...newPost, module_id: e.target.value })}
                  >
                    <option value="">General Discussion</option>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={String(n)}>Module {n}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <textarea
                    className="form-input"
                    placeholder="Write your message here..."
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    value={newPost.content}
                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowNewPost(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Topic'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="forum-posts-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--grey-400)' }}>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '0.5rem' }}>Loading posts…</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--grey-400)' }}>
                No posts found for this category.
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className={`forum-post-card ${post.is_pinned ? 'pinned' : ''}`}>
                  <div className="post-header">
                    <div className="post-author-info">
                      {isMyPost(post) ? (
                        <LearnerAvatar avatarId={avatarId} size="sm" />
                      ) : (
                        <div className="post-avatar" style={{ background: 'linear-gradient(135deg, var(--k-500), var(--k-300))' }}>
                          {getInitials(post.user_id)}
                        </div>
                      )}
                      <div>
                        <div className="post-author-name">{post.author_name || post.user_id}</div>
                        <div className="post-meta">
                          <span className="post-time">{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Just now'}</span>
                          <span className="post-meta-dot">•</span>
                          <span className="post-module">{post.module_tag || (post.module_id ? `Module ${post.module_id}` : 'General')}</span>
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-icon"><MoreVertical size={16} /></button>
                  </div>

                  <div className="post-body">
                    {post.is_pinned && <span className="badge badge-brand" style={{ marginBottom: '0.5rem', fontSize: '.65rem' }}>📌 Pinned</span>}
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-content">{post.content}</p>
                  </div>

                  <div className="post-footer">
                    <div className="post-actions">
                      <button
                        type="button"
                        className={`post-action-btn ${post.my_reaction === 'like' ? 'active-like' : ''}`}
                        disabled={reactingPostId === post.id}
                        onClick={() => handleReaction(post.id, 'like')}
                        aria-pressed={post.my_reaction === 'like'}
                        aria-label="Like post"
                      >
                        <ThumbsUp size={15} /> {post.likes_count ?? 0}
                      </button>
                      <button
                        type="button"
                        className={`post-action-btn ${post.my_reaction === 'dislike' ? 'active-dislike' : ''}`}
                        disabled={reactingPostId === post.id}
                        onClick={() => handleReaction(post.id, 'dislike')}
                        aria-pressed={post.my_reaction === 'dislike'}
                        aria-label="Dislike post"
                      >
                        <ThumbsDown size={15} /> {post.dislikes_count ?? 0}
                      </button>
                      <button type="button" className="post-action-btn" onClick={() => toggleReplies(post.id)}>
                        <MessageSquare size={15} /> {post.replies_count || 0} Replies
                        {expandedPost === post.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleReplies(post.id)}>
                      <Reply size={14} /> Reply
                    </button>
                  </div>

                  {expandedPost === post.id && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--grey-100)' }}>
                      {loadingReplies === post.id ? (
                        <div style={{ textAlign: 'center', padding: '1rem' }}><Loader size={18} className="spin" /></div>
                      ) : (
                        <>
                          {(replies[post.id] || []).map(r => (
                            <div key={r.id} style={{ marginBottom: '0.75rem', paddingLeft: '1rem', borderLeft: '2px solid var(--g-200)' }}>
                              <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--g-800)' }}>{r.author_name || r.user_id}</div>
                              <p style={{ fontSize: '.85rem', color: 'var(--grey-700)', margin: '0.25rem 0 0' }}>{r.content}</p>
                              <span style={{ fontSize: '.72rem', color: 'var(--grey-400)' }}>
                                {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                              </span>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <textarea
                              className="form-input"
                              rows={2}
                              placeholder="Write a reply..."
                              value={replyText[post.id] || ''}
                              onChange={e => setReplyText(prev => ({ ...prev, [post.id]: e.target.value }))}
                              style={{ flex: 1, fontSize: '.85rem' }}
                            />
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={replying === post.id || !replyText[post.id]?.trim()}
                              onClick={() => handleReplySubmit(post.id)}
                            >
                              {replying === post.id ? '...' : 'Send'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
}
