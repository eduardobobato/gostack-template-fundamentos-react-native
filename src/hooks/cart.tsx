import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();
      const productsString = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      const productsList = productsString ? JSON.parse(productsString) : [];
      setProducts(productsList);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(prd => prd.id === product.id);

      let newProducts = [...products];
      if (productIndex === -1) {
        newProducts = [...products, { ...product, quantity: 1 }];
      } else {
        newProducts = products.map(p =>
          p.id === product.id ? { ...product, quantity: p.quantity + 1 } : p,
        );
      }
      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );
      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(prd => prd.id === id);

      let productsList = [...products];
      if (productsList[productIndex].quantity - 1 <= 0) {
        productsList = productsList.filter(product => product.id !== id);
      } else {
        productsList[productIndex] = {
          ...productsList[productIndex],
          quantity: productsList[productIndex].quantity - 1,
        };
      }
      setProducts(productsList);

      await AsyncStorage.setItem(
        '@GoStacoFundamentosNome-products',
        JSON.stringify(productsList),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
