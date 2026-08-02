# Regenerates every app icon from assets/icon-source.png.
#
# One-off helper, Windows-only (uses System.Drawing) — it is NOT part of the
# build or CI. The generated files are committed; run this again only if the
# source artwork changes:
#
#   powershell -File scripts/generate-icons.ps1
#
# Source is 500x500 RGBA with a transparent background.

Add-Type -AssemblyName System.Drawing

$repo = Split-Path $PSScriptRoot -Parent
$src = Join-Path $repo "assets\icon-source.png"
$out = Join-Path $repo "public"

if (-not (Test-Path $src)) { throw "Source artwork not found: $src" }

$source = [System.Drawing.Bitmap]::FromFile($src)

# Draws the source into a size x size canvas. $background = $null keeps the
# alpha channel; a colour flattens onto it (iOS renders apple-touch-icon on an
# opaque tile and mangles transparency).
function Render([int]$size, $background) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($null -ne $background) {
        $brush = New-Object System.Drawing.SolidBrush $background
        $g.FillRectangle($brush, 0, 0, $size, $size)
        $brush.Dispose()
    }

    # TileFlipXY stops the bicubic kernel sampling transparent black from
    # outside the bitmap, which would leave a dark halo on the edges.
    $attr = New-Object System.Drawing.Imaging.ImageAttributes
    $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $rect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
    $g.DrawImage($source, $rect, 0, 0, $source.Width, $source.Height,
        [System.Drawing.GraphicsUnit]::Pixel, $attr)

    $attr.Dispose()
    $g.Dispose()
    return $bmp
}

function Save($bmp, [string]$name) {
    $path = Join-Path $out $name
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output ("  {0,-24} {1,4}x{2,-4} {3,7:N1} Ko" -f $name, $bmp.Width, $bmp.Height, ((Get-Item $path).Length / 1KB))
}

Write-Output "Icones generees :"

# Browser tab. Transparent so it sits on light and dark tab strips alike.
$f16 = Render 16 $null;  Save $f16 "favicon-16x16.png"
$f32 = Render 32 $null;  Save $f32 "favicon-32x32.png"
$f48 = Render 48 $null

# iOS home screen — flattened on white, transparency renders badly there.
$apple = Render 180 ([System.Drawing.Color]::White)
Save $apple "apple-touch-icon.png"

# Web app manifest / Android home screen.
$i192 = Render 192 $null; Save $i192 "icon-192.png"
$i512 = Render 512 $null; Save $i512 "icon-512.png"

# Multi-size favicon.ico for bare /favicon.ico requests. Modern .ico files
# embed PNG payloads rather than raw bitmaps.
$icoPath = Join-Path $out "favicon.ico"
$entries = @($f16, $f32, $f48)
$blobs = @()
foreach ($b in $entries) {
    $ms = New-Object System.IO.MemoryStream
    $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $blobs += , $ms.ToArray()
    $ms.Dispose()
}
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter $fs
$bw.Write([uint16]0)                 # reserved
$bw.Write([uint16]1)                 # type: icon
$bw.Write([uint16]$entries.Count)
$offset = 6 + 16 * $entries.Count
for ($i = 0; $i -lt $entries.Count; $i++) {
    $bw.Write([byte]$entries[$i].Width)
    $bw.Write([byte]$entries[$i].Height)
    $bw.Write([byte]0)               # palette size (0 = no palette)
    $bw.Write([byte]0)               # reserved
    $bw.Write([uint16]1)             # colour planes
    $bw.Write([uint16]32)            # bits per pixel
    $bw.Write([uint32]$blobs[$i].Length)
    $bw.Write([uint32]$offset)
    $offset += $blobs[$i].Length
}
foreach ($blob in $blobs) { $bw.Write($blob) }
$bw.Dispose(); $fs.Dispose()
Write-Output ("  {0,-24} 16/32/48  {1,7:N1} Ko" -f "favicon.ico", ((Get-Item $icoPath).Length / 1KB))

# Social preview card (og:image). 1200x630 is the ratio every platform crops to.
$og = New-Object System.Drawing.Bitmap 1200, 630, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($og)
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::White)
$side = 520
$g.DrawImage($source, [int]((1200 - $side) / 2), [int]((630 - $side) / 2), $side, $side)
$g.Dispose()
Save $og "og-image.png"

foreach ($b in @($f16, $f32, $f48, $apple, $i192, $i512, $og)) { $b.Dispose() }
$source.Dispose()
