/** Flat cartoon avatar illustrations — Kijani palette, no external assets. */

const skin = '#E8B88A';
const skinShadow = '#D4A574';
const hair = '#2C1810';
const shirt = '#237048';
const shirtLight = '#4caf7d';
const accent = '#2e8b57';

function Base({ children, bg = '#d6efe2' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
      <circle cx="60" cy="60" r="58" fill={bg} />
      <circle cx="60" cy="60" r="58" stroke="rgba(13,51,32,.08)" strokeWidth="2" />
      {children}
    </svg>
  );
}

export function AvatarGuardian() {
  return (
    <Base bg="#e8f5ec">
      <ellipse cx="60" cy="72" rx="28" ry="32" fill={shirt} />
      <path d="M32 95 Q60 108 88 95" fill={shirt} />
      <circle cx="60" cy="48" r="22" fill={skin} />
      <path d="M38 42 Q60 28 82 42" fill={hair} />
      <ellipse cx="52" cy="50" rx="3" ry="4" fill="#1a3d2a" />
      <ellipse cx="68" cy="50" rx="3" ry="4" fill="#1a3d2a" />
      <path d="M54 58 Q60 62 66 58" stroke={skinShadow} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M45 38 L42 22 L55 32 Z" fill={accent} />
      <path d="M75 38 L78 22 L65 32 Z" fill={accent} />
      <ellipse cx="42" cy="78" rx="8" ry="12" fill={shirtLight} opacity=".6" />
      <ellipse cx="78" cy="78" rx="8" ry="12" fill={shirtLight} opacity=".6" />
    </Base>
  );
}

export function AvatarRanger() {
  return (
    <Base bg="#f0faf4">
      <ellipse cx="60" cy="74" rx="30" ry="30" fill="#5d4037" />
      <circle cx="60" cy="46" r="21" fill={skin} />
      <path d="M39 40 Q60 24 81 40 L78 48 Q60 34 42 48 Z" fill="#3e2723" />
      <rect x="38" y="32" width="44" height="8" rx="4" fill="#6d4c41" />
      <ellipse cx="52" cy="48" rx="3" ry="3.5" fill="#1a3d2a" />
      <ellipse cx="68" cy="48" rx="3" ry="3.5" fill="#1a3d2a" />
      <path d="M55 56 Q60 60 65 56" stroke={skinShadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="48" y="58" width="24" height="3" rx="1.5" fill="#8d6e63" opacity=".5" />
      <circle cx="88" cy="55" r="10" fill={accent} opacity=".3" />
      <path d="M82 52 L94 48 L90 58 Z" fill={shirt} />
    </Base>
  );
}

export function AvatarResearcher() {
  return (
    <Base bg="#eef6f1">
      <ellipse cx="60" cy="76" rx="26" ry="28" fill="#fff" />
      <ellipse cx="60" cy="76" rx="26" ry="28" stroke={shirt} strokeWidth="2" fill="none" />
      <circle cx="60" cy="44" r="20" fill={skin} />
      <path d="M42 38 Q60 26 78 38" fill="#4a3728" />
      <circle cx="72" cy="42" r="14" stroke="#78909c" strokeWidth="3" fill="rgba(200,220,230,.4)" />
      <line x1="84" y1="48" x2="92" y2="52" stroke="#78909c" strokeWidth="2" />
      <ellipse cx="52" cy="46" rx="2.5" ry="3" fill="#1a3d2a" />
      <ellipse cx="64" cy="46" rx="2.5" ry="3" fill="#1a3d2a" />
      <path d="M54 54 Q60 57 66 54" stroke={skinShadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="52" y="68" width="16" height="20" rx="2" fill={shirtLight} opacity=".5" />
    </Base>
  );
}

export function AvatarStoryteller() {
  return (
    <Base bg="#fdf8f0">
      <ellipse cx="60" cy="75" rx="28" ry="29" fill="#7b1fa2" opacity=".15" />
      <ellipse cx="60" cy="75" rx="28" ry="29" fill={shirt} />
      <circle cx="60" cy="45" r="21" fill={skin} />
      <path d="M40 38 Q60 22 80 38 Q75 55 60 50 Q45 55 40 38" fill="#1a237e" />
      <ellipse cx="52" cy="47" rx="3" ry="3.5" fill="#1a3d2a" />
      <ellipse cx="68" cy="47" rx="3" ry="3.5" fill="#1a3d2a" />
      <path d="M56 56 Q60 61 64 56" stroke={skinShadow} strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="78" y="62" width="14" height="18" rx="2" fill="#fff" stroke={accent} strokeWidth="1.5" />
      <line x1="81" y1="68" x2="89" y2="68" stroke={accent} strokeWidth="1" />
      <line x1="81" y1="72" x2="87" y2="72" stroke={accent} strokeWidth="1" />
    </Base>
  );
}

export function AvatarCommunity() {
  return (
    <Base bg="#f5f0e8">
      <ellipse cx="60" cy="76" rx="30" ry="28" fill="#ff8f00" opacity=".2" />
      <ellipse cx="60" cy="76" rx="30" ry="28" fill={shirtLight} />
      <circle cx="60" cy="44" r="20" fill="#C68642" />
      <path d="M42 36 Q60 20 78 36" fill="#1b1b1b" />
      <ellipse cx="52" cy="46" rx="3" ry="3.5" fill="#1a3d2a" />
      <ellipse cx="68" cy="46" rx="3" ry="3.5" fill="#1a3d2a" />
      <path d="M56 55 Q60 60 64 55" stroke="#8d5524" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="70" r="8" fill={skin} opacity=".9" />
      <circle cx="82" cy="70" r="8" fill={skin} opacity=".9" />
      <path d="M34 78 Q38 72 42 78" stroke={accent} strokeWidth="2" fill="none" />
      <path d="M78 78 Q82 72 86 78" stroke={accent} strokeWidth="2" fill="none" />
    </Base>
  );
}

export function AvatarTechnologist() {
  return (
    <Base bg="#e8f4fc">
      <ellipse cx="60" cy="76" rx="28" ry="28" fill="#37474f" />
      <ellipse cx="60" cy="76" rx="28" ry="28" fill={shirt} opacity=".85" />
      <circle cx="60" cy="44" r="20" fill={skin} />
      <path d="M42 38 Q60 28 78 38" fill="#263238" />
      <rect x="44" y="40" width="32" height="10" rx="5" fill="#455a64" />
      <ellipse cx="52" cy="46" rx="2.5" ry="3" fill="#1a3d2a" />
      <ellipse cx="68" cy="46" rx="2.5" ry="3" fill="#1a3d2a" />
      <rect x="72" y="58" width="22" height="16" rx="3" fill="#263238" />
      <rect x="74" y="60" width="18" height="10" rx="1" fill="#4fc3f7" opacity=".6" />
      <circle cx="28" cy="52" r="6" fill={accent} />
      <path d="M28 46 L28 58 M22 52 L34 52" stroke="#fff" strokeWidth="1.5" />
    </Base>
  );
}

export function AvatarAdvocate() {
  return (
    <Base bg="#fef3e8">
      <ellipse cx="60" cy="76" rx="28" ry="28" fill="#c62828" opacity=".12" />
      <ellipse cx="60" cy="76" rx="28" ry="28" fill={shirt} />
      <circle cx="60" cy="44" r="20" fill="#AD7C59" />
      <path d="M42 34 Q60 18 78 34 L76 42 Q60 30 44 42 Z" fill="#212121" />
      <ellipse cx="52" cy="46" rx="3" ry="3.5" fill="#1a3d2a" />
      <ellipse cx="68" cy="46" rx="3" ry="3.5" fill="#1a3d2a" />
      <path d="M56 55 Q60 59 64 55" stroke="#6d4c41" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M48 88 L60 72 L72 88" fill="#ffc107" opacity=".9" />
      <circle cx="60" cy="70" r="4" fill="#ff9800" />
    </Base>
  );
}

export function AvatarExplorer() {
  return (
    <Base bg="#e0f2f1">
      <ellipse cx="60" cy="76" rx="30" ry="28" fill="#00695c" opacity=".2" />
      <ellipse cx="60" cy="76" rx="30" ry="28" fill={shirtLight} />
      <circle cx="60" cy="44" r="21" fill={skin} />
      <path d="M40 36 Q60 22 80 36" fill="#5d4037" />
      <path d="M48 32 L72 32 L68 26 L52 26 Z" fill="#795548" />
      <ellipse cx="52" cy="47" rx="3" ry="3.5" fill="#1a3d2a" />
      <ellipse cx="68" cy="47" rx="3" ry="3.5" fill="#1a3d2a" />
      <path d="M54 56 Q60 60 66 56" stroke={skinShadow} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="88" cy="40" r="12" fill="#81c784" opacity=".5" />
      <path d="M82 40 Q88 32 94 40 Q88 48 82 40" fill={accent} />
      <path d="M24 50 L32 42 L28 58 Z" fill="#8d6e63" />
    </Base>
  );
}

const MAP = {
  guardian: AvatarGuardian,
  ranger: AvatarRanger,
  researcher: AvatarResearcher,
  storyteller: AvatarStoryteller,
  community: AvatarCommunity,
  technologist: AvatarTechnologist,
  advocate: AvatarAdvocate,
  explorer: AvatarExplorer,
};

export function AvatarGraphic({ id }) {
  const Comp = MAP[id] || AvatarGuardian;
  return <Comp />;
}
