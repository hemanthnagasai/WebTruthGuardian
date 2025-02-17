import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Shield, Share2, Code, Twitter, Facebook, Linkedin, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareBadgeProps {
  url: string;
  isPhishing: boolean;
  riskScore: number;
}

export function ShareBadge({ url: websiteUrl, isPhishing, riskScore }: ShareBadgeProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/badge/${encodeURIComponent(websiteUrl)}`;
  const embedCode = `<iframe src="${shareUrl}" width="200" height="50" frameborder="0"></iframe>`;

  const shareText = isPhishing 
    ? `⚠️ This website might be dangerous! Risk score: ${riskScore}%` 
    : `✅ This website is safe! Risk score: ${riskScore}%`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Badge embed code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <h3 className="font-medium">Share Safety Status</h3>
          </div>
          <Badge variant={isPhishing ? "destructive" : "default"} className={!isPhishing ? "bg-green-500" : ""}>
            {isPhishing ? "Potentially Dangerous" : "Safe Website"}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('twitter')}
          >
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('facebook')}
          >
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('linkedin')}
          >
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </Button>
        </div>

        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="sm" className="w-full">
                <Code className="h-4 w-4 mr-2" />
                Get Embed Code
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4">
              <div className="space-y-2">
                <h4 className="font-medium">Embed this badge</h4>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={embedCode}
                    className="w-[300px]"
                  />
                  <Button
                    size="sm"
                    onClick={handleCopyEmbed}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
}