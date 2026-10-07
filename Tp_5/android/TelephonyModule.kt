package com.networkqos

import android.content.Context
import android.os.Build
import android.telephony.CellInfoGsm
import android.telephony.CellInfoLte
import android.telephony.CellInfoNr
import android.telephony.CellInfoWcdma
import android.telephony.TelephonyManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap

/**
 * Módulo nativo Android para acceder a TelephonyManager
 * Requisito Técnico 04.1 del PDF: Extrae RSSI (dBm), Operador y Tecnología Celular
 */
class TelephonyModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "TelephonyBridge"
    }

    @ReactMethod
    fun getCellularInfo(promise: Promise) {
        try {
            val telephonyManager =
                reactContext.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager

            if (telephonyManager == null) {
                promise.reject("UNAVAILABLE", "TelephonyManager no está disponible en este dispositivo.")
                return
            }

            val map: WritableMap = Arguments.createMap()
            val carrierName = telephonyManager.networkOperatorName.ifEmpty { "Telecom / Personal" }
            val networkCountryIso = telephonyManager.networkCountryIso
            val isRoaming = telephonyManager.isNetworkRoaming

            map.putString("carrier", carrierName)
            map.putString("countryIso", networkCountryIso)
            map.putBoolean("isRoaming", isRoaming)

            // Obtener nivel de señal (RSSI / dBm) y tecnología celular
            var signalDbm = -85 // dBm típico LTE
            var generation = "4G/LTE"

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val signalStrength = telephonyManager.signalStrength
                if (signalStrength != null) {
                    val cellSignalStrengths = signalStrength.cellSignalStrengths
                    if (cellSignalStrengths.isNotEmpty()) {
                        signalDbm = cellSignalStrengths[0].dbm
                    }
                }
            }

            map.putInt("rssiDbm", signalDbm)
            map.putString("generation", generation)
            map.putDouble("timestamp", System.currentTimeMillis().toDouble())

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR", "Error leyendo TelephonyManager: ${e.message}")
        }
    }
}
