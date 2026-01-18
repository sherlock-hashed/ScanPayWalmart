import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatPrice } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Download, 
  Home, 
  QrCode,
  Receipt,
  Clock,
  MapPin,
  Copy,
  FileText,
  ArrowLeft,
  Star,
  Coins,
  Gift
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { fetchOrdersByUserId, fetchAllOrders } from '@/lib/orders';
import { useAuth } from '@/context/AuthContext';

interface OrderDetails {
  orderId: string;
  exitQRData: string;
  items: any[];
  totalAmount: number;
  finalAmount?: number;
  pointsRedeemed?: number;
  discountFromPoints?: number;
  pointsEarned?: number;
  shippingInfo: any;
  timestamp: string;
}

export default function InvoicePage() {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId: paramOrderId } = useParams();
  const receiptRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // For fallback display
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);

  useEffect(() => {
    async function loadOrder() {
      if (!user) {
        navigate('/cart');
        return;
      }
      try {
        if (paramOrderId) {
          // Fetch all orders and find the one with this Firebase key or orderId
          const allOrders = await fetchAllOrders();
          console.log('paramOrderId:', paramOrderId);
          console.log('all order keys:', allOrders.map(o => o.id));
          console.log('all orderIds:', allOrders.map(o => o.orderId));
          const found = allOrders.find((o: any) => o.id === paramOrderId || o.orderId === paramOrderId);
          if (found) {
            setOrderDetails(found);
            // Calculate time remaining (15 minutes from order timestamp)
            const orderTime = new Date(found.timestamp).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - orderTime) / 1000);
            const remaining = Math.max(900 - elapsed, 0);
            setTimeRemaining(remaining);
            return;
          } else {
            // Save all orders for fallback display
            setOrderDetails(null);
            setAvailableOrders(allOrders);
            return;
          }
        }
        // fallback: show most recent order for user
        const orders = await fetchOrdersByUserId(user.email || user.id);
        if (orders.length > 0) {
          const sorted = orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setOrderDetails(sorted[0]);
          const orderTime = new Date(sorted[0].timestamp).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - orderTime) / 1000);
          const remaining = Math.max(900 - elapsed, 0);
          setTimeRemaining(remaining);
        } else {
          setOrderDetails(null);
        }
      } catch (error) {
        console.error('Failed to load order details:', error);
        setOrderDetails(null);
      }
    }
    loadOrder();
    // eslint-disable-next-line
  }, [user, navigate, paramOrderId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(prev - 1, 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  // Auto-generate PDF if navigated from payment
  // useEffect(() => {
  //   if (orderDetails && location.state?.autoDownload) {
  //     generatePDF();
  //   }
  //   // eslint-disable-next-line
  // }, [orderDetails]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyOrderId = () => {
    if (orderDetails) {
      navigator.clipboard.writeText(orderDetails.orderId);
      toast({
        title: "Order ID Copied",
        description: "Order ID has been copied to clipboard.",
      });
    }
  };

  const generatePDF = async () => {
    if (!orderDetails || !receiptRef.current) return;

    setIsDownloading(true);
    
    try {
      // Create a temporary element for PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.padding = '20px';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.width = '800px';
      
      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; font-size: 28px; margin-bottom: 8px;">ScanPay</h1>
          <p style="color: #222; font-size: 16px;">Smart Checkout Solution</p>
          <p style="color: #333; font-size: 14px;">${new Date().toLocaleDateString('en-IN')}</p>
        </div>
        
        <div style="border-bottom: 2px solid #6B46C1; margin-bottom: 20px;">
          <h2 style="color: #111; font-size: 24px; margin-bottom: 10px;">Purchase Receipt</h2>
        </div>
        
        <div style="margin-bottom: 30px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <p style="color: #222; font-size: 14px; margin-bottom: 4px;">Order ID</p>
              <p style="font-weight: bold; font-size: 16px; color: #111;">${orderDetails.orderId}</p>
            </div>
            <div>
              <p style="color: #222; font-size: 14px; margin-bottom: 4px;">Date & Time</p>
              <p style="font-weight: bold; font-size: 16px; color: #111;">${new Date(orderDetails.timestamp).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            <div>
              <p style="color: #222; font-size: 14px; margin-bottom: 4px;">Customer</p>
              <p style="font-weight: bold; font-size: 16px; color: #111;">${orderDetails.shippingInfo.name}</p>
            </div>
            <div>
              <p style="color: #222; font-size: 14px; margin-bottom: 4px;">Status</p>
              <p style="color: #16a34a; font-weight: bold; font-size: 16px;">PAID</p>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #111; font-size: 18px; margin-bottom: 15px;">Items Purchased</h3>
          <table style="width: 100%; border-collapse: collapse; color: #111;">
            <thead>
              <tr style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; color: #111;">
                <th style="padding: 12px; text-align: left; font-weight: 600;">Item</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Unit Price</th>
                <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.items.map(item => `
                <tr style="border-bottom: 1px solid #dee2e6; color: #111;">
                  <td style="padding: 12px;">${item.product.name}</td>
                  <td style="padding: 12px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right;">${formatPrice(item.itemPrice)}</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600;">${formatPrice(item.itemPrice * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px; color: #111;">
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #111;">
              <span>Subtotal:</span>
              <span>${formatPrice(orderDetails.totalAmount)}</span>
            </div>
            ${orderDetails.discountFromPoints ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #16a34a;">
              <span>Points Discount (${orderDetails.pointsRedeemed} points):</span>
              <span>-${formatPrice(orderDetails.discountFromPoints)}</span>
            </div>
            ` : ''}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #dee2e6; padding-top: 10px;">
            <span style="font-size: 20px; font-weight: 600; color: #111;">Total Amount Paid</span>
            <span style="font-size: 24px; font-weight: bold; color: #111;">${formatPrice(orderDetails.finalAmount || orderDetails.totalAmount)}</span>
          </div>
          ${orderDetails.pointsEarned ? `
          <div style="margin-top: 15px; padding: 10px; background-color: #fef3c7; border-radius: 6px; color: #d97706;">
            <div style="display: flex; align-items: center;">
              <span style="font-weight: 600;">🎉 Points Earned: ${orderDetails.pointsEarned} points!</span>
            </div>
          </div>
          ` : ''}
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #111; font-size: 18px; margin-bottom: 15px;">Billing Address</h3>
          <div style="color: #111; line-height: 1.6;">
            <p style="font-weight: 600; color: #111;">${orderDetails.shippingInfo.name}</p>
            <p>${orderDetails.shippingInfo.email}</p>
            ${orderDetails.shippingInfo.phone ? `<p>${orderDetails.shippingInfo.phone}</p>` : ''}
            <p>${orderDetails.shippingInfo.address}</p>
            <p>${orderDetails.shippingInfo.city}${orderDetails.shippingInfo.state ? `, ${orderDetails.shippingInfo.state}` : ''}${orderDetails.shippingInfo.zipCode ? ` ${orderDetails.shippingInfo.zipCode}` : ''}</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 2px solid #6B46C1; margin-top: 40px;">
          <p style="color: #111; font-size: 14px;">Thank you for shopping with ScanPay!</p>
          <p style="color: #222; font-size: 12px; margin-top: 8px;">This receipt was generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</p>
        </div>
      `;
      
      document.body.appendChild(pdfContent);
      
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(pdfContent);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `ScanPay_Receipt_${orderDetails.orderId}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Receipt Downloaded Successfully",
        description: `Your receipt has been saved as ${fileName}`,
      });
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF receipt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardTitle>No order found</CardTitle>
          <CardContent>
            <p className="mb-4">We couldn't find this order. Please check your orders list.</p>
            <Button onClick={() => navigate('/orders')}>Go to My Orders</Button>
            {availableOrders.length > 0 && (
              <div className="mt-6">
                <div className="font-bold mb-2">Available Orders:</div>
                <ul className="text-xs">
                  {availableOrders.map((o, idx) => (
                    <li key={idx}>
                      <b>id:</b> {o.id} | <b>orderId:</b> {o.orderId}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Success Header with Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in animate-delay-200">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            Your order has been processed and is ready for pickup.
          </p>
          
          {/* Points Earned Notification */}
          {orderDetails.pointsEarned && orderDetails.pointsEarned > 0 && (
            <div className="mt-6 animate-fade-in animate-delay-500">
              <Card className="max-w-md mx-auto bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                        🎉 You earned {orderDetails.pointsEarned} points!
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300">
                        Keep shopping to earn more rewards
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-in animate-delay-300" ref={receiptRef}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5" />
                  <span>Order Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Order ID</p>
                    <p className="font-medium text-foreground">{orderDetails.orderId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Order Date</p>
                    <p className="font-medium text-foreground">
                      {new Date(orderDetails.timestamp).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Payment Status</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Customer</p>
                    <p className="font-medium text-foreground">{orderDetails.shippingInfo.name}</p>
                  </div>
                </div>

                {/* Download PDF Button */}
                <div className="flex justify-end mt-4">
                  <Button onClick={generatePDF} disabled={isDownloading} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                  </Button>
                </div>

                <Separator />

                {/* Itemized List */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center space-x-2">
                    <Receipt className="h-4 w-4" />
                    <span>Items Purchased</span>
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderDetails.items.map((item) => (
                        <TableRow key={item.product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.product.imageURL}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded-lg bg-muted"
                              />
                              <span className="font-medium">{item.product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatPrice(item.itemPrice)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatPrice(item.itemPrice * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator />

                {/* Shipping Information */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Billing Information</span>
                  </h3>
                  <div className="text-sm space-y-1 bg-muted/30 p-4 rounded-lg">
                    <p className="font-medium text-foreground">{orderDetails.shippingInfo.name}</p>
                    <p className="text-muted-foreground">{orderDetails.shippingInfo.email}</p>
                    {orderDetails.shippingInfo.phone && (
                      <p className="text-muted-foreground">{orderDetails.shippingInfo.phone}</p>
                    )}
                    <p className="text-muted-foreground">
                      {orderDetails.shippingInfo.address}
                      {orderDetails.shippingInfo.city && `, ${orderDetails.shippingInfo.city}`}
                      {orderDetails.shippingInfo.state && `, ${orderDetails.shippingInfo.state}`}
                      {orderDetails.shippingInfo.zipCode && ` ${orderDetails.shippingInfo.zipCode}`}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(orderDetails.totalAmount)}</span>
                  </div>
                  {orderDetails.discountFromPoints && orderDetails.discountFromPoints > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 flex items-center space-x-1">
                        <Coins className="h-3 w-3" />
                        <span>Points Discount ({orderDetails.pointsRedeemed} points)</span>
                      </span>
                      <span className="font-medium text-green-600">-{formatPrice(orderDetails.discountFromPoints)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total Amount Paid</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(orderDetails.finalAmount || orderDetails.totalAmount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exit Information & Actions */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <Card className="glass-card animate-fade-in animate-delay-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5" />
                  <span>Exit Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                {/* QR Code with Pulse Animation */}
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 animate-pulse-slow">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                </div>
                
                {/* Order ID Display */}
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Order ID
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-mono font-bold text-foreground">
                        {orderDetails.orderId}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyOrderId}
                        className="hover-scale"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm font-medium text-foreground">
                    Show this Order ID at store exit
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Staff will verify your purchase using this Order ID
                  </p>
                </div>

                {timeRemaining > 0 ? (
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">
                      Valid for: <span className="font-medium text-orange-500">
                        {formatTime(timeRemaining)}
                      </span>
                    </span>
                  </div>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Order ID Expired
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3 animate-fade-in animate-delay-700">
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                className="w-full hover-scale"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>

              <Button 
                onClick={() => navigate(-1)} 
                variant="ghost" 
                className="w-full hover-scale"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
