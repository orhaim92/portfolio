"use client";

import { useEffect } from "react";

// Tells the server that a real person opened the page, once per browser tab.
// Open the site once with ?owner=1 on your own devices and they stop counting.
export function VisitBeacon() {
  useEffect(() => {
    try {
      if (new URLSearchParams(location.search).has("owner")) localStorage.setItem("owner", "1");
      if (localStorage.getItem("owner") === "1") return;
      if (sessionStorage.getItem("visit-sent")) return;
      sessionStorage.setItem("visit-sent", "1");
    } catch {
      /* storage blocked: still count the visit */
    }
    const body = JSON.stringify({ ref: document.referrer });
    fetch("/api/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }, []);
  return null;
}
