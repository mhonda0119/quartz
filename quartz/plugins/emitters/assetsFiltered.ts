import { FilePath, joinSegments, slugifyFilePath } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import path from "path"
import fs from "fs"
import { ProcessedContent } from "../vfile"
import { visit } from "unist-util-visit"
import { Root } from "hast"
import isAbsoluteUrl from "is-absolute-url"

// Collect all referenced files from published content
function collectReferencedFiles(content: ProcessedContent[]): Set<string> {
  const referencedFiles = new Set<string>()

  for (const [tree, vfile] of content) {
    // Collect links from a tags (wikilinks, markdown links)
    const links = vfile.data?.links ?? []
    for (const link of links) {
      referencedFiles.add(link)
    }

    // Collect media resources from img, video, audio, iframe src attributes
    visit(tree as Root, "element", (node) => {
      if (
        ["img", "video", "audio", "iframe"].includes(node.tagName) &&
        node.properties &&
        typeof node.properties.src === "string"
      ) {
        const src = node.properties.src
        // Skip external URLs
        if (!isAbsoluteUrl(src, { httpOnly: false }) && !src.startsWith("#")) {
          // Extract the file path from the src
          referencedFiles.add(src)
        }
      }
    })
  }

  return referencedFiles
}

const copyFile = async (
  directory: string,
  output: string,
  fp: FilePath,
): Promise<FilePath | null> => {
  const src = joinSegments(directory, fp) as FilePath

  // Check if source exists
  try {
    await fs.promises.access(src)
  } catch {
    return null
  }

  const name = slugifyFilePath(fp)
  const dest = joinSegments(output, name) as FilePath

  // ensure dir exists
  const dir = path.dirname(dest) as FilePath
  await fs.promises.mkdir(dir, { recursive: true })

  await fs.promises.copyFile(src, dest)
  return dest
}

export const FilteredAssets: QuartzEmitterPlugin = () => ({
  name: "FilteredAssets",
  async *emit({ argv }, content) {
    const referencedFiles = collectReferencedFiles(content)

    for (const fp of referencedFiles) {
      // Skip empty or whitespace-only paths
      if (!fp.trim()) continue
      // Skip markdown files - they're handled by content emitters
      if (fp.endsWith(".md")) continue

      const result = await copyFile(argv.directory, argv.output, fp as FilePath)
      if (result) {
        yield result
      }
    }
  },
  async *partialEmit(ctx, content, _resources, changeEvents) {
    const referencedFiles = collectReferencedFiles(content)

    for (const changeEvent of changeEvents) {
      const ext = path.extname(changeEvent.path)
      if (ext === ".md") continue

      // Check if this file is referenced by any published content
      if (!referencedFiles.has(changeEvent.path)) continue

      if (changeEvent.type === "add" || changeEvent.type === "change") {
        const result = await copyFile(ctx.argv.directory, ctx.argv.output, changeEvent.path)
        if (result) yield result
      } else if (changeEvent.type === "delete") {
        const name = slugifyFilePath(changeEvent.path)
        const dest = joinSegments(ctx.argv.output, name) as FilePath
        try {
          await fs.promises.unlink(dest)
        } catch {
          // File doesn't exist, ignore
        }
      }
    }
  },
})
