import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

// ─── Types matching your backend populate() output ───────────────────────────

interface PopulatedUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface PopulatedRestaurant {
  _id: string;
  name: string;
  address: string;
  phone: string;
}

interface PopulatedDriver {
  _id: string;
  vehicleType: string;
  vehicleNumber: string;
  phone: string;
}

interface OrderItem {
  _id?: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  foodId?: string;
  productId?: {
    _id: string;
    name: string;
  };
}

interface DeliveryLocation {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  coordinates?: [number, number]; // [lng, lat] GeoJSON
}

// The shape your backend actually returns for a driver's order
export interface PopulatedOrder {
  _id: string;
  userId: PopulatedUser | string;
  restaurantId: PopulatedRestaurant | string;
  driverId: PopulatedDriver | string | null;
  items: OrderItem[];
  status: string;
  deliveryAddress: string;
  deliveryLocation?: DeliveryLocation;
  phoneNumber?: string; // top-level phone if stored on order
  subtotal?: number;
  deliveryFee?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  currency?: string;
  estimatedDeliveryTime?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function asPopulatedUser(value: unknown): PopulatedUser | null {
  if (value && typeof value === "object" && "first_name" in value) {
    return value as PopulatedUser;
  }
  return null;
}

function asPopulatedRestaurant(value: unknown): PopulatedRestaurant | null {
  if (value && typeof value === "object" && "name" in value) {
    return value as PopulatedRestaurant;
  }
  return null;
}

function asPopulatedDriver(value: unknown): PopulatedDriver | null {
  if (value && typeof value === "object" && "vehicleType" in value) {
    return value as PopulatedDriver;
  }
  return null;
}

function formatMoney(value: number | undefined | null): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value.toLocaleString();
}

function formatCoordinates(loc: DeliveryLocation | undefined): string | null {
  if (!loc) return null;
  const lat = loc.latitude ?? loc.lat;
  const lng = loc.longitude ?? loc.lng;
  if (typeof lat === "number" && typeof lng === "number") {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
  if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
    // GeoJSON is [lng, lat]
    return `${loc.coordinates[1]}, ${loc.coordinates[0]}`;
  }
  return null;
}

function idString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: string })._id);
  }
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <View className="mb-3 flex-row items-start">
      <Ionicons name={icon} size={17} color="#64748b" />
      <View className="ml-2.5 flex-1">
        <Text className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </Text>
        <Text selectable className="mt-0.5 text-sm text-slate-800">
          {value}
        </Text>
      </View>
    </View>
  );
}

function getStatusStyle(status: string | null | undefined): {
  container: string;
  dot: string;
  text: string;
} {
  switch (status?.toUpperCase()) {
    case "ARRIVED":
    case "DELIVERED":
      return {
        container: "bg-emerald-100",
        dot: "bg-emerald-600",
        text: "text-emerald-800",
      };
    case "CANCELLED":
      return {
        container: "bg-red-100",
        dot: "bg-red-600",
        text: "text-red-800",
      };
    case "OUT_FOR_DELIVERY":
    case "DELIVERING":
    case "PICKED_UP":
      return {
        container: "bg-blue-100",
        dot: "bg-blue-600",
        text: "text-blue-800",
      };
    case "DRIVER_ASSIGNED":
    case "READY_FOR_PICKUP":
      return {
        container: "bg-violet-100",
        dot: "bg-violet-600",
        text: "text-violet-800",
      };
    default:
      return {
        container: "bg-amber-100",
        dot: "bg-amber-600",
        text: "text-amber-800",
      };
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ArrivedOrderCard({ order }: { order: PopulatedOrder }) {
  // Resolve populated vs ID-only references
  const customer = asPopulatedUser(order.userId);
  const restaurant = asPopulatedRestaurant(order.restaurantId);
  const driver = asPopulatedDriver(order.driverId);

  // IDs (works whether populated or raw string)
  const userId = idString(order.userId);
  const restaurantId = idString(order.restaurantId);
  const driverId = idString(order.driverId);

  // Customer fields
  const customerName = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ")
    : null;
  const customerPhone = order.phoneNumber ?? customer?.phone ?? null;
  const customerEmail = customer?.email ?? null;

  // Restaurant fields
  const restaurantName = restaurant?.name ?? null;
  const restaurantAddress = restaurant?.address ?? null;
  const restaurantPhone = restaurant?.phone ?? null;

  // Driver fields
  const driverVehicle = driver
    ? [driver.vehicleType, driver.vehicleNumber].filter(Boolean).join(" · ")
    : null;
  const driverPhone = driver?.phone ?? null;

  // Order meta
  const orderId = order._id.slice(-8).toUpperCase();
  const orderStatus = order.status;
  const statusLabel = orderStatus.replaceAll("_", " ");
  const statusStyle = getStatusStyle(orderStatus);
  const currency = order.currency ?? "LKR";

  // Financials
  const subtotal = formatMoney(order.subtotal);
  const deliveryFee = formatMoney(order.deliveryFee);
  const total = formatMoney(order.totalAmount);

  // Location
  const coordinates = formatCoordinates(order.deliveryLocation);

  // Date
  const placedAt = (() => {
    const d = new Date(order.createdAt);
    return Number.isNaN(d.getTime()) ? order.createdAt : d.toLocaleString();
  })();

  const hasDetails =
    customerName ||
    customerPhone ||
    order.deliveryAddress ||
    restaurantName ||
    order.items.length > 0 ||
    total ||
    subtotal;

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      {/* ── Header ── */}
      <View className="flex-row items-center justify-between bg-emerald-50 px-4 py-3.5">
        <View className="flex-1 pr-3">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
            Assigned delivery
          </Text>
          <Text selectable className="mt-1 text-base font-bold text-slate-900">
            #{orderId}
          </Text>
        </View>
        <View
          className={`flex-row items-center rounded-full px-3 py-1.5 ${statusStyle.container}`}
        >
          <View className={`mr-1.5 h-2 w-2 rounded-full ${statusStyle.dot}`} />
          <Text className={`text-xs font-bold ${statusStyle.text}`}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View className="p-4">
        {/* ── Restaurant block ── */}
        {restaurantName ? (
          <View className="mb-4 rounded-xl bg-slate-50 p-3">
            <Text className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Restaurant
            </Text>
            <Text className="mt-1 text-sm font-semibold text-slate-900">
              {restaurantName}
            </Text>
            {restaurantAddress ? (
              <Text className="mt-0.5 text-xs text-slate-500">
                {restaurantAddress}
              </Text>
            ) : null}
            {restaurantPhone ? (
              <Text className="mt-0.5 text-xs text-slate-500">
                {restaurantPhone}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* ── Customer ── */}
        <DetailRow
          icon="person-outline"
          label="Customer"
          value={customerName}
        />
        <DetailRow
          icon="mail-outline"
          label="Customer email"
          value={customerEmail}
        />
        <DetailRow
          icon="call-outline"
          label="Customer phone"
          value={customerPhone}
        />

        {/* ── IDs (useful for debugging / support) ── */}
        <DetailRow
          icon="person-circle-outline"
          label="Customer ID"
          value={userId}
        />
        <DetailRow
          icon="restaurant-outline"
          label="Restaurant ID"
          value={restaurantId}
        />
        <DetailRow icon="bicycle-outline" label="Driver ID" value={driverId} />

        {/* ── Driver ── */}
        <DetailRow
          icon="car-outline"
          label="Driver vehicle"
          value={driverVehicle}
        />
        <DetailRow
          icon="call-outline"
          label="Driver phone"
          value={driverPhone}
        />

        {/* ── Delivery ── */}
        <DetailRow
          icon="location-outline"
          label="Delivery address"
          value={order.deliveryAddress}
        />
        <DetailRow
          icon="navigate-outline"
          label="Delivery coordinates"
          value={coordinates}
        />
        <DetailRow
          icon="document-text-outline"
          label="Delivery instructions"
          value={order.notes}
        />

        {/* ── Order meta ── */}
        <DetailRow
          icon="sync-outline"
          label="Order status"
          value={orderStatus}
        />
        <DetailRow icon="time-outline" label="Order placed" value={placedAt} />
        {order.estimatedDeliveryTime ? (
          <DetailRow
            icon="timer-outline"
            label="Est. delivery time"
            value={`${order.estimatedDeliveryTime} min`}
          />
        ) : null}

        {/* ── Items ── */}
        {order.items.length > 0 ? (
          <View className="mb-3 border-t border-slate-100 pt-3">
            <Text className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Order items
            </Text>
            {order.items.map((item, index) => {
              const itemName =
                item.name ?? item.productId?.name ?? `Item ${index + 1}`;
              const lineTotal = formatMoney(item.price * item.quantity);
              return (
                <View
                  key={item._id ?? `${itemName}-${index}`}
                  className="flex-row justify-between py-1.5"
                >
                  <Text className="flex-1 pr-3 text-sm text-slate-700">
                    {item.quantity} × {itemName}
                    {item.size ? (
                      <Text className="text-slate-400"> ({item.size})</Text>
                    ) : null}
                  </Text>
                  {lineTotal ? (
                    <Text className="text-sm font-medium text-slate-700">
                      {currency} {lineTotal}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* ── Financials ── */}
        {subtotal || deliveryFee || total ? (
          <View className="mb-3 border-t border-slate-100 pt-3">
            {subtotal ? (
              <View className="mb-1.5 flex-row justify-between">
                <Text className="text-sm text-slate-600">Subtotal</Text>
                <Text className="text-sm text-slate-700">
                  {currency} {subtotal}
                </Text>
              </View>
            ) : null}
            {deliveryFee ? (
              <View className="mb-2 flex-row justify-between">
                <Text className="text-sm text-slate-600">Delivery fee</Text>
                <Text className="text-sm text-slate-700">
                  {currency} {deliveryFee}
                </Text>
              </View>
            ) : null}
            {total ? (
              <View className="flex-row justify-between">
                <Text className="text-sm font-semibold text-slate-700">
                  Order total
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {currency} {total}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ── Payment ── */}
        <DetailRow
          icon="card-outline"
          label="Payment"
          value={
            [order.paymentMethod, order.paymentStatus]
              .filter(Boolean)
              .join(" · ") || null
          }
        />

        {/* ── Empty state ── */}
        {!hasDetails ? (
          <Text className="text-sm text-slate-500">
            This order has no additional customer or delivery details.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
