# Quartz v4

> “[One] who works with the door open gets all kinds of interruptions, but [they] also occasionally gets clues as to what the world is and what might be important.” — Richard Hamming

Quartz is a set of tools that helps you publish your [digital garden](https://jzhao.xyz/posts/networked-thought) and notes as a website for free.

🔗 Read the documentation and get started: https://quartz.jzhao.xyz/

[Join the Discord Community](https://discord.gg/cRFFHYye7t)

## ノートをブログに公開する手順

### 1. Obsidianでノートに `#Publish` タグをつける

ノートの本文（フロントマターの外）に `#Publish` を記述する。

```markdown
#Publish

# ノートのタイトル
...
```

フロントマターに書く場合はこちら。

```markdown
---
tags:
  - Publish
---
```

### 2. コンテンツを同期してプッシュする

```bash
npm run publish
```

このコマンドは以下を一括実行する。

1. `#Publish` タグのついたノートを Obsidian Vault (`Z:/obsidian/note`) から `content/` へコピー
2. `git add content/` → `git commit` → `git push origin v4`

プッシュ後、CIが自動でビルド・デプロイする。

### ローカルでプレビューしたい場合

```bash
npm run preview
```

Obsidian Vault を直接参照してローカルサーバーを起動する（`content/` へのコピーは不要）。

---

## Sponsors

<p align="center">
  <a href="https://github.com/sponsors/jackyzha0">
    <img src="https://cdn.jsdelivr.net/gh/jackyzha0/jackyzha0/sponsorkit/sponsors.svg" />
  </a>
</p>
