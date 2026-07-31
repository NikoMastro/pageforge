import React from 'react';

interface Meta { title: string; description: string; }
interface Appearance { profileImageUrl?: string; }
interface ProfileCardProps { meta: Meta; appearance: Appearance; className?: string; }

export const ProfileCard: React.FC<ProfileCardProps> = ({ meta, appearance, className = '' }) => {
  return (
    <header className={`rounded-xl p-5 backdrop-blur-sm text-center ${className}`}>
      {appearance.profileImageUrl && (
        <img
          src={appearance.profileImageUrl}
          alt={meta.title}
          className="mx-auto w-24 h-24 rounded-full object-cover border border-white/20 shadow mb-4"
          loading="lazy"
        />
      )}
      <h1 className="text-2xl font-bold text-slate-100 mb-2 leading-tight break-words">{meta.title}</h1>
      {meta.description && (
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line break-words">{meta.description}</p>
      )}
    </header>
  );
};

export default ProfileCard;
