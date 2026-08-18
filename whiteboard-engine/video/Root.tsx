import { registerRoot, Composition } from "remotion";
import { WhiteboardEngine, WhiteboardProps } from "./WhiteboardEngine";
import { VeoComposition, VeoProps } from "./VeoComposition";
import { SlideshowVideo, SlideshowProps } from "./SlideshowVideo";
import { EpisodeComposition, EpisodeProps } from "./EpisodeComposition";
import { CaptionedSlideshow, CaptionedProps } from "./CaptionedSlideshow";

// Standardverdier brukes i Remotion Studio (forhåndsvisning). Under kjøring
// sender server.js inn ekte inputProps, og calculateMetadata setter riktig
// lengde/fps ut fra manuset.
const defaultProps: WhiteboardProps = {
  audioUrl: "",
  imageUrl: "",
  handUrl: "",
  drawing: null,
  textTimestamps: [],
  totalFrames: 900,
  fps: 30,
};

const veoDefaults: VeoProps = {
  scenes: [],
  fps: 30,
  totalFrames: 900,
};

const slideshowDefaults: SlideshowProps = {
  scenes: [],
  fps: 30,
  totalFrames: 900,
};

const episodeDefaults: EpisodeProps = {
  shots: [],
  fps: 30,
  totalFrames: 900,
};

const captionedDefaults: CaptionedProps = {
  scenes: [],
  fps: 30,
  totalFrames: 900,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WhiteboardComposition"
        component={WhiteboardEngine}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Number(props.totalFrames) || 900),
          fps: Number(props.fps) || 30,
        })}
      />
      {/* Veo-varianten (Nano Banana + Veo): vertikal 9:16, satt sammen av klipp. */}
      <Composition
        id="VeoComposition"
        component={VeoComposition}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={veoDefaults}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Number(props.totalFrames) || 900),
          fps: Number(props.fps) || 30,
        })}
      />
      {/* Slideshow-varianten (YouTube-appen): stillbilder med Ken Burns +
          stemme per kapittel, ingen Veo-videoklipp. Horisontal 16:9 for lange
          videoer, vertikal 9:16 for Shorts (props.aspect, satt av server.js). */}
      <Composition
        id="SlideshowComposition"
        component={SlideshowVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={slideshowDefaults}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Number(props.totalFrames) || 900),
          fps: Number(props.fps) || 30,
          width: props.aspect === "9:16" ? 1080 : 1920,
          height: props.aspect === "9:16" ? 1920 : 1080,
        })}
      />
      {/* Mia & Teo Video Creator, final assembly: approved shot clips +
          dialogue/narration audio, sequenced into one finished episode.
          16:9 by default (Mia & Teo's primary format), 9:16 optional. */}
      <Composition
        id="EpisodeComposition"
        component={EpisodeComposition}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={episodeDefaults}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Number(props.totalFrames) || 900),
          fps: Number(props.fps) || 30,
          width: props.aspect === "9:16" ? 1080 : 1920,
          height: props.aspect === "9:16" ? 1920 : 1080,
        })}
      />
      {/* LME VideoFlow: styled Ken Burns slideshow with word-level karaoke
          captions burned in. 16:9 by default, 9:16 optional. */}
      <Composition
        id="CaptionedSlideshowComposition"
        component={CaptionedSlideshow}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={captionedDefaults}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, Number(props.totalFrames) || 900),
          fps: Number(props.fps) || 30,
          width: props.aspect === "9:16" ? 1080 : 1920,
          height: props.aspect === "9:16" ? 1920 : 1080,
        })}
      />
    </>
  );
};

registerRoot(RemotionRoot);
