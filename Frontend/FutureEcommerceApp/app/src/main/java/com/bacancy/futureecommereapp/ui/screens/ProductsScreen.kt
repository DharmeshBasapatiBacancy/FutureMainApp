package com.bacancy.futureecommereapp.ui.screens

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.FilterList
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TextButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.bacancy.futureecommereapp.data.remote.ProductDto
import com.bacancy.futureecommereapp.ui.products.ProductsViewModel
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight
import com.bacancy.futureecommereapp.ui.theme.FutureSky
import kotlin.math.max
import kotlin.math.min

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductsScreen(
    viewModel: ProductsViewModel,
    onBackClick: () -> Unit,
    onProductClick: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var isFilterSheetOpen by remember { mutableStateOf(false) }

    var sortOption by remember { mutableStateOf(ProductSort.Relevance) }
    var inStockOnly by remember { mutableStateOf(false) }
    var minPriceText by remember { mutableStateOf("") }
    var maxPriceText by remember { mutableStateOf("") }

    val filteredProducts = remember(
        uiState.products,
        searchQuery,
        sortOption,
        inStockOnly,
        minPriceText,
        maxPriceText
    ) {
        val query = searchQuery.trim().lowercase()

        val minPrice = minPriceText.toDoubleOrNull()
        val maxPrice = maxPriceText.toDoubleOrNull()
        val normalizedMin = minPrice
        val normalizedMax = maxPrice

        uiState.products
            .asSequence()
            .filter { product ->
                if (query.isBlank()) true
                else {
                    val name = product.name.orEmpty().lowercase()
                    name.contains(query)
                }
            }
            .filter { product ->
                if (!inStockOnly) true else (product.stock ?: 0) > 0
            }
            .filter { product ->
                val price = product.price
                val passesMin = normalizedMin?.let { minP -> (price ?: 0.0) >= minP } ?: true
                val passesMax = normalizedMax?.let { maxP -> (price ?: 0.0) <= maxP } ?: true
                passesMin && passesMax
            }
            .toList()
            .let { list ->
                when (sortOption) {
                    ProductSort.Relevance -> list
                    ProductSort.PriceLowHigh -> list.sortedBy { it.price ?: Double.MAX_VALUE }
                    ProductSort.PriceHighLow -> list.sortedByDescending { it.price ?: Double.MIN_VALUE }
                    ProductSort.NameAZ -> list.sortedBy { it.name.orEmpty().lowercase() }
                }
            }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Products", fontWeight = FontWeight.Bold, color = FutureMidnight) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back", tint = FutureMidnight)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = FutureSky)
            )
        },
        containerColor = FutureSky
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            ProductsSearchRow(
                query = searchQuery,
                onQueryChange = { searchQuery = it },
                onOpenFilters = { isFilterSheetOpen = true }
            )

            when {
                uiState.isLoading -> {
                    ShimmerProductsGrid()
                }

                uiState.error != null -> {
                    Box(
                        Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                uiState.error!!,
                                color = MaterialTheme.colorScheme.error,
                                textAlign = TextAlign.Center
                            )
                            Spacer(Modifier.height(12.dp))
                            Button(onClick = { viewModel.loadProducts() }) {
                                Text("Retry")
                            }
                        }
                    }
                }

                filteredProducts.isEmpty() -> {
                    Box(
                        Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (searchQuery.isBlank() && !inStockOnly && minPriceText.isBlank() && maxPriceText.isBlank() && sortOption == ProductSort.Relevance) {
                                "No products yet"
                            } else {
                                "No matches for your filters"
                            },
                            color = FutureMidnight.copy(alpha = 0.7f),
                            textAlign = TextAlign.Center
                        )
                    }
                }

                else -> {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(filteredProducts, key = { it.id ?: it.name ?: "" }) { product ->
                            ProductCard(
                                product = product,
                                onClick = { product.id?.let { onProductClick(it) } }
                            )
                        }
                    }
                }
            }
        }

        if (isFilterSheetOpen) {
            ModalBottomSheet(
                onDismissRequest = { isFilterSheetOpen = false },
                containerColor = Color.White
            ) {
                ProductsFilterSheetContent(
                    sortOption = sortOption,
                    onSortChange = { sortOption = it },
                    inStockOnly = inStockOnly,
                    onInStockOnlyChange = { inStockOnly = it },
                    minPriceText = minPriceText,
                    onMinPriceTextChange = { minPriceText = it },
                    maxPriceText = maxPriceText,
                    onMaxPriceTextChange = { maxPriceText = it },
                    onClear = {
                        sortOption = ProductSort.Relevance
                        inStockOnly = false
                        minPriceText = ""
                        maxPriceText = ""
                    },
                    onClose = { isFilterSheetOpen = false }
                )
            }
        }
    }
}

private enum class ProductSort(val label: String) {
    Relevance("Relevance"),
    PriceLowHigh("Price: low → high"),
    PriceHighLow("Price: high → low"),
    NameAZ("Name: A → Z")
}

@Composable
private fun ProductsSearchRow(
    query: String,
    onQueryChange: (String) -> Unit,
    onOpenFilters: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            modifier = Modifier.weight(1f),
            singleLine = true,
            leadingIcon = {
                Icon(Icons.Rounded.Search, contentDescription = "Search", tint = FutureMidnight.copy(alpha = 0.7f))
            },
            trailingIcon = {
                if (query.isNotBlank()) {
                    IconButton(onClick = { onQueryChange("") }) {
                        Icon(Icons.Rounded.Close, contentDescription = "Clear search", tint = FutureMidnight)
                    }
                }
            },
            placeholder = {
                Text("Search products", color = FutureMidnight.copy(alpha = 0.6f))
            },
            shape = RoundedCornerShape(14.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = FutureBlue,
                unfocusedBorderColor = FutureMidnight.copy(alpha = 0.18f),
                focusedContainerColor = Color.White,
                unfocusedContainerColor = Color.White,
                cursorColor = FutureBlue
            )
        )

        IconButton(
            onClick = onOpenFilters,
            modifier = Modifier
                .clip(RoundedCornerShape(14.dp))
                .background(Color.White)
        ) {
            Icon(Icons.Rounded.FilterList, contentDescription = "Filters", tint = FutureMidnight)
        }
    }
}

@Composable
private fun ProductsFilterSheetContent(
    sortOption: ProductSort,
    onSortChange: (ProductSort) -> Unit,
    inStockOnly: Boolean,
    onInStockOnlyChange: (Boolean) -> Unit,
    minPriceText: String,
    onMinPriceTextChange: (String) -> Unit,
    maxPriceText: String,
    onMaxPriceTextChange: (String) -> Unit,
    onClear: () -> Unit,
    onClose: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(bottom = 24.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Filters",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = FutureMidnight,
                modifier = Modifier.weight(1f)
            )
            TextButton(onClick = onClear) { Text("Clear") }
            IconButton(onClick = onClose) {
                Icon(Icons.Rounded.Close, contentDescription = "Close")
            }
        }

        Spacer(Modifier.height(6.dp))
        Text(
            text = "Sort by",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = FutureMidnight
        )
        Spacer(Modifier.height(6.dp))

        ProductSort.entries.forEach { option ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onSortChange(option) }
                    .padding(vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                RadioButton(selected = sortOption == option, onClick = { onSortChange(option) })
                Text(
                    text = option.label,
                    color = FutureMidnight,
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(start = 8.dp)
                )
            }
        }

        Spacer(Modifier.height(14.dp))
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onInStockOnlyChange(!inStockOnly) }
                .padding(vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            androidx.compose.material3.Checkbox(
                checked = inStockOnly,
                onCheckedChange = onInStockOnlyChange
            )
            Text(
                text = "In stock only",
                color = FutureMidnight,
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(start = 8.dp)
            )
        }

        Spacer(Modifier.height(14.dp))
        Text(
            text = "Price range",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = FutureMidnight
        )
        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedTextField(
                value = minPriceText,
                onValueChange = { text -> onMinPriceTextChange(text.filter { it.isDigit() || it == '.' }) },
                modifier = Modifier.weight(1f),
                singleLine = true,
                placeholder = { Text("Min") },
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = FutureBlue,
                    unfocusedBorderColor = FutureMidnight.copy(alpha = 0.18f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    cursorColor = FutureBlue
                )
            )
            OutlinedTextField(
                value = maxPriceText,
                onValueChange = { text -> onMaxPriceTextChange(text.filter { it.isDigit() || it == '.' }) },
                modifier = Modifier.weight(1f),
                singleLine = true,
                placeholder = { Text("Max") },
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = FutureBlue,
                    unfocusedBorderColor = FutureMidnight.copy(alpha = 0.18f),
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    cursorColor = FutureBlue
                )
            )
        }

        Spacer(Modifier.height(18.dp))
    }
}

@Composable
private fun ShimmerProductsGrid() {
    val shimmerBrush = rememberShimmerBrush()
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.fillMaxSize()
    ) {
        items(10) {
            ShimmerProductCard(brush = shimmerBrush)
        }
    }
}

@Composable
private fun ShimmerProductCard(brush: Brush) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.72f),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(0.dp))
                    .background(brush)
            )
            Spacer(Modifier.height(10.dp))
            Box(
                modifier = Modifier
                    .padding(horizontal = 10.dp)
                    .fillMaxWidth()
                    .height(14.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(brush)
            )
            Spacer(Modifier.height(8.dp))
            Box(
                modifier = Modifier
                    .padding(horizontal = 10.dp)
                    .fillMaxWidth(fraction = 0.55f)
                    .height(16.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(brush)
            )
        }
    }
}

@Composable
private fun rememberShimmerBrush(): Brush {
    val shimmerColors = listOf(
        Color(0xFFE9EEF7),
        Color(0xFFF6F8FC),
        Color(0xFFE9EEF7)
    )
    val transition = rememberInfiniteTransition(label = "shimmer")
    val translate by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1200f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1100),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerTranslate"
    )
    return Brush.linearGradient(
        colors = shimmerColors,
        start = androidx.compose.ui.geometry.Offset(translate - 1200f, translate - 1200f),
        end = androidx.compose.ui.geometry.Offset(translate, translate)
    )
}

@Composable
private fun ProductCard(
    product: ProductDto,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.72f)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .background(Color.White)
            ) {
                val imageUrl = product.primary_image_url ?: product.images?.firstOrNull()
                if (!imageUrl.isNullOrBlank()) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = product.name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Text(
                        text = (product.name?.firstOrNull()?.uppercase() ?: "?").toString(),
                        style = MaterialTheme.typography.headlineMedium,
                        color = FutureBlue,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
            Text(
                text = product.name ?: "",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = FutureMidnight,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
            Text(
                text = "$${String.format("%.2f", product.price ?: 0.0)}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = FutureBlue,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}
