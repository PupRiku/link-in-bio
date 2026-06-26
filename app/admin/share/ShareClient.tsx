"use client";

import Image from "next/image";
import { useState } from "react";

import { Button, Card } from "../_components/ui";
import { CopyIcon, DownloadIcon } from "../_components/icons";

export default function ShareClient({
  shareUrl,
  pngDataUrl,
  svg,
}: {
  shareUrl: string;
  pngDataUrl: string;
  svg: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "riku-qr.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-start">
      <Card className="flex flex-col items-center gap-4">
        <div className="rounded-[14px] bg-bone p-4">
          <Image
            src={pngDataUrl}
            alt="QR code for the public page"
            width={200}
            height={200}
            unoptimized
            className="h-[200px] w-[200px]"
          />
        </div>
        <span className="font-oswald text-[11px] uppercase tracking-[0.18em] text-mute">
          Scan me
        </span>
      </Card>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block font-oswald text-[11px] uppercase tracking-[0.14em] text-mute">
            Public URL
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="w-full rounded-[9px] border border-line-2 bg-panel px-3 py-2.5 text-sm text-bone outline-none"
            />
            <Button variant="ghost" onClick={copy}>
              <CopyIcon className="h-[15px] w-[15px]" />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <div>
          <span className="mb-2 block font-oswald text-[11px] uppercase tracking-[0.14em] text-mute">
            Download
          </span>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="solid" href={pngDataUrl} download="riku-qr.png">
              <DownloadIcon className="h-[15px] w-[15px]" />
              PNG
            </Button>
            <Button variant="primary" onClick={downloadSvg}>
              <DownloadIcon className="h-[15px] w-[15px]" />
              SVG
            </Button>
          </div>
        </div>

        <p className="text-[12.5px] leading-relaxed text-dim">
          The QR points at the site root with a{" "}
          <span className="text-steel">?ref=qr</span> tag. When a visitor taps a
          link, that tag travels in the referrer and shows up in your click
          analytics — so you can tell QR traffic apart from shared links.
        </p>
      </div>
    </div>
  );
}
