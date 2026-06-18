$postsDir = "src/content/blog"
$files = Get-ChildItem -Path $postsDir -Filter *.mdx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $baseName = $file.BaseName
    
    $imgName = $baseName + ".png"
    
    if ($content -match 'image: "/images/posts/(post_.*?|todo-app|calculator|portfolio-website|portfolio-site|nav-menu|glass-card|countdown-timer|password-generator|quiz-app|valentine-game|css-buttons|pricing-calculator|pricing-cards|profile-card|sidebar-menu|login-form|post_image_slider|post_nav_menu|post_glass_card|post_portfolio_site|post_css_buttons|post_quiz_app|post_valentine_game|post_countdown_timer|post_login_form|post_page_full_width|post_profile_card)\.png"') {
        
        $isCorrect = $false
        if ($baseName -eq "javascript-todo-app" -and $content -match "todo-app.png") { $isCorrect = $true }
        if ($baseName -eq "javascript-calculator" -and $content -match "calculator.png") { $isCorrect = $true }
        if ($baseName -eq "responsive-portfolio-website" -and $content -match "portfolio-site.png") { $isCorrect = $true }
        if ($baseName -eq "javascript-countdown-timer" -and $content -match "countdown-timer.png") { $isCorrect = $true }
        if ($baseName -eq "javascript-password-generator" -and $content -match "password-generator.png") { $isCorrect = $true }
        if ($baseName -eq "javascript-quiz-app" -and $content -match "quiz-app.png") { $isCorrect = $true }
        if ($baseName -eq "valentine-fun-game" -and $content -match "valentine-game.png") { $isCorrect = $true }
        if ($baseName -eq "responsive-nav-menu" -and $content -match "nav-menu.png") { $isCorrect = $true }
        if ($baseName -eq "css-animated-login-form" -and $content -match "login-form.png") { $isCorrect = $true }
        if ($baseName -eq "css-glassmorphism-card" -and $content -match "glass-card.png") { $isCorrect = $true }
        if ($baseName -eq "css-animated-buttons" -and $content -match "css-buttons.png") { $isCorrect = $true }
        if ($baseName -eq "javascript-pricing-calculator" -and $content -match "pricing-calculator.png") { $isCorrect = $true }
        if ($baseName -eq "css-pricing-cards" -and $content -match "pricing-cards.png") { $isCorrect = $true }
        if ($baseName -eq "css-profile-card-flip" -and $content -match "profile-card.png") { $isCorrect = $true }
        if ($baseName -eq "responsive-sidebar-menu" -and $content -match "sidebar-menu.png") { $isCorrect = $true }
        if ($baseName -eq "javascript-form-validation" -and $content -match "form-validation.png") { $isCorrect = $true }
        if ($baseName -eq "javascript-image-slider" -and $content -match "image-slider.png") { $isCorrect = $true }
        if ($baseName -eq "css-dark-mode-toggle" -and $content -match "dark-mode-toggle.png") { $isCorrect = $true }

        if ($isCorrect) {
            # Skip update
        } else {
            Write-Host "Updating $($file.Name) to use unique image: $imgName"
            $newContent = $content -replace 'image: "/images/posts/.*?\.png"', "image: `"/images/posts/$imgName`""
            [System.IO.File]::WriteAllText($file.FullName, $newContent)
        }
    }
}
