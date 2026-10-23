package app.mindcircle.android.core

import io.github.jan.supabase.auth.auth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

/** A non-2xx answer from the Next.js API. The server message is shown as-is. */
class ApiException(val status: Int, val serverMessage: String) : Exception(serverMessage)

/**
 * Typed access to the 21 Next.js route handlers.
 *
 * Every call carries the Supabase access token as `Authorization: Bearer`,
 * which `src/lib/supabase/server.ts` forwards to Supabase's auth server and to
 * PostgREST — so Row Level Security still decides what the caller may see.
 * The web app keeps using cookies; nothing about it changed.
 */
object ApiClient {

    const val BASE = "https://mindcircle.vercel.app"

    internal val MEDIA_JSON = "application/json; charset=utf-8".toMediaType()
    internal val EMPTY_BODY = JsonObject(emptyMap())

    internal val http: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(45, TimeUnit.SECONDS)
        .build()

    /** Current access token. supabase-kt keeps it fresh while the app is alive. */
    suspend fun token(): String? = Supabase.auth.currentSessionOrNull()?.accessToken

    internal suspend inline fun <reified T> get(path: String): T = request("GET", path, null)
    internal suspend inline fun <reified T> post(path: String, body: JsonObject? = null): T =
        request("POST", path, body)
    internal suspend inline fun <reified T> patch(path: String, body: JsonObject? = null): T =
        request("PATCH", path, body)
    internal suspend inline fun <reified T> delete(path: String, body: JsonObject? = null): T =
        request("DELETE", path, body)

    /**
     * Sends a write whose response we do not model, and never decodes it.
     *
     * `post<Any>` looks like it should work and does not: kotlinx.serialization
     * has no serializer for `Any`, so every such call died with "Serializer for
     * class 'Any' is not found" *after* the request had already been sent. That
     * silently broke mood check-ins, settings toggles, sending a chat message,
     * connection requests and journal deletes. Use these instead.
     */
    internal suspend fun postIgnoring(path: String, body: JsonObject? = null) =
        sendIgnoring("POST", path, body)

    internal suspend fun patchIgnoring(path: String, body: JsonObject? = null) =
        sendIgnoring("PATCH", path, body)

    internal suspend fun deleteIgnoring(path: String, body: JsonObject? = null) =
        sendIgnoring("DELETE", path, body)

    private suspend fun sendIgnoring(method: String, path: String, body: JsonObject?) {
        if (call(method, path, body, token()) === null) {
            runCatching { Supabase.auth.refreshCurrentSession() }
            if (call(method, path, body, token()) === null) {
                throw ApiException(401, "Your session has expired. Please sign in again.")
            }
        }
    }

    internal suspend inline fun <reified T> request(method: String, path: String, body: JsonObject?): T {
        val attempt = execute<T>(method, path, body, token())
        if (attempt === ApiRetryNeeded) {
            // The token expired mid-session: refresh once, then try again.
            runCatching { Supabase.auth.refreshCurrentSession() }
            val retried = execute<T>(method, path, body, token())
            // Still 401 after a refresh means the session is genuinely gone, not
            // merely stale. Returning ApiRetryNeeded here used to reach the
            // unchecked cast below and blow up with an unreadable
            // "ApiRetryNeeded cannot be cast to T", hiding the real cause.
            if (retried === ApiRetryNeeded) {
                throw ApiException(401, "Your session has expired. Please sign in again.")
            }
            @Suppress("UNCHECKED_CAST")
            return retried as T
        }
        @Suppress("UNCHECKED_CAST")
        return attempt as T
    }

    /**
     * One HTTP round trip, minus the decoding.
     *
     * Returns the response body on success, or null when the caller should
     * refresh its session and retry (a 401 while a token was present).
     */
    private suspend fun call(
        method: String,
        path: String,
        body: JsonObject?,
        accessToken: String?,
    ): String? = withContext(Dispatchers.IO) {
        // OkHttp only has toRequestBody() for String/ByteArray/InputStream, so
        // the JsonObject is serialised to a String first.
        val content = (body ?: EMPTY_BODY).toString().toRequestBody(MEDIA_JSON)
        val builder = Request.Builder().url(BASE + path)
        accessToken?.let { builder.header("Authorization", "Bearer $it") }
        when (method) {
            "GET" -> builder.get()
            "DELETE" -> builder.delete(content)
            "PATCH" -> builder.patch(content)
            else -> builder.post(content)
        }

        http.newCall(builder.build()).execute().use { response ->
            val text = response.body?.string().orEmpty()
            if (response.code == 401 && accessToken != null) return@use null
            if (!response.isSuccessful) {
                val message = runCatching {
                    Api.json.decodeFromString<ErrorBody>(text.ifBlank { "{}" }).error
                }.getOrNull() ?: "Something went wrong. Please try again."
                throw ApiException(response.code, message)
            }
            text
        }
    }

    /**
     * One HTTP round trip, decoding the body into [T].
     *
     * Returns [ApiRetryNeeded] instead of throwing on a 401 so the caller can
     * refresh the session exactly once.
     */
    internal suspend inline fun <reified T> execute(
        method: String,
        path: String,
        body: JsonObject?,
        accessToken: String?,
    ): Any? {
        val text = call(method, path, body, accessToken) ?: return ApiRetryNeeded
        return Api.json.decodeFromString<T>(text)
    }

    @kotlinx.serialization.Serializable
    internal data class ErrorBody(val error: String? = null)

    /** Marker returned internally when the session needs a refresh. */
    internal object ApiRetryNeeded
}

/** Builds a JSON request body from simple Kotlin values. */
fun jsonBody(vararg fields: Pair<String, Any?>): JsonObject = buildJsonObject {
    fields.forEach { (key, value) ->
        when (value) {
            null -> put(key, JsonNull)
            is String -> put(key, JsonPrimitive(value))
            is Int -> put(key, JsonPrimitive(value))
            is Long -> put(key, JsonPrimitive(value))
            is Double -> put(key, JsonPrimitive(value))
            is Float -> put(key, JsonPrimitive(value.toDouble()))
            is Boolean -> put(key, JsonPrimitive(value))
            is JsonObject -> put(key, value)
            is List<*> -> put(
                key,
                JsonArray(
                    value.map { item ->
                        when (item) {
                            null -> JsonNull
                            is Number -> JsonPrimitive(item)
                            else -> JsonPrimitive(item.toString())
                        }
                    },
                ),
            )
            else -> put(key, JsonPrimitive(value.toString()))
        }
    }
}
