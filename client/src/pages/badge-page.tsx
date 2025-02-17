import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { type Scan } from "@shared/schema";

export default function BadgePage() {
  const [, params] = useRoute("/badge/:url");
  const url = params?.url ? decodeURIComponent(params.url) : '';

  const { data: scan } = useQuery<Scan>({
    queryKey: [`/api/scans/url/${encodeURIComponent(url)}`],
  });

  if (!scan) {
    return (
      <div className="flex items-center justify-center p-2 bg-background text-foreground">
        <Shield className="h-4 w-4 mr-1" />
        <span className="text-sm">Not scanned</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-2 ${
      scan.isPhishing ? 'bg-destructive/10' : 'bg-green-500/10'
    }`}>
      {scan.isPhishing ? (
        <>
          <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
          <span className="text-sm text-destructive">Risk Score: {scan.riskScore}%</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-sm text-green-700">Safe - {scan.riskScore}% Risk</span>
        </>
      )}
    </div>
  );
}
