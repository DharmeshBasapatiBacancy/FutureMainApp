package com.bacancy.futureecommereapp.ui.components

import androidx.compose.foundation.background
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
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.bacancy.futureecommereapp.ui.theme.FutureBlue
import com.bacancy.futureecommereapp.ui.theme.FutureMidnight

@Composable
fun ProductImagePager(
    images: List<String>,
    contentDescription: String,
    modifier: Modifier = Modifier,
    fallbackLetter: String = "?"
) {
    Surface(modifier = modifier, color = Color.White) {
        if (images.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    text = fallbackLetter,
                    style = MaterialTheme.typography.displayMedium,
                    color = FutureBlue,
                    fontWeight = FontWeight.Bold
                )
            }
            return@Surface
        }

        val pagerState = rememberPagerState(initialPage = 0, pageCount = { images.size })
        val pageLabel by remember {
            derivedStateOf { "${pagerState.currentPage + 1}/${images.size}" }
        }

        Box(Modifier.fillMaxSize()) {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxSize()
            ) { index ->
                AsyncImage(
                    model = images[index],
                    contentDescription = contentDescription,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit
                )
            }

            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(12.dp)
                    .clip(CircleShape)
                    .background(FutureMidnight.copy(alpha = 0.65f))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = pageLabel,
                    color = Color.White,
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    repeat(images.size.coerceAtMost(7)) { dotIndex ->
                        val actualIndex = when {
                            images.size <= 7 -> dotIndex
                            pagerState.currentPage <= 3 -> dotIndex
                            pagerState.currentPage >= images.size - 4 -> images.size - 7 + dotIndex
                            else -> pagerState.currentPage - 3 + dotIndex
                        }
                        val selected = actualIndex == pagerState.currentPage
                        Spacer(
                            modifier = Modifier
                                .size(if (selected) 8.dp else 6.dp)
                                .clip(CircleShape)
                                .background(
                                    if (selected) FutureBlue else FutureMidnight.copy(alpha = 0.25f)
                                )
                        )
                    }
                }
                Spacer(Modifier.height(2.dp))
            }
        }
    }
}

