package com.bacancy.futureecommereapp.data.repository

import com.bacancy.futureecommereapp.data.remote.CategoryDto
import com.bacancy.futureecommereapp.data.remote.CustomerApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class CategoryRepository(private val customerApi: CustomerApi) {

    suspend fun getCategories(): Result<List<CategoryDto>> = withContext(Dispatchers.IO) {
        try {
            val res = customerApi.getCategories()
            if (!res.isSuccessful) {
                return@withContext Result.failure(Exception(res.message() ?: "Failed to load categories"))
            }
            val list = res.body()?.categories ?: emptyList()
            Result.success(list)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
