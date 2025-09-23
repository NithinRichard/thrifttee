
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import CartItem from '../components/cart/CartItem';

const CartPage = () => {
  const { state, actions } = useApp();

  const cartSubtotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-8 text-center">
            Your Shopping Cart
          </h1>

          {state.cart.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-lg">
              <p className="text-xl text-gray-500 mb-6">Your cart is empty</p>
              <Link to="/products" className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                <div className="space-y-6">
                  {state.cart.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={actions.updateCartItem}
                      onRemove={actions.removeFromCart}
                    />
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
                <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold text-gray-800">
                    ₹{cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-bold text-gray-800">₹5.00</span>
                  </div>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-vintage-600">
                    ₹{(cartSubtotal + 5.0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="btn-primary w-full mt-8 text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CartPage;
