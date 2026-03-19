package com.bacancy.futureecommereapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.bacancy.futureecommereapp.data.repository.CartItem
import com.bacancy.futureecommereapp.ui.ordersummary.OrderSummaryViewModel
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight
import com.bacancy.futureecommereapp.ui.theme.FutureSky

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderSummaryScreen(
    viewModel: OrderSummaryViewModel,
    onBackClick: () -> Unit,
    onProceedToPayment: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val items by viewModel.items.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Order summary", fontWeight = FontWeight.Bold, color = FutureMidnight) },
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
        if (items.isEmpty() && !uiState.orderCreated) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No items in cart", color = FutureMidnight.copy(alpha = 0.7f))
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp)
                ) {
                    items(items) { item ->
                        OrderSummaryItemRow(item = item)
                    }
                }
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp)
                ) {
                    SummaryLine("Subtotal", viewModel.subtotal)
                    SummaryLine("Shipping", viewModel.shippingCost)
                    SummaryLine("Tax (8%)", viewModel.taxAmount)
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Total", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = FutureMidnight)
                        Text(
                            "$${String.format("%.2f", viewModel.total)}",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = FutureBlue
                        )
                    }
                    if (uiState.error != null) {
                        Text(
                            text = uiState.error!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }
                    Button(
                        onClick = {
                            viewModel.createOrder(onSuccess = onProceedToPayment)
                        },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        enabled = !uiState.isLoading,
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = FutureBlue)
                    ) {
                        if (uiState.isLoading) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color.White, strokeWidth = 2.dp)
                        } else {
                            Text("Proceed to payment", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SummaryLine(label: String, value: Double) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = FutureMidnight)
        Text("$${String.format("%.2f", value)}", style = MaterialTheme.typography.bodyMedium, color = FutureMidnight)
    }
}

@Composable
private fun OrderSummaryItemRow(item: CartItem) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(modifier = Modifier.size(56.dp).background(Color.White)) {
                val url = item.imageUrl
                if (!url.isNullOrBlank()) {
                    AsyncImage(model = url, contentDescription = null, modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                } else {
                    Text(
                        text = (item.name.firstOrNull()?.uppercase() ?: "?").toString(),
                        style = MaterialTheme.typography.titleMedium,
                        color = FutureBlue,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
            Column(modifier = Modifier.weight(1f).padding(horizontal = 12.dp)) {
                Text(item.name, style = MaterialTheme.typography.titleSmall, color = FutureMidnight, maxLines = 1)
                Text("Qty: ${item.quantity} × $${String.format("%.2f", item.price)}", style = MaterialTheme.typography.bodySmall, color = FutureMidnight.copy(alpha = 0.8f))
            }
            Text("$${String.format("%.2f", item.lineTotal)}", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, color = FutureBlue)
        }
    }
}
