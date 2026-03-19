package com.bacancy.futureecommereapp.data.repository

import com.bacancy.futureecommereapp.BuildConfig
import com.bacancy.futureecommereapp.data.remote.CustomerApi
import com.bacancy.futureecommereapp.data.remote.CustomerDto
import com.bacancy.futureecommereapp.data.remote.LoginRequest
import com.bacancy.futureecommereapp.data.remote.RegisterRequest
import com.bacancy.futureecommereapp.data.remote.SupabaseAuthApi
import com.bacancy.futureecommereapp.data.remote.SupabaseSignUpRequest
import com.bacancy.futureecommereapp.data.remote.SupabaseTokenRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

data class AuthResult(val accessToken: String, val customer: CustomerDto)

class AuthRepository(
    private val customerApi: CustomerApi,
    private val tokenProvider: () -> String?
) {
    private var supabaseAuthApi: SupabaseAuthApi? = null

    private fun getSupabaseAuthApi(): SupabaseAuthApi? {
        val url = BuildConfig.SUPABASE_URL
        val key = BuildConfig.SUPABASE_ANON_KEY
        if (url.isNullOrEmpty() || key.isNullOrEmpty()) return null
        if (supabaseAuthApi != null) return supabaseAuthApi
        val baseUrl = url.trimEnd('/') + "/"
        val client = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor { chain ->
                chain.proceed(
                    chain.request().newBuilder()
                        .addHeader("apikey", key)
                        .addHeader("Authorization", "Bearer $key")
                        .build()
                )
            }
            .build()
        supabaseAuthApi = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(SupabaseAuthApi::class.java)
        return supabaseAuthApi
    }

    suspend fun signIn(email: String, password: String): Result<AuthResult> = withContext(Dispatchers.IO) {
        val api = getSupabaseAuthApi()
        if (api == null) {
            return@withContext Result.failure(Exception("Supabase URL and Anon Key must be set in BuildConfig"))
        }
        val tokenRes = api.signInWithPassword(SupabaseTokenRequest(email = email, password = password))
        if (!tokenRes.isSuccessful) {
            val body = tokenRes.errorBody()?.string()
            val err = tokenRes.body()?.error_description ?: body ?: "Sign in failed"
            return@withContext Result.failure(Exception(err))
        }
        val accessToken = tokenRes.body()?.access_token
        if (accessToken.isNullOrBlank()) {
            return@withContext Result.failure(Exception("No access token received"))
        }
        val loginRes = customerApi.login(LoginRequest(accessToken = accessToken))
        if (!loginRes.isSuccessful) {
            val msg = loginRes.body()?.message ?: loginRes.message() ?: "Login failed"
            return@withContext Result.failure(Exception(msg))
        }
        val customer = loginRes.body()?.customer
        if (customer == null) {
            return@withContext Result.failure(Exception("No customer data"))
        }
        Result.success(AuthResult(accessToken = accessToken, customer = customer))
    }

    suspend fun testLogin(): Result<AuthResult> = withContext(Dispatchers.IO) {
        try {
            val loginRes = customerApi.login(LoginRequest(accessToken = "test-token-customer"))
            if (!loginRes.isSuccessful) {
                val msg = loginRes.body()?.message ?: loginRes.message() ?: "Test login failed"
                return@withContext Result.failure(Exception(msg))
            }
            val customer = loginRes.body()?.customer
                ?: return@withContext Result.failure(Exception("No customer data"))
            Result.success(AuthResult(accessToken = "test-token-customer", customer = customer))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signUp(
        email: String,
        password: String,
        firstName: String? = null,
        lastName: String? = null,
        displayName: String? = null
    ): Result<AuthResult> = withContext(Dispatchers.IO) {
        val api = getSupabaseAuthApi()
        if (api == null) {
            return@withContext Result.failure(Exception("Supabase URL and Anon Key must be set in BuildConfig"))
        }
        val signUpRes = api.signUp(SupabaseSignUpRequest(email = email, password = password))
        if (!signUpRes.isSuccessful) {
            val body = signUpRes.errorBody()?.string()
            val err = signUpRes.body()?.error_description ?: body ?: "Sign up failed"
            return@withContext Result.failure(Exception(err))
        }
        val body = signUpRes.body()
        val accessToken = body?.access_token
        if (accessToken.isNullOrBlank()) {
            val msg = if (body?.user != null)
                "Sign up successful. Please check your email to confirm your account, then sign in."
            else
                body?.error_description ?: "Sign up failed. Try again or use a different email."
            return@withContext Result.failure(Exception(msg))
        }
        val registerRes = customerApi.register(
            RegisterRequest(
                accessToken = accessToken,
                firstName = firstName,
                lastName = lastName,
                displayName = displayName
            )
        )
        if (!registerRes.isSuccessful) {
            val msg = registerRes.body()?.message ?: registerRes.message() ?: "Registration failed"
            return@withContext Result.failure(Exception(msg))
        }
        val customer = registerRes.body()?.customer
        if (customer == null) {
            return@withContext Result.failure(Exception("No customer data"))
        }
        Result.success(AuthResult(accessToken = accessToken, customer = customer))
    }

    suspend fun verify(): Result<CustomerDto> = withContext(Dispatchers.IO) {
        val token = tokenProvider()
        if (token.isNullOrBlank()) return@withContext Result.failure(Exception("No token"))
        val res = customerApi.verify()
        if (!res.isSuccessful) return@withContext Result.failure(Exception("Invalid session"))
        val customer = res.body()?.customer ?: return@withContext Result.failure(Exception("No customer"))
        Result.success(customer)
    }

    suspend fun logout(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            customerApi.logout()
        } catch (_: Exception) { }
        Result.success(Unit)
    }
}
