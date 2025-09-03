import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const backendUploadsUrl = process.env.NEXT_PUBLIC_BACKEND_UPLOADS_URL || "http://localhost:3002";
    const backendChatUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
    let cspHeader = '';

    if (process.env.NODE_ENV === 'development') {
        // For development, allow unsafe-eval and unsafe-inline for easier debugging.
        cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/api.js https://www.gstatic.com/recaptcha/ https://unpkg.com/leaflet@* https://cdn.jsdelivr.net/npm/leaflet@*;
        connect-src 'self' ${backendUrl} ${backendChatUrl} https://www.google.com https://unpkg.com/leaflet@* https://cdn.jsdelivr.net/npm/leaflet@* https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://nominatim.openstreetmap.org https://api.mapbox.com https://www.gstatic.com/recaptcha/releases/;
        style-src 'self' 'unsafe-inline' https://unpkg.com/leaflet@* https://cdn.jsdelivr.net/npm/leaflet@*;
        img-src 'self' ${backendUploadsUrl} blob: data: https://unpkg.com/leaflet@* https://cdn.jsdelivr.net/npm/leaflet@* https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org;
        frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
        `;
    } else {
        // For production, strict and secure CSP.
        cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' https://www.google.com/recaptcha/api.js https://www.gstatic.com/recaptcha/ https://unpkg.com/leaflet@* https://cdn.jsdelivr.net/npm/leaflet@*;
        connect-src 'self' ${backendUrl} https://www.google.com https://unpkg.com/leaflet@* https://cdn.jsdelivr.net/npm/leaflet@* https://{s}.tile.openstreetmap.org https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org;
        style-src 'self' 'nonce-${nonce}' https://unpkg.com/leaflet@* https://cdn.jsdelivr.net/npm/leaflet@*;
        img-src 'self' blob: data: https://unpkg.com/leaflet@* https://cdn.jsdelivr.net/npm/leaflet@* https://{s}.tile.openstreetmap.org https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org;
        frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
        `;
    }

  // Clone the request headers, set the Content Security Policy and a custom nonce header
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim());
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set the CSP in the response headers for the browser
  response.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim());
  return response;
}