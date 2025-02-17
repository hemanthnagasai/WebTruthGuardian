import { URL } from "url";
import { checkVirusTotal, checkGoogleSafeBrowsing } from "./services/security";
import axios from "axios";
import * as tls from "tls";
import { createConnection } from "net";

interface ScanResults {
  riskScore: number;
  isPhishing: boolean;
  features: {
    hasHttps: boolean;
    domainAge: string;
    suspiciousUrl: boolean;
    redirectCount: number;
    sslCertificate: {
      valid: boolean;
      issuer?: string;
      expiresAt?: Date;
    };
    securityHeaders: {
      hasHSTS: boolean;
      hasCSP: boolean;
      hasXFrame: boolean;
    };
    phishingPatterns: {
      hasSuspiciousQuery: boolean;
      hasMaliciousKeywords: boolean;
      hasEncodedCharacters: boolean;
      hasIpAddress: boolean;
    };
    virusTotal: {
      isClean: boolean;
      stats: any;
      reputation: number;
    };
    safeBrowsing: {
      isSafe: boolean;
      threats: string[];
    };
  };
}

// Suspicious patterns for phishing detection
const SUSPICIOUS_KEYWORDS = [
  'login', 'account', 'banking', 'secure', 'update', 'verify',
  'signin', 'payment', 'confirm', 'password', 'credential'
];

const SUSPICIOUS_TLD = [
  '.xyz', '.top', '.work', '.loan', '.click', '.diet'
];

async function checkSSLCertificate(hostname: string, port = 443): Promise<{
  valid: boolean;
  issuer?: string;
  expiresAt?: Date;
}> {
  return new Promise((resolve) => {
    const socket = createConnection(port, hostname, () => {
      const tlsSocket = tls.connect({
        socket,
        servername: hostname,
      }, () => {
        const cert = tlsSocket.getPeerCertificate();
        tlsSocket.end();

        if (!cert) {
          resolve({ valid: false });
          return;
        }

        resolve({
          valid: tlsSocket.authorized,
          issuer: cert.issuer?.O || cert.issuer?.CN,
          expiresAt: cert.valid_to ? new Date(cert.valid_to) : undefined,
        });
      });

      tlsSocket.on('error', () => {
        resolve({ valid: false });
      });
    });

    socket.on('error', () => {
      resolve({ valid: false });
    });

    // Set timeout
    socket.setTimeout(5000, () => {
      socket.destroy();
      resolve({ valid: false });
    });
  });
}

async function checkSecurityHeaders(urlString: string) {
  try {
    const response = await axios.head(urlString, {
      maxRedirects: 5,
      timeout: 5000,
      validateStatus: null,
    });

    const headers = response.headers;
    return {
      hasHSTS: !!headers['strict-transport-security'],
      hasCSP: !!headers['content-security-policy'],
      hasXFrame: !!headers['x-frame-options'],
    };
  } catch (error) {
    return {
      hasHSTS: false,
      hasCSP: false,
      hasXFrame: false,
    };
  }
}

function analyzePhishingPatterns(urlString: string): {
  hasSuspiciousQuery: boolean;
  hasMaliciousKeywords: boolean;
  hasEncodedCharacters: boolean;
  hasIpAddress: boolean;
} {
  const url = new URL(urlString);

  // Check for suspicious query parameters
  const hasSuspiciousQuery = url.search.toLowerCase().includes('token') ||
    url.search.toLowerCase().includes('auth') ||
    url.search.toLowerCase().includes('password');

  // Check for malicious keywords in domain
  const hasMaliciousKeywords = SUSPICIOUS_KEYWORDS.some(keyword => 
    url.hostname.toLowerCase().includes(keyword)
  );

  // Check for encoded characters
  const hasEncodedCharacters = urlString.includes('%') || 
    /[^a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;=]/.test(urlString);

  // Check if hostname is an IP address
  const hasIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(url.hostname);

  return {
    hasSuspiciousQuery,
    hasMaliciousKeywords,
    hasEncodedCharacters,
    hasIpAddress,
  };
}

export async function analyzeSite(urlString: string): Promise<ScanResults> {
  const url = new URL(urlString);
  const hasHttps = url.protocol === 'https:';

  // Run all checks in parallel
  const [
    virusTotalResults,
    safeBrowsingResults,
    sslCertificate,
    securityHeaders
  ] = await Promise.all([
    checkVirusTotal(urlString),
    checkGoogleSafeBrowsing(urlString),
    hasHttps ? checkSSLCertificate(url.hostname) : Promise.resolve({ valid: false }),
    checkSecurityHeaders(urlString),
  ]);

  // Analyze phishing patterns
  const phishingPatterns = analyzePhishingPatterns(urlString);

  // Calculate risk score with weighted factors
  const weights = {
    virusTotal: 30,
    safeBrowsing: 25,
    ssl: 15,
    securityHeaders: 10,
    phishingPatterns: 20,
  };

  let riskScore = 0;

  // VirusTotal score
  if (!virusTotalResults.isClean) {
    riskScore += weights.virusTotal;
  }

  // Safe Browsing score
  if (!safeBrowsingResults.isSafe) {
    riskScore += weights.safeBrowsing;
  }

  // SSL score
  if (!hasHttps || !sslCertificate.valid) {
    riskScore += weights.ssl;
  }

  // Security Headers score
  const headerScore = (
    (!securityHeaders.hasHSTS ? 3.33 : 0) +
    (!securityHeaders.hasCSP ? 3.33 : 0) +
    (!securityHeaders.hasXFrame ? 3.33 : 0)
  );
  riskScore += headerScore;

  // Phishing Patterns score
  const phishingScore = (
    (phishingPatterns.hasSuspiciousQuery ? 5 : 0) +
    (phishingPatterns.hasMaliciousKeywords ? 5 : 0) +
    (phishingPatterns.hasEncodedCharacters ? 5 : 0) +
    (phishingPatterns.hasIpAddress ? 5 : 0)
  );
  riskScore += phishingScore;

  return {
    riskScore: Math.min(100, Math.round(riskScore)),
    isPhishing: riskScore > 70,
    features: {
      hasHttps,
      domainAge: "Unknown", // Would require WHOIS API
      suspiciousUrl: SUSPICIOUS_KEYWORDS.some(keyword => url.hostname.includes(keyword)) ||
                    SUSPICIOUS_TLD.some(tld => url.hostname.endsWith(tld)),
      redirectCount: 0,
      sslCertificate,
      securityHeaders,
      phishingPatterns,
      virusTotal: virusTotalResults,
      safeBrowsing: safeBrowsingResults,
    }
  };
}