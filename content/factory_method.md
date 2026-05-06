---
refinement: working
---
#DesignPattern #GOF #Software #Blog #Publish 


# Factory Method

<ul>
    <li><a href="#1-目的">1. 目的</a></li>
    <li><a href="#2-動機">2. 動機</a></li>
    <li><a href="#3-実装">3. 実装</a>
        <ul>
            <li><a href="#31-軽実装">3.1. 軽実装</a></li>
            <li><a href="#32-中実装">3.2. 中実装</a></li>
            <li><a href="#33-重実装">3.3. 重実装</a></li>
        </ul>
    </li>
</ul>

## <a id="1-目的">1. 目的</a>
Factory Methodパターンは、オブジェクトを作成するためのインターフェースを提供しつつ、どのクラスのインスタンスを生成するかをサブクラスに決定させることを目的とした生成に関するデザインパターンです。これにより、クラスのインスタンス化のロジックをサブクラスに委譲し、コードの柔軟性と拡張性を高めます。

## <a id="2-動機">2. 動機</a>
大規模なソフトウェアでは、多くのオブジェクトを生成する必要があります。もしオブジェクトの生成ロジックがコードの至る所に散らばっていると、将来的に新しい種類のオブジェクトを追加したり、生成方法を変更したりする際に、多くの箇所を修正する必要が生じます。これは保守性の低下に繋がります。Factory Methodは、オブジェクト生成のコードを特定の「ファクトリ」メソッドに集約することで、この問題を解決します。

## <a id="3-実装">3. 実装</a>
以下に、C++を用いた実装の例を示します。

### <a id="31-軽実装">3.1. 軽実装</a>
基本的なFactory Methodパターンの実装です。製品（Product）のインターフェースと、それを生成する工場（Creator）のインターフェースを定義し、具体的な工場クラスがどの製品を生成するかを決定します。

```cpp
#include <iostream>
#include <string>
#include <memory>

// 製品インターフェース (Product)
class Transport {
public:
    virtual ~Transport() {}
    virtual std::string deliver() const = 0;
};

// 具体的な製品A (Concrete Product)
class Truck : public Transport {
public:
    std::string deliver() const override {
        return "陸路で箱に入れて配達します。";
    }
};

// 具体的な製品B (Concrete Product)
class Ship : public Transport {
public:
    std::string deliver() const override {
        return "海路でコンテナに入れて配達します。";
    }
};

// 工場インターフェース (Creator)
class Logistics {
public:
    virtual ~Logistics() {}
    // Factory Method
    virtual std::unique_ptr<Transport> createTransport() const = 0;

    void planDelivery() const {
        auto transport = createTransport();
        std::cout << "計画通り、" << transport->deliver() << std::endl;
    }
};

// 具体的な工場 (Concrete Creator)
class RoadLogistics : public Logistics {
public:
    std::unique_ptr<Transport> createTransport() const override {
        return std::make_unique<Truck>();
    }
};

// 具体的な工場 (Concrete Creator)
class SeaLogistics : public Logistics {
public:
    std::unique_ptr<Transport> createTransport() const override {
        return std::make_unique<Ship>();
    }
};

int main() {
    RoadLogistics roadCreator;
    roadCreator.planDelivery(); // "計画通り、陸路で箱に入れて配達します。"

    SeaLogistics seaCreator;
    seaCreator.planDelivery(); // "計画通り、海路でコンテナに入れて配達します。"

    return 0;
}
```

### <a id="32-中実装">3.2. 中実装</a>
※ここに、より複雑なパラメータを持つファクトリや、複数のファクトリを組み合わせるなど、応用的な実装を記述します。

### <a id="33-重実装">3.3. 重実装</a>
※ここに、DI（Dependency Injection）コンテナと連携するファクトリや、動的にロードされるモジュールから製品を生成するなど、フレームワークレベルの実装を記述します。
