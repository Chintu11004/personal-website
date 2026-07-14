import { memo } from 'react';
import { parseContentDescription } from './utils/parseContentDescription';

export const FullscreenPanelContent = memo(function FullscreenPanelContent({
  description,
  contentRef,
}) {
  const blocks = parseContentDescription(description);

  return (
    <div ref={contentRef} className="fullscreen-panel__desc-wrap">
      {blocks.map((block, index) => {
        if (block.type === 'youtube') {
          return (
            <div key={`youtube-${block.videoId}-${index}`} className="fullscreen-panel__video">
              <iframe
                src={`https://www.youtube.com/embed/${block.videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          );
        }

        if (block.type === 'image') {
          return (
            <figure key={`image-${block.src}-${index}`} className="fullscreen-panel__figure">
              <img className="fullscreen-panel__image" src={block.src} alt="" />
            </figure>
          );
        }

        return (
          <p key={`text-${index}`} className="fullscreen-panel__desc">
            {block.content}
          </p>
        );
      })}
    </div>
  );
});
