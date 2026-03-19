package com.bacancy.futureecommereapp.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bacancy.futureecommereapp.data.remote.CustomerDto
import com.bacancy.futureecommereapp.data.repository.AuthResult
import com.bacancy.futureecommereapp.data.repository.SessionManager
import com.bacancy.futureecommereapp.di.AppModule
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

data class AuthUiState(
    val customer: CustomerDto? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val isAuthenticated: Boolean = false
)

class AuthViewModel : ViewModel() {

    private val sessionManager: SessionManager = AppModule.getSessionManager()
    private val authRepository = AppModule.getAuthRepository()

    val currentCustomer: StateFlow<CustomerDto?> = sessionManager.currentCustomer
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        _uiState.value = _uiState.value.copy(
            customer = runBlocking { sessionManager.currentCustomer.value },
            isAuthenticated = sessionManager.getToken() != null
        )
        viewModelScope.launch {
            sessionManager.currentCustomer.collect { customer ->
                _uiState.update { it.copy(customer = customer, isAuthenticated = customer != null) }
            }
        }
        tryRestoreSession()
    }

    private fun tryRestoreSession() {
        viewModelScope.launch {
            val token = sessionManager.getToken()
            if (token.isNullOrBlank()) return@launch
            _uiState.update { it.copy(isLoading = true, error = null) }
            authRepository.verify()
                .onSuccess { customer ->
                    sessionManager.loadCustomer(customer)
                    _uiState.update { it.copy(isLoading = false, customer = customer, isAuthenticated = true) }
                }
                .onFailure { e ->
                    sessionManager.clearSession()
                    _uiState.update {
                        it.copy(isLoading = false, customer = null, isAuthenticated = false, error = e.message)
                    }
                }
        }
    }

    fun signIn(email: String, password: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            authRepository.signIn(email, password)
                .onSuccess { (accessToken, customer) ->
                    sessionManager.saveSession(accessToken, customer)
                    _uiState.update {
                        it.copy(isLoading = false, customer = customer, isAuthenticated = true, error = null)
                    }
                }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Sign in failed")
                    }
                }
        }
    }

    fun signUp(
        email: String,
        password: String,
        firstName: String? = null,
        lastName: String? = null,
        displayName: String? = null
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            authRepository.signUp(email, password, firstName, lastName, displayName)
                .onSuccess { (accessToken, customer) ->
                    sessionManager.saveSession(accessToken, customer)
                    _uiState.update {
                        it.copy(isLoading = false, customer = customer, isAuthenticated = true, error = null)
                    }
                }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Sign up failed")
                    }
                }
        }
    }

    fun testLogin() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            authRepository.testLogin()
                .onSuccess { (accessToken, customer) ->
                    sessionManager.saveSession(accessToken, customer)
                    _uiState.update {
                        it.copy(isLoading = false, customer = customer, isAuthenticated = true, error = null)
                    }
                }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isLoading = false, error = e.message ?: "Test login failed")
                    }
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            sessionManager.clearSession()
            _uiState.update { AuthUiState() }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
