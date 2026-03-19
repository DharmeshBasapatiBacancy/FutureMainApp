package com.bacancy.futureecommereapp.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.bacancy.futureecommereapp.data.remote.CustomerDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "session")

class SessionManager(private val context: Context) {

    private val _currentCustomer = MutableStateFlow<CustomerDto?>(null)
    val currentCustomer = _currentCustomer.asStateFlow()

    private val _currentCustomerId = MutableStateFlow<String?>(null)
    val currentCustomerId = _currentCustomerId.asStateFlow()

    private val _token = MutableStateFlow<String?>(null)
    val token = _token.asStateFlow()

    fun getToken(): String? = _token.value
    fun getCurrentCustomerId(): String? = _currentCustomerId.value

    init {
        runBlocking {
            loadToken()
            loadCustomerId()
        }
    }

    private suspend fun loadToken() {
        context.dataStore.data.map { prefs ->
            prefs[KEY_TOKEN]
        }.first()?.let { t ->
            _token.value = t
        }
    }

    private suspend fun loadCustomerId() {
        context.dataStore.data.map { prefs ->
            prefs[KEY_CUSTOMER_ID]
        }.first()?.let { id ->
            _currentCustomerId.value = id
        }
    }

    suspend fun saveSession(accessToken: String, customer: CustomerDto) {
        val customerId = customer.id ?: customer.uid
        context.dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = accessToken
            if (!customerId.isNullOrBlank()) {
                prefs[KEY_CUSTOMER_ID] = customerId
            }
        }
        _token.value = accessToken
        _currentCustomer.value = customer
        _currentCustomerId.value = customerId
    }

    suspend fun clearSession() {
        context.dataStore.edit {
            it.remove(KEY_TOKEN)
            it.remove(KEY_CUSTOMER_ID)
        }
        _token.value = null
        _currentCustomer.value = null
        _currentCustomerId.value = null
    }

    suspend fun loadCustomer(customer: CustomerDto) {
        _currentCustomer.value = customer
        _currentCustomerId.value = customer.id ?: customer.uid
    }

    companion object {
        private val KEY_TOKEN = stringPreferencesKey("customer_token")
        private val KEY_CUSTOMER_ID = stringPreferencesKey("customer_id")
    }
}
