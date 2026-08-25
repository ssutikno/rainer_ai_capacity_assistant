"use client";

import { useState } from "react";

export function ResultActions() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
    setCopied(true);
    window.setTimeout(() => setCopied(false), 5000);
  }
  return <div className="saved-result-actions"><button className="ghost" onClick={copy}>{copied ? "✓ Link disalin" : "↗ Bagikan hasil"}</button><a className="primary" href="mailto:sales@rainer.id?subject=Konsultasi%20Rainer%20AI%20Assistant">Hubungi Rainer →</a></div>;
}
