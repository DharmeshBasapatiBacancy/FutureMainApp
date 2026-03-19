package com.bacancy.futureecommereapp.ui.categories

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bacancy.futureecommereapp.data.remote.CategoryDto
import com.bacancy.futureecommereapp.di.AppModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class CategorySort {
    NAME_ASC,
    NAME_DESC,
    PRODUCT_COUNT_DESC
}

data class CategoriesUiState(
    val categories: List<CategoryDto> = emptyList(),
    val visibleCategories: List<CategoryDto> = emptyList(),
    val query: String = "",
    val sort: CategorySort = CategorySort.NAME_ASC,
    val hasImageOnly: Boolean = false,
    val minProductCount: Int = 0,
    val isLoading: Boolean = false,
    val error: String? = null
)

class CategoriesViewModel : ViewModel() {
    private val repository = AppModule.getCategoryRepository()

    private val _uiState = MutableStateFlow(CategoriesUiState())
    val uiState = _uiState.asStateFlow()

    init {
        loadCategories()
    }

    fun loadCategories() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            repository.getCategories()
                .onSuccess { list ->
                    _uiState.update { prev ->
                        val next = prev.copy(categories = list, isLoading = false)
                        next.copy(visibleCategories = applyClientSideFilters(next))
                    }
                }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Failed to load categories")
                    }
                }
        }
    }

    fun updateQuery(query: String) {
        _uiState.update { prev ->
            val next = prev.copy(query = query)
            next.copy(visibleCategories = applyClientSideFilters(next))
        }
    }

    fun updateSort(sort: CategorySort) {
        _uiState.update { prev ->
            val next = prev.copy(sort = sort)
            next.copy(visibleCategories = applyClientSideFilters(next))
        }
    }

    fun updateHasImageOnly(enabled: Boolean) {
        _uiState.update { prev ->
            val next = prev.copy(hasImageOnly = enabled)
            next.copy(visibleCategories = applyClientSideFilters(next))
        }
    }

    fun updateMinProductCount(min: Int) {
        _uiState.update { prev ->
            val next = prev.copy(minProductCount = min.coerceAtLeast(0))
            next.copy(visibleCategories = applyClientSideFilters(next))
        }
    }

    private fun applyClientSideFilters(state: CategoriesUiState): List<CategoryDto> {
        val q = state.query.trim()
        val filtered = state.categories.asSequence()
            .filter { c ->
                if (q.isBlank()) true else (c.name ?: "").contains(q, ignoreCase = true)
            }
            .filter { c ->
                if (!state.hasImageOnly) true else !c.image_url.isNullOrBlank()
            }
            .filter { c ->
                val count = c.productCount ?: 0
                count >= state.minProductCount
            }

        val sorted = when (state.sort) {
            CategorySort.NAME_ASC -> filtered.sortedBy { (it.name ?: "").lowercase() }
            CategorySort.NAME_DESC -> filtered.sortedByDescending { (it.name ?: "").lowercase() }
            CategorySort.PRODUCT_COUNT_DESC -> filtered.sortedByDescending { it.productCount ?: 0 }
        }

        return sorted.toList()
    }
}
