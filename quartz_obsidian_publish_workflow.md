# Obsidian → Quartz 公開手順（package.json ラッパー版）

この手順書は、次の運用を前提にしています。

- 普段の記事管理は **Obsidian のいつもの vault** で行う
- 公開したいノートに **`#publish`** を付ける
- Quartz は **vault を直接読む**
- 実行時の `-d "vaultのパス"` は **package.json の script に隠す**
- 公開対象は **`#publish` が付いたノートだけ** にする
- さらに、**その公開ノートに紐づいた画像やファイルだけ** を公開するように Quartz をカスタマイズする

---

## 1. 最終的に自分がやる普段の手順

### ローカル確認したいとき

1. Obsidian で記事を書く
2. 公開したいノートに `#publish` を付ける
3. ターミナルで次を実行する

```bash
npm run preview:vault
```

4. ローカル表示を確認する

---

### オンライン公開したいとき

1. Obsidian で記事を書く
2. 公開したいノートに `#publish` を付ける
3. ローカル確認する

```bash
npm run preview:vault
```

4. 問題なければ次を実行する

```bash
npm run publish:vault
```

5. GitHub Pages 側の反映を確認する

---

## 2. 最初に一度だけやること

以下は初回セットアップです。

### 2-1. Quartz の公開設定を済ませる

最低限、次を済ませます。

- `quartz.config.ts` の `baseUrl` を自分の公開URLに合わせる
- GitHub Pages 用の `.github/workflows/deploy.yml` を用意する
- GitHub の **Settings → Pages** で **Source = GitHub Actions** にする

通常、公開URL は次の形です。

```text
https://<GitHubユーザー名>.github.io/<リポジトリ名>
```

Quartz では、`baseUrl` はプロトコルなしで書きます。

例:

```ts
baseUrl: "yourname.github.io/quartz"
```

---

### 2-2. package.json にラッパーコマンドを追加する

`package.json` の `scripts` に、vault のパス込みコマンドを追加します。

例:

```json
{
  "scripts": {
    "preview:vault": "quartz build --serve -d \"C:/Users/yourname/ObsidianVault\"",
    "publish:vault": "quartz sync -d \"C:/Users/yourname/ObsidianVault\""
  }
}
```

### ポイント

- `preview:vault` はローカル確認用
- `publish:vault` は GitHub へ反映する用
- 以後、**自分では `-d` を打たない**

---

### 2-3. `#publish` ノートだけ通す Quartz 側の仕組みを入れる

これは標準のままでは足りません。

必要なのは次の2つです。

- **`#publish` が付いた Markdown だけを公開対象にするフィルタ**
- **公開対象ノートから参照されている画像や PDF などだけを出力する仕組み**

つまり、初回に Quartz 側をカスタマイズしておきます。

このカスタマイズが済んでいれば、以後の普段の操作は `npm run preview:vault` と `npm run publish:vault` だけで済みます。

---

### 2-4. vault 側にホームページ用のノートを用意する

Quartz は入力ディレクトリ内の `index.md` をホームページとして使います。

そのため、vault 内に公開用のホームとなる `index.md` を置きます。

例:

```md
---
title: Home
---

# Home

公開記事一覧への入口です。
```

---

## 3. 実際の運用フロー

### 3-1. 記事を書く

普段どおり Obsidian の vault に記事を書きます。

---

### 3-2. 公開したい記事に `#publish` を付ける

公開したいノートだけに `#publish` を付けます。

例:

```md
---
title: Quartz メモ
---

これは公開したい記事です。

#publish
```

---

### 3-3. ローカルで確認する

次を実行します。

```bash
npm run preview:vault
```

これで Quartz が vault を直接読み、`#publish` が付いたノートだけを対象にローカル表示します。

---

### 3-4. 問題があれば Obsidian 側で直す

修正は Quartz 側ではなく、**必ず Obsidian の元ノート側で行う** ようにします。

---

### 3-5. 公開する

ローカル確認で問題なければ次を実行します。

```bash
npm run publish:vault
```

これで GitHub に反映され、GitHub Pages 側のデプロイが走ります。

---

## 4. 自分が普段覚えておくべきこと

覚えることは実質これだけです。

### 確認

```bash
npm run preview:vault
```

### 公開

```bash
npm run publish:vault
```

### 記事側のルール

- 普段は Obsidian vault で書く
- 公開したいノートだけ `#publish` を付ける
- 修正は元ノートで行う

---

## 5. この運用の特徴

### メリット

- `content/` に手で記事を置かなくてよい
- 一時フォルダを意識しなくてよい
- `-d "vaultのパス"` を毎回打たなくてよい
- 普段の執筆は Obsidian に一本化できる

### 前提

この運用を成立させるには、Quartz 側で次のカスタム実装が必要です。

- `#publish` ノートだけ公開する
- そのノートが参照する画像や添付だけ公開する

ここが未実装のままだと、希望どおりの運用にはなりません。

---

## 6. まとめ

最終的にあなたがやる操作は、次の2つです。

### ローカル確認

```bash
npm run preview:vault
```

### オンライン公開

```bash
npm run publish:vault
```

その前にやることは、Obsidian で記事を書いて、公開したいノートに `#publish` を付けるだけです。
