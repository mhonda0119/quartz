import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"
import { slugTag } from "../../util/path"

export const InlineTagsToFrontmatter: QuartzTransformerPlugin = () => ({
  name: "InlineTagsToFrontmatter",
  markdownPlugins() {
    return [
      () => {
        return (tree: Root, file) => {
          // Tag regex - matches tags at start of line, after space, or after newline
          const tagRegex = /(?<=^|\n| )#((?:[-_\p{L}\p{Emoji}\p{M}\d])+(?:\/[-_\p{L}\p{Emoji}\p{M}\d]+)*)/gu
          
          // Collect tags and remove them from text nodes
          visit(tree, "text", (node, index, parent) => {
            if (!node.value) return
            
            const tags: string[] = []
            // Find and collect all tags, remove them from text
            const newText = node.value.replace(tagRegex, (_match, tag: string) => {
              // Check if the tag only includes numbers and slashes
              if (/^[\/\d]+$/.test(tag)) {
                return _match
              }
              tags.push(slugTag(tag))
              return "" // Remove the tag from text
            })
            
            // Clean up extra spaces
            const cleanedText = newText.replace(/  +/g, " ").replace(/^ +/, "").replace(/ +$/, "")
            
            if (tags.length > 0) {
              // Add tags to frontmatter
              if (file.data.frontmatter) {
                const noteTags = file.data.frontmatter.tags ?? []
                file.data.frontmatter.tags = [...new Set([...noteTags, ...tags])]
              }
              
              // Update the text node
              node.value = cleanedText
            }
          })
        }
      },
    ]
  },
})