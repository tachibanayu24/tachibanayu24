# tachibanayu24.com 仕様書

## 概要

tachibanayu24 の名刺とかに QR コードとして入れたりするリンク集です。

## 機能

### プロフィール表示

名前や自己紹介、契約企業などが表示される。クリックで裏面にフリップする。

### 多言語対応

- 日本語 / 英語の切り替えが可能（表面・裏面それぞれにトグルボタン）
- 選択言語はブラウザに保存され、次回以降も維持される

### 時間帯連動の背景演出

訪問者のローカル時刻に応じて背景が即座に変化する。

| 時間帯 | 時間        | 雰囲気                                 |
| ------ | ----------- | -------------------------------------- |
| 朝     | 5:00-11:00  | 柔らかい朝日と清潔なベッドシーツ、朝靄 |
| 昼     | 11:00-17:00 | 澄み渡る青空と太陽の光                 |
| 夕     | 17:00-20:00 | 夕日と長く伸びる影                     |
| 夜     | 20:00-5:00  | 夜空と雲、蛍の光                       |

- UI の配色（背景、シャドウ、テキスト色）も時間帯に合わせて変化

### インタラクティブなうさぎキャラクター

背景にうさぎのキャラクターをピクセルアートで配置。時間帯に応じて動作が変わる。クリックすると反応する。

**時間帯別の動作**

| 時間帯       | 動作         |
| ------------ | ------------ |
| 朝 (MORNING) | 元気に跳ねる |
| 昼 (NOON)    | 草を食べてる |
| 夕 (EVENING) | のんびり座る |
| 夜 (NIGHT)   | 眠っている   |

---

## 技術スタック

### フレームワーク

- **Astro** - 静的サイトジェネレーター
  - SEO最適化のため、ビルド時に `public/me.json` からメタタグ・構造化データ・コンテンツを生成
  - 完全な静的HTML出力でクローラー対応

### ホスティング

- **GitHub Pages** - 静的サイトホスティング
- **GitHub Actions** - 自動ビルド＆デプロイ

---

## コンテンツ管理

### me.json

プロフィール情報は `public/me.json` で一元管理。スキーマは `public/me.schema.json` で定義。

**単一の情報源**として、以下のすべてを自動生成：

- index.html（SEO対応メタタグ、構造化データ、初期コンテンツ）
- README.md / README.ja.md

### SEO対策

**静的HTML生成**により以下を実装：

- `<title>` に「立花 優斗」を含む
- `<meta name="description">` に日本語名を含む
- Open Graph / Twitter Card メタタグ
- JSON-LD構造化データ（Schema.org Person型）
- sitemap-index.xml 自動生成
- robots.txt 配置

### 自動生成フロー

#### README生成

`public/me.json` を更新して main ブランチに push すると、GitHub Actions により `README.md` と `README.ja.md` が自動再生成される。

- ワークフロー: `.github/workflows/generate-readme.yml`
- スクリプト: `scripts/generate-readme.js`

#### サイトデプロイ

main ブランチに push すると、GitHub Actions が自動的にビルドしてデプロイ。

- ワークフロー: `.github/workflows/deploy.yml`
- 実行内容：
  1. Astro ビルド（`npm run build`）
  2. `public/me.json` から静的HTML生成
  3. GitHub Pages にデプロイ

---

## 開発者向け

### 開発コマンド

```bash
# 開発サーバー起動（ポート4321）
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

### デバッグモード

- `#debug` を URL に付与するとデバッグパネルが表示され、時間帯を手動切替可能
- 例: `http://localhost:4321/#debug`
