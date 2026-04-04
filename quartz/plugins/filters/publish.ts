import { QuartzFilterPlugin } from "../types"

export const FilterPublishTag: QuartzFilterPlugin = () => ({
  name: "FilterPublishTag",
  shouldPublish(_ctx, [_tree, vfile]) {
    const frontmatter = vfile.data?.frontmatter
    const tags = frontmatter?.tags

    // Check if frontmatter tags exist and contain 'Publish' (case-insensitive)
    if (Array.isArray(tags)) {
      return tags.some((tag: string) => tag.toLowerCase() === "publish")
    }

    return false
  },
})