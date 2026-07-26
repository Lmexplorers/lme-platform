import { Config } from "@remotion/cli/config";

// Brukes av Remotion Studio / CLI (npm run studio). Selve rendringen skjer
// via server.js med @remotion/renderer.
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(2);
Config.setChromiumHeadlessMode(true);
