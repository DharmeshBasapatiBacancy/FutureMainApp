package com.bacancy.futureecommereapp.di

import android.content.Context
import com.bacancy.futureecommereapp.BuildConfig
import com.bacancy.futureecommereapp.data.remote.CustomerApi
import com.bacancy.futureecommereapp.data.repository.AuthRepository
import com.bacancy.futureecommereapp.data.repository.CartRepository
import com.bacancy.futureecommereapp.data.repository.CartStore
import com.bacancy.futureecommereapp.data.repository.CategoryRepository
import com.bacancy.futureecommereapp.data.repository.OrderRepository
import com.bacancy.futureecommereapp.data.repository.ProductRepository
import com.bacancy.futureecommereapp.data.repository.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object AppModule {

    private var sessionManager: SessionManager? = null
    private var customerApi: CustomerApi? = null
    private var authRepository: AuthRepository? = null
    private var categoryRepository: CategoryRepository? = null
    private var productRepository: ProductRepository? = null
    private var orderRepository: OrderRepository? = null
    private var cartRepository: CartRepository? = null
    private var cartStore: CartStore? = null
    private var appScope: CoroutineScope? = null

    fun init(context: Context) {
        if (sessionManager != null) return
        sessionManager = SessionManager(context)
        val sm = sessionManager!!
        appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
        customerApi = createCustomerApi(sm::getToken)
        authRepository = AuthRepository(customerApi!!, sm::getToken)
        categoryRepository = CategoryRepository(customerApi!!)
        productRepository = ProductRepository(customerApi!!)
        orderRepository = OrderRepository(customerApi!!)
        cartStore = CartStore(context)
        cartRepository = CartRepository(
            sessionManager = sm,
            cartStore = cartStore!!,
            scope = appScope!!
        )
    }

    private fun createCustomerApi(tokenProvider: () -> String?): CustomerApi {
        val client = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor { chain ->
                val token = tokenProvider()
                val request = chain.request().newBuilder()
                if (!token.isNullOrBlank()) {
                    request.addHeader("Authorization", "Bearer $token")
                }
                chain.proceed(request.build())
            }
            .apply {
                if (BuildConfig.DEBUG) {
                    addInterceptor(HttpLoggingInterceptor().setLevel(HttpLoggingInterceptor.Level.BODY))
                }
            }
            .build()
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL + "/")
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(CustomerApi::class.java)
    }

    fun getSessionManager(): SessionManager = sessionManager ?: error("AppModule.init(context) must be called first")
    fun getAuthRepository(): AuthRepository = authRepository ?: error("AppModule.init(context) must be called first")
    fun getCategoryRepository(): CategoryRepository = categoryRepository ?: error("AppModule.init(context) must be called first")
    fun getProductRepository(): ProductRepository = productRepository ?: error("AppModule.init(context) must be called first")
    fun getOrderRepository(): OrderRepository = orderRepository ?: error("AppModule.init(context) must be called first")
    fun getCartRepository(): CartRepository = cartRepository ?: error("AppModule.init(context) must be called first")
}
