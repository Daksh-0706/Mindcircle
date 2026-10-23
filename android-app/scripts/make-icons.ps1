# Generates the Android launcher icons from the repo's logo (public/logo-square.png).
# Output: app/src/main/res/mipmap-*/ic_launcher{,_round}.png + drawable-nodpi foreground.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot "..\..\public\logo-square.png"
$res = Join-Path $PSScriptRoot "..\app\src\main\res"
$logo = [System.Drawing.Image]::FromFile((Resolve-Path $src).Path)

function New-Canvas([int]$w, [int]$h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    return @($bmp, $g)
}

# --- Adaptive-icon foreground: logo centred at ~58% inside a 432dp canvas.
$fg = New-Canvas 432 432
$size = [int](432 * 0.58)
$off = [int]((432 - $size) / 2)
$fg[1].DrawImage($logo, (New-Object System.Drawing.Rectangle($off, $off, $size, $size)))
$fgDir = Join-Path $res "drawable-nodpi"
New-Item -ItemType Directory -Force -Path $fgDir | Out-Null
$fg[0].Save((Join-Path $fgDir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$fg[1].Dispose(); $fg[0].Dispose()

# --- Legacy + round icons: plum tile with the logo inset by 18%.
foreach ($mip in @(
        @{ dir = "mipmap-mdpi"; px = 48 },
        @{ dir = "mipmap-hdpi"; px = 72 },
        @{ dir = "mipmap-xhdpi"; px = 96 },
        @{ dir = "mipmap-xxhdpi"; px = 144 },
        @{ dir = "mipmap-xxxhdpi"; px = 192 })) {
    $d = Join-Path $res $mip.dir
    New-Item -ItemType Directory -Force -Path $d | Out-Null
    $c = New-Canvas $mip.px $mip.px
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 74, 44, 94))
    $c[1].FillRectangle($brush, 0, 0, $mip.px, $mip.px)
    $inset = [int]($mip.px * 0.18)
    $inner = $mip.px - (2 * $inset)
    $c[1].DrawImage($logo, (New-Object System.Drawing.Rectangle($inset, $inset, $inner, $inner)))
    $c[0].Save((Join-Path $d "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $c[0].Save((Join-Path $d "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $brush.Dispose(); $c[1].Dispose(); $c[0].Dispose()
    Write-Output ("{0}: {1}x{1}" -f $mip.dir, $mip.px)
}

$logo.Dispose()
Write-Output "Icons generated."
