import { useState, useEffect } from 'react';
import { User, Mail, MapPin, Briefcase, Camera, Loader } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import { fetchCached, updateProfile, learnerApi } from '../../api/cachedLearnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import { profileFromApi, getRoleLine } from '../../utils/profileDisplay';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError } from '../../utils/swal';
import './LearnerProfile.css';

export default function LearnerProfile() {
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(() => showPageLoading('profile:me', 'profile'));
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(() => {
    const cached = cachedData('profile:me', 'profile');
    return profileFromApi(cached);
  });

  useEffect(() => {
    fetchCached('profile:me', learnerApi.getMe, 'profile', { force: true })
      .then((res) => {
        const data = res?.data !== undefined ? res.data : res;
        if (data) setProfile(profileFromApi(data));
      })
      .catch((err) => console.error('Failed to load profile', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        first_name: profile.firstName,
        last_name: profile.lastName,
        country: profile.country,
        region: profile.region,
        background: profile.background,
        bio: profile.bio,
      });
      await refreshProfile();
      showSuccess('Profile updated', 'Your changes have been saved.');
    } catch (err) {
      console.error("Failed to update profile", err);
      showError('Update failed', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';

  return (
    <LearnerLayout title="My Profile" subtitle="Manage your account and preferences">
      <div className="profile-layout">
        
        <div className="profile-left">
          <div className="card profile-card-main">
            <div className="profile-avatar-large">
              {initials}
              <button className="avatar-edit-btn">
                <Camera size={14} />
              </button>
            </div>
            <h3>{profile.firstName} {profile.lastName}</h3>
            <p className="profile-role text-muted">{getRoleLine(profile)}</p>
            
            <div className="profile-info-list">
              <div className="profile-info-item">
                <Mail size={16} color="var(--grey-400)" />
                <span>{profile.email || '—'}</span>
              </div>
              <div className="profile-info-item">
                <MapPin size={16} color="var(--grey-400)" />
                <span>{profile.country || '—'} {profile.region ? `(${profile.region})` : ''}</span>
              </div>
              <div className="profile-info-item">
                <Briefcase size={16} color="var(--grey-400)" />
                <span>{profile.background || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="card">
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--k-800)' }}>Edit Profile</h4>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--grey-400)' }} />
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input 
                      className="form-input" 
                      value={profile.firstName} 
                      onChange={e => setProfile({...profile, firstName: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input 
                      className="form-input" 
                      value={profile.lastName} 
                      onChange={e => setProfile({...profile, lastName: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" value={profile.email} disabled style={{ background: 'var(--grey-50)' }} />
                  <span className="text-xs text-muted" style={{ marginTop: '4px' }}>Contact support to change your email address.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input 
                      className="form-input" 
                      value={profile.country} 
                      onChange={e => setProfile({...profile, country: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Professional Background</label>
                    <input 
                      className="form-input" 
                      value={profile.background} 
                      onChange={e => setProfile({...profile, background: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Bio / Motivation</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '100px' }}
                    placeholder="Your motivation from registration, or edit your story here."
                    value={profile.bio} 
                    onChange={e => setProfile({...profile, bio: e.target.value})} 
                  />
                </div>

                <div className="divider" />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button className="btn btn-ghost">Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--k-800)' }}>Security</h4>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="••••••••" style={{ maxWidth: '400px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="New password" style={{ maxWidth: '400px' }} />
            </div>
            <button className="btn btn-outline btn-sm">Update Password</button>
          </div>
        </div>

      </div>
    </LearnerLayout>
  );
}
