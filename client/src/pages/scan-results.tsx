import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Search,
  Lock
} from "lucide-react";
import { type Scan } from "@shared/schema";
import { ShareBadge } from "@/components/share-badge";

export default function ScanResults() {
  const [, params] = useRoute("/scan/:id");
  const [, setLocation] = useLocation();

  const { data: scan, isLoading } = useQuery<Scan>({
    queryKey: [`/api/scans/${params?.id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Scan not found</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const features = JSON.parse(scan.features);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container py-8 animate-in">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-white/10"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scanner
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Risk Score Card */}
          <Card className="glass-card border overflow-hidden">
            <CardHeader>
              <CardTitle className="bold-heading">Scan Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Risk Score</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on multiple security checks
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold tracking-tight">{scan.riskScore}%</span>
                </div>
              </div>

              <Progress value={scan.riskScore} className="h-2" />

              <div className="flex items-center gap-4 p-4 rounded-lg bg-white/50 dark:bg-black/20">
                <Shield className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold">Safety Assessment</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {scan.isPhishing ? (
                      <>
                        <Badge variant="destructive" className="animate-in">Potentially Dangerous</Badge>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </>
                    ) : (
                      <>
                        <Badge variant="default" className="bg-green-500 animate-in">Safe</Badge>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* VirusTotal Results */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-5 w-5" />
                  <h3 className="font-medium">VirusTotal Analysis</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Security Vendors</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {features.virusTotal?.stats?.malicious || 0} Malicious
                      </span>
                      {(features.virusTotal?.stats?.malicious || 0) > 0 && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reputation</p>
                    <span className="font-medium">{features.virusTotal?.reputation || 0}</span>
                  </div>
                </div>
              </div>

              {/* Google Safe Browsing Results */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5" />
                  <h3 className="font-medium">Google Safe Browsing</h3>
                </div>
                {features.safeBrowsing?.threats?.length > 0 ? (
                  <div>
                    <Badge variant="destructive" className="mb-2">
                      Threats Detected
                    </Badge>
                    <ul className="space-y-1">
                      {features.safeBrowsing.threats.map((threat: string) => (
                        <li key={threat} className="text-sm">
                          • {threat.replace('_', ' ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">No Threats</Badge>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Features Card */}
          <Card className="glass-card border">
            <CardHeader>
              <CardTitle className="bold-heading">Security Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SSL Certificate Section with glass morphic effect */}
              <div className="space-y-4 p-4 rounded-lg bg-white/50 dark:bg-black/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    <div>
                      <h3 className="font-semibold">SSL Certificate</h3>
                      <p className="text-sm text-muted-foreground">
                        {features.sslCertificate?.valid ? features.sslCertificate?.issuer : 'No valid certificate'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={features.sslCertificate?.valid ? "default" : "destructive"}
                    className="animate-in"
                  >
                    {features.sslCertificate?.valid ? "Valid" : "Invalid"}
                  </Badge>
                </div>
              </div>

              {/* Security Headers with minimalistic design */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold text-lg mb-3">Security Headers</h3>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">HTTP Strict Transport Security</span>
                    {features.securityHeaders?.hasHSTS ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Security Policy</span>
                    {features.securityHeaders?.hasCSP ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">X-Frame-Options</span>
                    {features.securityHeaders?.hasXFrame ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              </div>

              {/* Phishing Detection with enhanced visual hierarchy */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold text-lg mb-3">Phishing Detection</h3>
                <div className="grid gap-2">
                  {features.phishingPatterns?.hasSuspiciousQuery && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Suspicious query parameters detected</span>
                    </div>
                  )}
                  {features.phishingPatterns?.hasMaliciousKeywords && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Suspicious keywords in domain</span>
                    </div>
                  )}
                  {features.phishingPatterns?.hasEncodedCharacters && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Encoded characters in URL</span>
                    </div>
                  )}
                  {features.phishingPatterns?.hasIpAddress && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">IP address used instead of domain name</span>
                    </div>
                  )}
                  {!Object.values(features.phishingPatterns || {}).some(Boolean) && (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">No suspicious patterns detected</span>
                    </div>
                  )}
                </div>
              </div>

              {scan.isPhishing && (
                <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 animate-in">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <strong className="font-semibold">Warning</strong>
                  </div>
                  <p className="mt-2 text-sm">
                    This website shows multiple signs of being potentially dangerous.
                    Exercise caution and avoid entering sensitive information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Badge Card */}
          <div className="col-span-2">
            <ShareBadge
              url={scan.url}
              isPhishing={scan.isPhishing}
              riskScore={scan.riskScore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}