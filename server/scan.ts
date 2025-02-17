import { URL } from "url";
import { checkVirusTotal, checkGoogleSafeBrowsing } from "./services/security";

interface ScanResults {
  riskScore: number;
  isPhishing: boolean;
  features: {
    hasHttps: boolean;
    domainAge: string;
    suspiciousUrl: boolean;
    redirectCount: number;
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

export async function analyzeSite(urlString: string): Promise<ScanResults> {
  const url = new URL(urlString);

  // Basic analysis features
  const hasHttps = url.protocol === 'https:';
  const suspiciousUrl = /[0-9]{4,}|login|secure|account/.test(url.hostname);

  // Check VirusTotal and Safe Browsing
  const [virusTotalResults, safeBrowsingResults] = await Promise.all([
    checkVirusTotal(urlString),
    checkGoogleSafeBrowsing(urlString),
  ]);

  // Calculate risk score based on all factors
  const vtScore = virusTotalResults.isClean ? 0 : 40;
  const sbScore = safeBrowsingResults.isSafe ? 0 : 40;
  const basicScore = (hasHttps ? 0 : 10) + (suspiciousUrl ? 10 : 0);

  const riskScore = Math.min(100, vtScore + sbScore + basicScore);

  return {
    riskScore,
    isPhishing: riskScore > 70,
    features: {
      hasHttps,
      domainAge: "Unknown", // Would require WHOIS API
      suspiciousUrl,
      redirectCount: 0,
      virusTotal: virusTotalResults,
      safeBrowsing: safeBrowsingResults,
    }
  };
}