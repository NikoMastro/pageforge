import React from 'react';

interface IllustrationProps {
  illustrationUrl?: string;
  alt?: string;
}

const Illustration: React.FC<IllustrationProps> = ({ illustrationUrl, alt = "Game illustration" }) => {
  if (!illustrationUrl) {
    return null;
  }

  return (
    <div className="w-full flex justify-center">
      <img
        src={illustrationUrl}
        alt={alt}
        className="rounded-lg object-cover"
      />
    </div>
  );
};

export default Illustration;
