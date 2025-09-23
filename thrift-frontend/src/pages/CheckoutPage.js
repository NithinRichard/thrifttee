
import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import { formatINR } from '../utils/currency';

const CheckoutPage = () => {
  const { state, actions } = useApp();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const cartSubtotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingCost = 0;
  const totalCost = cartSubtotal + shippingCost;

  const onSubmit = async (data) => {
    try {
      actions.setLoading(true);
      const orderData = {
        order_items: state.cart.map(item => ({ product: item.id, quantity: item.quantity })),
        shipping_address: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
        payment_method: 'card',
      };
      
      await apiService.createOrder(orderData);
      
      actions.clearCart();
      // Redirect to a success page or show a success message
      alert('Order placed successfully!');

    } catch (error) {
      actions.setError('Failed to place order');
    } finally {
      actions.setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-vintage font-bold text-gray-900 mb-8 text-center">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Information */}
            <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                Shipping Information
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Full Name</label>
                    <input {...register('fullName', { required: true })} className="input-field" />
                    {errors.fullName && <span className="error-message">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input {...register('email', { required: true, pattern: /\S+@\S+\.\S+/ })} className="input-field" />
                    {errors.email && <span className="error-message">Please enter a valid email</span>}
                  </div>
                </div>
                <div>
                  <label className="label">Address</label>
                  <input {...register('address', { required: true })} className="input-field" />
                  {errors.address && <span className="error-message">This field is required</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="label">City</label>
                    <input {...register('city', { required: true })} className="input-field" />
                    {errors.city && <span className="error-message">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input {...register('state', { required: true })} className="input-field" />
                    {errors.state && <span className="error-message">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">ZIP Code</label>
                    <input {...register('zip', { required: true })} className="input-field" />
                    {errors.zip && <span className="error-message">This field is required</span>}
                  </div>
                </div>

                <h2 className="text-2xl font-vintage font-bold text-gray-900 pt-8 mb-6">
                  Payment Details
                </h2>
                <div>
                  <label className="label">Card Number</label>
                  <input {...register('cardNumber', { required: true })} className="input-field" />
                  {errors.cardNumber && <span className="error-message">This field is required</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Expiration Date</label>
                    <input {...register('expiryDate', { required: true })} className="input-field" placeholder="MM/YY" />
                    {errors.expiryDate && <span className="error-message">This field is required</span>}
                  </div>
                  <div>
                    <label className="label">CVC</label>
                    <input {...register('cvc', { required: true })} className="input-field" />
                    {errors.cvc && <span className="error-message">This field is required</span>}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    className="btn-primary w-full text-lg py-3"
                    disabled={state.loading}
                  >
                    {state.loading ? 'Placing Order...' : `Pay ${formatINR(totalCost)}`}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-8 rounded-lg shadow-lg h-fit">
              <h2 className="text-2xl font-vintage font-bold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4">
                {state.cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800">{item.title}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold text-gray-800">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 my-6"></div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-gray-800">
                    {formatINR(cartSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold text-gray-800">
                    {formatINR(shippingCost)}
                  </span>
                </div>
                <div className="border-t border-gray-200 my-4"></div>
                <div className="flex justify-between text-xl">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-vintage-600">
                    {formatINR(totalCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
