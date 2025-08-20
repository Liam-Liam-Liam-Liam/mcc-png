param(
  [string[]] $Paths,
  [string]   $Root = "assets/images/gallery",
  [string]   $Prefix = "photo",
  [int]      $Start = 1,
  [int]      $Pad = 0,                # e.g., 2 -> photo01
  [switch]   $ForceJpg,               # force .jpg for outputs
  [switch]   $DryRun                  # preview only
)

$exts = @('.jpg','.jpeg','.png','.webp','.tif','.tiff','.heic','.heif')

function Get-SetFolders {
  param([string]$root)
  Get-ChildItem -Path $root -Directory -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName }
}

function Get-Images {
  param([string]$folder)
  Get-ChildItem -Path $folder -File -ErrorAction SilentlyContinue |
    Where-Object { $exts -contains $_.Extension.ToLower() } |
    Sort-Object LastWriteTime, Name
}

function TwoPhaseRename {
  param([object[]]$Map, [switch]$DryRun)
  # Phase 1: to temp names (avoid collisions)
  foreach ($m in $Map) {
    if ($DryRun) { Write-Host ("TMP  : {0} -> {1}" -f (Split-Path $m.Src -Leaf), (Split-Path $m.Tmp -Leaf)) }
    else { Rename-Item -LiteralPath $m.Src -NewName (Split-Path $m.Tmp -Leaf) -ErrorAction Stop }
  }
  # Phase 2: temp -> final names
  foreach ($m in $Map) {
    if ($DryRun) { Write-Host ("FINAL: {0} -> {1}" -f (Split-Path $m.Tmp -Leaf), (Split-Path $m.Dst -Leaf)) }
    else { Rename-Item -LiteralPath $m.Tmp -NewName (Split-Path $m.Dst -Leaf) -ErrorAction Stop }
  }
}

if (-not $Paths -or $Paths.Count -eq 0) { $Paths = Get-SetFolders -root $Root }

foreach ($folder in $Paths) {
  if (-not (Test-Path $folder)) { Write-Warning "Skip $folder (not found)"; continue }
  $items = Get-Images -folder $folder
  if (-not $items -or $items.Count -eq 0) { Write-Host "[skip] $folder (no images)"; continue }

  $i = $Start
  $plan = @()
  foreach ($item in $items) {
    $num = if ($Pad -gt 0) { $i.ToString(("D{0}" -f $Pad)) } else { $i.ToString() }
    $ext = if ($ForceJpg) { ".jpg" } else { $item.Extension.ToLower() }
    $dst = Join-Path $folder ("{0}{1}{2}" -f $Prefix, $num, $ext)
    $tmp = Join-Path $folder ("__tmp__{0}{1}" -f ([guid]::NewGuid().ToString("N")), $ext)

    $plan += [pscustomobject]@{ Src = $item.FullName; Tmp = $tmp; Dst = $dst }
    $i++
  }

  Write-Host "`n=== $folder ==="
  $plan | ForEach-Object { "{0} -> {1}" -f (Split-Path $_.Src -Leaf), (Split-Path $_.Dst -Leaf) } | Write-Host

  if ($DryRun) { Write-Host "[dry-run] no changes made."; continue }

  try {
    TwoPhaseRename -Map $plan
    ($plan | ForEach-Object { "{0} -> {1}" -f (Split-Path $_.Src -Leaf), (Split-Path $_.Dst -Leaf) }) `
      | Out-File -FilePath (Join-Path $folder "rename_log.txt") -Encoding utf8
    Write-Host "[done] $folder"
  } catch {
    Write-Error "Rename failed in $folder: $($_.Exception.Message)"
    # best-effort rollback if needed is omitted for brevity; re-run with --dry-run to verify first
  }
}
