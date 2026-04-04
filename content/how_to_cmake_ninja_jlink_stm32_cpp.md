---
refinement: refined
title: STM32CubeMX,VScode,C++開発環境構築
---

#CMake #Make #Makefile #Ninja #Software #Setup
#STM32 #CubeMX #Cpp #C #Howto #Blog #VSCode 
#Publish

# はじめに

誰でも知ってることを今さら追いかけるみなさんこんにちわ
みんなだけが仲間です

2026-03-13現在のSTM32マイコンの開発環境構築方法を紹介します．
この記事の目標を以下に示します．

1. CubeMXでペリフェラルの初期化コード生成
2. C++で開発できる
3. CMake+Ninjaでビルド
4. ST-LinkをJ-Linkとして使えるようにする 
5. Jlinkで書き込み＆デバッグ
6. 2-4をVSCode上で完結させる
# 目次
0.  [**時間がない**](#時間がない)
1. [**使用環境**](#使用環境)
2. [**必要なもの一覧**](#必要なもの一覧)
3. [**必要なものをそろえる**](#必要なものをそろえる)
4. [**CubeMXでペリフェラルの初期化コード生成**](#CubeMXでペリフェラルの初期化コード生成)
5. [**C++で開発できるようにする**](#C++で開発できるようにする)
6. [**CMakeとNinjaでビルド**](#CMakeとNinjaでビルド)
7. [**ST-LinkをJ-Linkとして使えるようにする**](#ST-LinkをJ-Linkとして使えるようにする)
8. [**J-Linkで書き込み＆デバッグをする**](#J-Linkで書き込み＆デバッグをする)
9. [**環境構築を簡単にする**](#環境構築を簡単にする)
10. [**おわりに**](#おわりに)
11. [**参考**](#参考)

# 時間がない

CubeMXでgenerateCodeして，同じディレクトリでこれを実行します．
中のjsonはよしなに編集してください．
[GitHub - mhonda0119/cubemx\_env\_setup: CubeMXでGenerateCodeしたものに対して，フォルダ構成整えたり，C++で開発できるようにしたり，Jlinkで書き込みできるようにしたりします． · GitHub](https://github.com/mhonda0119/cubemx_env_setup.git)

だめなときは以下を参照してください．
 [**環境構築を簡単にする**](#環境構築を簡単にする)
  
# 使用環境

- プロセッサ：Intel(R) Core(TM) i7-8650U CPU @ 1.90GHz (2.11 GHz)
- 実装 RAM：16.0 GB
- システムの種類：64 ビット オペレーティング システム、x64 ベース プロセッサ
- エディション	：Windows 11 Home
- バージョン：25H2
- OS ビルド	26200.8037
[^1]

# 必要なもの一覧

それぞれの手順で随時インストールの案内をするので，ここで立ち止まる必要はないです．
インストールのし忘れや，あとで見返すときに閲覧してください．

**マイコン関連**

- 開発対象のマイコン
	- 補足
		- 本記事では**STM32F405RGT6**を対象にします．

- ST-Link＆mini-B to typeA ケーブル
	- 補足
		- 本記事ではSTM32Nucleoシリーズに付属しているST-Linkを使います．
		- miniBはST-Link側，typeAはお使いのPCに合わせて変更してください．
	 ![[file-20260321153455126.png|214]]

- CubeMX
	- ダウンロードページ：[link](https://www.st.com/content/st_com/en/products/development-tools/software-development-tools/stm32-software-development-tools/stm32-configurators-and-code-generators/stm32cubemx.html)
	- 2023-03-13時点の私の使用バージョン：v6.16.1
	- 補足： おとなしく最新のもの(2023-03-20時点では**6.17.0**)をダウンロードしてください．

**エディター**
- VSCode
	- ダウンロードページ：[link](https://code.visualstudio.com/download)
	- 2023-03-13時点の私の使用バージョン：
		Antigravity Version: 1.20.5  
		VSCode OSS Version: 1.107.0 (user setup)  
		Commit: 4603c2a412f8c7cca552ff00db91c3ee787016ff  
		Date: 2026-03-07T01:34:20.929Z (1 wk ago)  
		Electron: 39.2.3  
		Chromium: 142.0.7444.175  
		Node.js: 22.21.1  
		V8: 14.2.231.21-electron.0  
		OS: Windows_NT x64 10.0.26200  
		Language Server CL: 879885162
	- 補足：Windowsならなんでもいい．最新のものをインストールしておけばいいです．

**拡張機能**
- Cmake Tools
- clangd
- Cortex-Debug
- C C++ extension pack

**ビルド関連**
- GCC
	- ダウンロードページ：[link](https://developer.arm.com/downloads/-/arm-gnu-toolchain-downloads)
	- 2023-03-13時点の私の使用バーション：
		- ~~arm-none-eabi-g++.exe (GNU Arm Embedded Toolchain 10.3-2021.10) 10.3.1 20210824 (release)~~
		- 15.2にしました．この記事も15.2で解説してあります．
	- 補足
		- おとなしく最新のもの(2023-03-13時点では**15.2**)をダウンロードしたほうがいいです(10.3.1だと最新のCubeMXが吐いたペリフェラルの初期化コードを一部編集する必要があります．)
		- よく紹介されているダウンロードページ[link](https://developer.arm.com/downloads/-/gnu-rm)は古いサイトなので，10.3.1までしか載っていません
- CMake
	- ダウンロードページ：[link](https://cmake.org/download/)
	- 2023-03-13時点の私の使用バージョン：4.2.3
	- 補足：
		- Binary distributions > Platform：Windows x64 Installer
		- おとなしく最新のものをダウンロードしてください．

- Ninja
	- ダウンロードページ：[link](https://github.com/ninja-build/ninja/releases)
	- 2023-03-13時点の私の使用バージョン：1.13.2
	- 補足
		- Release > 1.13.2 > ninja-win.zip
		- 公式サイト([link](https://ninja-build.org))から辿るとバイナリが直接ダウンロードできるページがありました．

**デバッグ＆書き込み関連**
- J-Link
	- ダウンロードページ：[link](https://www.segger.com/downloads/jlink/)
	- 2023-03-13時点の私の使用バーション
		- SEGGER J-Link Commander V9.22 (Compiled Feb 24 2026 12:24:28)
	- 補足
		- おとなしく最新のもの(2023-3-20時点では**9.28**)をダウンロードしたほうがいいです．

- ST Link Refresh Utility
	- ダウンロードページ：[link](https://www.segger.com/downloads/jlink#STLink_Reflash)
	- 2023-03-13時点の私の使用バージョン
		- そもそもバージョンが分かれていないです．
	- 補足
		- **Click for downloads** から素直にダウンロードしてください．

- SEGGER_RTT
	- ダウンロードページ：[link](https://github.com/SEGGERMicro/RTT/tree/main/RTT)
	- 2023-03-13の私の使用バージョン
		- Release V8.56a
	- 補足
		- **RTT > SEGGER_RTT.c / SEGGER_RTT.h / SEGGER_RTT_printf.c** をダウンロードしてください．
		- **Config > SEGGER_RTT_Conf.h**をダウンロードしてください．

- svdファイル
	- ダウンロードページ：[link](https://www.keil.arm.com/devices/)
	- 補足
		- 開発対象のデバイスを検索して，svdファイルをダウンロードしてください．

# 必要なものをそろえる

## 開発対象のマイコン＆ST-Link

各自そろえてください．
## CubeMX

1. ダウンロードする．
	ダウンロードページ[link](https://www.st.com/content/st_com/en/products/development-tools/software-development-tools/stm32-software-development-tools/stm32-configurators-and-code-generators/stm32cubemx.html)へ行き，STM32CubeMX[^2] をダウンロードしてください．
	対象OSはWindows , Versionは6.17.0 Latest(2026-03-21時点) を選択してください．
	なお，ダウンロードにはmyST(STmicroの会員制度)に登録していることが必要です．
	![[file-20260321152950797.png]]

9. インストールする．
	1. zip解凍
		![[file-20260321155555572.png|394]]
	2. 解凍したら.exeファイルを実行
		![[file-20260321155748569.png]]
	3. 画面の指示に従ってインストールします．(ここから先は**次へ**とか**承認**みたいな文言をクリックしておけば勝手にインストールされます．)
		![[file-20260321160146539.png|265]]

## VSCode
1. ダウンロードする．
	ダウンロードページ[link](https://code.visualstudio.com/download)へ行き，Win11版をダウンロードしてください．
	![[file-20260321165030059.png|351]]
2. インストールする
	画面の指示に従ってインストールします．(詳しい説明はこの記事[link](https://docs.cse.lehigh.edu/vscode/installing-vscode-win/)が分かり易かったです．)

## VSCodeの拡張機能
-  Cmake Tools
	 ![[file-20260321171710833.png|318]]
-  clangd
	![[file-20260321171759937.png|359]]
-  Cortex-Debug
	![[file-20260321171832482.png|355]]
- C C++ extension
- ![[file-20260331081021794.png|320]]
## GCC
1. ダウンロードする．
	ダウンロードページ[link](https://developer.arm.com/downloads/-/arm-gnu-toolchain-downloads)へ行き，gccコンパイラをダウンロードしてください．
	**Downloads: 15.2.Rel1 > arm-gnu-toolchain-15.2.rel1-mingw-w64-i686-arm-none-eabi.zip**
	
	![[file-20260321172609452.png|497]]

1. 解凍して適当なフォルダ置く．
	解凍して，適当なフォルダ(本記事では**C:\toolchain**)に置きます．
	(わざわざ手動でパスを通す営みに意味がないので，先の手順で.msiをダウンロードした皆さんはそのまま実行してください．)
	![[file-20260323193016236.png|519]]

##  CMake
1. ダウンロードする
	ダウンロードページ[link](https://cmake.org/download/)へ行き，Windows x64 Installerをダウンロードしてください．
	場所は，
	Binary distributions > Platform：Windows x64 Installer >cmake-4.3.0-windows-x86_64.msi
	![[file-20260323193744970.png|570]]

2. インストールする
	AgreementとNextを連打してください．
	選択肢とかも全部デフォルトでいいです．
	![[file-20260323194021013.png|333]]
	![[file-20260323194049629.png|329]]
	![[file-20260323194821322.png|334]]
	

## Ninja
1. ダウンロードする
	ダウンロードページ[link](https://github.com/ninja-build/ninja/releases)へ行き，
	Latestって書いてあるversionの，win用をダウンロードします．
	v1.13.2は，変わってるかもしれないので，そのとき一番新しいやつをダウンロードしてください．
	**ninja-build > ninja > releases > v1.13.2 > ninja-win.zip**
	
	![[file-20260323194448942.png|518]]

2. 解凍して適当なフォルダ置く．
	解凍して，適当なフォルダ(本記事では**C:\toolchain**)に置きます．
	(僕は**win_v1-13-2**とかって無駄な接尾語をつけています．皆さんはお好きにどうぞ)
	![[file-20260323231254190.png|402]]

## J-Link
1. ダウンロードする．
	ダウンロードページ[link](https://www.segger.com/downloads/jlink/)へ行き，最新のWin64bit版Installerをダウンロードしてください．
	**J-Link Software and Documentation Pack > Version(V9.28) > WIndows > 64 bit Installer**
	(バージョン表示は更新されているかもしれません)
	![[file-20260324191716236.png|509]]
2. インストールする．
	何も考えず**Next**とか**I Agree**しとけばいいです．
	![[file-20260324192445052.png|308]]

## ST Link Reflash Utility
1. ダウンロードする．
	ダウンロードページ[link](https://www.segger.com/downloads/jlink#STLink_Reflash)へ行き，最新のSTLinkReflashをダウンロードしてください．
	**ST-Link Reflash Utility > STLinkReFlash**
	(2026-03-24現在，バージョンはないですが今後追加されるかもしれません)
	![[file-20260324192721355.png]]
2. 解凍して，適当なところにおく．
	僕はダウンロードフォルダにそのまま置いといてます．
	そういうツールをためといても使い方忘れるしあったことも忘れるので．
	海馬が残っている皆さんはお好きなツール置き場に置いておけばいいと思います．

## SEGGER_RTT
1. ダウンロードする．
	ダウンロードページ[link](https://github.com/SEGGERMicro/RTT/tree/main/RTT)へ行き，最新の，
	SEGGER_RTT.c /SEGGER_RTT.h/SEGGER_printf.c/SEGGER_RTT_Conf.h
	をダウンロードしてください．
	**RTT > SEGGER_RTT.c / SEGGER_RTT.h / SEGGER_RTT_printf.c** 
	**RTT > Config > SEGGER_RTT_Conf.h**
	
	![[file-20260324193855296.png|517]]

## svdファイル
<span style="color:#999;">svdってなに</span>[^6]
1. ダウンロードする．
	ダウンロードページ[link](https://www.keil.arm.com/devices/)へ行き，開発対象のsvdファイルをダウンロードします．
	ここで検索して
	![[file-20260329175239835.png]]
	開発対象のマイコンのページへ行き，**CMSIS Pack**の<対象マイコン名>\_DFPをクリック
	![[file-20260329175326388.png|490]]
	**Download**クリック
	![[file-20260329175555435.png|489]]
	拡張子を.zipに変更．そのまま解凍して，
	**Keil.STM32F4xx_DFP.3.1.1\CMSIS\SVD**
	ここにあります．
	あとで使うんで，そのままおいとけばいいです．
	![[file-20260329182439985.png]]
	![[file-20260329182455833.png]]
# CubeMXでペリフェラルの初期化コード生成

1. プロジェクト作成
	1. **File > New Project**
		![[file-20260321160723213.png|385]]
	2. **MCU/MPU Seletor**から，自分が開発したいマイコンの型番を入力(本記事ではSTM32F405RGT6)
		![[file-20260321161053474.png|369]]
	3. 画面下部の**MCUs/MPUs List**から，開発対象のマイコンを選んで，画面右上の**Start Project**
		![[file-20260321161457893.png|455]]
	4. **Clock＆Configuration**からクロックの設定
		![[file-20260321162608083.png|461]]
	5. **Pinout＆Configuration**からペリフェラルを設定
		![[file-20260321162434699.png|461]]
	6. **Project Manager**からコードジェネレートの設定
		1. **Project**
			1. **Project Name**を入力
			2. **Toolchain / IDE**から**CMake**を選択
				![[file-20260321162852028.png|330]]
		2. **Code Generator**
			1. **STM32Cube MCU pakages and embedded software packs**
				1. **Copy only the necessary library files**を選択
					![[file-20260321163612225.png|399]]
			2. **Generated files**
				1. **Generate peripheral initialization as a pair of '.c/.h' files per peripheral**を選択
				2. **Keep User Code when re-generating**を選択
				3. **Deletepreviously generated files when not re-generated**を選択
				![[file-20260321164146997.png]]
	7. **Generate Code**でコード生成
		1. **Generate Code** を押して，コード生成
		![[file-20260321164533734.png|407]]

# C++で開発できるようにする

1. フォルダ構成を整える．
	<span style="color:#999;">フォルダ構成を整えることはC++で開発できるようにすることと何の関係もないですが、</span>
	<span style="color:#999;">同じディレクトリ構成にしてもらえると後ろの工程もスムーズにいくと思います。</span>
	rootディレクトリにapps, build, libsというフォルダをつくります．
	appsの中に，src , inc というフォルダをつくります．
	フォルダ構成はここ[link](https://joholl.github.io/pitchfork-website/#tld.libs)を参考にしました．

	```
	root
	├── apps
	    └── src
	    └── inc
	└── build
	└── libs
	```

	CubeMXでGenerateCodeしたなら，全体のフォルダ構成は以下のようになると思います．

	```
	root
	├── apps
	├── build
	├── cmake
	├── Core
	├── Drivers
	├── libs
	├── .mxproject
	├── CMakeLists.txt
	├── CMakePresets.json
	├── <project_name>.ioc
	├── startup_stm32f405xx.s
	└──  STM32F405XX_FLASH.ld
	```

2. CMakeLists.txtをいじる
	rootディレクトリに**CMakeLists.txt**があるので開いてください．
	そして，以下のように編集します．
	みなさんと僕の記述で違うところは，
	**set(CMAKE_PROJECT_NAME <project_name>)**
	の部分のみだと思います．
	各行の意味はコメントを見てみてください．

```diff
 cmake_minimum_required(VERSION 3.22)

 #
 # This file is generated only once,
 # and is not re-generated if converter is called multiple times.
 #
 # User is free to modify the file as much as necessary
 #

 # Setup compiler settings
 # C settings
 set(CMAKE_C_STANDARD 11) # C11の有効化
 set(CMAKE_C_STANDARD_REQUIRED ON) # C11を必須にする
 set(CMAKE_C_EXTENSIONS ON) # C拡張機能を有効にする

+ #--------------追記(開始)--------------
+ # C++ settings
+ set(CMAKE_CXX_STANDARD 17) # C++17の有効化
+ set(CMAKE_CXX_STANDARD_REQUIRED ON) # C++17を必須にする
+ set(CMAKE_CXX_EXTENSIONS OFF) # C++標準のみを使用する
+ #--------------追記(終了)--------------

 # Define the build type
 if(NOT CMAKE_BUILD_TYPE) # CMAKE_BUILD_TYPEが未定義の場合
     set(CMAKE_BUILD_TYPE "Debug") # Debugモードでビルドする
 endif()

 # Set the project name
+ set(CMAKE_PROJECT_NAME passion_v3-2) # 各自でプロジェクト名を設定してください

 # Enable compile command to ease indexing with e.g. clangd
 set(CMAKE_EXPORT_COMPILE_COMMANDS TRUE) # clangd用のコンパイルコマンドを生成する(compile_commands.jsonを生成する)

 # Core project settings
 project(${CMAKE_PROJECT_NAME}) # プロジェクトの名前の設定
 message("Build type: " ${CMAKE_BUILD_TYPE}) # ビルドタイプの表示

- # Enable CMake support for ASM and C languages
- enable_language(C ASM)
+ # Enable CMake support for ASM and C and C++ languages
+ #--------------追記(開始)--------------
+ enable_language(C CXX ASM) # CとCXXとASM言語を有効にする(CXXを追記)
+ #--------------追記(終了)--------------

 # Create an executable object type
 add_executable(${CMAKE_PROJECT_NAME}) # 実行可能ファイルを作成する

 # Add STM32CubeMX generated sources
 add_subdirectory(cmake/stm32cubemx) # STM32CubeMXで生成されたソースを追加する

 # Link directories setup
 target_link_directories(${CMAKE_PROJECT_NAME} PRIVATE # リンクディレクトリの設定
     # Add user defined library search paths
 )

+#-------------追記(開始)--------------
+file(GLOB_RECURSE app_src #再帰的にapp/srcディレクトリ以下のファイルを検索する
+    "apps/src/*.cc"
+    "apps/src/*.c"
+)
+file(GLOB_RECURSE libs_src #再帰的にlibsディレクトリ以下のファイルを検索する
+    "libs/*.cc"
+    "libs/*.c"
+)
+
+file(GLOB app_inc_dirs #appディレクトリ以下のincディレクトリを検索する
+  "${CMAKE_SOURCE_DIR}/apps/inc"
+)
+file(GLOB libs_inc_dirs #libsディレクトリ以下のincディレクトリを検索する
+  "${CMAKE_SOURCE_DIR}/libs/*/inc"
+)
+#--------------追記(終了)--------------

 # Add sources to executable
 target_sources(${CMAKE_PROJECT_NAME} PRIVATE # ソースの追加
     # Add user sources here 
+    ${app_src}
+    ${libs_src}
 )

 # Add include paths
 target_include_directories(${CMAKE_PROJECT_NAME} PRIVATE # インクルードパスの追加
     # Add user defined include paths
+    ${app_inc_dirs}
+    ${libs_inc_dirs}
 )

 # Add project symbols (macros)
 target_compile_definitions(${CMAKE_PROJECT_NAME} PRIVATE # マクロの追加
     # Add user defined symbols
 )

 # Remove wrong libob.a library dependency when using cpp files
 list(REMOVE_ITEM CMAKE_C_IMPLICIT_LINK_LIBRARIES ob) # obライブラリの削除

 # Add linked libraries
 target_link_libraries(${CMAKE_PROJECT_NAME} # リンクライブラリの追加
     stm32cubemx # STM32CubeMXで生成されたライブラリ

     # Add user defined libraries
 )
```

3. もう一つのCmake.Listsをいじる．
	**root > cmake > stm32cubemx > CMakeLists.txt**
	を以下のようにいじります．[^3]
	
```diff
set(MX_Application_Src
-${CMAKE_CURRENT_SOURCE_DIR}/../../Core/Src/main.c
${CMAKE_CURRENT_SOURCE_DIR}/../../Core/Src/gpio.c
${CMAKE_CURRENT_SOURCE_DIR}/../../Core/Src/adc.c
${CMAKE_CURRENT_SOURCE_DIR}/../../Core/Src/dma.c
${CMAKE_CURRENT_SOURCE_DIR}/../../Core/Src/spi.c
${CMAKE_CURRENT_SOURCE_DIR}/../../Core/Src/tim.c
${CMAKE_CURRENT_SOURCE_DIR}/../../Core/Src/usart.c
```

4. main.c , main.hを移動させる．
	main.cを**main.cc**にリネームして，**apps > src**
	main.hを **apps > inc** に移動させてください．
	<span style="color:#999;">なぜmain.hをmain.hppにしないのか．なぜmain.cをmain.cppにしないのか</span>[^5]
# CMakeとNinjaでビルド

1. CMakeでconfigure[^4]できるようにする．
	1. configureコマンドを打つ．
		ターミナルからpowershellを選択して，
		以下のコマンドを打ってみてください．
```powershell
cmake --preset Debug
```

すると，以下のようなエラーメッセージが出ると思います．
Ninjaがみつからないよってことです．
```
CMake Error: CMake was unable to find a build program corresponding 
to "Ninja".  
CMAKE_MAKE_PROGRAM is not set.
You probably need to select a different build tool.
-- Configuring incomplete, errors occurred!
```
2. Ninjaとコンパイラのパスを通す．
rootディレクトリから，**CMakePresets.json**を開いてください．
**configurePresets**の**default**を以下のように編集してください．
**environment**という項目を追加してその中の**PATH**というキーに**Ninjaとコンパイラのパス**，それから元々**winの環境変数に入っていたパス**を追加します．
(じゃあ全部winの環境変数に入れればいいじゃんというのはそのとおり．)

```diff
"name": "default",
"hidden": true,
"generator": "Ninja",
"binaryDir": "${sourceDir}/build/${presetName}",
"toolchainFile": "${sourceDir}/cmake/gcc-arm-none-eabi.cmake",
-"cacheVariables": {}
+"cacheVariables": {},
+"environment":{
+"PATH": "C:/toolchain/ninja_win_v1-13-2;C:/toolchain/arm-gnu-toolchain-15.2.rel1-mingw-w64-i686-arm-none-eabi/bin;$penv{PATH}"
+}
```

そうしたらもう一度以下のコマンドをpowershellに入力してみてください．
configureできると思います．

```powershell
cmake --preset Debug --fresh
```

こんなんがでます．成功です

```
Build type: Debug
-- The ASM compiler identification is GNU
-- Found assembler: C:/toolchain/arm-gnu-toolchain-15.2.rel1-mingw-w64-i686-arm-none-eabi/bin/arm-none-eabi-gcc.exe
-- Configuring done (9.2s)
-- Generating done (0.1s)
-- Build files have been written to: C:/<**********>/Debug
```

3. CMakeでビルドできるようにする
	以下のコマンドを入力してください．もうビルドできると思います．
```powershell
cmake --build --preset Debug --fresh
```

こんなんがでます．成功です．
	
```
[33/33] Linking C executable passion_v3-2.elf
Memory region         Used Size  Region Size  %age Used
             RAM:       17568 B       128 KB     13.40%
          CCMRAM:           0 B        64 KB      0.00%
           FLASH:       16584 B         1 MB      1.58%
```

4. clangの警告を消す．
	ビルドできるのに，VSCodeの赤波線が消えない！[^8]
	プロジェクト直下に".clangd"というファイルをつくって以下のようにしてください．
	```yaml
	CompileFlags:
	  CompilationDatabase: build/Debug
	InlayHints:
	  Enabled: Yes
	  ParameterNames: Yes
	  DeducedTypes: No
	  Designators: No
	```
	そしたら，Ctrl + Shift + Pでコマンドパレットを出して，**clangd : Restart language server**を選択してください．そしたら消えます．


# ST-LinkをJ-Linkとして使えるようにする 

1. STLinkReflashを起動する．
	ダウンロードしたフォルダの中に入っている，**STLinkReflash.exe**
	を実行します．
	こうなるので，**Accept**しておきます．
	![[file-20260329145834501.png|458]]
	そしたらこうなるのでもう一度**Accept**します．
	![[file-20260329150108503.png|456]]
2. ST-LinkをJ-Linkとして使えるようにする
	ST-Linkをパソコンに接続し，この画面で\[1]Upgrade to J-Linkを選びます．
	あとは待ってたらやってくれます．
	![[file-20260329150133591.png]]

# J-Linkで書き込み＆デバッグをする

1. J-Linkでフラッシュに書き込める＆消せるようにする
	rootディレクトリに，**.vscode**ディレクトリを作成し，
	その中に**Run_Erase_Flash.jlink**と**Run_Flash_Debug.Jlink**を作成してください．
```
root
├── .vscode
	├── Run_Erase_Flash.jlink
	├── Run_Flash_Debug.Jlink
```
	それぞれの中身をこうしてください．
	**Run_Erase_Flash.jlink**
```
	si SWD
	speed 4000
	r
	h
	// Mass erase
	erase
	
	r
	qc
```

	**Run_Flash_Debug.jlink**
	**passion_v3-2**は，自分のプロジェクト名にしといてください．
```
	// Connect
	si SWD
	speed 4000
	r
	
	// Halt, program ELF, verify
	h
	loadfile ./build/Debug/passion_v3-2.elf
	verify
	
	// Reset & run
	r
	g
	qc
```


2. SEGGER_RTTを使えるようにする．
	先ほど作った**libs**というフォルダにダウンロードした**SEGGER_RTT**のファイル達を入れます．
	以下のようにしてください．
```
	libs
	├── segger_rtt
		└── inc
			├── SEGGER_RTT_Conf.h
			├── SEGGER_RTT.h
		└── src
			├── SEGGER_RTT_printf.c
			├── SEGGER_RTT.c
```
	そしたら，ひとまず**main.cc**にincludeして，while文の中にprintfを書いておきます.
	printfの書き方が，**SEGGER_RTT_printf**となるので要注意です．あとSEGGER_RTTを使うといろんなオプションがついてくるので適当につけます．
```diff
/* USER CODE BEGIN Includes */
+#include "SEGGER_RTT.h"
/* USER CODE END Includes */
```
```diff
+int i = 0;
while (1) {
/* USER CODE END WHILE */
/* USER CODE BEGIN 3 */
+i++;
+HAL_Delay(500);
+SEGGER_RTT_printf(0, "[%sinfo%s] yatta! %d\n",
+RTT_CTRL_TEXT_BRIGHT_GREEN, RTT_CTRL_RESET, i);
  }
```

3. svdファイルを格納する．
	rootディレクトリに**Device**というフォルダをつくり，サブフォルダとして**svd**というフォルダをつくります．
	そこに先ほどダウンロードした**SVDフォルダ**の中身を入れます．
```
	root
	├── Device
		└── svd
			├── STM32F401.svd
			├── STM32F405.svd
			....
```

4. launch.jsonをつくる．
	さきほどつくった.vscodeフォルダに**launch.json**をつくります．以下の内容を書きます．
	人によって違うところを記載します．
	- project_nameのところを自分のに変えてください．
	**"executable": "./build/Debug/<project_name>.elf"** 
	- 自分の使ってるMCUの名前に変えてください．MCUの名前確認方法は？[^7]
	**"device": "STM32F405RG"**
	- 対象のファイルがあるパスを探してください．
	**"serverpath": "C:\\Program Files\\SEGGER\\JLink_V922\\JLinkGDBServerCL.exe",
            "armToolchainPath": "C:\\toolchain\\arm-gnu-toolchain-15.2.rel1-mingw-w64-i686-arm-none-eabi\\bin",**
	 **"svdFile": "${workspaceRoot}/Device/svd/STM32F405RG.svd"**
	 
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Cortex Debug",
            "cwd": "${workspaceRoot}",
            "executable": "./build/Debug/passion_v3-2.elf",
            "request": "launch",
            "type": "cortex-debug",
            "servertype": "jlink",
            "device": "STM32F405RG",
            "interface": "swd",
            "serverpath": "C:\\Program Files\\SEGGER\\JLink_V922\\JLinkGDBServerCL.exe",
            "armToolchainPath": "C:\\toolchain\\arm-gnu-toolchain-15.2.rel1-mingw-w64-i686-arm-none-eabi\\bin",
            "svdFile": "${workspaceRoot}/Device/svd/STM32F405RG.svd",
            "debuggerArgs": [
                "-iex",
                "set auto-load safe-path /",
            ],
            "runToEntryPoint": "main",
            "rttConfig": {
                "enabled": true,
                "address": "auto",
                "decoders": [
                    {
                        "port": 0,
                        "type": "console"
                    }
                ]
            }
        }
    ]
}
```


5. 書き込む．
	ST-Linkをパソコンと開発対象につなげます．そしたら，以下のコマンドを実行します．
	device名と，プロジェクトフォルダのパスは各自のもの入れてください．
	実行したらできます．
	実行途中でなんらかのaccept求められる場合はacceptしといてください．
```powershell
& "C:\Program Files\SEGGER\JLink_V922\JLink.exe" -device STM32F405RG -CommanderScript "<projectフォルダのパス>\.vscode\Run_Flash_Debug.jlink"
```
	
6. デバッグする．
	書き込んだら，VSCodeの左側にある虫ついてる再生ボタン押してください．
	![[file-20260329192907217.png|417]]
	そしたらこんな画面になると思います．
	左下のterminalリスト(?)の**RTT Ch:0 console**
	を選択してください．
	![[file-20260329194200210.png|433]]
	yatta! こうなってたら成功です．
	![[file-20260329194333053.png|446]]

# 環境構築を簡単にする
1. [**必要なものをそろえる**](#必要なものをそろえる)まで行う
2. CubeMXでgeneratecodeする
3. 僕のgithubから**cubemx_env_setup**をクローンする．
	以下のURLから，cubemx_env_setupをクローンしてください．
	[GitHub - mhonda0119/cubemx\_env\_setup: CubeMXでGenerateCodeしたものに対して，フォルダ構成整えたり，C++で開発できるようにしたり，Jlinkで書き込みできるようにしたりします． · GitHub](https://github.com/mhonda0119/cubemx_env_setup.git)
4. setup_config.jsonの書き方
	cubemx_env_setupの中には，setup.pyとsetup_config.jsonがあります．
	setup_config.jsonは自分で書かないとならないので書き方を教えます．
	**toolchain**
	- ninja_path , gcc_path , jlink_exe , jlink_gdb_server
		- それぞれのパスを書いてください．
	**language**
	- お好みでどうぞ
	**build_types**
	- あんまいじらないほうがいいと思います．
``` json
{
  "toolchain": {
    "ninja_path": "<ninja_path>",
    "gcc_path": "<gcc_path>",
    "jlink_exe": "<jlink_exe>",
    "jlink_gdb_server": "<jlink_gdb_server>"
  },
  "language": {
    "c_standard": 11,
    "cpp_standard": 17,
    "cpp_extension": ".cc"
  },
  "build_types": [
    "Debug",
    "Release"
  ]
}
```

# おわりに

CMSIS toolboxとかいうやつでCubeMXでの操作減らせそうとか
AVH-FPVとかいうやつでマイコンエミュレートできちゃいそうとか，
これ書いてるあいだに知りました．
あたまいいひとはこうゆうのすぐできるんだろうなとおもいました．

CMakeってなに．CMSISってなに．Ninjaってなに．1.5時間かけて山の中にパソコンいじりにいく意味ってなに．Makefileってなに．デバッガの使い方わかんない．†深い†ってなに．Jlinkってなに．gtestってなに．yamlってなに．リモートあり都心パソカタより強制出社山中パソカタのほうが云々．命名規則どうすんの．DIってなに．クリーンアーキテクチャ？カタカナやめて．
とかは別でやれればやります．

# 参考
[Google C++ スタイルガイド(日本語全訳) Google C++ Style Guide (Japanese)](https://ttsuki.github.io/styleguide/cppguide.ja.html#File_Names)
[CMake入門](https://zenn.dev/yoshiyasu1111/scraps/d3ad3dbb07eadf)
[【超入門】1日で理解するCmake  - Qiita](https://qiita.com/sunrise_lover/items/589c4353d9547effc74b)
[僕が考えた最強のSTM32開発環境構築 (Windows) - すずゆーのブログ](https://xsuz.github.io/blog/stm32-development-environment/)
[CMake Tutorial for Absolute Beginners - From GCC to CMake including Make and Ninja - YouTube](https://www.youtube.com/watch?v=NGPo7mz1oa4)[【Windows】CMake 導入 - Qiita](https://qiita.com/matskeng/items/c466c4751e1352f97ce6)
[CMake Presets のメモ(CMake 3.24 以降利用推奨)  - Qiita](https://qiita.com/syoyo/items/788ce506b916392b996b)
[CMake入門-基本概念と主な関数  - Qiita](https://qiita.com/sakaeda11/items/fc95f62b68a14ab861dc)
[CMake参考書紹介(2022年時点) - Qiita](https://qiita.com/imaginary_uepon/items/aafbba33c87da06b284c)
[Professional CMake: A Practical Guide - 22nd Edition](https://crascit.com/professional-cmake/)
[Arm GNU Toolchain Downloads – Arm Developer](https://developer.arm.com/downloads/-/arm-gnu-toolchain-downloads)
[cxx-pflR1: The Pitchfork Layout (PFL)](https://joholl.github.io/pitchfork-website/#tld.libs)
[cmake-presets(7) — CMake 4.2.3 Documentation](https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html#build-preset)
[Cygwin, MSYS, MSYS2, MinGW, mingw-w64, WSL, WSL2 の違い.md · GitHub](https://gist.github.com/rz7d/4e699498d339a5837f016b3108631a2b)
[VSCodeでC++のビルド環境構築メモ（Ubuntu） - Qiita](https://qiita.com/JuvenileTalk9/items/fbb09d43051995bb5350)
[WindowsにMinGW-w64をインストールする 2025年版 - Qiita](https://qiita.com/yomei_o/items/2e706a5fa3ac5ffc3a50#%E3%81%8A%E3%81%BE%E3%81%91)
[Overview - CMSIS-Toolbox](https://open-cmsis-pack.github.io/cmsis-toolbox/overview/)
[C言語で使うファイルの拡張子と役目を知る（.c .out/.exe .o .h） - Qiita](https://qiita.com/4sterisk/items/839c0cdea17bfcb83887)
[Title Unavailable \| Site Unreachable](https://aoking.hatenablog.jp/entry/20121109/1352457273)
[STM32CubeMX for STM32 Devices - CMSIS-Toolbox](https://open-cmsis-pack.github.io/cmsis-toolbox/CubeMX/)
[VSCode×Arm Keil Studioで爆速構築！次世代Cortex-M仮想開発環境【Linux対応】  - Qiita](https://qiita.com/kamajiro/items/fcec67a9cd3455fd4674)[Supported devices - ST](https://www.segger.com/supported-devices/st/?utm_source=chatgpt.com)
[githubのREADME.mdに綺麗なツリーを描きたい  - Qiita](https://qiita.com/Yohey32/items/e6d0a48cc9871caee683)
[On Board ST-Link from dev board reprogrammed as stand-alone JLink???...... - Page 1](https://www.eevblog.com/forum/projects/on-board-st-link-from-dev-board-reprogrammed-as-stand-alone-jlink/?utm_source=chatgpt.com)
[Visual Studio Code for ARM with CMake 8 SEGGER RTT - DBL](https://embedded-dbl.com/visual-studio-code-for-arm-with-cmake-8-segger-rtt/)
[たのしい組み込みCMake - Qiita](https://qiita.com/tnishinaga/items/c01dfd5f43e446653cd1)


[^1]: **設定>システム>バージョン情報**より抜粋

[^2]: 今回は開発対象のマイコンがF405RGT6STM32CubeMX2ではありません．ちなみに，STM32CubeMX2は，STM32C5シリーズという新しいマイコンを対象にしているようです．

[^3]: どうやってビルドするか事前に決めること

[^4]: 元々あったmain.cをmain.ccにしてappsディレクトリに移動したので，そのままにしておくとCore/Srcにないよ．ってなります

[^5]: Google C++  style guideに盲目的に従っています．
	[Google C++ スタイルガイド(日本語全訳) Google C++ Style Guide (Japanese)](https://ttsuki.github.io/styleguide/cppguide.ja.html#File_Names)
	"C++ files should have a `.cc` filename extension, and header files should have a `.h` extension."

[^6]:だいたいレジスタマップのこと

[^7]:[Supported devices - ST](https://www.segger.com/supported-devices/st/?utm_source=chatgpt.com)ここで自分のMCUの名前を検索してみてください．

[^8]: clangは，**compile_commands.json**というファイルを読むんですが，デフォルトではプロジェクトディレクトリのルートフォルダにあるものを読むので正しい場所を教えてあげないといけません．
