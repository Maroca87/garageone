Add-Type -AssemblyName System.Drawing

function Generate-CarWrenchIcon($size, $path) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $scale = $size / 512.0
    $centerX = $size / 2.0
    $centerY = $size / 2.0

    $blueGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($size, $size)),
        [System.Drawing.Color]::FromArgb(255, 13, 98, 217),
        [System.Drawing.Color]::FromArgb(255, 6, 51, 128)
    )
    $g.FillRectangle($blueGrad, 0, 0, $size, $size)

    # 2. White Car Front Silhouette (Top Center)
    $carX = $centerX
    $carY = $centerY - 25.0 * $scale

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, (20.0 * $scale))
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

    # Car Roof & Pillars
    $roofPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $roofPath.AddBezier(
        ($carX - 130 * $scale), ($carY - 25 * $scale),
        ($carX - 70 * $scale), ($carY - 105 * $scale),
        ($carX + 70 * $scale), ($carY - 105 * $scale),
        ($carX + 130 * $scale), ($carY - 25 * $scale)
    )
    $roofPath.CloseFigure()
    $g.FillPath($whiteBrush, $roofPath)

    # Windshield Hole (Blue cutout)
    $windPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $windPath.AddBezier(
        ($carX - 110 * $scale), ($carY - 30 * $scale),
        ($carX - 55 * $scale), ($carY - 90 * $scale),
        ($carX + 55 * $scale), ($carY - 90 * $scale),
        ($carX + 110 * $scale), ($carY - 30 * $scale)
    )
    $windPath.CloseFigure()
    $g.FillPath($blueGrad, $windPath)

    # Car Body
    $bodyRect = New-Object System.Drawing.Drawing2D.GraphicsPath
    $bodyRadius = 30 * $scale
    $bodyRect.AddArc(($carX - 170 * $scale), ($carY - 25 * $scale), $bodyRadius, $bodyRadius, 180, 90)
    $bodyRect.AddArc(($carX + 170 * $scale - $bodyRadius), ($carY - 25 * $scale), $bodyRadius, $bodyRadius, 270, 90)
    $bodyRect.AddArc(($carX + 170 * $scale - $bodyRadius), ($carY + 60 * $scale - $bodyRadius), $bodyRadius, $bodyRadius, 0, 90)
    $bodyRect.AddArc(($carX - 170 * $scale), ($carY + 60 * $scale - $bodyRadius), $bodyRadius, $bodyRadius, 90, 90)
    $bodyRect.CloseFigure()
    $g.FillPath($whiteBrush, $bodyRect)

    # Side Mirrors
    $g.FillRectangle($whiteBrush, ($carX - 205 * $scale), ($carY - 20 * $scale), (38 * $scale), (20 * $scale))
    $g.FillRectangle($whiteBrush, ($carX + 167 * $scale), ($carY - 20 * $scale), (38 * $scale), (20 * $scale))

    # Cutouts for tires & headlights in body
    $g.FillRectangle($blueGrad, ($carX - 160 * $scale), ($carY + 40 * $scale), (50 * $scale), (25 * $scale))
    $g.FillRectangle($blueGrad, ($carX + 110 * $scale), ($carY + 40 * $scale), (50 * $scale), (25 * $scale))
    $g.FillEllipse($blueGrad, ($carX - 130 * $scale), ($carY - 5 * $scale), (40 * $scale), (40 * $scale))
    $g.FillEllipse($blueGrad, ($carX + 90 * $scale), ($carY - 5 * $scale), (40 * $scale), (40 * $scale))
    $g.FillRectangle($blueGrad, ($carX - 50 * $scale), ($carY + 25 * $scale), (100 * $scale), (20 * $scale))

    # 3. Mechanic Wrench Tool (Bottom Center)
    $wX = $centerX
    $wY = $centerY + 105.0 * $scale

    $g.DrawLine($whitePen, ($wX - 100 * $scale), ($wY - 25 * $scale), ($wX + 100 * $scale), ($wY + 25 * $scale))

    # Wrench Heads
    $g.DrawEllipse($whitePen, ($wX - 100 * $scale - 20 * $scale), ($wY - 25 * $scale - 20 * $scale), (40 * $scale), (40 * $scale))
    $g.DrawEllipse($whitePen, ($wX + 100 * $scale - 20 * $scale), ($wY + 25 * $scale - 20 * $scale), (40 * $scale), (40 * $scale))

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$iconDir = "c:\Users\mrodriguez\.gemini\antigravity-ide\scratch\autocare-pwa\icons"
if (-not (Test-Path $iconDir)) { New-Item -ItemType Directory -Path $iconDir }

Generate-CarWrenchIcon 180 "$iconDir\apple-touch-icon.png"
Generate-CarWrenchIcon 192 "$iconDir\icon-192.png"
Generate-CarWrenchIcon 512 "$iconDir\icon-512.png"

Write-Host "Car + Mechanic Wrench Icon generated successfully!"
