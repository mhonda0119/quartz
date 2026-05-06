import { readdir, readFile, copyFile, mkdir, rm } from "fs/promises"
import { existsSync, statSync, createWriteStream } from "fs"
import { join, relative, dirname, basename, extname } from "path"

const OBSIDIAN_VAULT = "Z:/obsidian/note"
const CONTENT_DIR = "content"

async function hasPublishTag(filePath) {
  try {
    const content = await readFile(filePath, "utf-8")
    // Check frontmatter tags
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1]
      const tagsMatch = frontmatter.match(/tags:\s*\n?\s*[\-\[\]]?\s*([\s\S]*?)(?=\n\w+:|\n---|$)/i)
      if (tagsMatch && tagsMatch[1].toLowerCase().includes("publish")) {
        return true
      }
      // Also check inline tags in frontmatter
      if (frontmatter.match(/tags:\s*\[.*Publish.*\]/i)) {
        return true
      }
    }
    // Check inline #Publish tag
    if (content.includes("#Publish") || content.includes("#publish") || content.includes("#PUBLISH")) {
      return true
    }
    return false
  } catch {
    return false
  }
}

async function findFileInVault(fileName, vaultRoot, extensions = null) {
  async function searchDir(dir) {
    if (!existsSync(dir)) return null
    
    const entries = await readdir(dir)
    for (const entry of entries) {
      if (entry.startsWith(".")) continue
      
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        const found = await searchDir(fullPath)
        if (found) return found
      } else {
        const nameMatch = entry.toLowerCase() === fileName.toLowerCase()
        const extMatch = extensions ? extensions.includes(extname(entry).toLowerCase()) : true
        if (nameMatch && extMatch) {
          return fullPath
        }
      }
    }
    return null
  }
  
  return await searchDir(vaultRoot)
}

async function copyReferencedFiles(mdFilePath, contentSubDir, vaultRoot, copiedFiles) {
  try {
    const content = await readFile(mdFilePath, "utf-8")
    
    // Match Obsidian links: ![[file.png|width]] or ![[file.pdf]] or [[file.pdf]]
    const obsidianLinkRegex = /!?\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/gi
    // Match markdown links: ![alt](path/file.png) or [text](path/file.pdf)
    const markdownLinkRegex = /!?\[([^\]]*)\]\(([^)]+)\)/gi
    
    const assetExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp', '.ico', '.pdf', '.zip', '.mp4', '.mov', '.avi']
    let match
    const mdDir = dirname(mdFilePath)
    
    // Process Obsidian links
    while ((match = obsidianLinkRegex.exec(content)) !== null) {
      let fileName = match[1].trim()
      // Remove size suffix like |214
      if (fileName.includes("|")) {
        fileName = fileName.split("|")[0].trim()
      }
      
      // Search in same directory as markdown file first, then vault root
      let foundPath = null
      const localPath = join(mdDir, fileName)
      if (existsSync(localPath)) {
        foundPath = localPath
      } else {
        foundPath = await findFileInVault(fileName, vaultRoot, assetExtensions)
      }
      
      if (foundPath) {
        const relPath = relative(vaultRoot, foundPath)
        const contentFilePath = join(CONTENT_DIR, relPath)
        
        if (!copiedFiles.has(contentFilePath)) {
          const contentFileDir = dirname(contentFilePath)
          await mkdir(contentFileDir, { recursive: true })
          await copyFile(foundPath, contentFilePath)
          console.log(`    📎 ${relPath}`)
          copiedFiles.add(contentFilePath)
        }
      }
    }
    
    // Process markdown links
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      let filePath = match[2].trim()
      filePath = decodeURIComponent(filePath)
      
      // Remove anchor if present
      if (filePath.includes("#")) {
        filePath = filePath.split("#")[0]
      }
      
      // Skip external links
      if (filePath.startsWith("http://") || filePath.startsWith("https://")) continue
      
      // Resolve relative path
      let fullPath
      if (!filePath.startsWith("/") && !filePath.match(/^[a-zA-Z]:/)) {
        fullPath = join(mdDir, filePath)
      } else {
        fullPath = join(vaultRoot, filePath)
      }
      
      if (existsSync(fullPath) && statSync(fullPath).isFile()) {
        const relPath = relative(vaultRoot, fullPath)
        const contentFilePath = join(CONTENT_DIR, relPath)
        
        if (!copiedFiles.has(contentFilePath)) {
          const contentFileDir = dirname(contentFilePath)
          await mkdir(contentFileDir, { recursive: true })
          await copyFile(fullPath, contentFilePath)
          console.log(`    📎 ${relPath}`)
          copiedFiles.add(contentFilePath)
        }
      }
    }
  } catch (err) {
    console.error(`  ⚠ Error copying referenced files from ${mdFilePath}: ${err.message}`)
  }
}

async function cleanContentDir() {
  console.log("Cleaning content directory...")
  if (existsSync(CONTENT_DIR)) {
    // Remove everything except .gitkeep
    const entries = await readdir(CONTENT_DIR)
    for (const entry of entries) {
      if (entry === ".gitkeep") continue
      const fullPath = join(CONTENT_DIR, entry)
      await rm(fullPath, { recursive: true, force: true })
    }
  } else {
    await mkdir(CONTENT_DIR, { recursive: true })
  }
}

async function syncFiles() {
  console.log("Syncing published content from Obsidian Vault...")

  // Clean content directory first
  await cleanContentDir()

  const copiedFiles = new Set()

  async function processDir(vaultDir, contentSubDir) {
    const entries = await readdir(vaultDir)
    for (const entry of entries) {
      // Skip hidden folders and copilot folder
      if (entry.startsWith(".") || entry === "copilot" || entry === "templates" || entry === "private") {
        continue
      }

      const vaultPath = join(vaultDir, entry)
      const contentPath = join(contentSubDir, entry)

      if (statSync(vaultPath).isDirectory()) {
        await mkdir(contentPath, { recursive: true })
        await processDir(vaultPath, contentPath)
      } else if (entry.endsWith(".md")) {
        const hasPublish = await hasPublishTag(vaultPath)
        if (hasPublish) {
          await copyFile(vaultPath, contentPath)
          console.log(`  ✓ ${relative(CONTENT_DIR, contentPath)}`)
          
          // Copy files referenced in this published markdown file
          await copyReferencedFiles(vaultPath, contentSubDir, OBSIDIAN_VAULT, copiedFiles)
        }
      }
    }
  }

  await processDir(OBSIDIAN_VAULT, CONTENT_DIR)
  console.log("Sync complete!")
}

syncFiles().catch(console.error)