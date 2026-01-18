import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FlaggedOrderAlert } from './FlaggedOrderAlert';
import { formatPrice } from '@/lib/currency';
import { 
  User, 
  Calendar, 
  Package, 
  DollarSign,
  Shield,
  Clock,
  AlertTriangle,
  ShoppingCart,
  ArrowUpDown,
  Filter,
  X
} from 'lucide-react';

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: any;
  showRiskAnalysis?: boolean;
}

const CATEGORIES = [
  'Food & Beverages',
  'Apparel',
  'Electronics',
  'Home & Kitchen',
  'Stationery',
  'Health & Beauty'
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
];

export function OrderDetailsDialog({ 
  isOpen, 
  onClose, 
  orderDetails,
  showRiskAnalysis = false 
}: OrderDetailsDialogProps) {
  const [sortBy, setSortBy] = useState('name-asc');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const sortedAndFilteredItems = useMemo(() => {
    if (!orderDetails?.items) return [];

    let filtered = orderDetails.items;
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((item: any) => item.product?.category === filterCategory);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name-asc':
          return a.product?.name.localeCompare(b.product?.name);
        case 'name-desc':
          return b.product?.name.localeCompare(a.product?.name);
        case 'price-asc':
          return a.itemPrice - b.itemPrice;
        case 'price-desc':
          return b.itemPrice - a.itemPrice;
        default:
          return 0;
      }
    });

    return sorted;
  }, [orderDetails?.items, sortBy, filterCategory]);

  const filteredTotal = useMemo(() => {
    return sortedAndFilteredItems.reduce((total: number, item: any) => {
      return total + (item.itemPrice * item.quantity);
    }, 0);
  }, [sortedAndFilteredItems]);

  if (!orderDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Order Details - {orderDetails.orderId}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Analysis Alert */}
          {showRiskAnalysis && orderDetails.needsManualVerification && (
            <FlaggedOrderAlert order={orderDetails} />
          )}

          {/* Order Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{orderDetails.customerName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">
                  {new Date(orderDetails.timestamp).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">{formatPrice(orderDetails.totalAmount)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="font-medium">{orderDetails.itemCount} items</p>
              </div>
            </div>
          </div>

          {/* Risk Analysis Section */}
          {showRiskAnalysis && orderDetails.suspicionScore !== undefined && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Risk Analysis</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Suspicion Score</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.min(10, Math.round(orderDetails.suspicionScore))}/10
                    </div>
                    <Badge 
                      variant={orderDetails.suspicionScore >= 5 ? "destructive" : "secondary"}
                      className="mt-1"
                    >
                      {orderDetails.suspicionScore >= 5 ? "High Risk" : "Low Risk"}
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {orderDetails.needsManualVerification ? "Flagged" : "Normal"}
                    </div>
                    <Badge 
                      variant={orderDetails.needsManualVerification ? "destructive" : "default"}
                      className="mt-1"
                    >
                      {orderDetails.needsManualVerification ? "Requires Review" : "Auto-Approved"}
                    </Badge>
                  </div>
                </div>

                {orderDetails.triggeredRules && orderDetails.triggeredRules.length > 0 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Triggered Risk Rules</span>
                    </h4>
                    <ul className="space-y-1">
                      {orderDetails.triggeredRules.map((rule: string, index: number) => (
                        <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Controls */}
          <div className="flex flex-wrap gap-4 py-4 border-b">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filterCategory !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterCategory('all')}
                className="flex items-center space-x-1"
              >
                <X className="h-3 w-3" />
                <span>Clear Filter</span>
              </Button>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            {sortedAndFilteredItems.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {filterCategory !== 'all' 
                    ? `No items found in "${filterCategory}" category`
                    : 'No items in this order'
                  }
                </p>
              </div>
            ) : (
              sortedAndFilteredItems.map((item: any, index: number) => (
                <Card key={`${item.product?.id || index}-${index}`} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          {item.product?.imageURL ? (
                            <img 
                              src={item.product.imageURL} 
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{item.product?.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {item.product?.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {formatPrice(item.itemPrice * item.quantity)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(item.itemPrice)} each
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Order Total */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {filterCategory !== 'all' 
                  ? `${sortedAndFilteredItems.length} items in "${filterCategory}" • Filtered Total:`
                  : `${sortedAndFilteredItems.length} items • Order Total:`
                }
              </div>
              <div className="font-bold text-lg text-foreground">
                {filterCategory !== 'all' ? formatPrice(filteredTotal) : formatPrice(orderDetails.totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
