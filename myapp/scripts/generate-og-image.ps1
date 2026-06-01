Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

function New-RoundedRectanglePath {
  param(
    [System.Drawing.RectangleF]$Rect,
    [float]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($Rect.X, $Rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rect.Right - $diameter, $Rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rect.X, $Rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$root = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $root "public/og-image.png"
$skylinePath = Join-Path $root "src/assets/hero-clear-2-skyline-teal.jpg"
$dashboardPath = Join-Path $root "public/portfolio-dashboard.png"

$width = 1200
$height = 630

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

try {
  $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 7, 18, 33),
    [System.Drawing.Color]::FromArgb(255, 16, 49, 79),
    0
  )
  $graphics.FillRectangle($bgBrush, $rect)

  if (Test-Path $skylinePath) {
    $skyline = [System.Drawing.Image]::FromFile($skylinePath)
    try {
      $srcRect = New-Object System.Drawing.Rectangle 20, 80, 1320, 630
      $destRect = New-Object System.Drawing.Rectangle 490, 0, 710, 630
      $attributes = New-Object System.Drawing.Imaging.ImageAttributes
      $matrix = New-Object System.Drawing.Imaging.ColorMatrix
      $matrix.Matrix33 = 0.30
      $attributes.SetColorMatrix($matrix)
      $graphics.DrawImage($skyline, $destRect, $srcRect.X, $srcRect.Y, $srcRect.Width, $srcRect.Height, [System.Drawing.GraphicsUnit]::Pixel, $attributes)
      $attributes.Dispose()
    }
    finally {
      $skyline.Dispose()
    }
  }

  $overlayRect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
  $overlayBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $overlayRect,
    [System.Drawing.Color]::FromArgb(245, 6, 15, 29),
    [System.Drawing.Color]::FromArgb(25, 6, 15, 29),
    0
  )
  $graphics.FillRectangle($overlayBrush, $overlayRect)

  $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 30, 188, 154))
  $mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(235, 225, 235, 242))
  $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 250, 250, 247))
  $softWhiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(210, 240, 245, 248))

  $pillRect = New-Object System.Drawing.RectangleF 72, 54, 240, 36
  $pillBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(42, 30, 188, 154))
  $pillPath = New-RoundedRectanglePath -Rect $pillRect -Radius 18
  $graphics.FillPath($pillBrush, $pillPath)
  $pillPath.Dispose()

  $pillFont = New-Object System.Drawing.Font -ArgumentList @("Segoe UI", 13, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.DrawString("ASSET72 PLATFORM", $pillFont, $accentBrush, 91, 62)

  $titleFont = New-Object System.Drawing.Font -ArgumentList @("Segoe UI", 42, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $subtitleFont = New-Object System.Drawing.Font -ArgumentList @("Segoe UI", 21, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $footerFont = New-Object System.Drawing.Font -ArgumentList @("Segoe UI", 16, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)

  $titleLayout = New-Object System.Drawing.RectangleF 72, 120, 570, 240
  $stringFormat = New-Object System.Drawing.StringFormat
  $stringFormat.Trimming = [System.Drawing.StringTrimming]::Word
  $graphics.DrawString("The Operating System for Real Estate Investments", $titleFont, $whiteBrush, $titleLayout, $stringFormat)

  $subtitleLayout = New-Object System.Drawing.RectangleF 76, 332, 500, 130
  $graphics.DrawString("AI-powered portfolio intelligence for NOI, rent rolls, occupancy, and risk signals.", $subtitleFont, $softWhiteBrush, $subtitleLayout, $stringFormat)

  $linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(190, 30, 188, 154)), 3
  $graphics.DrawLine($linePen, 76, 498, 200, 498)
  $graphics.DrawString("Analyze in minutes. Act with conviction.", $footerFont, $mutedBrush, 76, 514)

  $cardRect = New-Object System.Drawing.RectangleF 658, 88, 472, 390
  $cardBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 255, 255, 255))
  $cardBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(80, 255, 255, 255)), 1.5
  $cardPath = New-RoundedRectanglePath -Rect $cardRect -Radius 24
  $graphics.FillPath($cardBrush, $cardPath)
  $graphics.DrawPath($cardBorder, $cardPath)
  $cardPath.Dispose()

  if (Test-Path $dashboardPath) {
    $dashboard = [System.Drawing.Image]::FromFile($dashboardPath)
    try {
      $dashboardRect = New-Object System.Drawing.Rectangle 680, 108, 430, 348
      $graphics.DrawImage($dashboard, $dashboardRect)
    }
    finally {
      $dashboard.Dispose()
    }
  }

  $badgeRect = New-Object System.Drawing.RectangleF 864, 500, 266, 52
  $badgeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(235, 11, 31, 53))
  $badgePath = New-RoundedRectanglePath -Rect $badgeRect -Radius 18
  $graphics.FillPath($badgeBrush, $badgePath)
  $badgePath.Dispose()
  $graphics.DrawString("Portfolio Intelligence", $footerFont, $whiteBrush, 900, 517)

  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $graphics.Dispose()
  $bitmap.Dispose()
}
