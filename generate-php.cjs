const fs = require('fs');
const path = require('path');

const sidebarText = `
PHP – Guide
PHP – Roadmap
PHP – Intro
PHP – Install
PHP – History
PHP – Features
PHP – Syntax
PHP – First Program
PHP – Comments
PHP – Variables
PHP – Echo/Print
PHP – var_dump
PHP – $ & $$ Vars
PHP – Constants
PHP – Magic Const
PHP – Data Types
PHP – Type Casting
PHP – Type Juggling
PHP – Strings
PHP – Boolean
PHP – Integers
PHP – Files & I/O
PHP – Math Func
PHP – Heredoc/Nowdoc
PHP – Compound Types
PHP – File Include
PHP – Date/Time
PHP – Scalar Types
PHP – Return Types
➕ Operators
PHP – Operators
PHP – Arithmetic Ops
PHP – Comparison Ops
PHP – Logical Ops
PHP – Assignment Ops
PHP – String Ops
PHP – Array Ops
PHP – Conditional Ops
PHP – Spread Op
PHP – Null Coalescing
PHP – Spaceship Op
🔄 Control Flow
PHP – Control Flow
PHP – Decisions
PHP – If-Else
PHP – Switch
PHP – Loops
PHP – For Loop
PHP – Foreach
PHP – While Loop
PHP – Do-While
PHP – Break
PHP – Continue
📋 Arrays
PHP – Arrays
PHP – Indexed Array
PHP – Assoc Array
PHP – Multi Array
PHP – Array Func
PHP – Const Arrays
🔧 Functions
PHP – Functions
PHP – Params
PHP – Call by Value
PHP – Call by Ref
PHP – Default Args
PHP – Named Args
PHP – Variable Args
PHP – Return Values
PHP – Pass Functions
PHP – Recursive Func
PHP – Type Hints
PHP – Scope
PHP – Strict Typing
PHP – Anonymous Func
PHP – Arrow Func
PHP – Variable Func
PHP – Local Vars
PHP – Global Vars
🌐 Superglobals
PHP – Superglobals
PHP – $GLOBALS
PHP – $_SERVER
PHP – $_REQUEST
PHP – $_POST
PHP – $_GET
PHP – $_FILES
PHP – $_ENV
PHP – $_COOKIE
PHP – $_SESSION
📁 File Handling
PHP – File Handling
PHP – Open File
PHP – Read File
PHP – Write File
PHP – File Exists
PHP – Download File
PHP – Copy File
PHP – Append File
PHP – Delete File
PHP – CSV Files
PHP – File Perms
PHP – Create Dir
PHP – List Files
🧠 OOP
PHP – OOP Basics
PHP – Classes
PHP – Constructor/Destructor
PHP – Access Mods
PHP – Inheritance
PHP – Class Const
PHP – Abstract Class
PHP – Interfaces
PHP – Traits
PHP – Static Methods
PHP – Static Props
PHP – Namespaces
PHP – Object Iteration
PHP – Encapsulation
PHP – Final Keyword
PHP – Overloading
PHP – Cloning
PHP – Anonymous Class
🌍 Web Development
PHP – Web Basics
PHP – Forms
PHP – Validation
PHP – Email/URL
PHP – Full Form
PHP – File Include
PHP – GET/POST
PHP – Upload File
PHP – Cookies
PHP – Sessions
PHP – Session Options
PHP – Send Email
PHP – Sanitize Input
PHP – PRG Pattern
PHP – Flash Msg
⚡ AJAX
PHP – AJAX Intro
PHP – AJAX Search
PHP – AJAX XML
PHP – AJAX Auto Search
PHP – AJAX RSS
📄 XML
PHP – XML Intro
PHP – Simple XML
PHP – SAX Parser
PHP – DOM Parser
🔐 Login & Integration
PHP – Login Example
PHP – Facebook Login
PHP – PayPal
PHP – MySQL Login
🚀 Advanced
PHP – MySQL
PHP – php.ini
PHP – Array Destruct
PHP – Coding Std
PHP – Regex
PHP – Error Handling
PHP – Try-Catch
PHP – Debugging
PHP – For C Devs
PHP – For Perl Devs
PHP – Frameworks
PHP – Core vs Framework
PHP – Design Patterns
PHP – Filters
PHP – JSON
PHP – Exceptions
PHP – Special Types
PHP – Hashing
PHP – Encryption
PHP – is_null()
PHP – System Calls
PHP – HTTP Auth
PHP – Swap Vars
PHP – Closure Call
PHP – Safe Unserialize
PHP – IntlChar
PHP – CSPRNG
PHP – Expectations
PHP – Use Statement
PHP – Int Division
PHP – Deprecated
PHP – Removed Ext
PHP – PEAR
PHP – CSRF
PHP – FastCGI
PHP – PDO
PHP – Built-ins
`;

const dir = path.join(__dirname, 'src/content/tutorials');
let currentGroup = '';
let order = 1;

const lines = sidebarText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

for (const line of lines) {
  if (!line.startsWith('PHP')) {
    currentGroup = line; // e.g., "➕ Operators"
    continue;
  }

  const title = line.replace('PHP – ', 'PHP \\u2013 '); // Use unicode en-dash
  const slug = line.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const fileName = `${slug}.mdx`;
  const filePath = path.join(dir, fileName);

  if (!fs.existsSync(filePath)) {
    // Generate a basic template for the missing files
    let content = `---
title: "${line.replace('PHP – ', 'PHP \\u2013 ')}"
description: "Learn about ${line.replace('PHP – ', '')} in PHP with interactive examples."
category: "php"
order: ${order}
`;

    if (currentGroup) {
      content += `group: "${currentGroup}"\n`;
    }

    content += `---

import Editor from '../../components/Editor.astro';

# ${line.replace('PHP – ', 'PHP \\u2013 ')}

Welcome to the **${line.replace('PHP – ', '')}** tutorial in PHP! In this section, we will explore how this concept works and how you can implement it in your dynamic web applications.

## Overview

(Add detailed overview and explanation here)

## Interactive Example

Test out the concept in the interactive PHP WASM editor below. Modify the code and click **Run** to see the output instantly!

<Editor 
  initialPhp={\`<?php
// Your PHP code here
echo "Exploring ${line.replace('PHP – ', '')}!";
?>\`}
  activeTab="php" 
/>

## Best Practices

- Always validate and sanitize user input.
- Keep your PHP logic separate from your HTML presentation where possible.
- Use strict comparison (\`===\`) instead of loose comparison (\`==\`).

`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Generated ${fileName}`);
  } else {
    // File exists, but we might want to update its order and group
    let existingContent = fs.readFileSync(filePath, 'utf8');
    existingContent = existingContent.replace(/^order:.*$/m, `order: ${order}`);
    
    if (currentGroup) {
      if (existingContent.match(/^group:/m)) {
        existingContent = existingContent.replace(/^group:.*$/m, `group: "${currentGroup}"`);
      } else {
        existingContent = existingContent.replace(/^order:.*$/m, `order: ${order}\ngroup: "${currentGroup}"`);
      }
    } else {
      // Remove group if there is none
      existingContent = existingContent.replace(/^group:.*\r?\n/m, '');
    }
    fs.writeFileSync(filePath, existingContent, 'utf8');
  }

  order++;
}

console.log('Finished generating all missing PHP tutorial files!');
