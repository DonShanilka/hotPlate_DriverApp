export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
  PICKED_UP = "PICKED_UP",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERING = "DELIVERING",
  ARRIVED = "ARRIVED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CASH = "CASH",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
  CARD = "CARD",
  ONLINE = "ONLINE",
}

export interface OrderItem {
  foodId?: string;
  name: string;
  size?: string;
  quantity: number;
  price: number;
}

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
}

export interface OrderUser {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface Driver {
  _id: string;
  vehicleType?: string;
  vehicleNumber?: string;
  phone?: string;
}

export interface Order {
    
  _id: string;
  userId: string | OrderUser;
  restaurantId?: string | Restaurant | null;
  driverId?: string | Driver | null;
  items: OrderItem[];
  deliveryAddress: string;
  phoneNumber: string;
  deliveryLocation?: DeliveryLocation;
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  estimatedDeliveryTime?: number;
  deliveredAt?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}
