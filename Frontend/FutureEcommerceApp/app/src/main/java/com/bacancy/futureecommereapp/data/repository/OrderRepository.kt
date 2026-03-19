package com.bacancy.futureecommereapp.data.repository

import com.bacancy.futureecommereapp.data.remote.CreateOrderRequest
import com.bacancy.futureecommereapp.data.remote.CreateOrderResponse
import com.bacancy.futureecommereapp.data.remote.CustomerApi
import com.bacancy.futureecommereapp.data.remote.OrderItemDto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class OrderRepository(private val customerApi: CustomerApi) {

    suspend fun createOrder(
        items: List<OrderItemDto>,
        subtotal: Double,
        shippingAddress: Map<String, Any>? = null,
        billingAddress: Map<String, Any>? = null,
        paymentMethod: String? = null
    ): Result<CreateOrderResponse> = withContext(Dispatchers.IO) {
        try {
            val res = customerApi.createOrder(
                CreateOrderRequest(
                    items = items,
                    subtotal = subtotal,
                    shipping_address = shippingAddress,
                    billing_address = billingAddress,
                    payment_method = paymentMethod
                )
            )
            if (!res.isSuccessful) {
                val msg = res.body()?.message ?: res.errorBody()?.string() ?: res.message() ?: "Failed to create order"
                return@withContext Result.failure(Exception(msg))
            }
            val body = res.body() ?: return@withContext Result.failure(Exception("Empty response"))
            Result.success(body)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
