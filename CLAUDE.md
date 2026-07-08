# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

tachibanayu24.com - 個人プロフィールサイト。名刺のQRコードとして使用されるリンク集。
フレームワークなしの静的サイト（Pure HTML/CSS/JavaScript）。GitHub Pages でホスティング。

SEO/AEO のため、本文は `me.json` からビルド時にプリレンダー（SSG）される。多言語は別URLで配信: `/` = 日本語、`/en/` = 英語（hreflang で相互リンク）。言語トグルは URL 遷移（`/` ⇄ `/en/`）で切り替わる。

## 開発

バンドラなし。`me.json`（＋ `index.template.html`）からビルドスクリプトで HTML 等を生成する。

```bash
# me.json / テンプレート更新後、生成物（index.html, en/index.html, sitemap.xml,
# README×2, llms.txt）を再生成
node scripts/generate-docs.js

# ローカルサーバー起動（アセットは root-absolute パスなので repo root から配信）
python -m http.server 8000
```

> アセット参照は `/styles/...` `/profile/...` などの root-absolute パス（`/en/` 配下からも解決させるため）。そのため `file://` での直接オープンは不可。必ず repo root から HTTP サーバーで配信する。

### デバッグモード

URL に `#debug` を付与するとデバッグパネルが表示され、時間帯を手動で切り替えられる。
例: `http://localhost:8000/#debug`（英語版は `http://localhost:8000/en/#debug`）

## アーキテクチャ

### コンテンツ管理

- `me.json` - プロフィール情報の一元管理（多言語対応: en/ja）。meta description と JSON-LD の description は `backside.about.content` をそのまま使う（別文言を持たず陳腐化を防ぐ）。`seo` ブロックは about.content で表現できない構造化データ／メタ専用フィールド（alternateName, knowsAbout, tagline）のみ。`tagline` は llms.txt 冒頭のブロッククォート（1行ポジショニング）の唯一のソース
- `me.schema.json` - JSON スキーマ定義
- `index.template.html` - HTML のソーステンプレート（`{{TOKEN}}` をビルド時に言語別置換）。**`index.html` / `en/index.html` は生成物なので直接編集しない**
- `profile/` - プロフィール描画（`renderer.js`）、共有 HTML ビルダー（`templates.js`、ビルドと共有し構造ドリフトを防止）、言語（`language.js`）、カードフリップ（`flip.js`）、アイコン（`icons.js`）、エントリ（`index.js`）
- `card-effects.js` - カードの 3D チルト等の演出

### 背景アニメーションシステム (`background/`)

Canvas ベースの動的背景。ローカル時刻に応じて自動で変化する。

```
background/
├── index.js          # エントリーポイント、状態管理
├── config.js         # 全体設定（パーティクル数、色、サイズなど）
├── colors.js         # 時間帯別カラーパレット
├── time.js           # 時間帯判定（MORNING/NOON/EVENING/NIGHT）
├── particles.js      # 光の玉（bokeh）パーティクル
├── debug.js          # デバッグパネル
├── renderer/
│   ├── index.js      # BackgroundRenderer クラス（アニメーションループ）
│   ├── canvas.js     # Canvas ユーティリティ
│   ├── gradient.js   # 背景グラデーション
│   ├── celestial.js  # 太陽/月の描画
│   └── shapes.js     # 抽象的な幾何学図形
└── effects/
    ├── base-effect.js      # エフェクト基底クラス
    ├── morning-mist.js     # 朝：朝靄
    ├── god-rays.js         # 昼：太陽光線
    ├── dust-particles.js   # 昼：光の粒子
    ├── evening-clouds.js   # 夕：雲
    └── firefly.js          # 夜：蛍
```

**時間帯と演出:**

| 時間帯  | 時間        | 主な演出           |
| ------- | ----------- | ------------------ |
| MORNING | 5:00-11:00  | 朝靄、柔らかい光   |
| NOON    | 11:00-17:00 | 太陽光線、光の粒子 |
| EVENING | 17:00-20:00 | 夕焼け、雲         |
| NIGHT   | 20:00-5:00  | 夜空、蛍           |

### レイヤー構造

2つの Canvas レイヤー:

1. `bg-canvas` (z-index: -2) - グラデーション、太陽/月、図形、パーティクル
2. `overlay-canvas` (z-index: -1) - 時間帯別エフェクト

### サイト・ドキュメント自動生成

`me.json` / `index.template.html` / 共有モジュール（`profile/templates.js`, `profile/icons.js`）を更新して main に push すると、GitHub Actions で以下が自動再生成・コミットされる。

- 生成物: `index.html`（ja）, `en/index.html`（en）, `sitemap.xml`, `README.md`, `README.ja.md`, `llms.txt`
- ワークフロー: `.github/workflows/generate-docs.yml`
- スクリプト: `scripts/generate-docs.js`

リンクアイコンはビルド時に Simple Icons から取得してインライン SVG として焼き込む（実行時の外部 CDN 依存なし）。`sitemap.xml` の `lastmod` は `me.json` のコミット日を使う（内容非変更の手動実行で無駄な差分を出さないため）。
