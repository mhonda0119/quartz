# Obsidian Vault 直接公開 - Quartz カスタマイズ計画

## 概要

Obsidian vault内のノートに`#publish`タグを付けるだけで、公開対象をフィルタリングし、関連する画像やファイルだけを出力する仕組みを実装する。

## 必要なカスタマイズ一覧

### 1. カスタムフィルタプラグイン: `FilterPublishTag`

- **目的**: `#publish`タグ（frontmatterの`tags`またはinlineタグ）を持つノートだけを公開対象にする
- **場所**: `quartz/plugins/filters/publish.ts`（新規作成）
- **動作**:
  - Frontmatterの`tags`配列に`publish`が含まれているかチェック
  - または、Markdown本文内に`#publish`タグが含まれているかチェック
  - どちらか一方でもあれば公開対象として通過させる

### 2. カスタムエミッタプラグイン: `FilteredAssets`

- **目的**: 公開対象ノートから参照されている画像やPDFなどのアセットだけを出力する
- **場所**: `quartz/plugins/emitters/assetsFiltered.ts`（新規作成）
- **動作**:
  - 公開対象のMarkdownファイルが参照しているリンク（`![[...]]`や`[...]`）を収集
  - 参照されているファイルだけを`public`ディレクトリにコピーする
  - 参照されていないアセットは出力しない

### 3. `package.json` へのスクリプト追加

- **目的**: ユーザーが`-d`オプションを意識せずコマンドを実行できるようにする
- **変更内容**:
  ```json
  {
    "scripts": {
      "preview:vault": "quartz build --serve -d \"<vaultの絶対パス>\"",
      "publish:vault": "quartz sync -d \"<vaultの絶対パス>\""
    }
  }
  ```

### 4. `quartz.config.ts` の更新

- **目的**: 新しく作成したフィルタとエミッタを有効にする
- **変更内容**:
  - `plugins.filters`に`FilterPublishTag()`を追加
  - `plugins.emitters`の既存`Assets()`を`FilteredAssets()`に置き換え

### 5. `content/index.md` の作成（またはvault内に配置）

- **目的**: ホームページ用のノートを用意する
- **内容**: 公開記事一覧への入口となるシンプルなインデックスページ

### 6. `.github/workflows/deploy.yml` の確認・更新

- **目的**: GitHub Pagesへの自動デプロイが正しく動作するようにする
- **確認点**:
  - vaultのリポジトリ内での配置
  - ビルドコマンドが正しく実行されるか

## 実装順序

1. カスタムフィルタプラグイン `FilterPublishTag` の作成
2. カスタムエミッタプラグイン `FilteredAssets` の作成
3. `quartz.config.ts` の更新
4. `package.json` へのスクリプト追加
5. `content/index.md` の確認・作成
6. `.github/workflows/deploy.yml` の確認・更新
7. 動作確認

## 技術的な詳細

### フィルタプラグインの実装方針

Quartzのフィルタプラグインは`ProcessedContent`を受け取り、フィルタリング后的なコンテンツの配列を返す。

```typescript
import { QuartzFilterPlugin } from "../types"

export const FilterPublishTag: QuartzFilterPlugin = () => ({
  name: "FilterPublishTag",
  shouldPublish(ctx, content) {
    // frontmatterのtagsをチェック
    // inlineタグをチェック
    // どちらかにpublishがあればtrueを返す
  }
})
```

### エミッタプラグインの実装方針

既存の`Assets`エミッタを参考にして、公開対象ファイルから参照されているアセットだけを収集・出力する。

```typescript
import { QuartzEmitterPlugin } from "../types"

export const FilteredAssets: QuartzEmitterPlugin = () => ({
  name: "FilteredAssets",
  async emit(ctx, content, resources) {
    // 公開対象のMarkdownファイルから参照リンクを抽出
    // 参照されているファイルだけを出力
  }
})