package com.bacancy.futureecommereapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.FilterList
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.bacancy.futureecommereapp.data.remote.CategoryDto
import com.bacancy.futureecommereapp.ui.categories.CategorySort
import com.bacancy.futureecommereapp.ui.categories.CategoriesViewModel
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight
import com.bacancy.futureecommereapp.ui.theme.FutureSky

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoriesScreen(
    viewModel: CategoriesViewModel,
    onBackClick: () -> Unit,
    onCategoryClick: (String) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var filtersExpanded by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Categories", fontWeight = FontWeight.Bold, color = FutureMidnight) },
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
        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = FutureBlue)
            }
        } else if (uiState.error != null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text(uiState.error!!, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = uiState.query,
                        onValueChange = viewModel::updateQuery,
                        modifier = Modifier.weight(1f),
                        singleLine = true,
                        leadingIcon = {
                            Icon(Icons.Rounded.Search, contentDescription = "Search")
                        },
                        placeholder = { Text("Search categories") }
                    )
                    Box {
                        IconButton(onClick = { filtersExpanded = true }) {
                            Icon(Icons.Rounded.FilterList, contentDescription = "Sort & filters", tint = FutureMidnight)
                        }
                        DropdownMenu(
                            expanded = filtersExpanded,
                            onDismissRequest = { filtersExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Sort: Name A–Z") },
                                onClick = {
                                    viewModel.updateSort(CategorySort.NAME_ASC)
                                    filtersExpanded = false
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Sort: Name Z–A") },
                                onClick = {
                                    viewModel.updateSort(CategorySort.NAME_DESC)
                                    filtersExpanded = false
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Sort: Product count") },
                                onClick = {
                                    viewModel.updateSort(CategorySort.PRODUCT_COUNT_DESC)
                                    filtersExpanded = false
                                }
                            )
                            DropdownMenuItem(
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Checkbox(
                                            checked = uiState.hasImageOnly,
                                            onCheckedChange = null
                                        )
                                        Text("Has image only")
                                    }
                                },
                                onClick = { viewModel.updateHasImageOnly(!uiState.hasImageOnly) }
                            )
                            DropdownMenuItem(
                                text = { Text("Min products: Any") },
                                onClick = { viewModel.updateMinProductCount(0) }
                            )
                            DropdownMenuItem(
                                text = { Text("Min products: 1+") },
                                onClick = { viewModel.updateMinProductCount(1) }
                            )
                            DropdownMenuItem(
                                text = { Text("Min products: 5+") },
                                onClick = { viewModel.updateMinProductCount(5) }
                            )
                            DropdownMenuItem(
                                text = { Text("Min products: 10+") },
                                onClick = { viewModel.updateMinProductCount(10) }
                            )
                        }
                    }
                }

                if (uiState.visibleCategories.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(top = 24.dp),
                        contentAlignment = Alignment.TopCenter
                    ) {
                        Text(
                            text = "No categories found",
                            style = MaterialTheme.typography.bodyLarge,
                            color = FutureMidnight.copy(alpha = 0.7f),
                            textAlign = TextAlign.Center
                        )
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(top = 16.dp, bottom = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(uiState.visibleCategories) { category ->
                            CategoryCard(
                                category = category,
                                onClick = { category.id?.let { onCategoryClick(it) } }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CategoryCard(
    category: CategoryDto,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.9f)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1.2f)
                    .background(Color.White)
            ) {
                val imageUrl = category.image_url
                if (!imageUrl.isNullOrBlank()) {
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = category.name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Text(
                        text = (category.name?.firstOrNull()?.uppercase() ?: "?").toString(),
                        style = MaterialTheme.typography.headlineMedium,
                        color = FutureBlue,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
            Text(
                text = category.name ?: "",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = FutureMidnight,
                modifier = Modifier.padding(12.dp)
            )
            category.productCount?.let { count ->
                Text(
                    text = "$count products",
                    style = MaterialTheme.typography.bodySmall,
                    color = FutureMidnight.copy(alpha = 0.7f),
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                )
            }
        }
    }
}
