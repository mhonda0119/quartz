---
refinement: refined
---
#AI #Obsidian #Quartz #Setup #Blog #Software 

# Obsidian → Quartz 公開手順

この手順書は、次の運用を前提にしています。
- 普段の記事管理は **Obsidian** で行う
- 公開したいノートに **`#Publish`** を付ける
- 実行時のパス指定は **package.json の script に隠す**
- 公開対象は **`#Publish` が付いたノートだけ** にする
- さらに、**その公開ノートに紐づいた画像やファイルだけ** を公開するように Quartz をカスタマイズする

---

## 1. 最終的に自分が使う普段の手順
### ローカル確認したいとき
1. Obsidian で記事を書く
2. 公開したいノートに `#Publish` を付ける
3. ターミナルで次を実行する
```bash
npm run preview
```

4. ローカル表示を確認する
---

### オンライン公開したいとき
1. Obsidian で記事を書く
2. 公開したいノートに `#Publish` を付ける
3. ローカル確認する
```bash
npm run preview
```

4. 問題なければ次を実行する
```bash
npm run publish
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

### 2-2. package.json にコマンドを追加する

`package.json` の `scripts` に、パス込みコマンドを追加します。
```json
{
  "scripts": {
    "preview": "npx quartz build --serve -d \"C:/Users/yourname/ObsidianVault\"",
    "publish": "npx quartz sync -d \"C:/Users/yourname/ObsidianVault\""
  }
}
```

### ポイント
- `preview` はローカル確認用
- `publish` は GitHub へ反映する用
- 以後、**自分は `-d` を打たなくてよい**

---

### 2-3. `#Publish` ノートだけ通す Quartz 側の仕組みを作る

これは標準のままでは足りません。
必要なのは次の2つです。
- **`#Publish` が付いた Markdown だけを公開対象にするフィルタ**
- **公開対象ノートから参照されている画像や PDF などを出力する仕組み**

つまり、以下に Quartz 側をカスタマイズしておきます。
このカスタマイズが済んでいれば、以後の普段の操作は `npm run preview` と `npm run publish` だけで済みます。
---

### 2-4. ホームページ用のノートを用意する
Quartz は入力ディレクトリ内の `index.md` をホームページとして使います。
そのため、公開用のホームとなる `index.md` を置きます。
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
普段どおり Obsidian に記事を書きます。
---

### 3-2. 公開したい記事に `#Publish` を付ける
公開したいノートだけに `#Publish` を付けます。
例:

```md
---
title: Quartz メモ
---

これは公開したい記事です。
#Publish
```

---

### 3-3. ローカルで確認する
次を実行します。
```bash
npm run preview
```

これで Quartz がノートを読み、`#Publish` が付いたノートだけを対象にローカル表示します。
---

### 3-4. 問題があれば Obsidian 側で直す
修正は Quartz 側ではなく、**必ず Obsidian の元ノートで行う** ようにします。
---

### 3-5. 公開する
ローカル確認で問題なければ次を実行します。
```bash
npm run publish
```

これで GitHub に反映され、GitHub Pages 側のデプロイが走ります。
---

## 4. 自分が普段覚えておくべきこと

覚えることは実質これだけです。
### 確認
```bash
npm run preview
```

### 公開
```bash
npm run publish
```

### 記事側のルール

- 普段は Obsidian で書く
- 公開したいノートだけ `#Publish` を付ける
- 修正は元ノートで行う

---

## 5. この運用の特徴

### メリット

- 一時フォルダを意識しなくてよい
- パスを毎回打たなくてよい
- 普段の執筆は Obsidian に一本化できる

### 前提

この運用を成立させるには、Quartz 側で次のカスタム実装が必要です。
- `#Publish` ノートだけ公開する
- そのノートが参照する画像や添付だけ公開する

ここが未実装のままだと、希望どおりの運用にはなりません。
---

## 6. まとめ
最終的にあなたが使う操作は、次の2つです。
### ローカル確認
```bash
npm run preview
```

### オンライン公開
```bash
npm run publish
```

その前に使うことは、Obsidian で記事を書き、公開したいノートに `#Publish` を付けるだけです。