# Optional Windows helper: download the official Pip PNGs and switch the page
# from local SVG fallback illustrations to official locally downloaded PNGs for more reliable GitHub Pages hosting.
# Run inside the project folder: .\fetch-official-assets.ps1
$ErrorActionPreference = "Stop"
$base = "https://hax.baby/baby/assets"
$assets = @("pip_avatar_cloud.png", "pip_lullaby_box.png", "pip_dream_lantern.png")
$folder = Join-Path $PSScriptRoot "assets"
New-Item -ItemType Directory -Force -Path $folder | Out-Null

foreach ($file in $assets) {
    $url = "$base/$file"
    $target = Join-Path $folder $file
    Write-Host "Downloading $file ..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $target -UseBasicParsing
        if ((Get-Item $target).Length -lt 1000) { throw "Downloaded file is unexpectedly small" }
    } catch {
        Write-Warning "Unable to download $url : $_"
        Write-Host "No page changes made. The site already has SVG fallback illustrations."
        exit 1
    }
}

$page = Join-Path $PSScriptRoot "index.html"
$html = Get-Content -Raw -Encoding UTF8 $page
foreach ($file in $assets) {
    $fallback = switch ($file) { "pip_avatar_cloud.png" { "pip-fallback.svg" } "pip_lullaby_box.png" { "music-fallback.svg" } "pip_dream_lantern.png" { "lantern-fallback.svg" } }
    $html = $html.Replace("src=`"assets/$fallback`"", "src=`"assets/$file`"")
}
[System.IO.File]::WriteAllText($page, $html, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Done! All 3 official PNGs are local. Commit the updated index.html and assets/ PNGs." -ForegroundColor Green
