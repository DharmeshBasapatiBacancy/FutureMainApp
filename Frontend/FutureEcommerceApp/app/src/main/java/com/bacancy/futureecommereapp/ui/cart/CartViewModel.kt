package com.bacancy.futureecommereapp.ui.cart

import androidx.lifecycle.ViewModel
import com.bacancy.futureecommereapp.data.repository.CartItem
import com.bacancy.futureecommereapp.data.repository.CartRepository
import com.bacancy.futureecommereapp.di.AppModule
import kotlinx.coroutines.flow.StateFlow

class CartViewModel : ViewModel() {
    private val cartRepository: CartRepository = AppModule.getCartRepository()

    val items: StateFlow<List<CartItem>> = cartRepository.items
    val itemCount: Int get() = cartRepository.itemCount
    val subtotal: Double get() = cartRepository.subtotal
    val shippingCost: Double = 5.99
    val taxRate: Double = 0.08
    val taxAmount: Double get() = (subtotal * taxRate).let { (it * 100).toLong() / 100.0 }
    val total: Double get() = subtotal + shippingCost + taxAmount

    fun updateQuantity(productId: String, quantity: Int) {
        cartRepository.updateQuantity(productId, quantity)
    }

    fun removeItem(productId: String) {
        cartRepository.removeItem(productId)
    }

    fun clearCart() {
        cartRepository.clear()
    }
}
