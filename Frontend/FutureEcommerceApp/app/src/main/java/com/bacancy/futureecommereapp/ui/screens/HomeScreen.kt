package com.bacancy.futureecommereapp.ui.screens

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.bacancy.futureecommereapp.data.remote.CategoryDto
import com.bacancy.futureecommereapp.data.remote.ProductDto
import com.bacancy.futureecommereapp.ui.home.HomeViewModel
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight
import com.bacancy.futureecommereapp.ui.theme.FutureSky
import com.bacancy.futureecommereapp.ui.theme.FutureTeal

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    displayName: String?,
    cartItemCount: Int,
    onCategoriesClick: () -> Unit,
    onCategoryClick: (String) -> Unit,
    onProductClick: (String) -> Unit,
    onCartClick: () -> Unit,
    onLogout: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "FutureCart",
                        fontWeight = FontWeight.Bold,
                        color = FutureMidnight
                    )
                },
                actions = {
                    IconButton(onClick = onCartClick) {
                        Box {
                            Icon(
                                Icons.Rounded.ShoppingCart,
                                contentDescription = "Cart",
                                tint = FutureMidnight
                            )
                            if (cartItemCount > 0) {
                                Badge(
                                    modifier = Modifier.align(Alignment.TopEnd)
                                ) {
                                    Text("$cartItemCount")
                                }
                            }
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = FutureSky)
            )
        },
        containerColor = FutureSky
    ) { padding ->
        val gradient = Brush.verticalGradient(colors = listOf(FutureSky, Color.White))

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(gradient)
                .padding(padding)
        ) {
            when {
                uiState.isLoading -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = FutureBlue)
                    }
                }

                uiState.error != null && uiState.categories.isEmpty() && uiState.products.isEmpty() -> {
                    Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = uiState.error ?: "Something went wrong",
                                color = MaterialTheme.colorScheme.error
                            )
                            Spacer(Modifier.height(12.dp))
                            Button(onClick = { viewModel.loadHome() }) {
                                Text("Retry")
                            }
                        }
                    }
                }

                else -> {
                    HomeContent(
                        displayName = displayName,
                        categories = uiState.categories,
                        products = uiState.products,
                        onCategoriesClick = onCategoriesClick,
                        onCategoryClick = onCategoryClick,
                        onProductClick = onProductClick,
                        onLogout = onLogout
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun HomeContent(
    displayName: String?,
    categories: List<CategoryDto>,
    products: List<ProductDto>,
    onCategoriesClick: () -> Unit,
    onCategoryClick: (String) -> Unit,
    onProductClick: (String) -> Unit,
    onLogout: () -> Unit
) {
    val banners = products
        .filter { !(it.primary_image_url ?: it.images?.firstOrNull()).isNullOrBlank() && !it.id.isNullOrBlank() }
        .take(5)

    val bestSellers = products
        .filter { !it.id.isNullOrBlank() }
        .sortedWith(
            compareByDescending<ProductDto> { (it.stock ?: 0) > 0 }
                .thenByDescending { it.price ?: 0.0 }
        )
        .take(12)

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
                Text(
                    text = "Hi${displayName?.let { ", $it" } ?: ""}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold,
                    color = FutureMidnight
                )
                Text(
                    text = "Find your next favorite pick",
                    style = MaterialTheme.typography.bodyMedium,
                    color = FutureMidnight.copy(alpha = 0.7f)
                )
            }
        }

        if (banners.isNotEmpty()) {
            item {
                BannerCarousel(
                    banners = banners,
                    onBannerClick = { id -> onProductClick(id) }
                )
            }
        }

        item {
            SectionHeader(
                title = "Categories",
                actionLabel = "See all",
                onAction = onCategoriesClick
            )
        }

        item {
            if (categories.isEmpty()) {
                EmptyRowHint(text = "No categories yet")
            } else {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(categories, key = { it.id ?: it.name ?: "" }) { category ->
                        CategoryPill(
                            category = category,
                            onClick = { category.id?.let(onCategoryClick) }
                        )
                    }
                }
            }
        }

        item {
            SectionHeader(
                title = "Best sellers",
                actionLabel = null,
                onAction = null
            )
        }

        item {
            if (bestSellers.isEmpty()) {
                EmptyRowHint(text = "No products yet")
            } else {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(bestSellers, key = { it.id ?: it.name ?: "" }) { product ->
                        BestSellerCard(
                            product = product,
                            onClick = { product.id?.let(onProductClick) }
                        )
                    }
                }
            }
        }

        item {
            Spacer(Modifier.height(16.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = onCategoriesClick,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text("Browse categories")
                    Icon(
                        imageVector = Icons.Rounded.ChevronRight,
                        contentDescription = null,
                        modifier = Modifier.padding(start = 6.dp)
                    )
                }
                Button(
                    onClick = onLogout,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = FutureTeal)
                ) {
                    Text("Sign out", color = FutureMidnight, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun BannerCarousel(
    banners: List<ProductDto>,
    onBannerClick: (String) -> Unit
) {
    val pagerState = rememberPagerState(pageCount = { banners.size })
    HorizontalPager(
        state = pagerState,
        contentPadding = PaddingValues(horizontal = 16.dp),
        pageSpacing = 12.dp,
        modifier = Modifier
            .fillMaxWidth()
            .height(190.dp)
    ) { page ->
        val product = banners[page]
        val imageUrl = product.primary_image_url ?: product.images?.firstOrNull()
        val id = product.id ?: return@HorizontalPager

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onBannerClick(id) },
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Box(Modifier.fillMaxSize()) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.65f))
                            )
                        )
                )
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(14.dp)
                ) {
                    Text(
                        text = product.name ?: "Product",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    val price = product.price ?: 0.0
                    Surface(
                        color = Color.White.copy(alpha = 0.18f),
                        shape = RoundedCornerShape(999.dp)
                    ) {
                        Text(
                            text = "$${String.format("%.2f", price)}",
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            style = MaterialTheme.typography.labelLarge,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(
    title: String,
    actionLabel: String?,
    onAction: (() -> Unit)?
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = FutureMidnight,
            modifier = Modifier.weight(1f)
        )
        if (!actionLabel.isNullOrBlank() && onAction != null) {
            Text(
                text = actionLabel,
                style = MaterialTheme.typography.labelLarge,
                color = FutureBlue,
                modifier = Modifier
                    .clickable(onClick = onAction)
                    .padding(8.dp)
            )
        }
    }
}

@Composable
private fun CategoryPill(
    category: CategoryDto,
    onClick: () -> Unit
) {
    val name = category.name ?: "Category"
    Surface(
        modifier = Modifier
            .clickable(onClick = onClick),
        color = Color.White,
        shape = RoundedCornerShape(999.dp),
        tonalElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            val imageUrl = category.image_url
            if (!imageUrl.isNullOrBlank()) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = name,
                    modifier = Modifier.size(28.dp),
                    contentScale = ContentScale.Crop
                )
            } else {
                Surface(
                    color = FutureBlue.copy(alpha = 0.14f),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(
                        text = name.firstOrNull()?.uppercase() ?: "?",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        color = FutureBlue,
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Text(
                text = name,
                style = MaterialTheme.typography.titleSmall,
                color = FutureMidnight,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun BestSellerCard(
    product: ProductDto,
    onClick: () -> Unit
) {
    val imageUrl = product.primary_image_url ?: product.images?.firstOrNull()
    val name = product.name ?: "Product"
    Card(
        modifier = Modifier
            .size(width = 160.dp, height = 212.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(Modifier.fillMaxSize()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.05f)
                    .background(Color.White)
            ) {
                if (!imageUrl.isNullOrBlank()) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Text(
                        text = name.firstOrNull()?.uppercase() ?: "?",
                        style = MaterialTheme.typography.headlineMedium,
                        color = FutureBlue,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
            Text(
                text = name,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = FutureMidnight,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(Modifier.weight(1f))
            Text(
                text = "$${String.format("%.2f", product.price ?: 0.0)}",
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 10.dp),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = FutureBlue
            )
        }
    }
}

@Composable
private fun EmptyRowHint(text: String) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        color = Color.White.copy(alpha = 0.6f)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(16.dp),
            color = FutureMidnight.copy(alpha = 0.7f),
            style = MaterialTheme.typography.bodyMedium
        )
    }
}
