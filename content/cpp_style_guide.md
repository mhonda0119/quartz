---
refinement: working
---

#Software #StyleGuideLine #Cpp #Blog #Publish 

# C++ スタイルガイド
## 参考
[Google C++ スタイルガイド(日本語全訳) Google C++ Style Guide (Japanese)](https://ttsuki.github.io/styleguide/cppguide.ja.html)
[Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html)
[ROS C++ スタイルガイド](https://wiki.ros.org/ja/CppStyleGuide)
[C++でクリーンなコードの書き方  - Qiita](https://qiita.com/elipmoc101/items/01003c82dbd2e464a071)
[コンストラクタは自動生成だとだめなのか！ #C++ - Qiita](https://qiita.com/AAsada/items/ea4c5f05e795305fe117)

## 目的
読みやすく、デバッグしやすく、メンテナンスしやすく。

## 概要
[Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html)
[ROS C++ スタイルガイド](https://wiki.ros.org/ja/CppStyleGuide)

に準拠する。

## 現状意識しているルール

上記スタイルガイドを全部読んでないので今のレベルに合わせて取り込んでいく。
- 全部のクラスにコンストラクタとデストラクタ定義
- クラスのインスタンス化にはスマートポインタを使う
- 標準名前空間をなるべく汚さない
- 流用できそうな機能は名前空間で区別
- overrideする関数には必ずoverride修飾子つける
- enumじゃなくてenum structを使う
- 関数ならstaticより無名名前空間（そうでもないか）
- コンストラクタは初期化リスト使う
- HandleTypeDefはポインタ変数で定義
- ~Parameterは全てポインタで渡す
- interfaceはメンバ変数持たない
- 標準ライブラリ、システムライブラリは<>で上に、自作のは下に" "でincludeする
