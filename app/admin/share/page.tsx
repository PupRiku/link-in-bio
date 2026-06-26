import { headers } from "next/headers";
import QRCode from "qrcode";

import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "../_components/ui";
import ShareClient from "./ShareClient";

export const dynamic = "force-dynamic";

export default async function SharePage() {
  await requireAdmin();

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  // ?ref=qr rides along so QR-sourced visits show up in the referrer captured
  // by the /go click logging.
  const shareUrl = `${proto}://${host}/?ref=qr`;

  const opts = { margin: 2, color: { dark: "#0a0a0b", light: "#ede9e3" } };
  const [pngDataUrl, svg] = await Promise.all([
    QRCode.toDataURL(shareUrl, { ...opts, width: 640 }),
    QRCode.toString(shareUrl, { ...opts, type: "svg", width: 640 }),
  ]);

  return (
    <>
      <PageHeader
        title="Share"
        subtitle="QR code for the public page — print it, stick it, NFC it. Scans are tagged ?ref=qr."
      />
      <ShareClient shareUrl={shareUrl} pngDataUrl={pngDataUrl} svg={svg} />
    </>
  );
}
