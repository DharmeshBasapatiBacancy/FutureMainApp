package com.bacancy.futureecommereapp

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.VisibilityOff
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.bacancy.futureecommereapp.ui.theme.FutureECommereAppTheme
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight
import com.bacancy.futureecommereapp.ui.theme.FutureSky
import com.bacancy.futureecommereapp.ui.theme.FutureTeal
import java.util.regex.Pattern

@Composable
fun SignUpScreen(
    onBackClick: () -> Unit = {},
    onSignUpClick: (String, String, String) -> Unit = { _, _, _ -> },
    isLoading: Boolean = false,
    error: String? = null,
    onDismissError: () -> Unit = {}
) {
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var confirmPassword by rememberSaveable { mutableStateOf("") }
    var passwordVisible by rememberSaveable { mutableStateOf(false) }
    var confirmPasswordVisible by rememberSaveable { mutableStateOf(false) }
    
    var nameError by rememberSaveable { mutableStateOf<String?>(null) }
    var emailError by rememberSaveable { mutableStateOf<String?>(null) }
    var passwordError by rememberSaveable { mutableStateOf<String?>(null) }
    var confirmPasswordError by rememberSaveable { mutableStateOf<String?>(null) }
    
    val emailFocusRequester = remember { FocusRequester() }
    val passwordFocusRequester = remember { FocusRequester() }
    val confirmPasswordFocusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current
    
    val isFormValid = name.isNotBlank() && email.isNotBlank() && 
                     password.isNotBlank() && confirmPassword.isNotBlank() &&
                     nameError == null && emailError == null && 
                     passwordError == null && confirmPasswordError == null

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
                text = "Create Account",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.ExtraBold
                ),
                color = FutureMidnight
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Join us and start your shopping journey",
                style = MaterialTheme.typography.bodyLarge,
                color = FutureMidnight.copy(alpha = 0.7f)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Name Field
            OutlinedTextField(
                value = name,
                onValueChange = { newValue ->
                    name = newValue
                    nameError = if (newValue.isNotBlank()) {
                        validateName(newValue)
                    } else null
                },
                label = {
                    Text(
                        text = "Full Name",
                        style = MaterialTheme.typography.bodyMedium
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = "Name",
                        tint = if (nameError != null) MaterialTheme.colorScheme.error 
                               else FutureBlue
                    )
                },
                placeholder = {
                    Text(
                        text = "John Doe",
                        color = FutureMidnight.copy(alpha = 0.5f)
                    )
                },
                isError = nameError != null,
                supportingText = {
                    AnimatedVisibility(
                        visible = nameError != null,
                        enter = expandVertically(animationSpec = spring()) + fadeIn(),
                        exit = shrinkVertically(animationSpec = spring()) + fadeOut()
                    ) {
                        Text(
                            text = nameError ?: "",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Text,
                    imeAction = ImeAction.Next
                ),
                keyboardActions = KeyboardActions(
                    onNext = {
                        emailFocusRequester.requestFocus()
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

            Spacer(modifier = Modifier.height(20.dp))

            // Email Field
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
                    imeAction = ImeAction.Next
                ),
                keyboardActions = KeyboardActions(
                    onNext = {
                        passwordFocusRequester.requestFocus()
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
                modifier = Modifier
                    .fillMaxWidth()
                    .focusRequester(emailFocusRequester)
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Password Field
            OutlinedTextField(
                value = password,
                onValueChange = { newValue ->
                    password = newValue
                    passwordError = if (newValue.isNotBlank()) {
                        validatePassword(newValue)
                    } else null
                    // Re-validate confirm password if it's already filled
                    if (confirmPassword.isNotBlank()) {
                        confirmPasswordError = validateConfirmPassword(newValue, confirmPassword)
                    }
                },
                label = {
                    Text(
                        text = "Password",
                        style = MaterialTheme.typography.bodyMedium
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Filled.Lock,
                        contentDescription = "Password",
                        tint = if (passwordError != null) MaterialTheme.colorScheme.error 
                               else FutureBlue
                    )
                },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) 
                                Icons.Outlined.Visibility 
                            else 
                                Icons.Outlined.VisibilityOff,
                            contentDescription = if (passwordVisible) 
                                "Hide password" 
                            else 
                                "Show password",
                            tint = FutureMidnight.copy(alpha = 0.6f)
                        )
                    }
                },
                visualTransformation = if (passwordVisible) 
                    VisualTransformation.None 
                else 
                    PasswordVisualTransformation(),
                isError = passwordError != null,
                supportingText = {
                    AnimatedVisibility(
                        visible = passwordError != null,
                        enter = expandVertically(animationSpec = spring()) + fadeIn(),
                        exit = shrinkVertically(animationSpec = spring()) + fadeOut()
                    ) {
                        Text(
                            text = passwordError ?: "",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Next
                ),
                keyboardActions = KeyboardActions(
                    onNext = {
                        confirmPasswordFocusRequester.requestFocus()
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
                modifier = Modifier
                    .fillMaxWidth()
                    .focusRequester(passwordFocusRequester)
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Confirm Password Field
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = { newValue ->
                    confirmPassword = newValue
                    confirmPasswordError = if (newValue.isNotBlank()) {
                        validateConfirmPassword(password, newValue)
                    } else null
                },
                label = {
                    Text(
                        text = "Confirm Password",
                        style = MaterialTheme.typography.bodyMedium
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Filled.Lock,
                        contentDescription = "Confirm Password",
                        tint = if (confirmPasswordError != null) MaterialTheme.colorScheme.error 
                               else FutureBlue
                    )
                },
                trailingIcon = {
                    IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                        Icon(
                            imageVector = if (confirmPasswordVisible) 
                                Icons.Outlined.Visibility 
                            else 
                                Icons.Outlined.VisibilityOff,
                            contentDescription = if (confirmPasswordVisible) 
                                "Hide password" 
                            else 
                                "Show password",
                            tint = FutureMidnight.copy(alpha = 0.6f)
                        )
                    }
                },
                visualTransformation = if (confirmPasswordVisible) 
                    VisualTransformation.None 
                else 
                    PasswordVisualTransformation(),
                isError = confirmPasswordError != null,
                supportingText = {
                    AnimatedVisibility(
                        visible = confirmPasswordError != null,
                        enter = expandVertically(animationSpec = spring()) + fadeIn(),
                        exit = shrinkVertically(animationSpec = spring()) + fadeOut()
                    ) {
                        Text(
                            text = confirmPasswordError ?: "",
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                keyboardActions = KeyboardActions(
                    onDone = {
                        keyboardController?.hide()
                        if (isFormValid && !isLoading) {
                            onDismissError()
                            onSignUpClick(name, email, password)
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
                modifier = Modifier
                    .fillMaxWidth()
                    .focusRequester(confirmPasswordFocusRequester)
            )

            Spacer(modifier = Modifier.weight(1f))

            // Sign Up Button
            Button(
                onClick = {
                    keyboardController?.hide()
                    // Validate all fields before submitting
                    nameError = if (name.isBlank()) {
                        "Name is required"
                    } else {
                        validateName(name)
                    }
                    emailError = if (email.isBlank()) {
                        "Email is required"
                    } else {
                        validateEmail(email)
                    }
                    passwordError = if (password.isBlank()) {
                        "Password is required"
                    } else {
                        validatePassword(password)
                    }
                    confirmPasswordError = if (confirmPassword.isBlank()) {
                        "Please confirm your password"
                    } else {
                        validateConfirmPassword(password, confirmPassword)
                    }
                    
                    if (nameError == null && emailError == null && 
                        passwordError == null && confirmPasswordError == null) {
                        onDismissError()
                        onSignUpClick(name, email, password)
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
                        text = "Create Account",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = Color.White,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                }
            }

            if (error != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Sign In Link
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Already have an account? ",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FutureMidnight.copy(alpha = 0.7f)
                )
                Text(
                    text = "Sign In",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    color = FutureTeal,
                    modifier = Modifier.clickable {
                        onBackClick()
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

// Validation functions
fun validateName(name: String): String? {
    return when {
        name.isBlank() -> "Name is required"
        name.length < 2 -> "Name must be at least 2 characters"
        name.length > 50 -> "Name is too long"
        !name.matches(Regex("^[a-zA-Z\\s]+$")) -> "Name should only contain letters and spaces"
        else -> null
    }
}

fun validateConfirmPassword(password: String, confirmPassword: String): String? {
    return when {
        confirmPassword.isBlank() -> "Please confirm your password"
        password != confirmPassword -> "Passwords do not match"
        else -> null
    }
}

@Preview(showBackground = true)
@Composable
fun SignUpPreview() {
    FutureECommereAppTheme {
        SignUpScreen()
    }
}

