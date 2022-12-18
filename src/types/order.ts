export interface Order {
    _id: string
    user: {
        _id: string
        number: string
        name: string
    }
    status: string
    order_date: string
    total_price: number
    delivery_type: string
    delivery_address: {
        lat: number
        lng: number
    }
    delivery_date: string
    payment_type: string
    order_items: OrderItem[]
    created_at: string
    updated_at: string
}

export interface OrderItem {
    _id: string
    name: string
    product_id: string
    quantity: number
    price: number
    created_at: string
}

export const orderStatus = "confirmed" || "waiting" || "cancelled" || "delivered" || "readyForDelivery" || "readyForPickup" || "closed"