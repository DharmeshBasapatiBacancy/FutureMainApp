package com.bacancy.futureecommereapp

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.bacancy.futureecommereapp.ui.theme.FutureECommereAppTheme
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight
import com.bacancy.futureecommereapp.ui.theme.FutureSky
import com.bacancy.futureecommereapp.ui.theme.FutureTeal

@Composable
fun ForgotPasswordScreen(
    onBackClick: () -> Unit = {},
    onResetPasswordClick: (String) -> Unit = { }
) {
    var email by rememberSaveable { mutableStateOf("") }
    var isLoading by rememberSaveable { mutableStateOf(false) }
    var isSuccess by rememberSaveable { mutableStateOf(false) }
    var emailError by rememberSaveable { mutableStateOf<String?>(null) }
    
    val keyboardController = LocalSoftwareKeyboardController.current
    
    val isFormValid = email.isNotBlank() && emailError == null
    
    // Handle success state after API call
    LaunchedEffect(isLoading) {
        if (isLoading) {
            delay(1500) // Simulate API call
            isLoading = false
            isSuccess = true
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        FutureSky,
                        Color.White
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 16.dp)
        ) {
            // Back button
            IconButton(
                onClick = onBackClick,
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Icon(
                    imageVector = Icons.Rounded.ArrowBack,
                    contentDescription = "Back",
                    tint = FutureMidnight,
                    modifier = Modifier.size(28.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Header
            Text(
                text = "Forgot Password?",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.ExtraBold
                ),
                color = FutureMidnight
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = if (isSuccess) 
                    "We've sent a password reset link to your email"
                else 
                    "Enter your email address and we'll send you a link to reset your password",
                style = MaterialTheme.typography.bodyLarge,
                color = FutureMidnight.copy(alpha = 0.7f)
            )

            Spacer(modifier = Modifier.height(40.dp))

            if (isSuccess) {
                // Success State
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Surface(
                        shape = RoundedCornerShape(50),
                        color = FutureTeal.copy(alpha = 0.15f),
                        modifier = Modifier.size(120.dp)
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.fillMaxSize()
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.CheckCircle,
                                contentDescription = "Success",
                                tint = FutureTeal,
                                modifier = Modifier.size(64.dp)
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    Text(
                        text = "Check Your Email",
                        style = MaterialTheme.typography.headlineSmall.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = FutureMidnight,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        text = "We've sent password reset instructions to\n$email",
                        style = MaterialTheme.typography.bodyMedium,
                        color = FutureMidnight.copy(alpha = 0.7f),
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(40.dp))
                    
                    Button(
                        onClick = onBackClick,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = FutureBlue
                        )
                    ) {
                        Text(
                            text = "Back to Sign In",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold
                            ),
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                    }
                }
            } else {
                // Email Input Form
                OutlinedTextField(
                    value = email,
                    onValueChange = { newValue ->
                        email = newValue
                        emailError = if (newValue.isNotBlank()) {
                            validateEmail(newValue)
                        } else null
                    },
                    label = {
                        Text(
                            text = "Email Address",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Filled.Email,
                            contentDescription = "Email",
                            tint = if (emailError != null) MaterialTheme.colorScheme.error 
                                   else FutureBlue
                        )
                    },
                    placeholder = {
                        Text(
                            text = "your.email@example.com",
                            color = FutureMidnight.copy(alpha = 0.5f)
                        )
                    },
                    isError = emailError != null,
                    supportingText = {
                        AnimatedVisibility(
                            visible = emailError != null,
                            enter = expandVertically(animationSpec = spring()) + fadeIn(),
                            exit = shrinkVertically(animationSpec = spring()) + fadeOut()
                        ) {
                            Text(
                                text = emailError ?: "",
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    },
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Email,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = {
                            keyboardController?.hide()
                            if (isFormValid && !isLoading) {
                                emailError = if (email.isBlank()) {
                                    "Email is required"
                                } else {
                                    validateEmail(email)
                                }
                                
                                if (emailError == null) {
                                    isLoading = true
                                    onResetPasswordClick(email)
                                }
                            }
                        }
                    ),
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = FutureBlue,
                        unfocusedBorderColor = FutureMidnight.copy(alpha = 0.3f),
                        errorBorderColor = MaterialTheme.colorScheme.error,
                        focusedLabelColor = FutureBlue,
                        unfocusedLabelColor = FutureMidnight.copy(alpha = 0.7f),
                        focusedTextColor = FutureMidnight,
                        unfocusedTextColor = FutureMidnight
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.weight(1f))

                // Reset Password Button
                Button(
                    onClick = {
                        keyboardController?.hide()
                        // Validate before submitting
                        emailError = if (email.isBlank()) {
                            "Email is required"
                        } else {
                            validateEmail(email)
                        }
                        
                        if (emailError == null) {
                            isLoading = true
                            onResetPasswordClick(email)
                            // Success state will be handled by LaunchedEffect
                        }
                    },
                    enabled = !isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = FutureBlue,
                        disabledContainerColor = FutureBlue.copy(alpha = 0.6f)
                    )
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White,
                            strokeWidth = 2.5.dp
                        )
                    } else {
                        Text(
                            text = "Send Reset Link",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold
                            ),
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ForgotPasswordPreview() {
    FutureECommereAppTheme {
        ForgotPasswordScreen()
    }
}

