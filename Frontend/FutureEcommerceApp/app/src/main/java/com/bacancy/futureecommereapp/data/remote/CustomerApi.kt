package com.bacancy.futureecommereapp.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface CustomerApi {

    @POST("api/customer/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<LoginResponse>

    @POST("api/customer/auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<RegisterResponse>

    @GET("api/customer/auth/verify")
    suspend fun verify(): Response<VerifyResponse>

    @POST("api/customer/auth/logout")
    suspend fun logout(): Response<LogoutResponse>

    @GET("api/customer/categories")
    suspend fun getCategories(): Response<CategoriesResponse>

    @GET("api/customer/products")
    suspend fun getProducts(
        @Query("category_id") categoryId: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ProductsResponse>

    @GET("api/customer/products/{id}")
    suspend fun getProduct(@Path("id") id: String): Response<ProductDetailResponse>

    @POST("api/customer/orders")
    suspend fun createOrder(@Body body: CreateOrderRequest): Response<CreateOrderResponse>
}

data class LoginRequest(val accessToken: String)
data class LoginResponse(
    val success: Boolean? = null,
    val message: String? = null,
    val customer: CustomerDto? = null
)

data class RegisterRequest(
    val accessToken: String,
    val firstName: String? = null,
    val lastName: String? = null,
    val displayName: String? = null
)
data class RegisterResponse(
    val success: Boolean? = null,
    val message: String? = null,
    val customer: CustomerDto? = null
)

data class VerifyResponse(
    val success: Boolean? = null,
    val customer: CustomerDto? = null
)
data class LogoutResponse(val success: Boolean? = null, val message: String? = null)

data class CustomerDto(
    val id: String? = null,
    val uid: String? = null,
    val email: String? = null,
    val displayName: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val role: String? = null
)

data class CategoriesResponse(
    val success: Boolean? = null,
    val categories: List<CategoryDto>? = null
)
data class CategoryDto(
    val id: String? = null,
    val name: String? = null,
    val slug: String? = null,
    val description: String? = null,
    val image_url: String? = null,
    val status: String? = null,
    val display_order: Int? = null,
    val productCount: Int? = null
)

data class ProductsResponse(
    val success: Boolean? = null,
    val products: List<ProductDto>? = null,
    val pagination: PaginationDto? = null
)
data class PaginationDto(
    val page: Int? = null,
    val limit: Int? = null,
    val total: Int? = null,
    val totalPages: Int? = null
)
data class ProductDto(
    val id: String? = null,
    val name: String? = null,
    val short_description: String? = null,
    val description: String? = null,
    val price: Double? = null,
    val stock: Int? = null,
    val status: String? = null,
    val category_id: String? = null,
    val primary_image_url: String? = null,
    val images: List<String>? = null,
    val slug: String? = null
)

data class ProductDetailResponse(
    val success: Boolean? = null,
    val product: ProductDto? = null
)

data class CreateOrderRequest(
    val items: List<OrderItemDto>,
    val subtotal: Double,
    val shipping_address: Map<String, Any>? = null,
    val billing_address: Map<String, Any>? = null,
    val payment_method: String? = null
)
data class OrderItemDto(
    val product_id: String,
    val name: String,
    val quantity: Int,
    val price: Double,
    val image_url: String? = null
)
data class CreateOrderResponse(
    val success: Boolean? = null,
    val message: String? = null,
    val order: OrderDto? = null
)
data class OrderDto(
    val id: String? = null,
    val order_number: String? = null,
    val status: String? = null,
    val total_amount: Double? = null,
    val subtotal: Double? = null,
    val items: List<Any>? = null
)
