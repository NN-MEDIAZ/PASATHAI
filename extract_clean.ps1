Add-Type -AssemblyName System.Drawing

$board = [System.Drawing.Bitmap]::FromFile((Resolve-Path "Board.png").Path)

# Let's define the row tops and bottoms:
# Row 0: Y = 186 to 378 (Height = 192)
# Row 1: Y = 396 to 588 (Height = 192)
# Row 2: Y = 606 to 798 (Height = 192)
# Row 3: Y = 816 to 1008 (Height = 192)

$rowTops = @(186, 396, 606, 816)
$cardHeight = 192

# For columns:
# In Board.png, there are 11 columns.
# Let's check X centers:
# Col 0: 76 (left ~ 14, right ~ 138)
# Col 1: 210 (left ~ 148, right ~ 272)
# Col 2: 344 (left ~ 282, right ~ 406)
# Col 3: 478 (left ~ 416, right ~ 540)
# Col 4: 612 (left ~ 550, right ~ 674)
# Col 5: 746 (left ~ 684, right ~ 808)
# Col 6: 880 (left ~ 818, right ~ 942)
# Col 7: 1014 (left ~ 952, right ~ 1076)
# Col 8: 1148 (left ~ 1086, right ~ 1210)
# Col 9: 1282 (left ~ 1220, right ~ 1344)
# Col 10: 1416 (left ~ 1354, right ~ 1478)

# Notice card 17 (ฑ มณโฑ) is in Row 1 (row index 1), Col 5.
# X = 684, Y = 396, W = 124, H = 192!

$startX = 14
$colStep = 134
$cardWidth = 124

$outDir = "assets\cards"
for ($i = 0; $i -lt 44; $i++) {
    $r = [Math]::Floor($i / 11)
    $c = $i % 11
    
    $x = $startX + ($c * $colStep)
    $y = $rowTops[$r]
    $w = $cardWidth
    $h = $cardHeight
    
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
}

$board.Dispose()
Write-Host "Re-extracted 44 cards with clean tops and bottoms."
