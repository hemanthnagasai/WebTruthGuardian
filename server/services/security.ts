import axios from "axios";

interface VirusTotalResponse {
  data: {
    attributes: {
      last_analysis_stats: {
        malicious: number;
        suspicious: number;
        harmless: number;
        undetected: number;
      };
      reputation: number;
    };
  };
}

interface SafeBrowsingResponse {
  matches?: Array<{
    threatType: string;
    platformType: string;
    threat: { url: string };
  }>;
}

export async function checkVirusTotal(url: string): Promise<{
  isClean: boolean;
  stats: any;
  reputation: number;
}> {
  try {
    const response = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encodeURIComponent(url)}`,
      {
        headers: {
          'x-apikey': process.env.VIRUSTOTAL_API_KEY,
        },
      }
    );

    const data = response.data as VirusTotalResponse;
    const stats = data.data.attributes.last_analysis_stats;
    
    return {
      isClean: stats.malicious === 0 && stats.suspicious === 0,
      stats,
      reputation: data.data.attributes.reputation,
    };
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return {
      isClean: true,
      stats: {
        malicious: 0,
        suspicious: 0,
        harmless: 0,
        undetected: 0,
      },
      reputation: 0,
    };
  }
}

export async function checkGoogleSafeBrowsing(url: string): Promise<{
  isSafe: boolean;
  threats: string[];
}> {
  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`,
      {
        client: {
          clientId: "website-scanner",
          clientVersion: "1.0.0"
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE",
            "POTENTIALLY_HARMFUL_APPLICATION"
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      }
    );

    const data = response.data as SafeBrowsingResponse;
    const threats = data.matches?.map(match => match.threatType) || [];

    return {
      isSafe: !data.matches || data.matches.length === 0,
      threats,
    };
  } catch (error) {
    console.error('Google Safe Browsing API error:', error);
    return {
      isSafe: true,
      threats: [],
    };
  }
}
