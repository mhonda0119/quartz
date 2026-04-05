import { readdir, readFile, copyFile, mkdir } from "fs/promises"
import { existsSync, statSync } from "fs"
import { join, relative, dirname, basename } from "path"

const OBSIDIAN_VAULT = "C:/Users/mhonda0119/Documents/Obsidian/Note"
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

async function findImageInVault(imageName, vaultRoot) {
  const imageExt = /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i
  
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
      } else if (imageExt.test(entry)) {
        // Match by filename only (ignore path prefix in Obsidian link)
        if (entry.toLowerCase() === imageName.toLowerCase() || 
            entry.toLowerCase() === basename(imageName).toLowerCase()) {
          return fullPath
        }
      }
    }
    return null
  }
  
  return await searchDir(vaultRoot)
}

async function copyReferencedImages(mdFilePath, contentSubDir) {
  try {
    const content = await readFile(mdFilePath, "utf-8")
    const vaultRoot = OBSIDIAN_VAULT
    
    // Match Obsidian image links: ![[image.png|width]] or ![[image.png]]
    const obsidianImageRegex = /!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/gi
    // Match markdown image links: ![alt](path/image.png)
    const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/gi
    
    const imageExt = /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i
    let match
    const copiedImages = new Set()
    
    // Process Obsidian links
    while ((match = obsidianImageRegex.exec(content)) !== null) {
      let imageName = match[1].trim()
      // Remove size suffix like |214
      if (imageName.includes("|")) {
        imageName = imageName.split("|")[0].trim()
      }
      
      if (!imageExt.test(imageName)) continue
      
      const foundPath = await findImageInVault(imageName, vaultRoot)
      if (foundPath) {
        // Determine the relative path from vault root
        const relPath = relative(vaultRoot, foundPath)
        const contentImagePath = join(CONTENT_DIR, relPath)
        
        if (!copiedImages.has(contentImagePath)) {
          // Create directory if needed
          const contentImageDir = dirname(contentImagePath)
          await mkdir(contentImageDir, { recursive: true })
          
          await copyFile(foundPath, contentImagePath)
          console.log(`    📷 ${relPath}`)
          copiedImages.add(contentImagePath)
        }
      } else {
        console.log(`    ⚠ Image not found: ${imageName}`)
      }
    }
    
    // Process markdown links
    while ((match = markdownImageRegex.exec(content)) !== null) {
      let imagePath = match[2].trim()
      imagePath = decodeURIComponent(imagePath)
      
      if (!imageExt.test(imagePath)) continue
      
      // If it's a relative path, resolve it relative to the markdown file
      let fullPath
      if (!imagePath.startsWith("/") && !imagePath.match(/^[a-zA-Z]:/)) {
        fullPath = join(dirname(mdFilePath), imagePath)
      } else {
        fullPath = join(vaultRoot, imagePath)
      }
      
      if (existsSync(fullPath)) {
        const relPath = relative(vaultRoot, fullPath)
        const contentImagePath = join(CONTENT_DIR, relPath)
        
        if (!copiedImages.has(contentImagePath)) {
          const contentImageDir = dirname(contentImagePath)
          await mkdir(contentImageDir, { recursive: true })
          
          await copyFile(fullPath, contentImagePath)
          console.log(`    📷 ${relPath}`)
          copiedImages.add(contentImagePath)
        }
      }
    }
  } catch (err) {
    console.error(`  ⚠ Error copying images from ${mdFilePath}: ${err.message}`)
  }
}

async function syncFiles() {
  console.log("Syncing published content from Obsidian Vault...")

  // Ensure content directory exists
  if (!existsSync(CONTENT_DIR)) {
    await mkdir(CONTENT_DIR, { recursive: true })
  }

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
          
          // Copy images referenced in this published markdown file
          await copyReferencedImages(vaultPath, contentSubDir)
        }
      }
    }
  }

  await processDir(OBSIDIAN_VAULT, CONTENT_DIR)
  console.log("Sync complete!")
}

syncFiles().catch(console.error)