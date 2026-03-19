package com.bacancy.futureecommereapp.data.repository

data class CartItem(
    val productId: String,
    val name: String,
    val price: Double,
    val imageUrl: String? = null,
    var quantity: Int = 1
) {
    val lineTotal: Double get() = price * quantity
}
