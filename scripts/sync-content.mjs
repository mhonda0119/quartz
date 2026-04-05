import { readdir, readFile, copyFile, mkdir } from "fs/promises"
import { existsSync, statSync } from "fs"
import { join, relative } from "path"

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
        }
      } else if (/\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(entry)) {
        // Copy image files
        await copyFile(vaultPath, contentPath)
        console.log(`  ✓ ${relative(CONTENT_DIR, contentPath)}`)
      }
    }
  }

  await processDir(OBSIDIAN_VAULT, CONTENT_DIR)
  console.log("Sync complete!")
}

syncFiles().catch(console.error)