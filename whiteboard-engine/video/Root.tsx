import { registerRoot, Composition } from "remotion";
import { WhiteboardEngine, WhiteboardProps } from "./WhiteboardEngine";
import { VeoComposition, VeoProps } from "./VeoComposition";
import { SlideshowVideo, SlideshowProps } from "./SlideshowVideo";

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
    </>
  );
};

registerRoot(RemotionRoot);
