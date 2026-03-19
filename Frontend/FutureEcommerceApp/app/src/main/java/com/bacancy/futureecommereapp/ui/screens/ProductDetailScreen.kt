package com.bacancy.futureecommereapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Bolt
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.bacancy.futureecommereapp.ui.productdetail.ProductDetailViewModel
import com.bacancy.futureecommereapp.ui.components.ProductImagePager
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight
import com.bacancy.futureecommereapp.ui.theme.FutureSky

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    viewModel: ProductDetailViewModel,
    onBackClick: () -> Unit,
    onCartClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val density = LocalDensity.current
    val bottomInset = with(density) { WindowInsets.ime.getBottom(this).toDp() }

    LaunchedEffect(uiState.addedToCart) {
        if (uiState.addedToCart) {
            val result = snackbarHostState.showSnackbar(
                "Added to cart",
                actionLabel = "View cart",
                withDismissAction = true
            )
            viewModel.clearAddedToCart()
            if (result == SnackbarResult.ActionPerformed) {
                onCartClick()
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = uiState.product?.name ?: "Product",
                        fontWeight = FontWeight.Bold,
                        color = FutureMidnight
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back", tint = FutureMidnight)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = FutureSky)
            )
        },
        bottomBar = {
            val product = uiState.product
            if (product != null && !uiState.isLoading && uiState.error == null) {
                Surface(
                    tonalElevation = 6.dp,
                    shadowElevation = 8.dp,
                    color = Color.White
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 12.dp)
                            .padding(bottom = bottomInset),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Button(
                            onClick = {
                                viewModel.addToCart(1)
                                viewModel.clearAddedToCart()
                                onCartClick()
                            },
                            modifier = Modifier.weight(1f),
                        ) {
                            Icon(Icons.Rounded.Bolt, contentDescription = null)
                            Spacer(Modifier.padding(4.dp))
                            Text("Buy now", fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.padding(6.dp))
                        Button(
                            onClick = { viewModel.addToCart(1) },
                            modifier = Modifier.weight(1f),
                        ) {
                            Icon(Icons.Rounded.ShoppingCart, contentDescription = null)
                            Spacer(Modifier.padding(4.dp))
                            Text("Add to cart", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        },
        containerColor = FutureSky,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = FutureBlue)
            }
        } else if (uiState.error != null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text(uiState.error!!, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
            }
        } else {
            val product = uiState.product ?: return@Scaffold
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
            ) {
                val images = buildList {
                    product.primary_image_url?.takeIf { it.isNotBlank() }?.let { add(it) }
                    product.images.orEmpty()
                        .filter { it.isNotBlank() }
                        .forEach { add(it) }
                }.distinct()

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 280.dp)
                        .background(Color.White)
                ) {
                    ProductImagePager(
                        images = images,
                        contentDescription = product.name ?: "Product image",
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(320.dp),
                        fallbackLetter = (product.name?.firstOrNull()?.uppercase() ?: "?").toString()
                    )
                }

                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = product.name ?: "",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = FutureMidnight
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "$${String.format("%.2f", product.price ?: 0.0)}",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = FutureBlue
                        )
                        Spacer(Modifier.weight(1f))
                        val stock = product.stock ?: 0
                        val stockLabel = if (stock > 0) "In stock" else "Out of stock"
                        val stockColor = if (stock > 0) FutureMidnight else MaterialTheme.colorScheme.error
                        Text(
                            text = stockLabel,
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold,
                            color = stockColor
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    DetailSectionCard(
                        title = "Overview",
                        body = product.short_description
                            ?.takeIf { it.isNotBlank() }
                            ?: "No short description available."
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    DetailSectionCard(
                        title = "Description",
                        body = product.description
                            ?.takeIf { it.isNotBlank() }
                            ?: "No detailed description available."
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    DetailKeyValueCard(
                        title = "Details",
                        items = listOfNotNull(
                            product.stock?.let { "Stock" to it.toString() },
                            product.slug?.takeIf { it.isNotBlank() }?.let { "SKU" to it },
                            product.category_id?.takeIf { it.isNotBlank() }?.let { "Category" to it }
                        ).ifEmpty { listOf("Info" to "No additional details available.") }
                    )

                    Spacer(modifier = Modifier.height(88.dp))
                }
            }
        }
    }
}

@Composable
private fun DetailSectionCard(
    title: String,
    body: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(Modifier.padding(14.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = FutureMidnight
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = body,
                style = MaterialTheme.typography.bodyMedium,
                color = FutureMidnight.copy(alpha = 0.82f)
            )
        }
    }
}

@Composable
private fun DetailKeyValueCard(
    title: String,
    items: List<Pair<String, String>>,
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(14.dp)
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(Modifier.padding(contentPadding)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = FutureMidnight
            )
            Spacer(Modifier.height(10.dp))
            items.forEachIndexed { index, (k, v) ->
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = k,
                        style = MaterialTheme.typography.bodyMedium,
                        color = FutureMidnight.copy(alpha = 0.72f),
                        modifier = Modifier.weight(1f)
                    )
                    Text(
                        text = v,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = FutureMidnight,
                        textAlign = TextAlign.End
                    )
                }
                if (index != items.lastIndex) {
                    Spacer(Modifier.height(10.dp))
                    Divider(color = FutureMidnight.copy(alpha = 0.08f))
                    Spacer(Modifier.height(10.dp))
                }
            }
        }
    }
}
