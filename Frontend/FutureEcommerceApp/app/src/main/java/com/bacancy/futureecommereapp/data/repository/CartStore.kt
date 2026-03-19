package com.bacancy.futureecommereapp.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.first

private val Context.cartDataStore: DataStore<Preferences> by preferencesDataStore(name = "cart")

class CartStore(
    private val context: Context,
    private val gson: Gson = Gson()
) {
    private fun keyFor(customerId: String) = stringPreferencesKey("cart_items_$customerId")

    suspend fun loadCart(customerId: String): List<CartItem> {
        if (customerId.isBlank()) return emptyList()
        val key = keyFor(customerId)
        val json = context.cartDataStore.data.first()[key] ?: return emptyList()
        return try {
            val type = object : TypeToken<List<CartItem>>() {}.type
            gson.fromJson<List<CartItem>>(json, type) ?: emptyList()
        } catch (_: Throwable) {
            emptyList()
        }
    }

    suspend fun saveCart(customerId: String, items: List<CartItem>) {
        if (customerId.isBlank()) return
        val key = keyFor(customerId)
        val json = gson.toJson(items)
        context.cartDataStore.edit { prefs ->
            prefs[key] = json
        }
    }
}

