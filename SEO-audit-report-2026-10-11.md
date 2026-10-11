# Izumo Soan Webサイト SEO点検レポート

**点検日**: 2026-10-11
**対象**: C:\WWW\IzumoCompany\Izumosoan（ja / en / zh の3言語、全94ページ）
**ステータス**: 全対応完了（①sitemap追加 / ②lastmod見直し / ③新記事メタ / ④点検＋en title一括短縮＋desc短縮）

---

## 1. 総合評価

| 項目 | 評価 | コメント |
|---|---|---|
| sitemap.xml | ◎ | 91 URL、各URLにhreflang 4種・lastmod・changefreq・priority完備。業界標準以上の品質 |
| robots.txt | ◎ | 全許可＋sitemap参照。問題なし |
| canonical | ◎ | 全ページ設置済み |
| hreflang | ◎ | 全ページ ja/en/zh/x-default の4言語相互リンク完備 |
| OGP / Twitter Card | ◎ | 全ページ設置済み |
| 構造化データ(JSON-LD) | ○ | 404以外の全ページに設置（404は不要なので問題なし） |
| meta description | ○ | ほぼ全ページ適正長。1ページのみ上限超過 |
| **title タグ長** | **△** | **en版の21/31ページが推奨上限(60字)超過。要改善** |

**結論**: SEO基盤は非常に良好。唯一の体系的な課題は「英語版titleの長さ」。

---

## 2. 今回実施した対応

### ① 新記事をsitemapに追加（完了）
新記事 `cafeteria-popularity.html`（ja/en/zh）の3エントリをsitemap.xmlに追加。
- lastmod=2026-10-11, changefreq=monthly, priority=0.7（既存コラムと同一形式）
- hreflang 4種の相互リンクも設定
- sitemap URL数: 88 → 91

### ③ 新記事のSEOメタ再点検（完了）
| 言語 | title | description | 対応 |
|---|---|---|---|
| ja | 46字 ✅ | 107字 ✅ | 変更なし |
| en | 139字 → **63字** | 104字 ✅ | **title短縮済み** |
| zh | 37字 ✅ | 98字 ✅ | 変更なし |

※zh descriptionは当初34字と誤検出したが、属性内の二重引用符による解析エラーで、実際は98字で適正。

---

## 3. 発見された課題と対応結果

### 課題A: 英語版 title が長すぎる → ✅ 対応完了

en版の60字超 **20ページ** のtitleを「主要キーワード | ブランド名」の形に一括短縮。
新記事en含め、**en全31ページがtitle≤60字**になった（短縮前は21ページが超過）。

<details><summary>短縮前の状態（参考）</summary>

Googleの検索結果でtitleは約60字（全角約30字）で切れる。en版は**21/31ページ**が超過。

| ページ | 現在のtitle字数 |
|---|---|
| en/column/ai-cafeteria.html | 136 |
| en/column/ai-register.html | 114 |
| en/column/cafeteria-auto-settlement.html | 112 |
| en/column/rfid-vs-ai.html | 111 |
| en/column/cafeteria-faceauth-gate.html | 106 |
| en/column/cafeteria-payment-comparison.html | 105 |
| en/column/cafeteria-queue.html | 100 |
| en/column/rfid-settlement.html | 98 |
| en/partner-newcapec.html | 97 |
| en/smart-cafeteria-ai-newmodel.html | 92 |
| en/column/cafeteria-dx.html | 88 |
| en/lp-smart-cafeteria.html | 86 |
| en/products-sitebridge.html | 83 |
| en/products-safeops.html | 74 |
| en/smart-cafeteria-ai.html | 70 |
| en/services-network-infrastructure.html | 68 |
| en/column/index.html | 64 |
| en/smart-cafeteria-weight.html | 62 |
| en/services-field-digitalization.html | 61 |
| en/services-tech-implementation.html | 61 |

</details>

- **ja（最大58字）・zh（最大57字）は元から全ページ問題なし。**

### 課題B: description 上限超過 → ✅ 対応完了
- `en/smart-cafeteria-ai-newmodel.html`: description 186字 → **158字** に短縮済み。

### 課題C: lastmod の鮮度（sitemap）→ ✅ 対応完了
- sitemapの **87エントリ** のlastmodを実ファイルの更新日に揃えた。残stale 0。

---

## 4. 実施済みアクション（2026-10-11）

1. ✅ **新記事3言語をsitemapに追加**（88→91 URL）
2. ✅ **en版titleの一括短縮**（20ページ）— en全31ページがtitle≤60字に
3. ✅ **sitemap lastmodを実ファイル更新日に更新**（87エントリ、残stale 0）
4. ✅ **en/smart-cafeteria-ai-newmodel.html の description短縮**（186→158字）
5. ✅ **新記事en titleを再調整**（63→51字）

### 今後の任意改善（未対応）
- 画像のalt属性の網羅的点検、内部リンク構造の最適化
- ページ表示速度（Core Web Vitals）の確認
- OG:title は意図的に説明的な長めの文言を維持（検索title短縮とは別運用）

---

*本レポートは静的HTML/sitemap/robotsのファイル解析に基づく。検索順位・インデックス状況の実データはGoogle Search Consoleでの確認を推奨。*
