import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRScanner } from '@/components/qr/qr-scanner';
import { OrderDetailsDialog } from '@/components/staff/OrderDetailsDialog';
import { FlaggedOrderAlert } from '@/components/staff/FlaggedOrderAlert';
import { formatPrice } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  User,
  Package,
  Scan,
  RefreshCw,
  ShoppingCart,
  Flag,
  Shield
} from 'lucide-react';
import { generateDemoScenarios, type OrderWithRisk as BaseOrderWithRisk } from '@/services/anomalyService';
import { fetchAllOrders, updateOrderStatus, deleteOrder } from '@/lib/orders';

type OrderWithRisk = BaseOrderWithRisk & { id: string };

interface VerificationResult {
  status: 'success' | 'error' | 'warning';
  message: string;
  orderDetails?: any;
}

export default function StaffDashboard() {
  const [allOrders, setAllOrders] = useState<OrderWithRisk[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OrderWithRisk[]>([]);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'flagged' | 'verified'>('all');

  // Fetch all orders from Firebase
  const fetchAndSetAllOrders = async () => {
    try {
      const orders = await fetchAllOrders();
      const mappedOrders = orders
        .filter((order: any) => order.orderId && order.items && order.shippingInfo)
        .map((order: any) => ({
          id: order.id,
          orderId: order.orderId,
          customerName: order.shippingInfo?.name || 'Unknown',
          totalAmount: order.finalAmount || order.totalAmount,
          itemCount: order.items?.length || 0,
          timestamp: order.timestamp,
          status: order.status || 'pending',
          items: order.items,
          suspicionScore: order.suspicionScore,
          needsManualVerification: order.needsManualVerification,
          triggeredRules: order.triggeredRules
        }));
      setAllOrders(mappedOrders);
      setPendingOrders(mappedOrders.filter(order => order.status === 'pending' || order.status === 'flagged'));
    } catch {
      setAllOrders([]);
      setPendingOrders([]);
    }
  };

  useEffect(() => {
    fetchAndSetAllOrders();
  }, []);

  const handleOrderIdScan = async (orderId: string) => {
    setIsScanning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      let orderExists = allOrders.find(order => order.orderId === orderId);
      if (!orderExists) {
        orderExists = allOrders.find(order => order.orderId.includes(orderId) || orderId.includes(order.orderId));
      }
      if (orderExists) {
        setVerificationResult({
          status: 'success',
          message: 'Customer exit verified successfully!',
          orderDetails: { ...orderExists, verifiedAt: new Date().toISOString() }
        });
        await updateOrderStatus(orderExists.id, 'verified');
        toast({ title: "Exit Verified ✅", description: `Customer ${orderExists.customerName} can now exit the store.` });
        await fetchAndSetAllOrders();
      } else {
        setVerificationResult({ status: 'warning', message: `Order ID "${orderId}" not found or already verified.` });
        toast({ title: "Order Not Found ⚠️", description: `Order ID "${orderId}" was not found in pending exits.`, variant: "destructive" });
      }
    } catch (error) {
      setVerificationResult({ status: 'error', message: 'Verification failed. Please try again.' });
      toast({ title: "Verification Error", description: "Failed to verify order. Please try again.", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDirectVerify = async (order: OrderWithRisk) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setVerificationResult({ status: 'success', message: 'Order verified successfully!', orderDetails: { ...order, verifiedAt: new Date().toISOString() } });
      await updateOrderStatus(order.id, 'verified');
      toast({ title: "Order Verified ✅", description: `${order.customerName}'s order has been verified.` });
      await fetchAndSetAllOrders();
    } catch (error) {
      toast({ title: "Verification Error", description: "Failed to verify order. Please try again.", variant: "destructive" });
    }
  };

  const handleViewOrderDetails = (orderDetails: any) => {
    setSelectedOrderDetails(orderDetails);
    setIsOrderDetailsOpen(true);
  };

  const clearVerificationResult = () => {
    setVerificationResult(null);
  };

  const refreshPendingOrders = () => {
    fetchAndSetAllOrders();
    toast({ title: "Refreshed", description: "Pending orders list has been refreshed." });
  };

  // Analytics (from allOrders)
  const totalOrders = allOrders.length;
  const pendingCount = allOrders.filter(order => order.status === 'pending').length;
  const flaggedCount = allOrders.filter(order => order.status === 'flagged').length;
  const verifiedCount = allOrders.filter(order => order.status === 'verified').length;
  const totalSales = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  // Filtering and search (from pendingOrders)
  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      order.orderId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'flagged' ? order.status === 'flagged' :
      statusFilter === 'pending' ? order.status === 'pending' : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Staff Dashboard
          </h1>
          <p className="text-muted-foreground">
            Scan customer Order IDs or verify orders directly • AI-powered anomaly detection active
          </p>
          {/* Analytics and Filters */}
          <div className="mt-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="bg-primary/10 rounded-lg px-4 py-2 text-sm font-semibold">Total Orders: {totalOrders}</div>
              <div className="bg-yellow-100 text-yellow-800 rounded-lg px-4 py-2 text-sm font-semibold">Pending: {pendingCount}</div>
              <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2 text-sm font-semibold">Flagged: {flaggedCount}</div>
              <div className="bg-green-100 text-green-800 rounded-lg px-4 py-2 text-sm font-semibold">Verified: {verifiedCount}</div>
              <div className="bg-blue-100 text-blue-800 rounded-lg px-4 py-2 text-sm font-semibold">Total Sales: ₹{totalSales}</div>
            </div>
            <div className="flex gap-2 items-center mt-2 md:mt-0">
              <input
                type="text"
                placeholder="Search by customer or order ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring focus:border-primary"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:border-primary"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order ID Scanner Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scan className="h-5 w-5" />
                  <span>Order ID Scanner</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRScanner
                  onScan={handleOrderIdScan}
                  title="Scan Order ID"
                  description="Scan or enter the customer's Order ID to verify their purchase"
                />
              </CardContent>
            </Card>

            {/* Verification Result */}
            {verificationResult && (
              <Card className={`border-2 ${
                verificationResult.status === 'success' 
                  ? 'border-green-200 dark:border-green-800' 
                  : verificationResult.status === 'warning'
                    ? 'border-yellow-200 dark:border-yellow-800'
                    : 'border-red-200 dark:border-red-800'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {verificationResult.status === 'success' && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                      {verificationResult.status === 'warning' && (
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      )}
                      {verificationResult.status === 'error' && (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        verificationResult.status === 'success' 
                          ? 'text-green-600' 
                          : verificationResult.status === 'warning'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}>
                        {verificationResult.status === 'success' ? 'Verified' : 
                         verificationResult.status === 'warning' ? 'Warning' : 'Error'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearVerificationResult}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-foreground mb-4">{verificationResult.message}</p>
                  
                  {verificationResult.orderDetails && (
                    <div className="space-y-4">
                      {/* Risk Analysis Alert */}
                      {verificationResult.orderDetails.needsManualVerification && (
                        <FlaggedOrderAlert order={verificationResult.orderDetails} />
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Order ID</p>
                          <p className="font-medium">{verificationResult.orderDetails.orderId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Customer</p>
                          <p className="font-medium">{verificationResult.orderDetails.customerName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-medium">{formatPrice(verificationResult.orderDetails.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Items</p>
                          <p className="font-medium">{verificationResult.orderDetails.itemCount} items</p>
                        </div>
                      </div>
                      
                      {verificationResult.status === 'success' && (
                        <Button
                          onClick={() => handleViewOrderDetails(verificationResult.orderDetails)}
                          variant="outline"
                          className="w-full"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View Order Details
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pending Orders Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Pending Exits</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshPendingOrders}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-muted-foreground">No orders found.</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <Card 
                        key={order.orderId} 
                        className={`border animate-fade-in ${
                          order.needsManualVerification 
                            ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10' 
                            : 'border'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">
                                {order.customerName}
                              </span>
                              {order.needsManualVerification && (
                                <div className="flex items-center space-x-1">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <Badge variant="destructive" className="text-xs">
                                    <Flag className="h-3 w-3 mr-1" />
                                    Flagged
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <Badge variant="secondary">{order.orderId}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">Total Amount</p>
                              <p className="font-medium text-foreground">
                                {formatPrice(order.totalAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Items</p>
                              <p className="font-medium text-foreground">
                                {order.itemCount} items
                              </p>
                            </div>
                          </div>

                          {/* Risk Score Display */}
                          {order.suspicionScore !== undefined && order.suspicionScore > 0 && (
                            <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                              <div className="flex items-center space-x-2 text-sm">
                                <Shield className="h-4 w-4 text-yellow-600" />
                                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                                  Risk Score: {Math.min(10, Math.round(order.suspicionScore))}/10
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="mb-3 text-xs text-muted-foreground">
                            Ordered: {new Date(order.timestamp).toLocaleString('en-IN')}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleDirectVerify(order)}
                              className="flex-1"
                              size="sm"
                              variant={order.needsManualVerification ? "destructive" : "default"}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {order.needsManualVerification ? 'Manual Review' : 'Verify Order'}
                            </Button>
                            <Button
                              onClick={() => handleViewOrderDetails({
                                orderId: order.orderId,
                                customerName: order.customerName,
                                totalAmount: order.totalAmount,
                                itemCount: order.itemCount,
                                items: order.items,
                                timestamp: order.timestamp,
                                suspicionScore: order.suspicionScore,
                                needsManualVerification: order.needsManualVerification,
                                triggeredRules: order.triggeredRules
                              })}
                              variant="outline"
                              size="sm"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {pendingOrders.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Pending
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {flaggedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Flagged Orders
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {pendingCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Normal Orders
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Order Details Dialog */}
        <OrderDetailsDialog
          isOpen={isOrderDetailsOpen}
          onClose={() => setIsOrderDetailsOpen(false)}
          orderDetails={selectedOrderDetails}
          showRiskAnalysis={true}
        />
      </div>
    </div>
  );
}
