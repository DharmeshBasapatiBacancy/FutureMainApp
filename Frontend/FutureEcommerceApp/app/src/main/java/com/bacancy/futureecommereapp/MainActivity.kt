package com.bacancy.futureecommereapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowForward
import androidx.compose.material.icons.rounded.FlashOn
import androidx.compose.material.icons.rounded.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.bacancy.futureecommereapp.di.AppModule
import com.bacancy.futureecommereapp.navigation.NavRoutes
import com.bacancy.futureecommereapp.ui.auth.AuthViewModel
import com.bacancy.futureecommereapp.ui.cart.CartViewModel
import com.bacancy.futureecommereapp.ui.categories.CategoriesViewModel
import com.bacancy.futureecommereapp.ui.home.HomeViewModel
import com.bacancy.futureecommereapp.ui.ordersummary.OrderSummaryViewModel
import com.bacancy.futureecommereapp.ui.productdetail.ProductDetailViewModel
import com.bacancy.futureecommereapp.ui.products.ProductsViewModel
import com.bacancy.futureecommereapp.ui.screens.CartScreen
import com.bacancy.futureecommereapp.ui.screens.CategoriesScreen
import com.bacancy.futureecommereapp.ui.screens.HomeScreen
import com.bacancy.futureecommereapp.ui.screens.OrderSummaryScreen
import com.bacancy.futureecommereapp.ui.screens.PaymentScreen
import com.bacancy.futureecommereapp.ui.screens.ProductDetailScreen
import com.bacancy.futureecommereapp.ui.screens.ProductsScreen
import com.bacancy.futureecommereapp.ui.theme.FutureECommereAppTheme
import com.bacancy.futureecommereapp.ui.theme.FutureAccent
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureBlueDark
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight
import com.bacancy.futureecommereapp.ui.theme.FutureSky
import com.bacancy.futureecommereapp.ui.theme.FutureTeal
import com.bacancy.futureecommereapp.ui.theme.FutureTealLight
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            FutureECommereAppTheme {
                val navController = rememberNavController()
                val authViewModel: AuthViewModel = viewModel()

                val authState by authViewModel.uiState.collectAsState()
                LaunchedEffect(authState.isAuthenticated) {
                    if (authState.isAuthenticated && authState.customer != null) {
                        val currentRoute = navController.currentBackStackEntry?.destination?.route
                        if (
                            currentRoute == NavRoutes.SIGN_IN ||
                            currentRoute == NavRoutes.SIGN_UP ||
                            currentRoute == NavRoutes.WELCOME ||
                            currentRoute == NavRoutes.FORGOT_PASSWORD
                        ) {
                            navController.navigate(NavRoutes.HOME) {
                                popUpTo(NavRoutes.WELCOME) { inclusive = true }
                            }
                        }
                    }
                }

                NavHost(
                    navController = navController,
                    startDestination = NavRoutes.SPLASH
                ) {
                    composable(NavRoutes.SPLASH) {
                        SplashScreen(
                            onFinished = {
                                if (authViewModel.uiState.value.isAuthenticated) {
                                    navController.navigate(NavRoutes.HOME) {
                                        popUpTo(NavRoutes.SPLASH) { inclusive = true }
                                    }
                                } else {
                                    navController.navigate(NavRoutes.WELCOME) {
                                        popUpTo(NavRoutes.SPLASH) { inclusive = true }
                                    }
                                }
                            }
                        )
                    }
                    composable(NavRoutes.WELCOME) {
                        WelcomeScreen(
                            onExploreClick = { navController.navigate(NavRoutes.CATEGORIES) },
                            onSignInClick = { navController.navigate(NavRoutes.SIGN_IN) }
                        )
                    }
                    composable(NavRoutes.SIGN_IN) {
                        val uiState by authViewModel.uiState.collectAsState()
                        SignInScreen(
                            onBackClick = { navController.popBackStack() },
                            onSignInClick = { email, password ->
                                authViewModel.signIn(email, password)
                            },
                            onSignUpClick = { navController.navigate(NavRoutes.SIGN_UP) },
                            onForgotPasswordClick = { navController.navigate(NavRoutes.FORGOT_PASSWORD) },
                            onTestLogin = { authViewModel.testLogin() },
                            isLoading = uiState.isLoading,
                            error = uiState.error,
                            onDismissError = { authViewModel.clearError() }
                        )
                    }
                    composable(NavRoutes.SIGN_UP) {
                        val uiState by authViewModel.uiState.collectAsState()
                        SignUpScreen(
                            onBackClick = { navController.popBackStack() },
                            onSignUpClick = { name, email, password ->
                                authViewModel.signUp(
                                    email = email,
                                    password = password,
                                    displayName = name
                                )
                            },
                            isLoading = uiState.isLoading,
                            error = uiState.error,
                            onDismissError = { authViewModel.clearError() }
                        )
                    }
                    composable(NavRoutes.FORGOT_PASSWORD) {
                        ForgotPasswordScreen(
                            onBackClick = { navController.popBackStack() },
                            onResetPasswordClick = { }
                        )
                    }
                    composable(NavRoutes.HOME) {
                        val cartRepository = AppModule.getCartRepository()
                        val cartItems by cartRepository.items.collectAsState(initial = emptyList())
                        val customer by authViewModel.currentCustomer.collectAsState(initial = null)
                        val homeViewModel: HomeViewModel = viewModel()
                        HomeScreen(
                            viewModel = homeViewModel,
                            displayName = customer?.displayName ?: customer?.email,
                            cartItemCount = cartItems.sumOf { it.quantity },
                            onCategoriesClick = { navController.navigate(NavRoutes.CATEGORIES) },
                            onCategoryClick = { categoryId ->
                                navController.navigate(NavRoutes.products(categoryId))
                            },
                            onProductClick = { productId ->
                                navController.navigate(NavRoutes.productDetail(productId))
                            },
                            onCartClick = { navController.navigate(NavRoutes.CART) },
                            onLogout = {
                                authViewModel.logout()
                                navController.navigate(NavRoutes.WELCOME) {
                                    popUpTo(0) { inclusive = true }
                                }
                            }
                        )
                    }
                    composable(NavRoutes.CATEGORIES) {
                        val viewModel: CategoriesViewModel = viewModel()
                        CategoriesScreen(
                            viewModel = viewModel,
                            onBackClick = { navController.popBackStack() },
                            onCategoryClick = { id ->
                                navController.navigate(NavRoutes.products(id))
                            }
                        )
                    }
                    composable(
                        route = NavRoutes.PRODUCTS,
                        arguments = listOf(navArgument("categoryId") { type = NavType.StringType })
                    ) {
                        val viewModel: ProductsViewModel = viewModel()
                        ProductsScreen(
                            viewModel = viewModel,
                            onBackClick = { navController.popBackStack() },
                            onProductClick = { id ->
                                navController.navigate(NavRoutes.productDetail(id))
                            }
                        )
                    }
                    composable(
                        route = NavRoutes.PRODUCT_DETAIL,
                        arguments = listOf(navArgument("productId") { type = NavType.StringType })
                    ) {
                        val viewModel: ProductDetailViewModel = viewModel()
                        ProductDetailScreen(
                            viewModel = viewModel,
                            onBackClick = { navController.popBackStack() },
                            onCartClick = {
                                navController.navigate(NavRoutes.CART) {
                                    popUpTo(NavRoutes.HOME) { inclusive = false }
                                }
                            }
                        )
                    }
                    composable(NavRoutes.CART) {
                        val viewModel: CartViewModel = viewModel()
                        CartScreen(
                            viewModel = viewModel,
                            onBackClick = { navController.popBackStack() },
                            onProceedToOrderSummary = { navController.navigate(NavRoutes.ORDER_SUMMARY) }
                        )
                    }
                    composable(NavRoutes.ORDER_SUMMARY) {
                        val viewModel: OrderSummaryViewModel = viewModel()
                        OrderSummaryScreen(
                            viewModel = viewModel,
                            onBackClick = { navController.popBackStack() },
                            onProceedToPayment = { navController.navigate(NavRoutes.PAYMENT) }
                        )
                    }
                    composable(NavRoutes.PAYMENT) {
                        PaymentScreen(
                            onBackClick = { navController.popBackStack() },
                            onContinueShopping = {
                                navController.navigate(NavRoutes.HOME) {
                                    popUpTo(0) { inclusive = true }
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SplashScreen(onFinished: () -> Unit, durationMillis: Long = 1500) {
    LaunchedEffect(Unit) {
        delay(durationMillis)
        onFinished()
    }

    val pulseAlpha by rememberInfiniteTransition(label = "pulse")
        .animateFloat(
            initialValue = 0.6f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(900, easing = LinearEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "pulseAlpha"
        )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        FutureBlueDark,
                        FutureBlue,
                        FutureTeal
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Surface(
                modifier = Modifier
                    .size(120.dp)
                    .alpha(pulseAlpha),
                shape = CircleShape,
                color = FutureTealLight.copy(alpha = 0.18f),
                tonalElevation = 6.dp
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Surface(
                        modifier = Modifier.size(92.dp),
                        shape = CircleShape,
                        color = Color.White.copy(alpha = 0.08f),
                        tonalElevation = 10.dp
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Rounded.ShoppingCart,
                                contentDescription = "Future cart",
                                modifier = Modifier.size(54.dp),
                                tint = Color.White
                            )
                            Icon(
                                imageVector = Icons.Rounded.FlashOn,
                                contentDescription = null,
                                modifier = Modifier
                                    .size(24.dp)
                                    .align(Alignment.TopEnd)
                                    .padding(14.dp),
                                tint = FutureAccent
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "FutureCart",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                ),
                color = Color.White
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Next-gen shopping, delivered fast.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.White.copy(alpha = 0.85f),
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun WelcomeScreen(
    onExploreClick: () -> Unit = {},
    onSignInClick: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(FutureSky, Color.White)
                )
            )
            .padding(horizontal = 24.dp, vertical = 32.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.Start
            ) {
                Surface(
                    shape = CircleShape,
                    color = FutureTeal.copy(alpha = 0.12f)
                ) {
                    Icon(
                        painter = rememberVectorPainter(image = Icons.Rounded.ShoppingCart),
                        contentDescription = null,
                        modifier = Modifier.padding(14.dp),
                        tint = FutureTeal
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "Welcome to FutureCart",
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.ExtraBold
                    ),
                    color = FutureMidnight
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Experience the future of ecommerce with fast delivery, curated picks, and a sleek shopping journey.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FutureMidnight.copy(alpha = 0.75f),
                    lineHeight = 20.sp
                )
            }

            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Button(
                    onClick = onExploreClick,
                    modifier = Modifier.fillMaxWidth(),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = FutureBlue
                    )
                ) {
                    Text(
                        text = "Explore the Future",
                        color = Color.White,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    Icon(
                        imageVector = Icons.Rounded.ArrowForward,
                        contentDescription = null,
                        tint = Color.White
                    )
                }
                Button(
                    onClick = onSignInClick,
                    modifier = Modifier.fillMaxWidth(),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = FutureTeal
                    )
                ) {
                    Text(
                        text = "Sign In & Shop",
                        color = FutureMidnight,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    Icon(
                        imageVector = Icons.Rounded.ArrowForward,
                        contentDescription = null,
                        tint = FutureMidnight
                    )
                }
            }
        }
    }
}
