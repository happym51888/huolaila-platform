# 结束占用 3000 的 node 并清理 Next 开发锁，然后启动 dev
$dir = $PSScriptRoot
$lockPath = Join-Path $dir ".next\dev\lock"

# 结束监听 3000 的进程
$pids = (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique
foreach ($pid in $pids) {
    if ($pid -gt 0) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "已结束进程 $pid"
    }
}
Start-Sleep -Seconds 2

# 删除开发锁（避免 "another instance running"）
if (Test-Path $lockPath) {
    Remove-Item $lockPath -Force
    Write-Host "已删除 lock 文件"
}

# 若仍报错，可取消下面两行注释以清空 .next 再启动
# Remove-Item (Join-Path $dir ".next") -Recurse -Force -ErrorAction SilentlyContinue
# Write-Host "已清空 .next"

Set-Location $dir
npm run dev
