# Generates the app icons in ../icons: a serif "R" in ink on paper, underlined in red pen.
# Usage: powershell -ExecutionPolicy Bypass -File tools\make-icons.ps1
Add-Type -AssemblyName System.Drawing

$out = Join-Path $PSScriptRoot "..\icons"
New-Item -ItemType Directory -Force $out | Out-Null

function New-Icon([int]$size, [double]$scale, [string]$file) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.TextRenderingHint = "AntiAliasGridFit"
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#F2F4F8"))

  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#18203A"))
  $font = New-Object System.Drawing.Font "Georgia", ([float]($size * 0.62 * $scale)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = "Center"; $fmt.LineAlignment = "Center"
  $rect = New-Object System.Drawing.RectangleF 0, ([float](-$size * 0.05 * $scale)), $size, $size
  $g.DrawString("R", $font, $ink, $rect, $fmt)

  # Red pen wave under the letter
  $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#C42F25")), ([float]($size * 0.045 * $scale))
  $pen.StartCap = "Round"; $pen.EndCap = "Round"
  $w = $size * 0.46 * $scale; $x0 = ($size - $w) / 2; $y = $size * 0.5 + $size * 0.27 * $scale; $a = $size * 0.025 * $scale
  $g.DrawBezier($pen, [float]$x0, [float]$y, [float]($x0 + $w * 0.3), [float]($y - $a * 2), [float]($x0 + $w * 0.6), [float]($y + $a * 2), [float]($x0 + $w), [float]($y - $a * 0.5))

  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-Icon 192 1.0 "icon-192.png"
New-Icon 512 1.0 "icon-512.png"
# Maskable: Android crops to a circle or squircle, so keep the drawing inside the central safe zone
New-Icon 512 0.72 "icon-maskable-512.png"
Write-Output "Icons written to $out"
