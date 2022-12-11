export interface Order {
    _id: string
    user_id: string
    status: string
    order_date: string
    total_price: number
    delivery_type: string
    delivery_address: string
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