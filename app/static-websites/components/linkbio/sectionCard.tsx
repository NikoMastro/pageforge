import React from 'react';

interface SectionCardProps { title: string; children: React.ReactNode; hidden?: boolean; }

export const SectionCard: React.FC<SectionCardProps> = ({ children, hidden }) => {
  if (hidden) return null;
  return (
    <section className="p-5 backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
};

export default SectionCard;
