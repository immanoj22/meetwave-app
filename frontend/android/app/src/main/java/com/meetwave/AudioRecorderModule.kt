package com.meetwave

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.media.MediaRecorder
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import java.io.File
import java.util.*

class AudioRecorderModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    private var recorder: MediaRecorder? = null
    private var filePath: String? = null

    override fun getName(): String = "AudioRecorder"

    // =========================
    // Start Recording
    // =========================
    @ReactMethod
    fun start(promise: Promise) {
        // Permission check
        if (!hasAudioPermission()) {
            requestAudioPermission(promise)
            return
        }

        try {
            cleanUp()

            val audioDir = File(
            reactContext.getExternalFilesDir(null),
            "recordings"
        )
        
        // Create directory if it doesn't exist
        if (!audioDir.exists()) {
            audioDir.mkdirs()
        }
        
        val file = File(
            audioDir,
            "rec-${UUID.randomUUID()}.m4a"
        )
        filePath = file.absolutePath

        recorder = MediaRecorder().apply {
            setAudioSource(MediaRecorder.AudioSource.MIC)
            setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            setAudioSamplingRate(44100)
            setAudioEncodingBitRate(128000)
            setOutputFile(filePath)
            prepare()
            start()
        }

        promise.resolve(filePath)
        
        } catch (e: Exception) {
            promise.reject("START_FAILED", e.message)
        }
    }

    // =========================
    // Stop Recording
    // =========================
    @ReactMethod
    fun stop(promise: Promise) {
        try {
            recorder?.apply {
                stop()
                reset()
                release()
            }

            recorder = null

            val path = filePath
            filePath = null

            promise.resolve(path)

        } catch (e: Exception) {
            promise.reject("STOP_FAILED", e.message)
        }
    }

    // =========================
    // Remove Record Back Listener (API parity)
    // =========================
    @ReactMethod
    fun removeRecordBackListener() {
        // No-op on Android
    }

    // =========================
    // Cleanup
    // =========================
    private fun cleanUp() {
        try {
            recorder?.apply {
                stop()
                reset()
                release()
            }
        } catch (_: Exception) {}

        recorder = null
        filePath = null
    }

    // =========================
    // Permission Helpers
    // =========================
    private fun hasAudioPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestAudioPermission(promise: Promise) {
        val activity = reactContext.currentActivity

        if (activity == null) {
            promise.reject(
                "NO_ACTIVITY",
                "Activity not available"
            )
            return
        }

        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.RECORD_AUDIO),
            1001
        )

        promise.reject(
            "PERMISSION_REQUIRED",
            "Microphone permission required"
        )
    }
}