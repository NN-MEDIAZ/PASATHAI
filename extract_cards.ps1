# Script to extract all 44 Thai Alphabet Cards from Board.png
Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path "Board.png").Path
$board = [System.Drawing.Bitmap]::FromFile($srcPath)

$colLefts = @(14, 148, 282, 416, 550, 684, 818, 952, 1076, 1210, 1352)
$rowTops  = @(186, 396, 609, 818)
$rowHeights = @(192, 192, 191, 192)
$cardWidth = 127

$outDir = "assets\cards"
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

Write-Host "Extracting 44 Thai consonant cards from Board.png..."

for ($i = 0; $i -lt 44; $i++) {
    $r = [Math]::Floor($i / 11)
    $c = $i % 11
    
    $x = $colLefts[$c]
    $y = $rowTops[$r]
    $w = $cardWidth
    $h = $rowHeights[$r]
    
    if ($x + $w -gt $board.Width) { $w = $board.Width - $x }
    if ($y + $h -gt $board.Height) { $h = $board.Height - $y }
    
    $srcRect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $dstBmp = New-Object System.Drawing.Bitmap($w, $h)
    
    $g = [System.Drawing.Graphics]::FromImage($dstBmp)
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $dstRect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $g.DrawImage($board, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $cardName = ($i + 1).ToString("00") + ".png"
    $outPath = Join-Path $outDir $cardName
    $dstBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dstBmp.Dispose()
    
    Write-Host "Generated: $cardName"
}

$board.Dispose()
Write-Host "All 44 cards exported successfully from Board.png!"
