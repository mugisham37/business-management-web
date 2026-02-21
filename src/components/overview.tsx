import React from 'react';
import { AspectRatio } from '@/components/reui/aspect-ratio';
import { Skeleton } from '@/components/reui/skeleton';
import { Frame, FramePanel } from '@/components/reui/frame';

// Image configuration
interface ImageConfig {
  width: number;
  height: number;
  sizes: string;
  baseUrl: string;
  srcSet: string;
}

const images: Record<'background' | 'foreground', ImageConfig> = {
  background: {
    width: 2021,
    height: 1270,
    sizes: 'min(100vw - 40px, 580px)',
    baseUrl: 'https://framerusercontent.com/images/uFd4uP6Hq41yXZpn8dV7vhg0.jpg',
    srcSet:
      'https://framerusercontent.com/images/uFd4uP6Hq41yXZpn8dV7vhg0.jpg?scale-down-to=512 512w,https://framerusercontent.com/images/uFd4uP6Hq41yXZpn8dV7vhg0.jpg?scale-down-to=1024 1024w,https://framerusercontent.com/images/uFd4uP6Hq41yXZpn8dV7vhg0.jpg 2021w',
  },
  foreground: {
    width: 1680,
    height: 1104,
    sizes: '570px',
    baseUrl: 'https://framerusercontent.com/images/e2bSBE2FGqkvwqDjSs5GYHchjWw.jpg',
    srcSet:
      'https://framerusercontent.com/images/e2bSBE2FGqkvwqDjSs5GYHchjWw.jpg?scale-down-to=512 512w,https://framerusercontent.com/images/e2bSBE2FGqkvwqDjSs5GYHchjWw.jpg?scale-down-to=1024 1024w,https://framerusercontent.com/images/e2bSBE2FGqkvwqDjSs5GYHchjWw.jpg 1680w',
  },
};

// Reusable BackgroundImage component with loading state
const BackgroundImage: React.FC<{ config: ImageConfig }> = ({ config }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const aspectRatio = config.width / config.height;

  return (
    <div className="absolute inset-0 rounded-[inherit]" data-framer-background-image-wrapper="true">
      <AspectRatio ratio={aspectRatio} className="h-full">
        {!isLoaded && (
          <Skeleton className="absolute inset-0 rounded-[inherit]" />
        )}
        <img
          decoding="async"
          loading="lazy"
          width={config.width}
          height={config.height}
          sizes={config.sizes}
          srcSet={config.srcSet}
          src={config.baseUrl}
          alt=""
          onLoad={() => setIsLoaded(true)}
          className="block w-full h-full rounded-[inherit] object-center object-cover"
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
        />
      </AspectRatio>
    </div>
  );
};

const Overview = () => {
  return (
    <section 
      className="relative flex flex-col flex-none flex-nowrap items-center justify-center content-center w-full h-min gap-[23px] overflow-visible px-[100px] pt-10 pb-[50px] z-0 max-[1199px]:max-w-[810px] max-[1199px]:px-10 max-[1199px]:py-0 max-[809px]:px-5 max-[809px]:py-[50px]" 
      data-framer-name="Overview Section" 
      id="overview"
    >
      <Frame 
        variant="ghost" 
        className="w-full max-w-[1100px] p-0 gap-0 max-[1199px]:max-w-[810px] max-[809px]:max-w-[580px]"
      >
        <FramePanel 
          className="relative flex flex-col flex-none flex-nowrap items-center justify-center content-center w-full h-min min-h-[650px] gap-2.5 overflow-hidden rounded-[15px] px-[50px] pt-[50px] pb-0 [will-change:var(--framer-will-change-override,transform)] max-[1199px]:h-[467px] max-[1199px]:min-h-0 max-[1199px]:px-[30px] max-[1199px]:pt-[30px] max-[809px]:h-[380px] max-[809px]:min-h-0 max-[809px]:rounded-[10px] max-[809px]:px-[15px] max-[809px]:pt-[15px]" 
          data-framer-name="Visual"
        >
          <BackgroundImage config={images.background} />
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-row flex-none flex-nowrap items-center justify-center content-center w-min h-min min-w-[900px] min-h-[590px] gap-2.5 overflow-hidden p-0 z-0 max-[1199px]:min-w-0 max-[1199px]:min-h-[388px] max-[1199px]:w-full max-[1199px]:overflow-visible max-[809px]:relative max-[809px]:bottom-auto max-[809px]:left-auto max-[809px]:translate-x-0 max-[809px]:min-w-0 max-[809px]:min-h-[308px] max-[809px]:w-full max-[809px]:overflow-visible max-[809px]:z-[1]" 
            data-framer-name="Image"
          >
            <div
              className="absolute bottom-0 left-[calc(50%-450px)] flex-none w-[900px] h-[590px] gap-2.5 overflow-hidden rounded-t-[8px] z-0 [will-change:var(--framer-will-change-override,transform)] max-[1199px]:bottom-auto max-[1199px]:top-[calc(43.556701030927854%-219.5px)] max-[1199px]:left-[calc(50%-335px)] max-[1199px]:w-[670px] max-[1199px]:h-[439px] max-[1199px]:rounded-t-[5px] max-[809px]:bottom-auto max-[809px]:top-[calc(51.62337662337665%-186.5px)] max-[809px]:left-[2px] max-[809px]:w-[570px] max-[809px]:h-[373px] max-[809px]:rounded-t-[3px]"
              style={{
                willChange: 'transform',
                opacity: 1,
                transform: 'perspective(1200px) translateY(120px) scale(0.8) rotateX(60deg)',
              }}
            >
              <BackgroundImage config={images.foreground} />
            </div>
          </div>
        </FramePanel>
      </Frame>
    </section>
  );
};

export default Overview;