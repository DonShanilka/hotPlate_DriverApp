import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import type { DriverOrder } from "../../types/order.types";

type Data = Record<string, unknown>;

function asData(value: unknown): Data | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Data)
    : null;
}

function displayValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function idValue(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  const data = asData(value);
  return data ? findText(data, ["_id", "id", "userId"]) : null;
}

function formatMoney(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value))
    return displayValue(value);
  return value.toLocaleString();
}

function findText(data: Data | null, keys: string[]): string | null {
  if (!data) return null;
  for (const key of keys) {
    const value = displayValue(data[key]);
    if (value) return value;
  }
  return null;
}

function getAddress(value: unknown): string | null {
  const direct = displayValue(value);
  if (direct) return direct;
  const address = asData(value);
  if (!address) return null;
  return (
    [
      findText(address, [
        "formattedAddress",
        "label",
        "street",
        "addressLine1",
        "line1",
      ]),
      findText(address, ["addressLine2", "line2", "city", "town"]),
      findText(address, ["district", "state", "postalCode", "zipCode"]),
    ]
      .filter(Boolean)
      .join(", ") || null
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string | null;
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

export default function ArrivedOrderCard({ order }: { order: DriverOrder }) {
  const raw = order as unknown as Data;
  const customer =
    asData(raw.customer) ?? asData(raw.customerDetails) ?? asData(raw.userId);
  const restaurant =
    asData(raw.restaurant) ??
    asData(raw.restaurantDetails) ??
    asData(raw.restaurantId);
  const driver = asData(raw.driver) ?? asData(raw.driverId);
  const delivery = asData(raw.delivery) ?? asData(raw.deliveryDetails);
  const orderId = findText(raw, ["orderNumber", "orderId", "_id", "id"]) ?? "—";
  const splitCustomerName = [
    findText(customer, ["first_name", "firstName"]),
    findText(customer, ["last_name", "lastName"]),
  ]
    .filter(Boolean)
    .join(" ");
  const customerName =
    findText(raw, ["customerName", "recipientName"]) ??
    findText(customer, ["name", "fullName"]) ??
    (splitCustomerName || null);
  const customerPhone =
    findText(raw, [
      "customerPhone",
      "phoneNumber",
      "phone",
      "recipientPhone",
    ]) ?? findText(customer, ["phone", "phoneNumber", "mobile"]);
  const restaurantName =
    findText(raw, ["restaurantName", "storeName"]) ??
    findText(restaurant, ["name", "restaurantName", "title"]);
  const restaurantAddress = findText(restaurant, ["address", "location"]);
  const restaurantPhone = findText(restaurant, ["phone", "phoneNumber"]);
  const deliveryAddress =
    getAddress(raw.deliveryAddress ?? raw.shippingAddress ?? raw.address) ??
    getAddress(delivery?.address ?? delivery?.location);
  const subtotal = formatMoney(raw.subtotal);
  const deliveryFee = formatMoney(raw.deliveryFee);
  const total = formatMoney(
    raw.totalAmount ?? raw.total ?? raw.grandTotal ?? raw.amount,
  );
  const currency = findText(raw, ["currency"]) ?? "LKR";
  const paymentMethod = findText(raw, ["paymentMethod", "paymentType"]);
  const paymentStatus = findText(raw, ["paymentStatus"]);
  const instructions = findText(raw, [
    "deliveryInstructions",
    "instructions",
    "notes",
  ]);
  const placedAtValue = findText(raw, ["createdAt", "placedAt", "orderDate"]);
  const parsedPlacedAt = placedAtValue ? new Date(placedAtValue) : null;
  const placedAt =
    parsedPlacedAt && !Number.isNaN(parsedPlacedAt.getTime())
      ? parsedPlacedAt.toLocaleString()
      : placedAtValue;
  const itemsValue = raw.items ?? raw.orderItems ?? raw.products;
  const items = Array.isArray(itemsValue) ? itemsValue : [];
  const deliveryLocation = asData(raw.deliveryLocation);
  const coordinates = deliveryLocation
    ? (() => {
        const latitude = deliveryLocation.latitude ?? deliveryLocation.lat;
        const longitude = deliveryLocation.longitude ?? deliveryLocation.lng;
        if (typeof latitude === "number" && typeof longitude === "number") {
          return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
        const pair = deliveryLocation.coordinates;
        if (Array.isArray(pair) && pair.length >= 2) {
          return `${pair[1]}, ${pair[0]}`;
        }
        return null;
      })()
    : null;
  const orderStatus = findText(raw, ["status", "orderStatus"]);
  const statusLabel = orderStatus?.replaceAll("_", " ") ?? "UNKNOWN";
  const statusStyle = getStatusStyle(orderStatus);
  const userId = idValue(raw.userId);
  const restaurantId = idValue(raw.restaurantId);
  const driverId = idValue(raw.driverId);
  const driverVehicle = findText(driver, ["vehicleType", "vehicleNumber"]);

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
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
        {restaurantName ? (
          <View className="mb-4 rounded-xl bg-slate-50 p-3">
            <Text className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Restaurant
            </Text>
            <Text className="mt-1 text-sm font-semibold text-slate-900">
              {restaurantName}
            </Text>
          </View>
        ) : null}

        <DetailRow
          icon="person-outline"
          label="Customer"
          value={customerName}
        />
        <DetailRow
          icon="call-outline"
          label="Customer phone"
          value={customerPhone}
        />
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
        <DetailRow
          icon="car-outline"
          label="Driver vehicle"
          value={driverVehicle}
        />
        <DetailRow
          icon="call-outline"
          label="Restaurant phone"
          value={restaurantPhone}
        />
        <DetailRow
          icon="business-outline"
          label="Restaurant address"
          value={restaurantAddress}
        />
        <DetailRow
          icon="location-outline"
          label="Delivery address"
          value={deliveryAddress}
        />
        <DetailRow
          icon="navigate-outline"
          label="Delivery coordinates"
          value={coordinates}
        />
        <DetailRow
          icon="sync-outline"
          label="Order status"
          value={orderStatus}
        />
        <DetailRow icon="time-outline" label="Order placed" value={placedAt} />

        {items.length > 0 ? (
          <View className="mb-3 border-t border-slate-100 pt-3">
            <Text className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Order items
            </Text>
            {items.map((item, index) => {
              const itemData = asData(item);
              const product = asData(itemData?.productId);
              const name =
                findText(itemData, [
                  "name",
                  "productName",
                  "title",
                  "itemName",
                ]) ??
                findText(product, ["name", "productName", "title"]) ??
                `Item ${index + 1}`;
              const quantity = findText(itemData, ["quantity", "qty"]);
              const price = formatMoney(
                itemData?.price ?? itemData?.unitPrice ?? itemData?.total,
              );
              return (
                <View
                  key={String(itemData?._id ?? itemData?.id ?? index)}
                  className="flex-row justify-between py-1.5"
                >
                  <Text className="flex-1 pr-3 text-sm text-slate-700">
                    {quantity ? `${quantity} × ` : ""}
                    {name}
                  </Text>
                  {price ? (
                    <Text className="text-sm font-medium text-slate-700">
                      {currency} {price}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {subtotal || deliveryFee || total || paymentMethod || paymentStatus ? (
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
              <View className="mb-2 flex-row justify-between">
                <Text className="text-sm font-semibold text-slate-700">
                  Order total
                </Text>
                <Text className="text-sm font-bold text-slate-900">
                  {currency} {total}
                </Text>
              </View>
            ) : null}
            <DetailRow
              icon="card-outline"
              label="Payment"
              value={[paymentMethod, paymentStatus].filter(Boolean).join(" · ")}
            />
          </View>
        ) : null}

        <DetailRow
          icon="document-text-outline"
          label="Delivery instructions"
          value={instructions}
        />

        {!customerName &&
        !customerPhone &&
        !deliveryAddress &&
        !restaurantName &&
        !items.length &&
        !total &&
        !subtotal ? (
          <Text className="text-sm text-slate-500">
            This order has no additional customer or delivery details.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function getStatusStyle(status: string | null): {
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
    default:
      return {
        container: "bg-amber-100",
        dot: "bg-amber-600",
        text: "text-amber-800",
      };
  }
}
