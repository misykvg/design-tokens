import {
    readFileSync,
    writeFileSync,
    mkdirSync
} from 'fs'
import {
    join
} from 'path'
import {
    glob
} from 'glob'

class TokenResolver {
    constructor() {
        this.allTokens = {}
        this.resolvedTokens = {}
    }

    // Load tokens for specific context
    loadContextTokens(context) {
        const [brand, contextType, theme] = context.split('-')

        // Define files needed for this context
        const contextFiles = [
            'tokens/dsColors.tokens.json',
            'tokens/dsGlobals.tokens.json',
            `tokens/modeColors.${theme}.json`,
            `tokens/modeGlobals.default.json`,
            `tokens/contextColors.${contextType}.json`,
            `tokens/contextGlobals.${contextType}.json`,
            `tokens/brandColors.${brand}.json`,
            `tokens/brandGlobals.${brand}.json`,
            `tokens/${brand}${contextType.charAt(0).toUpperCase() + contextType.slice(1)}.primitives.json`
        ]

        console.log(`Loading files for ${context}:`)
        contextFiles.forEach(file => console.log(`  - ${file}`))

        for (const filePath of contextFiles) {
            try {
                if (glob.sync(filePath).length > 0) {
                    const content = readFileSync(filePath, 'utf-8')
                    const tokens = JSON.parse(content)
                    this.flattenTokens(tokens, filePath)
                } else {
                    console.warn(`File not found: ${filePath}`)
                }
            } catch (error) {
                console.warn(`Warning: Could not load ${filePath}:`, error.message)
            }
        }
    }

    // Flatten nested token structure
    flattenTokens(obj, filePath, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key

            if (value && typeof value === 'object' && '$value' in value) {
                // This is a token
                this.allTokens[fullKey] = {
                    ...value,
                    _filePath: filePath
                }
            } else if (value && typeof value === 'object') {
                // This is a group, recurse
                this.flattenTokens(value, filePath, fullKey)
            }
        }
    }

    // Resolve a token value by following references
    resolveValue(value) {
        if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
            const referencePath = value.slice(1, -1)
            const referencedToken = this.allTokens[referencePath]

            if (referencedToken) {
                return this.resolveValue(referencedToken.$value)
            } else {
                console.warn(`Warning: Reference not found: ${referencePath}`)
                return value // Return original if reference not found
            }
        }
        return value
    }

    // Resolve all ds tokens for current context
    resolveDsTokens() {
        const dsTokens = {}

        for (const [path, token] of Object.entries(this.allTokens)) {
            if (path.startsWith('ds.')) {
                const resolvedValue = this.resolveValue(token.$value)
                const pathParts = path.split('.').slice(1) // Remove 'ds' prefix

                // Store the full token info for later processing
                this.setNestedValue(dsTokens, pathParts, {
                    $type: token.$type,
                    $value: resolvedValue,
                    $description: token.$description,
                    $extensions: token.$extensions
                })
            }
        }

        return dsTokens
    }

    // Helper to set nested object values
    setNestedValue(obj, path, value) {
        let current = obj
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {}
            }
            current = current[path[i]]
        }
        current[path[path.length - 1]] = value
    }

    // Generate JavaScript tokens
    generateJSTokens(dsTokens) {
        const jsTokens = {}

        // Recursively process the nested token structure
        this.processTokensForJS(dsTokens, jsTokens)

        return `export const tokens = ${JSON.stringify(jsTokens, null, 2)};`
    }

    // Helper to process tokens for JavaScript output
    processTokensForJS(tokens, result) {
        for (const [key, value] of Object.entries(tokens)) {
            if (value && typeof value === 'object' && '$value' in value) {
                // This is a token, extract the value
                result[key] = value.$value
            } else if (value && typeof value === 'object') {
                // This is a group, recurse
                result[key] = {}
                this.processTokensForJS(value, result[key])
            }
        }
    }

    // Generate CSS variables
    generateCSSVariables(dsTokens) {
        const cssLines = [':root {']
        this.processTokensForCSS(dsTokens, cssLines, '--ds')
        cssLines.push('}')
        return cssLines.join('\n')
    }

    // Helper to process tokens for CSS output
    processTokensForCSS(tokens, cssLines, prefix) {
        for (const [key, value] of Object.entries(tokens)) {
            if (value && typeof value === 'object' && '$value' in value) {
                // This is a token, create CSS variable
                const cssVarName = `${prefix}-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
                cssLines.push(`  ${cssVarName}: ${value.$value};`)
            } else if (value && typeof value === 'object') {
                // This is a group, recurse
                this.processTokensForCSS(value, cssLines, `${prefix}-${key}`)
            }
        }
    }

    // Generate SCSS variables
    generateSCSSVariables(dsTokens) {
        const scssLines = []
        this.processTokensForSCSS(dsTokens, scssLines, '$ds')
        return scssLines.join('\n')
    }

    // Helper to process tokens for SCSS output
    processTokensForSCSS(tokens, scssLines, prefix) {
        for (const [key, value] of Object.entries(tokens)) {
            if (value && typeof value === 'object' && '$value' in value) {
                // This is a token, create SCSS variable
                const scssVarName = `${prefix}-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
                scssLines.push(`${scssVarName}: ${value.$value};`)
            } else if (value && typeof value === 'object') {
                // This is a group, recurse
                this.processTokensForSCSS(value, scssLines, `${prefix}-${key}`)
            }
        }
    }

    // Build tokens for a specific context
    async buildContext(context) {
        console.log(`\n🔄 Building ${context}...`)

        // Clear tokens for this context
        this.allTokens = {}
        this.resolvedTokens = {}

        // Load tokens for this context
        this.loadContextTokens(context)

        console.log(`📁 Loaded ${Object.keys(this.allTokens).length} tokens for ${context}`)

        // Resolve ds tokens
        const dsTokens = this.resolveDsTokens()
        console.log(`✅ Resolved ${Object.keys(dsTokens).length} ds tokens for ${context}`)

        // Create context-specific dist directory
        const contextDir = `dist/${context}`
        mkdirSync(contextDir, {
            recursive: true
        })

        // Generate JavaScript tokens
        const jsContent = this.generateJSTokens(dsTokens)
        writeFileSync(`${contextDir}/tokens.js`, jsContent)

        // Generate CSS variables
        const cssContent = this.generateCSSVariables(dsTokens)
        writeFileSync(`${contextDir}/tokens.css`, cssContent)

        // Generate SCSS variables
        const scssContent = this.generateSCSSVariables(dsTokens)
        writeFileSync(`${contextDir}/tokens.scss`, scssContent)

        console.log(`✅ ${context} built in ${contextDir}/`)

        return dsTokens
    }

    // Build all contexts
    async buildAllContexts() {
        const contexts = [
            'vg-b2b-light',
            'vg-b2b-dark',
            'vg-b2c-light',
            'vg-b2c-dark'
        ]

        console.log('🚀 Building all contexts...')

        // Create main dist directory
        mkdirSync('dist', {
            recursive: true
        })

        const allContexts = {}

        for (const context of contexts) {
            const contextTokens = await this.buildContext(context)
            allContexts[context] = contextTokens
        }

        // Generate combined JavaScript file with all contexts
        console.log('🔄 Generating combined tokens file...')
        const combinedJsContent = `export const tokens = ${JSON.stringify(allContexts, null, 2)};`
        writeFileSync('dist/tokens.js', combinedJsContent)

        console.log('\n✅ All contexts built! Generated files:')
        console.log('  - dist/tokens.js (all contexts combined)')
        contexts.forEach(context => {
            console.log(`  - dist/${context}/tokens.js`)
            console.log(`  - dist/${context}/tokens.css`)
            console.log(`  - dist/${context}/tokens.scss`)
        })
    }
}

// Run the build
const resolver = new TokenResolver()

// Check if specific context was requested
const context = process.argv[2]
if (context) {
    resolver.buildContext(context)
} else {
    resolver.buildAllContexts()
}