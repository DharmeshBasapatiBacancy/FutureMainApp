package com.bacancy.futureecommereapp.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bacancy.futureecommereapp.data.remote.CategoryDto
import com.bacancy.futureecommereapp.data.remote.ProductDto
import com.bacancy.futureecommereapp.di.AppModule
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HomeUiState(
    val categories: List<CategoryDto> = emptyList(),
    val products: List<ProductDto> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

class HomeViewModel : ViewModel() {
    private val categoryRepository = AppModule.getCategoryRepository()
    private val productRepository = AppModule.getProductRepository()

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState = _uiState.asStateFlow()

    init {
        loadHome()
    }

    fun loadHome() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            val categoriesDeferred = async { categoryRepository.getCategories() }
            val productsDeferred = async { productRepository.getProducts(categoryId = null, page = 1, limit = 50) }

            val categoriesResult = categoriesDeferred.await()
            val productsResult = productsDeferred.await()

            val categories = categoriesResult.getOrNull()
            val products = productsResult.getOrNull()?.products

            val errorMessage =
                categoriesResult.exceptionOrNull()?.message
                    ?: productsResult.exceptionOrNull()?.message

            _uiState.update {
                it.copy(
                    categories = categories ?: emptyList(),
                    products = products ?: emptyList(),
                    isLoading = false,
                    error = errorMessage
                )
            }
        }
    }
}
