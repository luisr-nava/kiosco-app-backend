const fs = require('fs');
const path = require('path');

function removeSwaggerFromFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remove Swagger imports
  const swaggerImportRegex = /^import\s+\{[^}]*\}\s+from\s+['"]@nestjs\/swagger['"];?\s*$/gm;
  if (swaggerImportRegex.test(content)) {
    content = content.replace(swaggerImportRegex, '');
    modified = true;
  }

  // Remove mixed imports (cuando swagger está junto con otros imports)
  const mixedImportRegex = /^import\s+\{([^}]*)\}\s+from\s+['"]@nestjs\/swagger['"];?\s*$/gm;
  content = content.replace(mixedImportRegex, (match, imports) => {
    const importList = imports.split(',').map(i => i.trim()).filter(i => i);
    const nonSwaggerImports = importList.filter(i =>
      !i.startsWith('Api') &&
      !i.includes('DocumentBuilder') &&
      !i.includes('SwaggerModule')
    );

    if (nonSwaggerImports.length === 0) {
      modified = true;
      return '';
    } else if (nonSwaggerImports.length < importList.length) {
      modified = true;
      return `import { ${nonSwaggerImports.join(', ')} } from '@nestjs/swagger';`;
    }
    return match;
  });

  // Remove Swagger decorators (@Api*) - including multiline
  const decoratorPatterns = [
    // Decoradores de clase
    /@ApiTags\([^)]*\)\s*/gs,
    /@ApiBearerAuth\([^)]*\)\s*/gs,

    // Decoradores de método (con soporte multilinea)
    /@ApiOperation\(\{[\s\S]*?\}\)\s*/gs,
    /@ApiResponse\(\{[\s\S]*?\}\)\s*/gs,
    /@ApiParam\(\{[\s\S]*?\}\)\s*/gs,
    /@ApiQuery\(\{[\s\S]*?\}\)\s*/gs,
    /@ApiBody\(\{[\s\S]*?\}\)\s*/gs,

    // Decoradores de propiedad (en DTOs)
    /@ApiProperty\(\{[\s\S]*?\}\)\s*/gs,
    /@ApiPropertyOptional\(\{[\s\S]*?\}\)\s*/gs,
  ];

  decoratorPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });

  // Remove empty lines (más de 2 líneas vacías consecutivas)
  content = content.replace(/\n\n\n+/g, '\n\n');

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function processDirectory(dir) {
  let filesModified = 0;

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !filePath.includes('node_modules')) {
        walkDir(filePath);
      } else if (file.endsWith('.ts')) {
        if (removeSwaggerFromFile(filePath)) {
          console.log(`✓ ${filePath}`);
          filesModified++;
        }
      }
    });
  }

  walkDir(dir);
  return filesModified;
}

const srcDir = path.join(__dirname, 'src');
console.log('🔍 Eliminando Swagger de archivos TypeScript...\n');
const modified = processDirectory(srcDir);
console.log(`\n✅ ${modified} archivos modificados`);
