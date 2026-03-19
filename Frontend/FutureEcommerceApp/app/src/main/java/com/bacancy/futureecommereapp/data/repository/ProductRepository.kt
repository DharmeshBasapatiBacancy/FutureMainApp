package com.bacancy.futureecommereapp.data.repository

import com.bacancy.futureecommereapp.data.remote.ProductDto
import com.bacancy.futureecommereapp.data.remote.ProductsResponse
import com.bacancy.futureecommereapp.data.remote.CustomerApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ProductRepository(private val customerApi: CustomerApi) {

    suspend fun getProducts(categoryId: String? = null, page: Int = 1, limit: Int = 20): Result<ProductsResponse> = withContext(Dispatchers.IO) {
        try {
            val res = customerApi.getProducts(categoryId, page, limit)
            if (!res.isSuccessful) {
                return@withContext Result.failure(Exception(res.message() ?: "Failed to load products"))
            }
            val body = res.body() ?: return@withContext Result.failure(Exception("Empty response"))
            Result.success(body)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProduct(id: String): Result<ProductDto> = withContext(Dispatchers.IO) {
        try {
            val res = customerApi.getProduct(id)
            if (!res.isSuccessful) {
                return@withContext Result.failure(Exception(res.message() ?: "Product not found"))
            }
            val product = res.body()?.product ?: return@withContext Result.failure(Exception("Product not found"))
            Result.success(product)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
