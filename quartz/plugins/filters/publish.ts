import { QuartzFilterPlugin } from "../types"

export const FilterPublishTag: QuartzFilterPlugin = () => ({
  name: "FilterPublishTag",
  shouldPublish(_ctx, [_tree, vfile]) {
    const frontmatter = vfile.data?.frontmatter
    const tags = frontmatter?.tags

    // Check if tags exist and contain 'Publish' (case-insensitive)
    if (Array.isArray(tags)) {
      if (tags.some((tag: string) => tag.toLowerCase() === "publish")) {
        return true
      }
    }

    // Also check vfile.data.tags (processed tags)
    const processedTags = vfile.data?.tags
    if (Array.isArray(processedTags)) {
      if (processedTags.some((tag: string) => tag.toLowerCase() === "publish")) {
        return true
      }
    }

    // Check raw content for #Publish inline tag (case-insensitive)
    const rawContent = vfile.data?.rawFrontmatter as string | undefined
    if (rawContent) {
      const tagsMatch = rawContent.match(/tags:\s*\n?([\s\S]*?)(?=\n\w+:|$)/i)
      if (tagsMatch && tagsMatch[1].toLowerCase().includes("publish")) {
        return true
      }
    }

    // Check body content for inline #Publish tag (case-insensitive)
    const value = vfile.value as string
    if (value && value.toLowerCase().includes("#publish")) {
      return true
    }

    return false
  },
})
