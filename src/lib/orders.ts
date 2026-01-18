import { db } from './firebase';
import { ref, push, set, get, query, orderByChild, equalTo, update, remove } from 'firebase/database';

// Create a new order in Firebase
export async function createOrder(orderData: any) {
  const ordersRef = ref(db, 'orders');
  const newOrderRef = push(ordersRef);
  await set(newOrderRef, orderData);
  return newOrderRef.key;
}

// Fetch all orders for a user (by userId or email)
export async function fetchOrdersByUserId(userIdentifier: string) {
  const ordersRef = ref(db, 'orders');
  const snapshot = await get(ordersRef);
  if (snapshot.exists()) {
    const ordersObj = snapshot.val();
    // Return orders where userId or email matches
    return Object.keys(ordersObj)
      .map((key) => ({ id: key, ...ordersObj[key] }))
      .filter(order => order.userId === userIdentifier || order.email === userIdentifier);
  }
  return [];
}

// Fetch all orders (for staff dashboard)
export async function fetchAllOrders() {
  const ordersRef = ref(db, 'orders');
  const snapshot = await get(ordersRef);
  if (snapshot.exists()) {
    const ordersObj = snapshot.val();
    return Object.keys(ordersObj).map((key) => ({ id: key, ...ordersObj[key] }));
  }
  return [];
}

// Update order status in Firebase
export async function updateOrderStatus(orderId: string, status: string) {
  const orderRef = ref(db, `orders/${orderId}`);
  await update(orderRef, { status });
}

// Delete an order from Firebase
export async function deleteOrder(orderId: string) {
  const orderRef = ref(db, `orders/${orderId}`);
  await remove(orderRef);
} 