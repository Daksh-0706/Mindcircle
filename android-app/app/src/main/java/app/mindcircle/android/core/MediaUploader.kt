package app.mindcircle.android.core

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import io.github.jan.supabase.storage.storage
import io.ktor.http.ContentType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.util.UUID

/**
 * Photo attachments for chat messages.
 *
 * Mirrors the web's flow in `src/lib/chat/media.ts`: the image goes into the
 * private `chat-media` bucket under the sender's own folder, and only the
 * storage *path* travels on the message. The API signs it back into
 * `image_urls` when the thread is read, so the bucket never has to be public.
 *
 * Path shape matters. The server rejects any path that does not start with the
 * caller's user id — that check is what stops a message pointing at somebody
 * else's upload.
 */
object MediaUploader {

    /** Server-side ceiling (MAX_IMAGES_PER_MESSAGE); mirrored to fail fast. */
    const val MAX_IMAGES_PER_MESSAGE = 9

    private const val BUCKET = "chat-media"
    private const val JPEG_QUALITY = 82

    /** Longest edge after downscaling. Phone cameras produce 4000px+ files. */
    private const val MAX_EDGE = 1600

    /** Captured/picked bytes above this are rejected rather than silently shrunk. */
    private const val MAX_INPUT_BYTES = 25L * 1024 * 1024

    /**
     * Reads [uri], downscales, re-encodes as JPEG and uploads it.
     *
     * @return the storage path to send as `media_paths`.
     */
    suspend fun upload(context: Context, uri: Uri, userId: String): String =
        withContext(Dispatchers.IO) {
            val jpeg = decodeAndCompress(context, uri)
                ?: throw IllegalArgumentException("That file could not be read as an image.")

            // Random component: a path must not be guessable from the message id.
            val path = "$userId/${UUID.randomUUID()}.jpg"

            Supabase.client.storage.from(BUCKET).upload(path, jpeg) {
                contentType = ContentType.Image.JPEG
            }

            path
        }

    /**
     * Decodes with `inSampleSize` so a huge photo never lands in memory whole,
     * then rotates using the EXIF orientation the camera recorded.
     */
    private fun decodeAndCompress(context: Context, uri: Uri): ByteArray? {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        context.contentResolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, bounds)
        }
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return null

        var sample = 1
        while (bounds.outWidth / sample > MAX_EDGE * 2 || bounds.outHeight / sample > MAX_EDGE * 2) {
            sample *= 2
        }

        val opts = BitmapFactory.Options().apply { inSampleSize = sample }
        val decoded = context.contentResolver.openInputStream(uri)?.use {
            BitmapFactory.decodeStream(it, null, opts)
        } ?: return null

        val rotation = context.contentResolver.openInputStream(uri)?.use { stream ->
            runCatching { ExifInterface(stream).rotationDegrees }.getOrDefault(0)
        } ?: 0

        val upright = if (rotation == 0) {
            decoded
        } else {
            val matrix = Matrix().apply { postRotate(rotation.toFloat()) }
            Bitmap.createBitmap(decoded, 0, 0, decoded.width, decoded.height, matrix, true)
                .also { decoded.recycle() }
        }

        val scaled = scaleToFit(upright)
        return ByteArrayOutputStream().use { out ->
            scaled.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, out)
            if (out.size() > MAX_INPUT_BYTES) throw IllegalArgumentException("That photo is too large.")
            scaled.recycle()
            out.toByteArray()
        }
    }

    private fun scaleToFit(source: Bitmap): Bitmap {
        val longest = maxOf(source.width, source.height)
        if (longest <= MAX_EDGE) return source
        val ratio = MAX_EDGE.toFloat() / longest
        val scaled = Bitmap.createScaledBitmap(
            source,
            (source.width * ratio).toInt().coerceAtLeast(1),
            (source.height * ratio).toInt().coerceAtLeast(1),
            true,
        )
        if (scaled != source) source.recycle()
        return scaled
    }
}