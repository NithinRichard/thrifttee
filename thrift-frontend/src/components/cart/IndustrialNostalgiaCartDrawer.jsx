import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { formatINR } from '../../utils/currency';

const IndustrialNostalgiaCartDrawer = ({ isOpen, onClose }) => {
  const { state, actions } = useApp();
  const navigate = useNavigate();

  const cartSubtotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-vintage font-bold text-lg">Shopping Cart</h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              {state.cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="bg-vintage-600 text-white px-4 py-2 rounded-lg hover:bg-vintage-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {state.cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={item.image || item?.tshirt?.primary_image || item?.tshirt?.all_images?.[0]}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                          <p className="text-vintage-600 font-bold">{formatINR(item.price)}</p>
                          <p className="text-xs text-gray-500">
                            Size: {item.size || 'N/A'} | Qty: {item.quantity}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center bg-gray-100 rounded">
                              <button
                                onClick={() => actions.updateCartItem(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              >
                                −
                              </button>
                              <span className="px-2 text-sm">{item.quantity}</span>
                              <button
                                onClick={() => actions.updateCartItem(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-800"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => actions.removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatINR(cartSubtotal)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between font-bold text-vintage-600">
                        <span>Total:</span>
                        <span>{formatINR(cartSubtotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-4 bg-vintage-600 text-white py-3 px-4 rounded-lg hover:bg-vintage-700 transition-colors font-semibold"
                  >
                    Proceed to Checkout
                  </button>

                  {/* View Cart Button */}
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/cart');
                    }}
                    className="w-full mt-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    View Full Cart
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IndustrialNostalgiaCartDrawer;
