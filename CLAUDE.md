# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

tachibanayu24.com - 個人プロフィールサイト。名刺のQRコードとして使用されるリンク集。
フレームワークなしの静的サイト（Pure HTML/CSS/JavaScript）。GitHub Pages でホスティング。

## 開発

ビルドツールなし。ブラウザで `index.html` を直接開くか、ローカルサーバーを使用。

```bash
# ローカルサーバー起動（任意のHTTPサーバーで可）
python -m http.server 8000
# または
npx serve .
```

### デバッグモード

URL に `#debug` を付与するとデバッグパネルが表示され、時間帯を手動で切り替えられる。
例: `http://localhost:8000/#debug`

## アーキテクチャ

### コンテンツ管理

- `me.json` - プロフィール情報の一元管理（多言語対応: en/ja）
- `me.schema.json` - JSON スキーマ定義
- `script.js` - プロフィール読み込み・レンダリング、カードフリップ、言語切り替え

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
    ├── firefly.js          # 夜：蛍
    └── rabbit-character.js # うさぎキャラクター（常時表示）
```

**時間帯と演出:**
| 時間帯 | 時間 | 主な演出 |
|--------|-------------|----------------------|
| MORNING | 5:00-11:00 | 朝靄、柔らかい光 |
| NOON | 11:00-17:00 | 太陽光線、光の粒子 |
| EVENING | 17:00-20:00 | 夕焼け、雲 |
| NIGHT | 20:00-5:00 | 夜空、蛍 |

### レイヤー構造

3つの Canvas レイヤー:

1. `bg-canvas` (z-index: -2) - グラデーション、太陽/月、図形、パーティクル
2. `overlay-canvas` (z-index: -1) - 時間帯別エフェクト
3. `rabbit-canvas` (z-index: 50) - うさぎキャラクター（カードの前面）

### README 自動生成

`me.json` を更新して main に push すると、GitHub Actions で `README.md` / `README.ja.md` が自動再生成される。

- ワークフロー: `.github/workflows/generate-readme.yml`
- スクリプト: `scripts/generate-readme.js`
