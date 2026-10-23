import java.io.File
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

// Release signing is read from android-app/keystore.properties (gitignored) so
// the keystore password never lands in a build file. See docs/ANDROID.md.
val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties().apply {
    if (keystorePropertiesFile.exists()) {
        keystorePropertiesFile.inputStream().use { load(it) }
    }
}

android {
    namespace = "app.mindcircle.android"
    compileSdk = 36

    defaultConfig {
        applicationId = "app.mindcircle.android"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        vectorDrawables { useSupportLibrary = true }

        // These two are public values — they ship inside the website's JS
        // bundle anyway, and every request they make is still gated by RLS.
        // They can be overridden in android-app/local.properties without
        // touching this file.
        buildConfigField(
            "String",
            "SUPABASE_URL",
            "\"${localPropOr("mindcircle.supabaseUrl", "https://btamknquiykxyjmutoki.supabase.co")}\""
        )
        buildConfigField(
            "String",
            "SUPABASE_ANON_KEY",
            "\"${localPropOr("mindcircle.supabaseAnonKey", "")}\""
        )
        // The Google OAuth client ID of type *Android* from Google Cloud
        // Console. Required by native Google Sign-In.
        buildConfigField(
            "String",
            "GOOGLE_SERVER_CLIENT_ID",
            "\"${localPropOr("mindcircle.googleServerClientId", "")}\""
        )
    }

    signingConfigs {
        if (keystoreProperties.isNotEmpty()) {
            create("release") {
                // Check absoluteness on the raw *string*. Calling file() first
                // would resolve a Windows path like C:\... against the :app
                // module and mangle it into "C:Daksh...".
                val rawPath = keystoreProperties["storeFile"] as String
                storeFile = File(rawPath).takeIf { it.isAbsolute } ?: rootProject.file(rawPath)
                storePassword = keystoreProperties["storePassword"] as String
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
            }
        }
    }

    buildTypes {
        release {
            // `./gradlew assembleRelease -PnoMinify` keeps the release signing
            // but turns R8 off, so a bug that only appears after minification
            // can be reproduced with readable class names instead of an
            // opaque "x.y cannot be cast to a.b".
            val noMinify = project.hasProperty("noMinify")
            isMinifyEnabled = !noMinify
            isShrinkResources = !noMinify
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            if (keystoreProperties.isNotEmpty()) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
        debug {
            // Keeps the app installable next to a release build during testing.
            applicationIdSuffix = ".debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

dependencies {
    // --- Jetpack Compose (versions come from the BOM) ---
    // NB: pinned to the SDK-36 generation. Newer AndroidX (compose 1.12 / core 1.19 /
    // nav 2.10 / lifecycle 2.11 / coil 3.6 / okhttp 5.5) all now require compileSdk 37
    // AND Android Gradle Plugin 9.1+, which would force an AGP major-version migration.
    val composeBom = platform("androidx.compose:compose-bom:2025.06.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.10.1")
    implementation("androidx.navigation:navigation-compose:2.9.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.9.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.9.0")
    implementation("androidx.core:core-ktx:1.16.0")
    // Camera photos carry their rotation in EXIF rather than in the pixels, so
    // uploads have to read it or every portrait photo arrives sideways.
    implementation("androidx.exifinterface:exifinterface:1.4.1")
    implementation("androidx.core:core-splashscreen:1.0.1")

    debugImplementation("androidx.compose.ui:ui-tooling")

    // --- Supabase: auth (native Google sign-in + session), realtime chat, storage ---
    // NB: the Maven group is io.github.jan-tennert.supabase (not io.github.jan.supabase).
    implementation(platform("io.github.jan-tennert.supabase:bom:3.1.4"))
    implementation("io.github.jan-tennert.supabase:auth-kt")
    implementation("io.github.jan-tennert.supabase:realtime-kt")
    implementation("io.github.jan-tennert.supabase:storage-kt")

    // supabase-kt rides on Ktor, which supplies only the client *core*. Without an
    // engine implementation it throws "Failed to find HTTP client engine
    // implementation" from Supabase.init() and the app dies at launch. The Android
    // engine is built on HttpURLConnection — no extra transitive deps, so it cannot
    // clash with the OkHttp version used for the Next.js API below.
    implementation("io.ktor:ktor-client-android:3.1.2")

    // --- Google native sign-in (Credential Manager returns an ID token) ---
    implementation("androidx.credentials:credentials:1.3.0")
    // Needed for Credential Manager on Android 13 and below, where the OS-level
    // implementation does not exist yet and Play services has to supply it.
    // Without this, sign-in only works on Android 14+.
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")

    // --- Networking for the Next.js API routes ---
    implementation("com.squareup.okhttp3:okhttp:5.1.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")

    // --- Image loading (chat photos, story images, signed URLs) ---
    implementation("io.coil-kt.coil3:coil-compose:3.2.0")
}

/** Reads an optional override from android-app/local.properties. */
fun localPropOr(key: String, default: String): String {
    val props = Properties().apply {
        val f = rootProject.file("local.properties")
        if (f.exists()) f.inputStream().use { load(it) }
    }
    return props.getProperty(key, default)
}
