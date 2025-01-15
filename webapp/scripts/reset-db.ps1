# Ensure we're in the webapp directory
Set-Location (Join-Path $PSScriptRoot "..")

# Extract database configuration from .env
if (Test-Path .env) {
    # Read DATABASE_URL from .env
    $envContent = Get-Content .env
    $databaseUrl = ($envContent | Where-Object { $_ -match "DATABASE_URL=" }) -replace "DATABASE_URL=", "" -replace '"', ''

    # Parse the connection string
    $dbUser = [regex]::Match($databaseUrl, "://([^:]+):").Groups[1].Value
    $dbPassword = [regex]::Match($databaseUrl, "://[^:]+:([^@]+)@").Groups[1].Value
    $dbName = [regex]::Match($databaseUrl, "/([^?]+)").Groups[1].Value
}
else {
    Write-Error "Error: .env file not found!"
    exit 1
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $dbPassword

Write-Host "🗑️  Dropping database if it exists..."
psql -U $dbUser -d "postgres" -c "DROP DATABASE IF EXISTS $dbName"

Write-Host "🆕 Creating fresh database..."
psql -U $dbUser -d "postgres" -c "CREATE DATABASE $dbName"

Write-Host "🔄 Running Prisma DB Push..."
bunx prisma db push

Write-Host "🌱 Seeding database..."
bunx prisma db seed

Write-Host "✅ Database reset complete!"

# Clear the PGPASSWORD environment variable for security
Remove-Item Env:PGPASSWORD 