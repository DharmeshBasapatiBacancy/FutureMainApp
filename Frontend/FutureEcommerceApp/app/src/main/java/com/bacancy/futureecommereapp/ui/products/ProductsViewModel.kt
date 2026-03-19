package com.bacancy.futureecommereapp.ui.products

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bacancy.futureecommereapp.data.remote.PaginationDto
import com.bacancy.futureecommereapp.data.remote.ProductDto
import com.bacancy.futureecommereapp.data.remote.ProductsResponse
import com.bacancy.futureecommereapp.di.AppModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ProductsUiState(
    val products: List<ProductDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val categoryId: String? = null,
    val pagination: PaginationDto? = null
)

class ProductsViewModel(savedStateHandle: SavedStateHandle) : ViewModel() {
    private val repository = AppModule.getProductRepository()
    val categoryId: String? = savedStateHandle.get<String>("categoryId")

    private val _uiState = MutableStateFlow(ProductsUiState(categoryId = categoryId))
    val uiState = _uiState.asStateFlow()

    init {
        loadProducts()
    }

    fun loadProducts() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            repository.getProducts(categoryId = categoryId)
                .onSuccess { response ->
                    _uiState.update {
                        it.copy(
                            products = response.products ?: emptyList(),
                            pagination = response.pagination,
                            isLoading = false
                        )
                    }
                }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Failed to load products")
                    }
                }
        }
    }
}
