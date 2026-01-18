
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Users,
  CreditCard,
  Activity,
  Zap,
  Eye,
  Link2,
  Package
} from 'lucide-react';
import { formatPrice, formatNumber } from '@/lib/currency';

interface PeakTimeData {
  hour: string;
  category: string;
  itemCount: number;
  orderCount: number;
  revenue: number;
}

interface UnpurchasedItem {
  productId: string;
  productName: string;
  scanCount: number;
  imageURL: string;
  category: string;
  price: number;
  potentialRevenue: number;
}

interface CoPurchasedItem {
  item1Name: string;
  item2Name: string;
  coOccurrenceCount: number;
  avgOrderValue: number;
  bundleOpportunity: number;
}

interface CheckoutMetrics {
  activeCartsCount: number;
  unverifiedOrdersCount: number;
  avgVerificationTimeSec: number;
  completionRate: number;
  abandonmentRate: number;
}

interface SalesTrend {
  date: string;
  totalSales: number;
  orderCount: number;
  avgOrderValue: number;
}

interface RealtimeUpdate {
  timestamp: number;
  metric: string;
  value: number;
  change: number;
}

export default function InsightsDashboard() {
  const [timeframe, setTimeframe] = useState('last7days');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  // Simulated real-time data with dynamic updates
  const [checkoutMetrics, setCheckoutMetrics] = useState<CheckoutMetrics>({
    activeCartsCount: 8,
    unverifiedOrdersCount: 3,
    avgVerificationTimeSec: 45,
    completionRate: 87.5,
    abandonmentRate: 12.5
  });

  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>([
    { date: '2024-12-25', totalSales: 1542000, orderCount: 67, avgOrderValue: 23000 },
    { date: '2024-12-26', totalSales: 1865000, orderCount: 82, avgOrderValue: 22700 },
    { date: '2024-12-27', totalSales: 2234000, orderCount: 95, avgOrderValue: 23500 },
    { date: '2024-12-28', totalSales: 1987000, orderCount: 88, avgOrderValue: 22600 },
    { date: '2024-12-29', totalSales: 2560000, orderCount: 104, avgOrderValue: 24600 },
    { date: '2024-12-30', totalSales: 2890000, orderCount: 117, avgOrderValue: 24700 },
    { date: '2024-07-01', totalSales: 3125000, orderCount: 125, avgOrderValue: 25000 }
  ]);

  const [peakTimes, setPeakTimes] = useState<PeakTimeData[]>([
    { hour: '09:00', category: 'Food & Beverages', itemCount: 45, orderCount: 23, revenue: 89000 },
    { hour: '10:00', category: 'Food & Beverages', itemCount: 62, orderCount: 31, revenue: 124000 },
    { hour: '11:00', category: 'Food & Beverages', itemCount: 78, orderCount: 39, revenue: 156000 },
    { hour: '12:00', category: 'Food & Beverages', itemCount: 95, orderCount: 48, revenue: 192000 },
    { hour: '13:00', category: 'Food & Beverages', itemCount: 87, orderCount: 44, revenue: 176000 },
    { hour: '14:00', category: 'Electronics', itemCount: 34, orderCount: 17, revenue: 234000 },
    { hour: '15:00', category: 'Electronics', itemCount: 56, orderCount: 28, revenue: 384000 },
    { hour: '16:00', category: 'Electronics', itemCount: 43, orderCount: 22, revenue: 302000 },
    { hour: '17:00', category: 'Electronics', itemCount: 67, orderCount: 34, revenue: 468000 },
    { hour: '18:00', category: 'Electronics', itemCount: 54, orderCount: 27, revenue: 371000 }
  ]);

  const [unpurchasedItems] = useState<UnpurchasedItem[]>([
    {
      productId: 'prod-001',
      productName: 'Premium Wireless Headphones',
      scanCount: 28,
      imageURL: '/placeholder.svg',
      category: 'Electronics',
      price: 1999900,
      potentialRevenue: 55997200
    },
    {
      productId: 'prod-002',
      productName: 'Organic Green Tea',
      scanCount: 22,
      imageURL: '/placeholder.svg',
      category: 'Food & Beverages',
      price: 129900,
      potentialRevenue: 2857800
    },
    {
      productId: 'prod-003',
      productName: 'Smart Watch Pro',
      scanCount: 19,
      imageURL: '/placeholder.svg',
      category: 'Electronics',
      price: 3999900,
      potentialRevenue: 75998100
    },
    {
      productId: 'prod-004',
      productName: 'Artisan Coffee Beans',
      scanCount: 15,
      imageURL: '/placeholder.svg',
      category: 'Food & Beverages',
      price: 249900,
      potentialRevenue: 3748500
    },
    {
      productId: 'prod-005',
      productName: 'Bluetooth Speaker',
      scanCount: 12,
      imageURL: '/placeholder.svg',
      category: 'Electronics',
      price: 799900,
      potentialRevenue: 9598800
    }
  ]);

  const [coPurchasedItems] = useState<CoPurchasedItem[]>([
    { item1Name: 'Coffee Beans', item2Name: 'Milk', coOccurrenceCount: 45, avgOrderValue: 1850, bundleOpportunity: 25 },
    { item1Name: 'Wireless Headphones', item2Name: 'Phone Case', coOccurrenceCount: 32, avgOrderValue: 24500, bundleOpportunity: 15 },
    { item1Name: 'Protein Bars', item2Name: 'Energy Drink', coOccurrenceCount: 28, avgOrderValue: 1250, bundleOpportunity: 20 },
    { item1Name: 'Notebooks', item2Name: 'Pens', coOccurrenceCount: 24, avgOrderValue: 890, bundleOpportunity: 12 },
    { item1Name: 'Chips', item2Name: 'Soft Drinks', coOccurrenceCount: 21, avgOrderValue: 750, bundleOpportunity: 18 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const updates = Math.random();

      if (updates > 0.7) {
        setCheckoutMetrics(prev => {
          const newActiveCart = Math.max(0, prev.activeCartsCount + (Math.random() > 0.5 ? 1 : -1));
          const newUnverified = Math.max(0, prev.unverifiedOrdersCount + (Math.random() > 0.6 ? 1 : -1));
          const newAvgTime = Math.max(20, prev.avgVerificationTimeSec + (Math.random() - 0.5) * 10);

          return {
            ...prev,
            activeCartsCount: newActiveCart,
            unverifiedOrdersCount: newUnverified,
            avgVerificationTimeSec: Math.round(newAvgTime),
            completionRate: Math.round((85 + Math.random() * 10) * 10) / 10,
            abandonmentRate: Math.round((10 + Math.random() * 8) * 10) / 10
          };
        });

        const newUpdate: RealtimeUpdate = {
          timestamp: Date.now(),
          metric: 'checkout',
          value: Math.random() > 0.5 ? 1 : -1,
          change: Math.random() * 5
        };

        setRealtimeUpdates(prev => [newUpdate, ...prev.slice(0, 4)]);
        setLastUpdate(new Date());
        setAnimationKey(prev => prev + 1);
      }

      if (updates > 0.8) {
        setSalesTrends(prev => {
          const lastTrend = prev[prev.length - 1];
          const newRevenue = lastTrend.totalSales + Math.round((Math.random() - 0.4) * 2000);
          const newOrders = lastTrend.orderCount + Math.round((Math.random() - 0.4) * 10);

          return [
            ...prev.slice(1),
            {
              ...lastTrend,
              totalSales: Math.max(0, newRevenue),
              orderCount: Math.max(0, newOrders),
              avgOrderValue: newOrders > 0 ? Math.round(newRevenue / newOrders) : 0
            }
          ];
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const generatePeakTimesData = (timeframe: string) => {
    const baseData = [
      { hour: '09:00', category: 'Food & Beverages', itemCount: 45, orderCount: 23, revenue: 89000 },
      { hour: '10:00', category: 'Food & Beverages', itemCount: 62, orderCount: 31, revenue: 124000 },
      { hour: '11:00', category: 'Food & Beverages', itemCount: 78, orderCount: 39, revenue: 156000 },
      { hour: '12:00', category: 'Food & Beverages', itemCount: 95, orderCount: 48, revenue: 192000 },
      { hour: '13:00', category: 'Food & Beverages', itemCount: 87, orderCount: 44, revenue: 176000 },
      { hour: '14:00', category: 'Electronics', itemCount: 34, orderCount: 17, revenue: 234000 },
      { hour: '15:00', category: 'Electronics', itemCount: 56, orderCount: 28, revenue: 384000 },
      { hour: '16:00', category: 'Electronics', itemCount: 43, orderCount: 22, revenue: 302000 },
      { hour: '17:00', category: 'Electronics', itemCount: 67, orderCount: 34, revenue: 468000 },
      { hour: '18:00', category: 'Electronics', itemCount: 54, orderCount: 27, revenue: 371000 }
    ];

    let multiplier = 1;
    switch (timeframe) {
      case 'today':
        multiplier = 0.3;
        break;
      case 'last7days':
        multiplier = 1;
        break;
      case 'last30days':
        multiplier = 4.2;
        break;
      default:
        multiplier = 1;
    }

    return baseData.map(item => ({
      ...item,
      itemCount: Math.round(item.itemCount * multiplier),
      orderCount: Math.round(item.orderCount * multiplier),
      revenue: Math.round(item.revenue * multiplier)
    }));
  };

  useEffect(() => {
    const newData = generatePeakTimesData(timeframe);
    setPeakTimes(newData);
  }, [timeframe]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const totalPotentialRevenue = unpurchasedItems.reduce((sum, item) => sum + item.potentialRevenue, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-muted/30 rounded-lg w-2/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-32 bg-muted/30 rounded-2xl"
                  />
                ))}
              </div>
              <div className="h-96 bg-muted/30 rounded-2xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
                Store Performance Insights
              </h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg text-muted-foreground mb-0"
              >
                Real-time data to optimize operations, staffing, and inventory.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-right"
            >
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="text-xl font-bold text-foreground">
                {lastUpdate.toLocaleTimeString()}
              </p>
              <div className="flex items-center justify-end space-x-2 mt-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-500 rounded-full"
                />
                <span className="text-sm font-medium text-green-600">Live Data</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Real-time Updates Alerts */}
        <AnimatePresence>
          {realtimeUpdates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 space-y-3"
            >
              {realtimeUpdates.slice(0, 2).map((update, index) => (
                <motion.div
                  key={update.timestamp}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Alert className="bg-card text-card-foreground border-primary/20 shadow-lg">
                    <Activity className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-foreground">
                      <strong>Live Update:</strong> Checkout metrics updated • {new Date(update.timestamp).toLocaleTimeString()}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl h-12">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="shopping-patterns"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              Shopping Patterns
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              Inventory Insights
            </TabsTrigger>
            <TabsTrigger
              value="operations"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              Operations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Carts</p>
                        <motion.p
                          key={`active-${checkoutMetrics.activeCartsCount}-${animationKey}`}
                          initial={{ scale: 0.9, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl font-bold text-foreground"
                        >
                          {checkoutMetrics.activeCartsCount}
                        </motion.p>
                      </div>
                      <div className="relative">
                        <ShoppingCart className="h-8 w-8 text-primary" />
                        {checkoutMetrics.activeCartsCount > 5 && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <Progress value={checkoutMetrics.completionRate} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {checkoutMetrics.completionRate}% completion rate
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Unverified Orders</p>
                        <motion.p
                          key={`unverified-${checkoutMetrics.unverifiedOrdersCount}-${animationKey}`}
                          initial={{ scale: 0.9, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl font-bold text-foreground"
                        >
                          {checkoutMetrics.unverifiedOrdersCount}
                        </motion.p>
                      </div>
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg wait: {checkoutMetrics.avgVerificationTimeSec}s
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg. Verification</p>
                        <motion.p
                          key={`avg-time-${checkoutMetrics.avgVerificationTimeSec}-${animationKey}`}
                          initial={{ scale: 0.9, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl font-bold text-foreground"
                        >
                          {checkoutMetrics.avgVerificationTimeSec}s
                        </motion.p>
                      </div>
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        checkoutMetrics.avgVerificationTimeSec < 30 ? 'bg-green-500' :
                        checkoutMetrics.avgVerificationTimeSec < 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <p className="text-xs text-muted-foreground">
                        {checkoutMetrics.avgVerificationTimeSec < 30 ? 'Excellent' :
                          checkoutMetrics.avgVerificationTimeSec < 60 ? 'Good' : 'Needs improvement'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                        <p className="text-3xl font-bold text-foreground">
                          {formatPrice(salesTrends[salesTrends.length - 1]?.totalSales || 0)}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(salesTrends[salesTrends.length - 1]?.orderCount || 0)} orders •
                      Avg: {formatPrice(salesTrends[salesTrends.length - 1]?.avgOrderValue || 0)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Sales Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Revenue & Order Trends</span>
                    <Badge variant="secondary" className="ml-auto">
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Live
                      </motion.span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesTrends}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          formatter={(value: any, name: any) => [
                            name === 'totalSales' ? formatPrice(value as number) : formatNumber(value as number),
                            name === 'totalSales' ? 'Revenue' : 'Orders'
                          ]}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="totalSales"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          strokeWidth={3}
                        />
                        <Area
                          type="monotone"
                          dataKey="orderCount"
                          stroke="hsl(var(--secondary))"
                          fillOpacity={1}
                          fill="url(#colorOrders)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      Potential Revenue Loss
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-destructive">{formatPrice(totalPotentialRevenue)}</p>
                    <p className="text-sm text-muted-foreground">From unpurchased scanned items</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      Bundle Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{coPurchasedItems.length}</p>
                    <p className="text-sm text-muted-foreground">High-frequency item pairs</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Abandonment Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-foreground">{checkoutMetrics.abandonmentRate}%</p>
                    <p className="text-sm text-muted-foreground">Cart abandonment rate</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="shopping-patterns" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <span className="text-foreground">Peak Shopping Times by Category</span>
                    </CardTitle>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="w-48 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakTimes} key={timeframe}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                        <XAxis
                          dataKey="hour"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          formatter={(value: any, name: any) => [
                            name === 'revenue' ? formatPrice(value as number) : formatNumber(value as number),
                            name === 'revenue' ? 'Revenue' : name === 'itemCount' ? 'Items' : 'Orders'
                          ]}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Bar dataKey="itemCount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="revenue" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Link2 className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Frequently Co-Purchased Items</span>
                    <Badge variant="outline" className="border-primary text-primary">Bundle Opportunities</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coPurchasedItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-muted/50 to-muted/20 rounded-xl border border-border hover:shadow-md transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold text-lg text-foreground">
                              {item.item1Name} + {item.item2Name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Avg Order Value: {formatPrice(item.avgOrderValue)} •
                              Bundle Discount Opportunity: {item.bundleOpportunity}%
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-2xl text-primary">{item.coOccurrenceCount}</p>
                          <p className="text-xs text-muted-foreground">co-purchases</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
            >
              <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Most Scanned but Unpurchased Items</span>
                    <Badge variant="destructive">Revenue Risk</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-muted/50">
                          <TableHead className="text-foreground font-semibold">Product</TableHead>
                          <TableHead className="text-foreground font-semibold">Category</TableHead>
                          <TableHead className="text-foreground font-semibold">Price</TableHead>
                          <TableHead className="text-foreground font-semibold">Scans</TableHead>
                          <TableHead className="text-foreground font-semibold">Potential Revenue</TableHead>
                          <TableHead className="text-foreground font-semibold">Alert</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unpurchasedItems.map((item, index) => (
                          <motion.tr
                            key={item.productId}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="border-border hover:bg-muted/30 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <img
                                  src={item.imageURL}
                                  alt={item.productName}
                                  className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                />
                                <div>
                                  <p className="font-semibold text-foreground">{item.productName}</p>
                                  <p className="text-sm text-muted-foreground">ID: {item.productId}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-primary/50 text-primary">
                                {item.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {formatPrice(item.price)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-2xl text-foreground">{item.scanCount}</span>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-destructive">
                              {formatPrice(item.potentialRevenue)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <span className="text-sm text-destructive font-medium">High Risk</span>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-6 p-6 bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
                  >
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recommendations
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Consider price adjustments for high-scan, low-purchase items
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Implement targeted promotions or discounts
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Review product placement and accessibility
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        Analyze competitor pricing for comparison
                      </li>
                    </ul>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-foreground">Checkout Flow Status</span>
                      <Badge variant="secondary">
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Live
                        </motion.span>
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
                      >
                        <div className="flex items-center space-x-4">
                          <ShoppingCart className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground text-lg">Active Carts</p>
                            <p className="text-sm text-muted-foreground">Customers currently shopping</p>
                          </div>
                        </div>
                        <motion.div
                          key={`active-carts-${checkoutMetrics.activeCartsCount}-${animationKey}`}
                          initial={{ scale: 0.9, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge variant="secondary" className="text-xl px-4 py-2 font-bold">
                            {checkoutMetrics.activeCartsCount}
                          </Badge>
                        </motion.div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl border border-orange-200/50 dark:border-orange-800/50"
                      >
                        <div className="flex items-center space-x-4">
                          <Clock className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground text-lg">Unverified Orders</p>
                            <p className="text-sm text-muted-foreground">Awaiting staff verification</p>
                          </div>
                        </div>
                        <motion.div
                          key={`unverified-orders-${checkoutMetrics.unverifiedOrdersCount}-${animationKey}`}
                          initial={{ scale: 0.9, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge variant="secondary" className="text-xl px-4 py-2 font-bold">
                            {checkoutMetrics.unverifiedOrdersCount}
                          </Badge>
                        </motion.div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-200/50 dark:border-green-800/50"
                      >
                        <div className="flex items-center space-x-4">
                          <Zap className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground text-lg">Avg. Verification Time</p>
                            <p className="text-sm text-muted-foreground">Processing efficiency</p>
                          </div>
                        </div>
                        <motion.div
                          key={`avg-verification-${checkoutMetrics.avgVerificationTimeSec}-${animationKey}`}
                          initial={{ scale: 0.9, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Badge variant="secondary" className="text-xl px-4 py-2 font-bold">
                            {checkoutMetrics.avgVerificationTimeSec}s
                          </Badge>
                        </motion.div>
                      </motion.div>

                      <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="font-medium text-foreground">Completion Rate</span>
                          <span className="font-bold text-foreground">{checkoutMetrics.completionRate}%</span>
                        </div>
                        <Progress value={checkoutMetrics.completionRate} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <span className="text-foreground">Operational Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                      >
                        <Alert className="bg-gradient-to-r from-yellow-50/50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-900/10 border-yellow-200/50 dark:border-yellow-800/50">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                          <AlertDescription>
                            <p className="font-semibold text-foreground">
                              High scan rate for Wireless Headphones
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              28 scans with 0 purchases - consider price adjustment or promotion
                            </p>
                          </AlertDescription>
                        </Alert>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        <Alert className="bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200/50 dark:border-blue-800/50">
                          <Link2 className="h-4 w-4 text-primary" />
                          <AlertDescription>
                            <p className="font-semibold text-foreground">
                              Coffee + Milk Bundle Opportunity
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              45 co-purchases detected - create bundle offer to increase AOV
                            </p>
                          </AlertDescription>
                        </Alert>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <Alert className="bg-gradient-to-r from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-green-200/50 dark:border-green-800/50">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <AlertDescription>
                            <p className="font-semibold text-foreground">
                              Peak Hours: 12:00-13:00 for F&B
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Ensure adequate staffing during lunch hours for optimal service
                            </p>
                          </AlertDescription>
                        </Alert>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <Alert className="bg-gradient-to-r from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-200/50 dark:border-purple-800/50">
                          <Users className="h-4 w-4 text-primary" />
                          <AlertDescription>
                            <p className="font-semibold text-foreground">
                              Electronics peak at 17:00
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              67 items scanned during evening rush - optimize staff allocation
                            </p>
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Performance Metrics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Card className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-foreground">Store Performance Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-6 bg-gradient-to-br from-green-50/50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-200/50 dark:border-green-800/50"
                    >
                      <TrendingUp className="h-10 w-10 text-primary mx-auto mb-3" />
                      <p className="text-3xl font-bold text-foreground mb-1">
                        {formatPrice(salesTrends[salesTrends.length - 1]?.totalSales || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">Today's Revenue</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
                    >
                      <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                      <p className="text-3xl font-bold text-foreground mb-1">
                        {formatNumber(salesTrends[salesTrends.length - 1]?.orderCount || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">Orders Processed</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-6 bg-gradient-to-br from-purple-50/50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl border border-purple-200/50 dark:border-purple-800/50"
                    >
                      <CreditCard className="h-10 w-10 text-primary mx-auto mb-3" />
                      <p className="text-3xl font-bold text-foreground mb-1">
                        {formatPrice(salesTrends[salesTrends.length - 1]?.avgOrderValue || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">Avg Order Value</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
