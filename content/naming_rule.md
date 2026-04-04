---
refinement: refined
title: ファイルとフォルダの命名規則
---
#Software #StyleGuideLine #Blog #Publish

# ファイルとフォルダの命名規則

### 目的
十分な情報をわかり易く表すことができる。多くの記録媒体,OSでファイル名が変わらない。ディレクトリ構造が保たれる。
### 基本形

```
foo{_bar}_v<major>-<minor>-p<patch>-b<build>-r<revision>_<YYYY-MM-DD>.<ext>
```
### 例
- `abc_defg_123_v1-1-b1_2026-02-10.txt`
- `pcb_fpc_jlc_v1-1-p12_2026-11-22.tar.gz`
- `passion_v3-1`
### 詳細

- 使用可能なのは、英数字(小文字)のみ。記号は「-」「_」のみ[^1]
	- a - z , 0 - 9 , - , _
	- 拡張子限定でピリオド「.」で区切るのはOK
	- フォルダ名は一単語限定で大文字から始めることを許す
- 年月日表記：`YYYY-MM-DD`[^2]
	- 時間をつける場合は
		- `YYYY-MM-DDThh-mm-ssPTTTT`
		- 例
			- 2025-09-11T13-12-11P0900
				- 2025年9月11日13時12分11秒UTC+09:00
			- 2025-09-11T13-12-11Z
				- 2025年9月11日13時12分11秒協定世界時
- Version表記：`v<major>-<minor>-p<patch>-b<build>-r<revision>` [^3]
	- minor以降はその数字が何を表すかを接頭辞として追加する
		- patch : p
		- build : b
		- revision : r
- 名前の長さ：64文字以内[^4]
- フルパスの長さ：240文字以内[^5]
- その他
	- 先頭8文字が同じファイル・フォルダを同一フォルダ内に作らない[^6]
	- 予約語の禁止[^7]
	- 1プロジェクトにつき8階層まで[^8]
	- 他所から持ってきたファイル・フォルダ名を無理に変更しない[^9]

## 参考
[ROS C++ スタイルガイド](https://wiki.ros.org/ja/CppStyleGuide)
[命名規則についてまとめてみた（キャメルケース、パスカルケース、スネークケース、ケバブケース, etc...）- Qiita](https://qiita.com/shota0616/items/4ac7a8696b3f6ccbe2bc)
[個人用ディレクトリ・ファイルの命名規則 - あしあと](https://pyohei.hatenablog.com/entry/2019/02/06/071620)
[プロジェクトとディレクトリの命名規則ガイド](https://zenn.dev/glound/articles/1a6728a746f87d)
[ISO 9660 - Wikipedia](https://ja.wikipedia.org/wiki/ISO_9660)
[ファイルとフォルダの命名規則 2025](https://zenn.dev/kkzk/articles/2025-05-10_fogy-naming-conventions)
[はじめに  pep8-ja 1.0 ドキュメント](https://pep8-ja.readthedocs.io/ja/latest/#section-20)
[ISO 8601 - Wikipedia](https://ja.wikipedia.org/wiki/ISO_8601)
[バージョンにあれこれ名前を巡らせてみた - Qiita](https://qiita.com/t_nakayama0714/items/c312bc5edcce6c214856)
[とほほのセマンティックバージョニング入門 - とほほのWWW入門](https://www.tohoho-web.com/ex/semver.html)
[大文字と小文字を区別 | Microsoft Learn](https://learn.microsoft.com/ja-jp/windows/wsl/case-sensitivity)
[Jolietとは - IT用語辞典 e-Words](https://e-words.jp/w/Joliet.html)
[ISO9660 と Joliet の情報交換 せんべえ焼き、もしくはコースターメーカー](http://senbee.seesaa.net/article/46341135.html)
[9.1.1 使用できない文字\<Windows用/Solaris用>](https://software.fujitsu.com/jp/manual/manualfiles/m140026/j2ul1987/01z200/j1987-00-09-01-01.html)
[Google C++ スタイルガイド(日本語訳) Google C++ Style Guide (Japanese)](https://ttsuki.github.io/styleguide/cppguide.ja.html)



[^1]: Windowsは大文字小文字を区別しない。しかしLinuxは区別する。URL表記とUrl表記が混ざったとき問題となる。で略語をルールを決めるか略語も通常と同じルールにする方がいい。理由はルールが少なくできることと、なるべく命名規則を混在(現状スネークケース+ケバブケース)させたくないから。また、その他記号はWindowsで使えないことがあるし、環境依存文字や日本語、絵文字は環境によって表示方法が変わることがある。[大文字と小文字を区別 | Microsoft Learn](https://learn.microsoft.com/ja-jp/windows/wsl/case-sensitivity)

[^2]: ISO8601になるべく準拠した。年月日は完全準拠したが、時間は「.」を使えないので、ハイフンを使用した。[ISO 8601 - Wikipedia](https://ja.wikipedia.org/wiki/ISO_8601)

[^3]: セマンティックバージョニングの記法になるべく準拠した。「.」を使えないので、ハイフンを使用した。また、マイナーバージョン以降に何を記載するか様々なので意味を示すために接頭辞をつけることにした。[バージョンにあれこれ名前を巡らせてみた - Qiita](https://qiita.com/t_nakayama0714/items/c312bc5edcce6c214856)[とほほのセマンティックバージョニング入門 - とほほのWWW入門](https://www.tohoho-web.com/ex/semver.html)

[^4]: Joliet の「ファイル名1要素の上限」が基本 64Unicode文字だから。基本RockRidgeとJolietの積集合を取ろうとしてるので、Jolietのほうが厳しいので合わせてる。[Jolietとは - IT用語辞典 e-Words](https://e-words.jp/w/Joliet.html)[ISO 9660 - Wikipedia](https://ja.wikipedia.org/wiki/ISO_9660)

[^5]: Jolietのフルパス名上限240byte以内から。RockRidgeに制限はない。[ISO9660 と Joliet の情報交換 せんべえ焼き、もしくはコースターメーカー](http://senbee.seesaa.net/article/46341135.html)

[^6]: ISO9660(Level1)の8.3形式に直した時、先頭8文字まで同一だとエンコーダによっては同一ファイルとなってしまうかもしれない。[ISO 9660 - Wikipedia](https://ja.wikipedia.org/wiki/ISO_9660)

[^7]: OSによってファイル名に使用できない文字がある。特にWindows。[9.1.1 使用できない文字\<Windows用/Solaris用>](https://software.fujitsu.com/jp/manual/manualfiles/m140026/j2ul1987/01z200/j1987-00-09-01-01.html)

[^8]: ISO9660ではフォルダ階層は8階層までとなっている。ルートディレクトリからだと厳しいので、CD-Rに書き込む可能性のあるプロジェクト単位にしてる。また、フォルダ階層は深すぎると扱いにくいため、制限を設けた。[ファイルとフォルダの命名規則 2025](https://zenn.dev/kkzk/articles/2025-05-10_fogy-naming-conventions) [ISO 9660 - Wikipedia](https://ja.wikipedia.org/wiki/ISO_9660)

[^9]: 他所から持ってきたものを変更するなんて中途半端に終わることは最初からしない。