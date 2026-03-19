package com.bacancy.futureecommereapp.navigation

object NavRoutes {
    const val SPLASH = "splash"
    const val WELCOME = "welcome"
    const val SIGN_IN = "sign_in"
    const val SIGN_UP = "sign_up"
    const val FORGOT_PASSWORD = "forgot_password"
    const val HOME = "home"
    const val CATEGORIES = "categories"
    const val PRODUCTS = "products/{categoryId}"
    const val PRODUCT_DETAIL = "product/{productId}"
    const val CART = "cart"
    const val ORDER_SUMMARY = "order_summary"
    const val PAYMENT = "payment"

    fun products(categoryId: String) = "products/$categoryId"
    fun productDetail(productId: String) = "product/$productId"
}
