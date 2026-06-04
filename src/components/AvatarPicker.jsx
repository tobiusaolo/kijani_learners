import { useState } from 'react';
import { Check } from 'lucide-react';
import { AVATAR_CATALOG } from '../data/avatarCatalog';
import { getStoredAvatarId, setStoredAvatarId } from '../utils/learnerAvatar';
import LearnerAvatar from './LearnerAvatar';
import './AvatarPicker.css';

export default function AvatarPicker({ onSelect }) {
  const [selected, setSelected] = useState(getStoredAvatarId);

  const choose = (id) => {
    setSelected(id);
    setStoredAvatarId(id);
    onSelect?.(id);
  };

  return (
    <div className="avatar-picker">
      <p className="avatar-picker-intro">
        Choose a Terrascape character for your profile. Your selection is saved on this device only.
      </p>
      <div className="avatar-picker-grid" role="listbox" aria-label="Choose your avatar">
        {AVATAR_CATALOG.map((item) => {
          const isActive = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={isActive}
              className={`avatar-picker-option ${isActive ? 'is-active' : ''}`}
              onClick={() => choose(item.id)}
            >
              <LearnerAvatar avatarId={item.id} size="lg" showRing={isActive} />
              <span className="avatar-picker-label">{item.label}</span>
              <span className="avatar-picker-role">{item.role}</span>
              {isActive && (
                <span className="avatar-picker-check" aria-hidden>
                  <Check size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
