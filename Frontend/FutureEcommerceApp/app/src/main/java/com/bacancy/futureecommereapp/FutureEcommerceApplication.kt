package com.bacancy.futureecommereapp

import android.app.Application
import com.bacancy.futureecommereapp.di.AppModule

class FutureEcommerceApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AppModule.init(this)
    }
}
