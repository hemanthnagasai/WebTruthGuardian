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
  Search
} from "lucide-react";
import { type Scan } from "@shared/schema";

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
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scanner
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Risk Score</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on multiple security checks
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{scan.riskScore}%</span>
                </div>
              </div>

              <Progress value={scan.riskScore} className="h-2" />

              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8" />
                <div>
                  <h3 className="font-medium">Safety Assessment</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {scan.isPhishing ? (
                      <>
                        <Badge variant="destructive">Potentially Dangerous</Badge>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </>
                    ) : (
                      <>
                        <Badge variant="default" className="bg-green-500">Safe</Badge>
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
                        {features.virusTotal.stats.malicious} Malicious
                      </span>
                      {features.virusTotal.stats.malicious > 0 && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reputation</p>
                    <span className="font-medium">{features.virusTotal.reputation}</span>
                  </div>
                </div>
              </div>

              {/* Google Safe Browsing Results */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5" />
                  <h3 className="font-medium">Google Safe Browsing</h3>
                </div>
                {features.safeBrowsing.threats.length > 0 ? (
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

          <Card>
            <CardHeader>
              <CardTitle>Security Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {features.hasHttps ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    <span>HTTPS Encryption</span>
                  </div>
                  <Badge variant={features.hasHttps ? "default" : "destructive"}>
                    {features.hasHttps ? "Secure" : "Not Secure"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {features.suspiciousUrl ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    <span>Domain Assessment</span>
                  </div>
                  <Badge variant={features.suspiciousUrl ? "destructive" : "default"}>
                    {features.suspiciousUrl ? "Suspicious" : "Clean"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Domain Age</span>
                  </div>
                  <Badge variant="secondary">
                    {features.domainAge}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Redirect Count</span>
                  </div>
                  <Badge variant="secondary">
                    {features.redirectCount}
                  </Badge>
                </div>
              </div>

              {scan.isPhishing && (
                <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <strong>Warning</strong>
                  </div>
                  <p className="mt-2 text-sm">
                    This website shows multiple signs of being potentially dangerous. 
                    Exercise caution and avoid entering sensitive information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}