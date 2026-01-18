import React, { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Scan, Type } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface QRScannerProps {
  onScan: (qrCodeId: string) => void;
  title?: string;
  description?: string;
}

export function QRScanner({ onScan, title = "Scan Product", description = "Point your camera at the QR code or enter the code manually" }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions or use manual input.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      console.log('Manual code submitted:', manualCode.trim());
      onScan(manualCode.trim());
      setManualCode('');
      setShowManualInput(false);
      
      const codeType = user?.role === 'staff' ? 'Order ID' : 'Product ID';
      toast({
        title: "Manual Code Entered",
        description: `Processing ${codeType}: ${manualCode.trim()}`,
      });
    }
  };

  // All possible demo product codes for customers
  const allDemoProductCodes = [
    'SP-FOOD-001', // Food
    'SP-AUDIO-001', // Electronics
    'SP-APPAREL-001', // Apparel
    'SP-FOOD-003', // Food
    'SP-KITCHEN-001', // Home & Kitchen
    'SP-STATIONARY-001', // Stationery
    'SP-FOOD-002',
    'SP-FOOD-004',
    'SP-FOOD-005',
    'SP-APPAREL-002',
    'SP-AUDIO-002',
    'SP-KITCHEN-002',
  ];

  // Shuffle utility
  function shuffle(array: string[]) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Memoize the shuffled demo codes so they change on refresh/mount
  const demoCodes = useMemo(() => {
    if (user?.role === 'staff') {
      return ['SP-001', 'SP-002', 'SP-003', 'SP-004', 'SP-005'];
    } else {
      return shuffle(allDemoProductCodes).slice(0, 6);
    }
  }, [user?.role]);

  const handleDemoScan = (code: string) => {
    console.log('Demo scan triggered:', code);
    onScan(code);
    
    const codeType = user?.role === 'staff' ? 'order' : 'product';
    toast({
      title: "Demo Scan",
      description: `Scanned demo ${codeType} ID: ${code}`,
    });
  };

  const inputPlaceholder = user?.role === 'staff' 
    ? "Enter Order ID (e.g., SP-001)" 
    : "Enter Product QR Code (e.g., SP-FOOD-001)";

  const inputLabel = user?.role === 'staff' ? "Order ID" : "Product QR Code";
  const demoTitle = user?.role === 'staff' 
    ? "Demo Order IDs (Exit Verification):" 
    : "Demo Product QR Codes (for testing):";

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Scan className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Scanner */}
        {isScanning ? (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-lg bg-muted"
            />
            <div className="flex space-x-2">
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Stop Camera
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Position the QR code within the camera view
            </p>
          </div>
        ) : (
          <Button onClick={startCamera} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Start Camera
          </Button>
        )}

        {/* Manual Input Toggle */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowManualInput(!showManualInput)}
          className="w-full"
        >
          <Type className="h-4 w-4 mr-2" />
          Enter Code Manually
        </Button>

        {/* Manual Input Form */}
        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <Label htmlFor="manual-code">{inputLabel}</Label>
              <Input
                id="manual-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={inputPlaceholder}
                className="mt-1"
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full" disabled={!manualCode.trim()}>
              Submit Code
            </Button>
          </form>
        )}

        {/* Demo Codes */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">{demoTitle}</p>
          <div className="grid grid-cols-3 gap-2">
            {demoCodes.map((code) => (
              <Button
                key={code}
                variant="outline"
                size="sm"
                onClick={() => handleDemoScan(code)}
                className="text-xs"
              >
                {code}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
