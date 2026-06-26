"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

// Minimal typings for Spotify's iFrame API (no official package).
type PlaybackUpdate = { data: { isPaused: boolean } };
type EmbedController = {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  destroy: () => void;
  addListener: (event: string, cb: (e: PlaybackUpdate) => void) => void;
};
type IFrameAPI = {
  createController: (
    el: HTMLElement,
    opts: { uri: string; width: string | number; height: number },
    cb: (controller: EmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
  }
}

export type SpotifyPlayerHandle = { toggle: () => void };

/**
 * Mounts only on the visitor's first tap, so the iFrame API script, the
 * controller, and the embed iframe never load until they opt in. The embed
 * exposes no raw audio data, so the hero waveform stays simulated — this
 * component just reports real play/pause state up so the parent can switch
 * the simulated waveform (and the button) on and off.
 */
const SpotifyPlayer = forwardRef<
  SpotifyPlayerHandle,
  { uri: string; onPlayingChange: (playing: boolean) => void }
>(function SpotifyPlayer({ uri, onPlayingChange }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<EmbedController | null>(null);

  useImperativeHandle(ref, () => ({
    toggle() {
      controllerRef.current?.togglePlay();
    },
  }), []);

  useEffect(() => {
    let cancelled = false;

    const init = (api: IFrameAPI) => {
      if (cancelled || !hostRef.current) return;
      api.createController(
        hostRef.current,
        { uri, width: "100%", height: 152 },
        (controller) => {
          if (cancelled) {
            controller.destroy();
            return;
          }
          controllerRef.current = controller;
          controller.addListener("playback_update", (e) => {
            onPlayingChange(!e.data.isPaused);
          });
          // One tap: attempt playback right away, authorized by the tap that
          // mounted this component. If the browser blocks programmatic play,
          // the loaded embed below stays as the manual fallback.
          controller.play();
        }
      );
    };

    window.onSpotifyIframeApiReady = init;

    let script = document.querySelector<HTMLScriptElement>(
      "script[data-spotify-iframe-api]"
    );
    if (!script) {
      script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.dataset.spotifyIframeApi = "true";
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [uri, onPlayingChange]);

  return (
    <div className="np-embed">
      <div ref={hostRef} />
    </div>
  );
});

export default SpotifyPlayer;
