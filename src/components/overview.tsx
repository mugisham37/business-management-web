import React from 'react';

// Shared styles for image wrappers
const imageWrapperStyle: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 'inherit',
  inset: '0px',
};

const imageStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  objectPosition: 'center center',
  objectFit: 'cover',
};

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

// Reusable BackgroundImage component
const BackgroundImage: React.FC<{ config: ImageConfig }> = ({ config }) => (
  <div data-framer-background-image-wrapper="true" style={imageWrapperStyle}>
    <img
      decoding="async"
      loading="lazy"
      width={config.width}
      height={config.height}
      sizes={config.sizes}
      srcSet={config.srcSet}
      src={config.baseUrl}
      alt=""
      style={imageStyle}
    />
  </div>
);

const Overview = () => {
  return (
    <section className="framer-lr7btw" data-framer-name="Overview Section" id="overview">
      <div className="ssr-variant hidden-187ctmn hidden-72rtr7">
        <div className="framer-jwkkuz" data-framer-name="Visual" style={{ opacity: 1, transform: 'none' }}>
          <BackgroundImage config={images.background} />
          <div className="framer-1oodw5w" data-framer-name="Image">
            <div
              className="framer-13ji8es"
              style={{
                willChange: 'transform',
                opacity: 1,
                transform: 'perspective(1200px) translateY(120px) scale(0.8) rotateX(60deg)',
              }}
            >
              <BackgroundImage config={images.foreground} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Overview;