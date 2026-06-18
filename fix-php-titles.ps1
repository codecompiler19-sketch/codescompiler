$dir = "c:\Users\Computer\Desktop\github\New_codecompiler\App\src\content\tutorials"

# Map: filename => [new-title, new-description, order, group]
$fixes = @{
  "php-guide.mdx"            = @("PHP – Guide", "Welcome to CodesCompiler's complete PHP tutorial. Discover what PHP is, how it powers over 77% of the web, and start building dynamic web applications.", 1, "")
  "php-roadmap.mdx"          = @("PHP – Roadmap", "A structured PHP learning roadmap that takes you from absolute beginner to confident developer — from syntax basics to OOP, databases, and modern PHP 8 features.", 2, "")
  "php-intro.mdx"            = @("PHP – Intro", "An introduction to PHP: what it is, how it works as a server-side language, and why millions of developers choose it for building powerful web applications.", 3, "")
  "php-install.mdx"          = @("PHP – Install", "Learn how to install PHP on Windows, macOS, and Linux. Set up XAMPP, MAMP, or a standalone PHP environment and run your first local PHP script.", 4, "")
  "php-history.mdx"          = @("PHP – History", "Explore the fascinating history of PHP from Rasmus Lerdorf's Personal Home Page tools in 1994 to the modern PHP 8 powerhouse used by billions of websites.", 5, "")
  "php-features.mdx"         = @("PHP – Features", "Discover the top features that make PHP a dominant server-side language: open source, cross-platform support, database connectivity, and blazing performance.", 6, "")
  "php-syntax.mdx"           = @("PHP – Syntax", "Master PHP syntax fundamentals: how PHP scripts start, how statements end, case sensitivity rules, and how PHP embeds inside HTML documents.", 7, "")
  "php-first-program.mdx"    = @("PHP – First Program", "Write your very first PHP program! Learn to output text with echo, understand the PHP opening tag, and run PHP code live in your browser using WebAssembly.", 8, "")
  "php-comments.mdx"         = @("PHP – Comments", "Learn all three PHP comment styles: single-line, multi-line, and DocBlock comments. Discover when and why to comment your code for clarity and maintainability.", 9, "")
  "php-variables.mdx"        = @("PHP – Variables", "Variables are the building blocks of PHP programs. Learn strict naming rules, dynamic typing, variable assignment, and string interpolation with live examples.", 10, "")
  "php-echo-print.mdx"       = @("PHP – Echo/Print", "Compare PHP's echo and print output constructs. Understand their differences, performance characteristics, and when to use each in your PHP programs.", 11, "")
  "php-var-dump.mdx"         = @("PHP – var_dump", "Master PHP's var_dump() function to inspect any variable's type and value. Learn how it compares to print_r() and var_export() for effective debugging.", 12, "")
  "php-reference-vars.mdx"   = @('PHP – $ & $$ Vars', "Understand the difference between PHP variables (\$var) and variable variables (\$\$var). Learn how dynamic variable names work and when to use them safely.", 13, "")
  "php-constants.mdx"        = @("PHP – Constants", "Learn how to define PHP constants using define() and const. Discover why constants are faster than variables and how to use predefined PHP constants.", 14, "")
  "php-magic-constants.mdx"  = @("PHP – Magic Const", "Explore PHP's eight magic constants like __LINE__, __FILE__, __CLASS__, and __FUNCTION__ that change their values depending on where they are used.", 15, "")
  "php-data-types.mdx"       = @("PHP – Data Types", "PHP supports 8 primitive data types: String, Integer, Float, Boolean, Array, Object, NULL, and Resource. Master them all with practical live examples.", 16, "")
  "php-type-casting.mdx"     = @("PHP – Type Casting", "Master PHP type casting to explicitly convert values between types using (int), (float), (string), (bool), (array), and (object) cast operators.", 17, "")
  "php-type-juggling.mdx"    = @("PHP – Type Juggling", "Understand how PHP automatically converts data types behind the scenes. Learn the type juggling rules that affect comparisons, arithmetic, and logic.", 18, "")
  "php-strings.mdx"          = @("PHP – Strings", "Master PHP strings from creation and concatenation to 20+ powerful built-in string functions that supercharge your text processing skills.", 19, "")
}

foreach ($file in $fixes.Keys) {
  $path = Join-Path $dir $file
  if (Test-Path $path) {
    $content = Get-Content $path -Raw
    $title = $fixes[$file][0]
    $desc  = $fixes[$file][1]
    $order = $fixes[$file][2]
    $group = $fixes[$file][3]

    # Replace frontmatter title
    $content = $content -replace '(?m)^title:.*$', "title: `"$title`""
    $content = $content -replace '(?m)^description:.*$', "description: `"$desc`""
    $content = $content -replace '(?m)^order:.*$', "order: $order"

    # Add or update group field
    if ($group -ne "") {
      if ($content -match '(?m)^group:') {
        $content = $content -replace '(?m)^group:.*$', "group: `"$group`""
      } else {
        $content = $content -replace '(?m)^order: \d+', "order: $order`ngroup: `"$group`""
      }
    } else {
      # Remove group line if present
      $content = $content -replace '(?m)^group:.*\r?\n', ''
    }

    Set-Content -Path $path -Value $content -NoNewline
    Write-Host "Fixed: $file -> $title"
  } else {
    Write-Host "MISSING: $file"
  }
}
Write-Host "Done fixing titles!"
