package com.bacancy.futureecommereapp.data.repository

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class CartRepository(
    private val sessionManager: SessionManager,
    private val cartStore: CartStore,
    private val scope: CoroutineScope
) {

    private val _items = MutableStateFlow<List<CartItem>>(emptyList())
    val items = _items.asStateFlow()

    val itemCount: Int get() = _items.value.sumOf { it.quantity }
    val subtotal: Double get() = _items.value.sumOf { it.lineTotal }

    @Volatile
    private var activeCustomerId: String? = null

    init {
        scope.launch {
            sessionManager.currentCustomerId
                .collect { customerId ->
                    activeCustomerId = customerId
                    if (customerId.isNullOrBlank()) {
                        _items.value = emptyList()
                        return@collect
                    }
                    val loaded = withContext(Dispatchers.IO) { cartStore.loadCart(customerId) }
                    _items.value = loaded
                }
        }

        scope.launch {
            items
                .drop(1) // skip initial empty
                .collect { list ->
                    val customerId = activeCustomerId
                    if (customerId.isNullOrBlank()) return@collect
                    withContext(Dispatchers.IO) { cartStore.saveCart(customerId, list) }
                }
        }
    }

    fun addItem(productId: String, name: String, price: Double, imageUrl: String? = null, quantity: Int = 1) {
        _items.update { list ->
            val existing = list.find { it.productId == productId }
            if (existing != null) {
                list.map { if (it.productId == productId) it.copy(quantity = it.quantity + quantity) else it }
            } else {
                list + CartItem(productId = productId, name = name, price = price, imageUrl = imageUrl, quantity = quantity)
            }
        }
    }

    fun updateQuantity(productId: String, quantity: Int) {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }
        _items.update { list ->
            list.map { if (it.productId == productId) it.copy(quantity = quantity) else it }
        }
    }

    fun removeItem(productId: String) {
        _items.update { it.filter { item -> item.productId != productId } }
    }

    fun clear() {
        _items.value = emptyList()
    }

    fun getItems(): List<CartItem> = _items.value
}
