import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertScanSchema, type Scan } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Shield, LogOut, Loader2, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm({
    resolver: zodResolver(insertScanSchema),
    defaultValues: {
      url: "",
    },
  });

  const { data: scans, isLoading: isLoadingScans } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
  });

  const scanMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/scan", { url });
      return res.json();
    },
    onSuccess: (scan: Scan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      setLocation(`/scan/${scan.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Scan failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <h1 className="text-lg font-semibold">Website Scanner</h1>
          </div>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Scan Website</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) =>
                      scanMutation.mutate(data.url)
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter website URL to scan..."
                        {...form.register("url")}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={scanMutation.isPending}
                    >
                      {scanMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Scan Now
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingScans ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !scans?.length ? (
                  <p className="text-center text-muted-foreground p-4">
                    No scans yet. Try scanning a website above.
                  </p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {scans.map((scan) => (
                        <Card key={scan.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setLocation(`/scan/${scan.id}`)}>
                          <CardContent className="flex items-center gap-4 p-4">
                            {scan.isPhishing ? (
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="truncate">{scan.url}</p>
                              <p className="text-sm text-muted-foreground">
                                Risk Score: {scan.riskScore}%
                              </p>
                            </div>
                            <ExternalLink className="h-4 w-4" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
