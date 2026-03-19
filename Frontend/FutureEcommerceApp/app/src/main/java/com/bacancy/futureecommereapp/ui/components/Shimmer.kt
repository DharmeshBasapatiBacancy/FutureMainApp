package com.bacancy.futureecommereapp.ui.components

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
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

private val DefaultShimmerBase = Color(0xFFE9EEF5)
private val DefaultShimmerHighlight = Color(0xFFF8FAFD)

fun Modifier.shimmer(
    baseColor: Color = DefaultShimmerBase,
    highlightColor: Color = DefaultShimmerHighlight,
    durationMs: Int = 1100,
    tilt: Float = 20f,
): Modifier = composed {
    val transition = rememberInfiniteTransition(label = "shimmer")
    val progress by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = durationMs, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "shimmerProgress"
    )

    val dx = 800f
    val startX = -dx + (dx * 2f) * progress
    val start = Offset(startX, 0f)
    val end = Offset(startX + dx, dx * kotlin.math.tan(Math.toRadians(tilt.toDouble())).toFloat())

    background(
        brush = Brush.linearGradient(
            colors = listOf(baseColor, highlightColor, baseColor),
            start = start,
            end = end
        )
    )
}

@Composable
fun ShimmerBlock(
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 16.dp,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(cornerRadius))
            .shimmer()
    )
}

@Composable
fun ShimmerTextLine(
    modifier: Modifier = Modifier,
    widthFraction: Float,
    height: Dp = 14.dp,
    cornerRadius: Dp = 999.dp,
) {
    ShimmerBlock(
        modifier = modifier
            .fillMaxWidth(widthFraction)
            .height(height),
        cornerRadius = cornerRadius
    )
}

@Composable
fun HomeLoadingShimmer(
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)) {
                ShimmerTextLine(widthFraction = 0.45f, height = 20.dp, cornerRadius = 999.dp)
                Spacer(Modifier.height(10.dp))
                ShimmerTextLine(widthFraction = 0.6f, height = 14.dp, cornerRadius = 999.dp)
            }
        }

        item {
            ShimmerBlock(
                modifier = Modifier
                    .padding(horizontal = 16.dp)
                    .fillMaxWidth()
                    .height(190.dp),
                cornerRadius = 20.dp
            )
        }

        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                ShimmerTextLine(widthFraction = 0.35f, height = 18.dp)
                Spacer(Modifier.height(12.dp))
            }
        }

        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items((1..8).toList()) {
                    ShimmerBlock(
                        modifier = Modifier
                            .height(44.dp)
                            .width(120.dp),
                        cornerRadius = 999.dp
                    )
                }
            }
        }

        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Spacer(Modifier.height(6.dp))
                ShimmerTextLine(widthFraction = 0.40f, height = 18.dp)
                Spacer(Modifier.height(12.dp))
            }
        }

        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items((1..6).toList()) {
                    ShimmerProductCardHorizontal()
                }
            }
        }
    }
}

@Composable
private fun ShimmerProductCardHorizontal() {
    Column(
        modifier = Modifier
            .size(width = 160.dp, height = 212.dp)
    ) {
        ShimmerBlock(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1.05f),
            cornerRadius = 18.dp
        )
        Spacer(Modifier.height(10.dp))
        ShimmerTextLine(widthFraction = 0.9f, height = 14.dp)
        Spacer(Modifier.height(8.dp))
        ShimmerTextLine(widthFraction = 0.55f, height = 16.dp)
    }
}

@Composable
fun CategoryGridLoadingShimmer(
    modifier: Modifier = Modifier,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = modifier.fillMaxSize()
    ) {
        items((1..8).toList()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(0.9f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(0.dp)
            ) {
                ShimmerBlock(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1.2f),
                    cornerRadius = 16.dp
                )
                Spacer(Modifier.height(10.dp))
                Column(modifier = Modifier.padding(horizontal = 12.dp)) {
                    ShimmerTextLine(widthFraction = 0.7f, height = 16.dp)
                    Spacer(Modifier.height(8.dp))
                    ShimmerTextLine(widthFraction = 0.45f, height = 12.dp)
                }
            }
        }
    }
}

@Composable
fun ProductGridLoadingShimmer(
    modifier: Modifier = Modifier,
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = modifier.fillMaxSize()
    ) {
        items((1..10).toList()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(0.72f)
            ) {
                ShimmerBlock(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1f),
                    cornerRadius = 16.dp
                )
                Spacer(Modifier.height(10.dp))
                ShimmerTextLine(modifier = Modifier.padding(horizontal = 8.dp), widthFraction = 0.9f, height = 14.dp)
                Spacer(Modifier.height(8.dp))
                ShimmerTextLine(modifier = Modifier.padding(horizontal = 8.dp), widthFraction = 0.6f, height = 16.dp)
            }
        }
    }
}

@Composable
fun ProductDetailLoadingShimmer(
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        ShimmerBlock(
            modifier = Modifier
                .fillMaxWidth()
                .height(280.dp),
            cornerRadius = 18.dp
        )
        Spacer(Modifier.height(16.dp))
        ShimmerTextLine(widthFraction = 0.75f, height = 22.dp)
        Spacer(Modifier.height(12.dp))
        ShimmerTextLine(widthFraction = 0.35f, height = 26.dp)
        Spacer(Modifier.height(14.dp))
        ShimmerTextLine(widthFraction = 1.0f, height = 14.dp)
        Spacer(Modifier.height(8.dp))
        ShimmerTextLine(widthFraction = 0.95f, height = 14.dp)
        Spacer(Modifier.height(8.dp))
        ShimmerTextLine(widthFraction = 0.65f, height = 14.dp)
        Spacer(Modifier.weight(1f))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            ShimmerBlock(modifier = Modifier.height(52.dp).weight(1f), cornerRadius = 16.dp)
        }
    }
}

