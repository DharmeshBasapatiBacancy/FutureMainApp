package com.bacancy.futureecommereapp.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

/**
 * Supabase Auth REST API (token endpoint) to get access_token for Backend login.
 */
interface SupabaseAuthApi {

    @Headers("Content-Type: application/json")
    @POST("auth/v1/token?grant_type=password")
    suspend fun signInWithPassword(@Body body: SupabaseTokenRequest): Response<SupabaseTokenResponse>

    @Headers("Content-Type: application/json")
    @POST("auth/v1/signup")
    suspend fun signUp(@Body body: SupabaseSignUpRequest): Response<SupabaseTokenResponse>
}

data class SupabaseTokenRequest(
    val email: String,
    val password: String
)

data class SupabaseSignUpRequest(
    val email: String,
    val password: String,
    val data: Map<String, String>? = null
)

data class SupabaseTokenResponse(
    val access_token: String? = null,
    val token_type: String? = null,
    val expires_in: Int? = null,
    val refresh_token: String? = null,
    val user: SupabaseUser? = null,
    val error: String? = null,
    val error_description: String? = null
)

data class SupabaseUser(
    val id: String? = null,
    val email: String? = null
)
