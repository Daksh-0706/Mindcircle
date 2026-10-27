package app.mindcircle.android.ui.components

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.Camera
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import app.mindcircle.android.R
import app.mindcircle.android.ui.theme.Palette
import app.mindcircle.android.ui.theme.Shapes
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/**
 * The app's own viewfinder, used everywhere a photo is taken.
 *
 * The OS camera *intent* was the wrong tool here. On the test device it hands
 * back a cancelled result, and even when it works the user is dumped into a
 * completely different looking app to take the picture, then has to confirm in
 * a review screen that belongs to that camera. Hosting CameraX inside our own
 * composable keeps the whole flow in MindCircle: cream chrome, the shutter the
 * design calls for, and a result we always receive.
 *
 * Captures land in the app's cache and are handed back as a `file://` uri â€”
 * callers already read that through [android.content.ContentResolver], so the
 * existing compression/upload pipeline needs no changes.
 */
@Composable
fun CameraCaptureScreen(
    onClose: () -> Unit,
    onCaptured: (Uri) -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    var granted by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
                PackageManager.PERMISSION_GRANTED,
        )
    }
    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted = it }
    // Asked for on first open, never at launch: a permission dialog over the
    // home screen is a great way to lose a new user.
    LaunchedEffect(Unit) {
        if (!granted) permissionLauncher.launch(Manifest.permission.CAMERA)
    }

    // The gallery half of the design. The system photo picker needs no
    // permission at all, so it stays available even if the camera is denied.
    val galleryLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.PickVisualMedia(),
    ) { uri -> uri?.let(onCaptured) }

    var lensFacing by remember { mutableIntStateOf(CameraSelector.LENS_FACING_BACK) }
    var flashOn by remember { mutableStateOf(false) }
    var zoom by remember { mutableFloatStateOf(1f) }
    var capturing by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    val previewView = remember {
        PreviewView(context).apply { scaleType = PreviewView.ScaleType.FILL_CENTER }
    }
    val imageCapture = remember {
        ImageCapture.Builder()
            .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
            .build()
    }
    var provider by remember { mutableStateOf<ProcessCameraProvider?>(null) }
    var camera by remember { mutableStateOf<Camera?>(null) }

    LaunchedEffect(granted) {
        if (!granted || provider != null) return@LaunchedEffect
        // get() blocks while CameraX spins its camera service up.
        provider = withContext(Dispatchers.IO) {
            runCatching { ProcessCameraProvider.getInstance(context).get() }.getOrNull()
        }
        if (provider == null) error = "This device could not start the camera."
    }

    LaunchedEffect(provider, granted, lensFacing) {
        val bound = provider ?: return@LaunchedEffect
        if (!granted) return@LaunchedEffect
        val preview = Preview.Builder().build().also {
            it.surfaceProvider = previewView.surfaceProvider
        }
        bound.unbindAll()
        camera = runCatching {
            bound.bindToLifecycle(
                lifecycleOwner,
                CameraSelector.Builder().requireLensFacing(lensFacing).build(),
                preview,
                imageCapture,
            )
        }.onFailure { error = "Could not start the camera." }.getOrNull()
    }

    LaunchedEffect(camera, zoom) {
        runCatching { camera?.cameraControl?.setZoomRatio(zoom) }
    }

    LaunchedEffect(flashOn) {
        imageCapture.flashMode =
            if (flashOn) ImageCapture.FLASH_MODE_ON else ImageCapture.FLASH_MODE_OFF
    }

    DisposableEffect(Unit) {
        onDispose { provider?.unbindAll() }
    }

    fun shoot() {
        if (capturing) return
        capturing = true
        error = null
        val dir = File(context.cacheDir, "camera").apply { mkdirs() }
        val file = File(dir, "capture-${System.currentTimeMillis()}.jpg")
        imageCapture.takePicture(
            ImageCapture.OutputFileOptions.Builder(file).build(),
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(results: ImageCapture.OutputFileResults) {
                    capturing = false
                    onCaptured(Uri.fromFile(file))
                }

                override fun onError(exception: ImageCaptureException) {
                    capturing = false
                    error = "Could not take the photo. Try again."
                }
            },
        )
    }

    // A dialog window, not a nested layout: it has to cover the app's own top
    // bar and bottom nav, which is what the design shows.
    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Palette.Cream),
        ) {
        // --- Chrome: back, title, flash -------------------------------------
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 18.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            RoundIconButton(
                icon = R.drawable.ic_chevron_left,
                contentDescription = "Close camera",
                onClick = onClose,
            )
            Column(
                modifier = Modifier.weight(1f),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    "Take a Photo",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = Palette.Charcoal,
                )
                Text(
                    "Capture a moment",
                    style = MaterialTheme.typography.bodySmall,
                    color = Palette.WarmGray,
                )
            }
            RoundIconButton(
                icon = R.drawable.ic_zap,
                contentDescription = if (flashOn) "Turn flash off" else "Turn flash on",
                onClick = { flashOn = !flashOn },
                active = flashOn,
            )
        }

        // --- Viewfinder ------------------------------------------------------
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 14.dp)
                .clip(RoundedCornerShape(22.dp))
                .background(Color(0xFF1B1B1B)),
        ) {
            if (granted) {
                AndroidView(
                    factory = { previewView },
                    modifier = Modifier.fillMaxSize(),
                )
            }

            ViewfinderCorners()

            if (!granted) {
                // Denied (or not yet granted): explain instead of showing a
                // black rectangle, and keep the gallery open as a way out.
                Column(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(horizontal = 28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        "Camera access is off",
                        style = MaterialTheme.typography.titleMedium,
                        color = Palette.White,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Allow the camera to take a photo, or pick one from your gallery.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Palette.White.copy(alpha = 0.75f),
                    )
                    Spacer(Modifier.height(14.dp))
                    Box(
                        modifier = Modifier
                            .clip(Shapes.Pill)
                            .background(Palette.White)
                            .clickable { permissionLauncher.launch(Manifest.permission.CAMERA) }
                            .padding(horizontal = 20.dp, vertical = 10.dp),
                    ) {
                        Text(
                            "Allow camera",
                            style = MaterialTheme.typography.labelLarge,
                            color = Palette.Plum,
                        )
                    }
                }
            }

            // Side controls, floating over the preview the way the design has them.
            Column(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                GlassButton(
                    icon = R.drawable.ic_switch_camera,
                    contentDescription = "Switch camera",
                    onClick = {
                        lensFacing = if (lensFacing == CameraSelector.LENS_FACING_BACK) {
                            CameraSelector.LENS_FACING_FRONT
                        } else {
                            CameraSelector.LENS_FACING_BACK
                        }
                    },
                )
                Box(
                    modifier = Modifier
                        .size(width = 52.dp, height = 36.dp)
                        .clip(Shapes.Pill)
                        .background(Color.Black.copy(alpha = 0.35f))
                        .clickable { zoom = if (zoom > 1f) 1f else 2f },
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "${zoom.toInt()}x",
                        style = MaterialTheme.typography.labelLarge,
                        color = Palette.White,
                    )
                }
            }

            error?.let {
                Text(
                    it,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 14.dp),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFFFFC9C9),
                )
            }
        }

        // --- Bottom sheet: gallery, shutter, photo/video ----------------------
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp)
                .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                .background(Palette.White)
                .padding(top = 20.dp, bottom = 18.dp),
        ) {
            Box(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .padding(start = 34.dp)
                        .clickable {
                            galleryLauncher.launch(
                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly),
                            )
                        },
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Box(
                        modifier = Modifier
                            .size(54.dp)
                            .clip(CircleShape)
                            .background(Palette.CreamDark),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.ic_image),
                            contentDescription = "Gallery",
                            tint = Palette.Charcoal,
                            modifier = Modifier.size(22.dp),
                        )
                    }
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "Gallery",
                        style = MaterialTheme.typography.labelMedium,
                        color = Palette.WarmGray,
                    )
                }

                ShutterButton(
                    busy = capturing,
                    enabled = granted,
                    modifier = Modifier.align(Alignment.Center),
                    onClick = { shoot() },
                )
            }

            Spacer(Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .clip(Shapes.Pill)
                        .background(Palette.Plum)
                        .padding(horizontal = 22.dp, vertical = 8.dp),
                ) {
                    Text(
                        "Photo",
                        style = MaterialTheme.typography.labelLarge,
                        color = Palette.White,
                    )
                }
                Spacer(Modifier.width(18.dp))
                // Video is a real feature on the roadmap, not a button that
                // quietly does nothing: it is drawn muted, exactly as in the
                // mock, and is deliberately not clickable yet.
                Text(
                    "Video",
                    style = MaterialTheme.typography.labelLarge,
                    color = Palette.WarmGrayLight,
                )
            }
        }
        }
    }
}

@Composable
private fun RoundIconButton(
    icon: Int,
    contentDescription: String,
    onClick: () -> Unit,
    active: Boolean = false,
) {
    Box(
        modifier = Modifier
            .size(42.dp)
            .clip(CircleShape)
            .background(if (active) Palette.Plum else Palette.White)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            painter = painterResource(icon),
            contentDescription = contentDescription,
            tint = if (active) Palette.White else Palette.Charcoal,
            modifier = Modifier.size(19.dp),
        )
    }
}

@Composable
private fun GlassButton(
    icon: Int,
    contentDescription: String,
    onClick: () -> Unit,
) {
    Box(
        modifier = Modifier
            .size(46.dp)
            .clip(CircleShape)
            .background(Color.Black.copy(alpha = 0.35f))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(
            painter = painterResource(icon),
            contentDescription = contentDescription,
            tint = Palette.White,
            modifier = Modifier.size(22.dp),
        )
    }
}

@Composable
private fun ShutterButton(
    busy: Boolean,
    enabled: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    Box(
        modifier = modifier
            .size(86.dp)
            .clip(CircleShape)
            .border(3.dp, Color(0xFFD9CFF0), CircleShape)
            .clickable(enabled = enabled && !busy, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Box(
            modifier = Modifier
                .size(68.dp)
                .clip(CircleShape)
                .background(if (enabled) Palette.Plum else Palette.WarmGrayLight),
            contentAlignment = Alignment.Center,
        ) {
            if (busy) {
                CircularProgressIndicator(
                    strokeWidth = 2.dp,
                    color = Palette.White,
                    modifier = Modifier.size(22.dp),
                )
            }
        }
    }
}

/** The four white corner brackets from the design. */
@Composable
private fun ViewfinderCorners() {
    Canvas(modifier = Modifier.fillMaxSize().padding(20.dp)) {
        val arm = 26.dp.toPx()
        val stroke = 2f.dp.toPx()
        val color = Color.White.copy(alpha = 0.92f)
        val w = size.width
        val h = size.height

        // top-left / top-right / bottom-left / bottom-right, drawn as two
        // strokes each so the corner stays crisp at any density.
        drawLine(color, Offset(0f, 0f), Offset(arm, 0f), stroke, StrokeCap.Round)
        drawLine(color, Offset(0f, 0f), Offset(0f, arm), stroke, StrokeCap.Round)
        drawLine(color, Offset(w, 0f), Offset(w - arm, 0f), stroke, StrokeCap.Round)
        drawLine(color, Offset(w, 0f), Offset(w, arm), stroke, StrokeCap.Round)
        drawLine(color, Offset(0f, h), Offset(arm, h), stroke, StrokeCap.Round)
        drawLine(color, Offset(0f, h), Offset(0f, h - arm), stroke, StrokeCap.Round)
        drawLine(color, Offset(w, h), Offset(w - arm, h), stroke, StrokeCap.Round)
        drawLine(color, Offset(w, h), Offset(w, h - arm), stroke, StrokeCap.Round)
    }
}
