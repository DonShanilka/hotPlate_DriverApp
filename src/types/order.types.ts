export type MongoId = string;

export interface OrderItem {
	_id?: MongoId;
	productId?: MongoId;
	name?: string;
	productName?: string;
	quantity?: number;
	price?: number;
	unitPrice?: number;
	subtotal?: number;
	[key: string]: unknown;
}

export interface DeliveryLocation {
	latitude?: number;
	longitude?: number;
	lat?: number;
	lng?: number;
	coordinates?: [number, number];
	[key: string]: unknown;
}

/** Client representation of the MongoDB Order document returned by the API. */
export interface DriverOrder {
	_id: MongoId;
	userId: MongoId | Record<string, unknown>;
	restaurantId: MongoId | Record<string, unknown>;
	driverId: MongoId | Record<string, unknown>;
	items: OrderItem[];
	deliveryAddress: string;
	phoneNumber: string;
	deliveryLocation?: DeliveryLocation;
	subtotal: number;
	deliveryFee: number;
	totalAmount: number;
	status: string;
	paymentStatus: string;
	paymentMethod: string;
	notes?: string;
	createdAt: string;
	updatedAt: string;
	__v?: number;
	[key: string]: unknown;
}

export interface DriverOrdersQuery {
	driverIds: string[];
	status?: string;
}
