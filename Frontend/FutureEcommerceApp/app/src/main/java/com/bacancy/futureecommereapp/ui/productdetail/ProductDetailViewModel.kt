package com.bacancy.futureecommereapp.ui.productdetail

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bacancy.futureecommereapp.data.remote.ProductDto
import com.bacancy.futureecommereapp.di.AppModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ProductDetailUiState(
    val product: ProductDto? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val addedToCart: Boolean = false
)

class ProductDetailViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    private val repository = AppModule.getProductRepository()
    private val cartRepository = AppModule.getCartRepository()
    val productId: String = savedStateHandle.get<String>("productId") ?: ""

    private val _uiState = MutableStateFlow(ProductDetailUiState())
    val uiState = _uiState.asStateFlow()

    init {
        loadProduct()
    }

    private fun loadProduct() {
        if (productId.isBlank()) return
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            repository.getProduct(productId)
                .onSuccess { product ->
                    _uiState.update { it.copy(product = product, isLoading = false) }
                }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Product not found")
                    }
                }
        }
    }

    fun addToCart(quantity: Int = 1) {
        val p = _uiState.value.product ?: return
        cartRepository.addItem(
            productId = p.id ?: return,
            name = p.name ?: "Product",
            price = p.price ?: 0.0,
            imageUrl = p.primary_image_url ?: p.images?.firstOrNull(),
            quantity = quantity
        )
        _uiState.update { it.copy(addedToCart = true) }
    }

    fun clearAddedToCart() {
        _uiState.update { it.copy(addedToCart = false) }
    }
}
