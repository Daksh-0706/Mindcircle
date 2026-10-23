# --- kotlinx.serialization -------------------------------------------------
# R8 has to be told three separate things here, or the generic response models
# (DataList<DirectoryPerson> and friends) blow up at runtime with an opaque
# "X cannot be cast to Y" on obfuscated class names:
#
#  * Signature — `serializer<T>()` resolves the type ARGUMENT of a generic
#    wrapper through `typeOf<T>()`, which reads the generic signature of the
#    inlined call site. R8 strips that attribute by default; the type argument
#    then degrades to a star projection and the decode produces the wrong
#    class. This is the single most important line in this file.
#  * The Companion object, so the serializer is not found reflectively through
#    getDeclaredClasses().
#  * The generated Foo$$serializer classes and their serializer() methods.
#
# These follow the upstream-recommended rules, so a future kotlinx.serialization
# upgrade does not silently break the API layer again.
-keepattributes *Annotation*, InnerClasses, Signature, EnclosingMethod, RuntimeVisibleAnnotations, AnnotationDefault

-dontnote kotlinx.serialization.**

-if @kotlinx.serialization.Serializable class **
-keepclassmembers class <1> {
    static <1>$Companion Companion;
}

-if @kotlinx.serialization.Serializable class ** {
    static **$* *;
}
-keepclassmembers class <2>$<3> {
    kotlinx.serialization.KSerializer serializer(...);
}

-if @kotlinx.serialization.Serializable class ** {
    public static ** INSTANCE;
}
-keepclassmembers class <1> {
    public static <1> INSTANCE;
    kotlinx.serialization.KSerializer serializer(...);
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# supabase-kt
-keep class io.github.jan.supabase.** { *; }
-keep class io.ktor.** { *; }
-dontwarn io.ktor.**

# Credential Manager's Play services fallback (Android 13 and below). R8 drops
# it without this rule because nothing in our code references it directly, and
# sign-in then fails only on older devices — the hardest kind of bug to see.
-if class androidx.credentials.CredentialManager
-keep class androidx.credentials.playservices.** {
  *;
}
