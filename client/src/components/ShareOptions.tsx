import { useState } from "react";
import {
  LinkedinShareButton,
  TwitterShareButton,
  LinkedinIcon,
  TwitterIcon,
} from "react-share";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Printer, 
  FileDown, 
  Copy,
  Instagram,
  Check,
  Music,
  Image,
  Link2
} from "lucide-react";
import { CalculatedResults } from "@/lib/types";

interface ShareOptionsProps {
  results: CalculatedResults;
  resultRef: React.RefObject<HTMLDivElement>;
}

function buildShareUrl(results: CalculatedResults): string {
  const params = new URLSearchParams({
    orbit: results.summary.orbitName,
    mass: String(results.summary.mass),
    cost: String(results.metrics.estimatedCost),
    dv: String(results.metrics.deltaV),
    rockets: String(results.compatibleRockets?.length || 0),
  });
  return `${window.location.origin}?mission=${btoa(params.toString())}`;
}

export default function ShareOptions({ results, resultRef }: ShareOptionsProps) {
  const [copied, setCopied] = useState(false);
  const [snapshotGenerated, setSnapshotGenerated] = useState(false);
  const shareUrl = buildShareUrl(results);
  const shareTitle = `Just mapped out a ${results.summary.mass}kg cargo mission to ${results.summary.orbitName} on Orbit 2 Orbit Express!`;
  const shareText = `Mission to ${results.summary.orbitName}: ${results.metrics.deltaV.toLocaleString()} m/s delta-V, ~$${results.metrics.estimatedCost.toLocaleString()} estimated cost, ${results.compatibleRockets?.length || 0} compatible rockets. Calculate your own mission:`;

  const generatePDF = async () => {
    if (!resultRef.current) return;
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(resultRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`Orbit_Logistics_Cargo_${results.summary.orbitName.replace(' ', '_')}_Mission.pdf`);
  };

  const generateSnapshot = async () => {
    if (!resultRef.current) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(resultRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const link = document.createElement("a");
    link.download = `Mission_${results.summary.orbitName.replace(/\s+/g, "_")}_${results.summary.mass}kg.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setSnapshotGenerated(true);
    setTimeout(() => setSnapshotGenerated(false), 2000);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareToInstagram = () => {
    const instagramUrl = `instagram://library?AssetPath=${encodeURIComponent(`${shareTitle}\n\n${shareText}`)}`;
    const webUrl = `https://www.instagram.com`;
    window.location.href = instagramUrl;
    setTimeout(() => {
      window.open(webUrl, '_blank');
    }, 500);
  };
  
  const shareToTikTok = () => {
    window.open(`https://www.tiktok.com/upload?lang=en`, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span>Share Results</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Share Your Mission</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={generateSnapshot} className="cursor-pointer flex items-center gap-2">
          {snapshotGenerated ? <Check className="h-4 w-4 text-green-500" /> : <Image className="h-4 w-4" />}
          <span>{snapshotGenerated ? "Saved!" : "Download Snapshot Image"}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={generatePDF} className="cursor-pointer flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handlePrint} className="cursor-pointer flex items-center gap-2">
          <Printer className="h-4 w-4" />
          <span>Print Results</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyShareLink} className="cursor-pointer flex items-center gap-2">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
          <span>{copied ? "Link Copied!" : "Copy Mission Link"}</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Social Media</DropdownMenuLabel>
        
        <div className="py-2 px-2 flex justify-between">
          <TwitterShareButton url={shareUrl} title={shareText} className="flex flex-col items-center">
            <TwitterIcon size={32} round />
            <span className="text-xs mt-1">X</span>
          </TwitterShareButton>
          
          <LinkedinShareButton url={shareUrl} title={shareTitle} summary={shareText} className="flex flex-col items-center">
            <LinkedinIcon size={32} round />
            <span className="text-xs mt-1">LinkedIn</span>
          </LinkedinShareButton>
          
          <button onClick={shareToInstagram} className="flex flex-col items-center bg-transparent border-none cursor-pointer">
            <div className="bg-rail-red p-1 flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs mt-1">Instagram</span>
          </button>
          
          <button onClick={shareToTikTok} className="flex flex-col items-center bg-transparent border-none cursor-pointer">
            <div className="bg-black rounded-full p-1 flex items-center justify-center" style={{ width: '32px', height: '32px' }}>
              <Music className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs mt-1">TikTok</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
