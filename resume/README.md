<style>
    @media print {
        h1:not([id]) {
            display: none;
        }
        .no-print {
            display: none;
        }
    }
    th {
     background-color: #f6f8fa;
    }
    table th:first-child, table td:first-child {
        width: 100px;
    }
    button {
      border: none;
      padding: 2px 8px;
      font-size: 0.75rem;
      border-radius: 4px;
    }
</style>

<button onclick="window.print()" class="no-print">Download as PDF</button>
<button onclick="location.href='https://raw.githubusercontent.com/tachibanayu24/tachibanayu24/refs/heads/main/resume/README.md'" class="no-print">Download as Markdown</button>

# 職務経歴書 

* 更新日: 2024-12-15
* 氏名: 立花優斗

## 要約

2018年に新卒でNTTコムウェア株式会社に企画職で入社し、主に官公庁に向けドローンやXR、自動運転領域の先端技術応用提案などに従事しました。  
その後ソフトウェアエンジニアとして複数組織で様々な領域のサービス開発に取り組みました。組織開発や採用、育成、技術戦略立案、品質管理、PM、PdM、開発責任者など幅広く取り組みました。
現在は、株式会社ディー・エヌ・エーで医療系サービスのPMとして、企画やビジネスモデル検討、関係者感調整から体験設計、ロードマップ設計などの工程に取り組んでいます。

## 職務経歴

### 株式会社ディー・エヌ・エー: 2022-10 - 現在

* 事業内容: モバイル向けゲーム関連サービス事業 他
* 従業員数:  2,897名（2024-03末）

#### 健診システムの開発

| label | detail |
| ----- | ------ |
| 概要 | 医療法人を持つ協業先に導入予定の健診システム(管理機能・ユーザー向け機能)の開発。 |
| 業務内容 | フロントエンドチームのテックリード、新卒採用、育成（メンター業務） |
| 役割 | テックリード |
| 取り組み | 非常に複雑な領域のDXであるため業界理解から入り、PoC開発からこまめにすり合わせを実施し、長期的な運用を見据えメンテナビリティを考慮したアーキテクチャ検討や設計に取り組みました。取り組みはオウンドメディアで記事化しています。 [新設チームで複雑なドメイン領域に立ち向かうための取り組み](https://engineering.dena.com/blog/2023/12/junior-engineer-enablement/)  |
| 使用技術 | Turborepo, React, Remix, TypeScript, Go, MySQL, AWS, PandaCSS |

#### 医療系サービスの企画・検討・サービス設計

| label | detail |
| ----- | ------ |
| 概要 | 医療法人を持つ協業先の新規サービスの企画・PM、DX推進 |
| 業務内容 | 強力な顧客基盤とリアルアセットを持つ協業先に向け、ITに強みを持つディー・エヌ・エーとして戦略・DXコンサルティングにより |
| 役割 | PM（ビジネス職） |
| 取り組み | 主にLINEを活用した新規医療プログラムの設計や開発ディレクションやビジネスモデル検討、ベンダー選定などに取り組み、中長期的なDX戦略を検討し実行しました。現場から経営層まで全体として納得感を持って推進していけるように細やかな連携にも注力しました。 |

### 株式会社ワークサイド: 2020-10 - 2022-10

* 事業内容: 入社オンボーディングプラットフォーム「Onn」の開発
* 従業員数: 10名程度（2024-03末）

#### 入社オンボーディングプラットフォーム「Onn」の開発

| label | detail |
| ----- | ------ |
| 概要 | 入社者の早期立ち上がり、定着をサポートするHR SaaS「Onn」の開発。 |
| 業務内容 | 技術戦略立案、設計、開発、テスト、運用、PM、採用、組織開発 |
| 役割 | テックリード、開発責任者 |
| 取り組み | 一人目社員として入社しました。PoCの状態のプロダクトから製品として提供できるレベルまで拡張、高度化し、複数の上場企業などに導入するまでに至りました。ドキュメンテーションやコミュニケーションの組織文化醸成、採用業務も担当しました。 |
| 使用技術 | React, TypeScript, Node.js, NestJS, Go, MUI, Google Cloud, Firebase, Firestore |


### 株式会社pring: 2019-05 - 2020-09

* 事業内容: お金コミュニケーションアプリ「pring」の開発
* 従業員数: 当時20名程度（現在は米グーグルにより買収済み）

#### web版pringの開発 

| label | detail |
| ----- | ------ |
| 概要 | いいねの代わりに1円単位からお金を遅れるファンコミュニティ「pring team」のweb版の開発。 |
| 業務内容 | 設計、実装、テスト、運用 |
| 役割 | リーダー |
| 取り組み | アプリ版は先行リリースされておりweb版を開発。開発責任者のサポートを受けながら、技術選定やプロジェクト立ち上げを遂行し、設計からテストまで一貫して取り組みました。最終的には他メンバーも加わり、リーダーとしてプロジェクト進行をリードしました。 |
| 使用技術 | React, TypeScript, Redux, styled-components, AWS, metabase, Sentry |


### NTTコムウェア株式会社: 2018-04 - 2019-04

* 事業内容: システムインテグレーション事業
* 従業員数: 5,449名（2024-03末）

#### ドローンによるビル等設備の保守自動化SaaSの開発・検証

| label | detail |
| ----- | ------ |
| 概要 | ドローンで撮影したビルなどの設備を、SfM(Structure from Motion)により3Dモデル化し、撮影画像をDeep Learningで分析して、ビルの故障などの検出を自動化するSaaSの開発。 |
| 業務内容 | 企画補佐と検証、提案など |
| 役割 | 10名程度のチームでメンバー |
| 使用技術 | Ubuntu, HTML5, CSS3, JavaScript, Python, Docker, AWS(Cognito, DynamoDB, API Gateway, ECR, S3, Lambda, Serverless Framework) |
