package com.bacancy.futureecommereapp.ui.ordersummary

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bacancy.futureecommereapp.data.remote.OrderItemDto
import com.bacancy.futureecommereapp.di.AppModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class OrderSummaryUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val orderCreated: Boolean = false,
    val orderId: String? = null,
    val orderNumber: String? = null
)

class OrderSummaryViewModel : ViewModel() {
    private val orderRepository = AppModule.getOrderRepository()
    private val cartRepository = AppModule.getCartRepository()

    val items = cartRepository.items.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val subtotal: Double get() = cartRepository.subtotal
    val shippingCost: Double = 5.99
    val taxRate: Double = 0.08
    val taxAmount: Double get() = (subtotal * taxRate).let { (it * 100).toLong() / 100.0 }
    val total: Double get() = subtotal + shippingCost + taxAmount

    private val _uiState = MutableStateFlow(OrderSummaryUiState())
    val uiState = _uiState.asStateFlow()

    fun createOrder(onSuccess: () -> Unit) {
        val cartItems = cartRepository.getItems()
        if (cartItems.isEmpty()) {
            _uiState.update { it.copy(error = "Cart is empty") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val orderItems = cartItems.map {
                OrderItemDto(
                    product_id = it.productId,
                    name = it.name,
                    quantity = it.quantity,
                    price = it.price,
                    image_url = it.imageUrl
                )
            }
            orderRepository.createOrder(
                items = orderItems,
                subtotal = subtotal
            )
                .onSuccess { response ->
                    cartRepository.clear()
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            orderCreated = true,
                            orderId = response.order?.id,
                            orderNumber = response.order?.order_number
                        )
                    }
                    onSuccess()
                }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Failed to create order")
                    }
                }
        }
    }
}
