import React, { useEffect, useState } from 'react';
import { fetchOrdersByUserId } from '@/lib/orders';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/currency';

export default function UserOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchOrdersByUserId(user.email || user.id)
      .then((data) => {
        setOrders(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load orders');
        setLoading(false);
      });
  }, [user]);

  if (!user) return <div className="text-center mt-12">Please log in to view your orders.</div>;
  if (loading) return <div className="text-center mt-12">Loading your orders...</div>;
  if (error) return <div className="text-center text-red-500 mt-12">{error}</div>;
  if (orders.length === 0) return <div className="text-center mt-12">No orders found.</div>;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground text-center">My Orders</h1>
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id} className="hover-lift">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-lg">Order #{order.orderId}</div>
                  <div className="text-sm text-muted-foreground mb-2">{new Date(order.timestamp).toLocaleString()}</div>
                  <div className="text-sm mb-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                  <div className="text-sm mb-1">Total: <span className="font-bold">{formatPrice(order.finalAmount || order.totalAmount)}</span></div>
                  <div className="text-xs text-muted-foreground mb-1">To: {order.shippingInfo?.name} ({order.shippingInfo?.city})</div>
                  <div className="text-xs text-muted-foreground mb-1">Products: {order.items.map((item: any) => `${item.product.name} (x${item.quantity})`).join(', ')}</div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-end">
                  <Button size="sm" onClick={() => navigate(`/invoice/${order.id}`)}>View Invoice</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 