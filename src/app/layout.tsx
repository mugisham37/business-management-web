import type { Metadata } from "next";
import "./globals.css";
import Nav from "../components/nav";
import Cta from "../components/cta";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "ReadyLaunch",
  description: "Kickstart your SaaS or MVP launch with ReadyLaunch — a clean, modular, and fully responsive Framer template built for startups, product teams, and early-stage founders.",
  generator: "Framer e0edd7a",
  robots: "max-image-preview:large",
  icons: {
    icon: [
      { url: "https://framerusercontent.com/images/PDLdfGWeOSjOK9KEv5Qut955U.png", media: "(prefers-color-scheme: light)" },
      { url: "https://framerusercontent.com/images/bIoAiZwzbhtErWmX199xbz24DA.png", media: "(prefers-color-scheme: dark)" }
    ],
    apple: "https://framerusercontent.com/images/LgHMsWBfMxBKb6W9P95XQOUsPR4.png"
  },
  openGraph: {
    type: "website",
    title: "ReadyLaunch",
    description: "Kickstart your SaaS or MVP launch with ReadyLaunch — a clean, modular, and fully responsive Framer template built for startups, product teams, and early-stage founders.",
    images: "https://framerusercontent.com/images/oyXhJRBeJeSRD8h071o9BmnZ6U.png",
    url: "https://readylaunch.framer.website/"
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadyLaunch",
    description: "Kickstart your SaaS or MVP launch with ReadyLaunch — a clean, modular, and fully responsive Framer template built for startups, product teams, and early-stage founders.",
    images: "https://framerusercontent.com/images/oyXhJRBeJeSRD8h071o9BmnZ6U.png"
  },
  other: {
    "framer-search-index": "https://framerusercontent.com/sites/15HCAGt7HTKzwoQOuf2CIt/searchIndex-bKzJmyzPpDu9.json"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --token-44021ae2-4cdd-419c-805c-4b1fd642bfaa: rgb(255, 255, 255);
            --token-d3c732bc-55cf-476f-8dd2-e130b23f6381: rgb(38, 38, 38);
          }
          html, body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          #main {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
        `}} />
      </head>
      <body className="bg-white"> 
        <div id="main" data-framer-hydrate-v2='{"routeId":"augiA20Il","localeId":"default","breakpoints":[{"hash":"72rtr7","mediaQuery":"(min-width: 1200px)"},{"hash":"187ctmn","mediaQuery":"(min-width: 810px) and (max-width: 1199px)"},{"hash":"unjy5z","mediaQuery":"(max-width: 809px)"},{"hash":"c3pthz","mediaQuery":"(min-width: 1200px)"},{"hash":"x4vgtb","mediaQuery":"(min-width: 810px) and (max-width: 1199px)"},{"hash":"824o0y","mediaQuery":"(max-width: 809px)"}]}' data-framer-ssr-released-at="2025-07-23T07:48:11.716Z" data-framer-page-optimized-at="2025-07-25T14:17:52.852Z" data-framer-generated-page="">
          <Nav />
          
          <div className="flex flex-col flex-nowrap items-center content-center justify-start gap-0 p-0 relative overflow-visible bg-white w-full h-min" data-layout-template="true" style={{minHeight: '100vh', width: 'auto'}}>
            
            <div data-framer-root="" className="flex flex-col flex-nowrap items-center content-center justify-start gap-0 p-0 relative overflow-hidden bg-white w-[1200px] h-min" style={{minHeight: '100vh', width: 'auto', display: 'contents'}}>
              {children}
            </div>
            
            <div id="overlay"></div>
            <div className="bg-transparent flex-grow h-0 w-0 relative" style={{margin: '0 0 -0px'}}></div>
            
            
            
            <div className="flex-none h-[130px] max-[809px]:h-[68px] left-0 fixed top-0 w-full z-[9] pointer-events-none" style={{order: 1002}}>
              <div className="contents">
                <div style={{position: 'absolute', inset: '0px', overflow: 'hidden'}}>
                  <div style={{opacity: 1, position: 'absolute', inset: '0px', zIndex: 1, maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0) 37.5%)', borderRadius: '0px', pointerEvents: 'none', backdropFilter: 'blur(0.0390625px)', willChange: 'auto'}}></div>
                  <div style={{opacity: 1, position: 'absolute', inset: '0px', zIndex: 2, maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0) 12.5%, rgb(0, 0, 0) 25%, rgb(0, 0, 0) 37.5%, rgba(0, 0, 0, 0) 50%)', borderRadius: '0px', pointerEvents: 'none', backdropFilter: 'blur(0.078125px)', willChange: 'auto'}}></div>
                  <div style={{opacity: 1, position: 'absolute', inset: '0px', zIndex: 3, maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0) 25%, rgb(0, 0, 0) 37.5%, rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0) 62.5%)', borderRadius: '0px', pointerEvents: 'none', backdropFilter: 'blur(0.15625px)', willChange: 'auto'}}></div>
                  <div style={{opacity: 1, position: 'absolute', inset: '0px', zIndex: 4, maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0) 37.5%, rgb(0, 0, 0) 50%, rgb(0, 0, 0) 62.5%, rgba(0, 0, 0, 0) 75%)', borderRadius: '0px', pointerEvents: 'none', backdropFilter: 'blur(0.3125px)', willChange: 'auto'}}></div>
                  <div style={{opacity: 1, position: 'absolute', inset: '0px', zIndex: 5, maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0) 50%, rgb(0, 0, 0) 62.5%, rgb(0, 0, 0) 75%, rgba(0, 0, 0, 0) 87.5%)', borderRadius: '0px', pointerEvents: 'none', backdropFilter: 'blur(0.625px)', willChange: 'auto'}}></div>
                  <div style={{opacity: 1, position: 'absolute', inset: '0px', zIndex: 6, maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0) 62.5%, rgb(0, 0, 0) 75%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)', borderRadius: '0px', pointerEvents: 'none', backdropFilter: 'blur(1.25px)', willChange: 'auto'}}></div>
                  <div style={{opacity: 1, position: 'absolute', inset: '0px', zIndex: 7, maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0) 75%, rgb(0, 0, 0) 87.5%, rgb(0, 0, 0) 100%)', borderRadius: '0px', pointerEvents: 'none', backdropFilter: 'blur(2.5px)', willChange: 'auto'}}></div>
                  <div style={{opacity: 1, position: 'absolute', inset: '0px', zIndex: 8, maskImage: 'linear-gradient(to top, rgba(0, 0, 0, 0) 87.5%, rgb(0, 0, 0) 100%)', borderRadius: '0px', pointerEvents: 'none', backdropFilter: 'blur(5px)', willChange: 'auto'}}></div>
                </div>
              </div>
            </div>
            
            <Cta />
            <Footer />
          </div>
          
          <div id="template-overlay"></div>
        </div>
        <div id="svg-templates" style={{position: 'absolute', overflow: 'hidden', bottom: 0, left: 0, width: 0, height: 0, zIndex: 0, contain: 'strict'}} aria-hidden="true" dangerouslySetInnerHTML={{__html: `
          <svg viewBox="0 0 32 32" id="svg9326151606">
            <path d="M 3.447 11.869 L 3.447 3.551 L 11.704 3.551 L 11.704 11.869 Z" fill="var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))" stroke="var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M 28.447 11.908 L 22.692 11.908 L 22.694 11.911 C 20.704 11.911 20.193 13.401 20.193 14.655 L 20.19 14.651 L 20.19 20.229 L 14.477 20.229 C 12.379 20.277 11.803 22.239 11.719 23.128 L 11.706 23.115 L 11.706 28.551 L 3.449 28.551 L 3.449 20.233 L 9.102 20.233 L 9.095 20.227 C 10.866 20.226 11.841 18.8 11.933 17.725 L 11.933 11.911 L 17.851 11.911 C 19.463 11.794 20.152 10.477 20.189 9.263 L 20.189 3.59 L 28.447 3.59 Z" fill="var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))" stroke="var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          <svg viewBox="0 0 32 32" id="svg11630543270">
            <path d="M 3.447 11.869 L 3.447 3.551 L 11.704 3.551 L 11.704 11.869 Z" fill="var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))" stroke="var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M 28.447 11.908 L 22.692 11.908 L 22.694 11.911 C 20.704 11.911 20.193 13.401 20.193 14.655 L 20.19 14.651 L 20.19 20.229 L 14.477 20.229 C 12.379 20.277 11.803 22.239 11.719 23.128 L 11.706 23.115 L 11.706 28.551 L 3.449 28.551 L 3.449 20.233 L 9.102 20.233 L 9.095 20.227 C 10.866 20.226 11.841 18.8 11.933 17.725 L 11.933 11.911 L 17.851 11.911 C 19.463 11.794 20.152 10.477 20.189 9.263 L 20.189 3.59 L 28.447 3.59 Z" fill="var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))" stroke="var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        `}} />
      </body>
    </html>
  );
}
