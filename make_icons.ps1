Add-Type -AssemblyName System.Drawing
$b1 = New-Object System.Drawing.Bitmap 192, 192
$g1 = [System.Drawing.Graphics]::FromImage($b1)
$g1.Clear([System.Drawing.Color]::FromArgb(0, 122, 255))
$font = New-Object System.Drawing.Font("Arial", 80, [System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.Brushes]::White
$g1.DrawString("🚗", $font, $brush, 10, 20)
$b1.Save("C:\Users\mrodriguez\.gemini\antigravity-ide\scratch\autocare-pwa\icons\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)

$b2 = New-Object System.Drawing.Bitmap 512, 512
$g2 = [System.Drawing.Graphics]::FromImage($b2)
$g2.Clear([System.Drawing.Color]::FromArgb(0, 122, 255))
$font2 = New-Object System.Drawing.Font("Arial", 220, [System.Drawing.FontStyle]::Bold)
$g2.DrawString("🚗", $font2, $brush, 40, 60)
$b2.Save("C:\Users\mrodriguez\.gemini\antigravity-ide\scratch\autocare-pwa\icons\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Icons generated successfully!"
