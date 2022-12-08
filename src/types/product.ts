export interface Product {
    id: string
    name: string
    manufacturer: string
    description: string
    price: number
    salePrice: number
    images: string[]
    isAvailable: boolean
    tags: string[]
    characteristics: Characteristic[]
    created_at: string
    updated_at: string
}

export interface Characteristic {
    id: string
    title: string
    info: string
}