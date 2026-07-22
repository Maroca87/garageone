Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\mrodriguez\.gemini\antigravity-ide\brain\c82b909b-62db-4909-af23-5b676c793c1d\garageone_car_wrench_icon_1784661037408.png"
$targetDir = "c:\Users\mrodriguez\.gemini\antigravity-ide\scratch\autocare-pwa\icons"

if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir }

function Resize-Image($src, $dest, $width, $height) {
    $img = [System.Drawing.Image]::FromFile($src)
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(255, 13, 98, 217))
    $g.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
}

Resize-Image $sourcePath "$targetDir\apple-touch-icon.png" 180 180
Resize-Image $sourcePath "$targetDir\icon-192.png" 192 192
Resize-Image $sourcePath "$targetDir\icon-512.png" 512 512

Write-Host "Icons updated successfully from source image."
