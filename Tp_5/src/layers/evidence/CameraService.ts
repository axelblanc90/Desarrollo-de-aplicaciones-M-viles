export class CameraService {
  /**
   * Captures or simulates equipment photograph for field installation audit
   */
  async captureEquipmentPhoto(): Promise<{ uri: string; base64: string }> {
    // Generate an SVG-based clean base64 placeholder image representing hardware audit photo
    const timestamp = new Date().toLocaleString();
    const svgContent = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#131B2E"/>
        <rect x="30" y="50" width="340" height="180" rx="10" fill="#1E293B" stroke="#2563EB" stroke-width="3"/>
        <circle cx="80" cy="140" r="15" fill="#10B981"/>
        <circle cx="120" cy="140" r="15" fill="#10B981"/>
        <circle cx="160" cy="140" r="15" fill="#3B82F6"/>
        <rect x="210" y="125" width="130" height="30" rx="4" fill="#0B0F19"/>
        <text x="200" y="270" font-family="monospace" font-size="12" fill="#94A3B8" text-anchor="middle">EVIDENCIA TÉCNICA AUDITADA</text>
        <text x="200" y="285" font-family="monospace" font-size="10" fill="#64748B" text-anchor="middle">${timestamp}</text>
      </svg>
    `;

    const base64 = typeof btoa !== 'undefined'
      ? `data:image/svg+xml;base64,${btoa(svgContent)}`
      : `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

    return {
      uri: `file:///data/user/0/com.networkqos/cache/audit_${Date.now()}.jpg`,
      base64,
    };
  }
}
