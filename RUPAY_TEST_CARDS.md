# Rupay Test Card Numbers for Development

## 🎯 **Test Cards Available**

The following test card numbers are available for development testing:

### **Debit Cards**
- `5085000000000001` - Valid Rupay Debit Card
- `5085000000000002` - Valid Rupay Debit Card

### **Credit Cards**
- `6060000000000001` - Valid Rupay Credit Card
- `6060000000000002` - Valid Rupay Credit Card

### **Prepaid Cards**
- `6070000000000001` - Valid Rupay Prepaid Card
- `6070000000000002` - Valid Rupay Prepaid Card

### **Premium Cards**
- `6080000000000001` - Valid Rupay Premium Card
- `6080000000000002` - Valid Rupay Premium Card

## 📝 **Test Data**

### **Card Details for Testing**
- **Card Number**: Use any of the above test card numbers
- **Expiry Date**: Any future date (e.g., `12/28` for December 2028)
- **CVV**: Any 3-digit number (e.g., `123`)
- **Cardholder Name**: Any name (e.g., `John Doe`)

### **Example Complete Test Data**
```javascript
{
  fullName: "John Doe",
  email: "john@example.com",
  address: "123 Test Street",
  city: "Mumbai",
  state: "Maharashtra",
  zip: "400001",
  cardNumber: "5085000000000001", // Use any test card number
  expiryDate: "12/28",
  cvv: "123"
}
```

## ✅ **How to Test**

1. **Copy a test card number** from the list above
2. **Paste it in the card number field** on the checkout page
3. **Fill in the other required fields** with test data
4. **Submit the form** to test the complete payment flow

## 🔍 **What Happens During Testing**

- ✅ Card type detection will show "Rupay Card"
- ✅ Card validation will pass
- ✅ Form submission will proceed
- ✅ Payment processing will simulate success
- ✅ Order will be created with demo transaction ID

## 🚫 **Note**
These test cards only work in **development mode**. In production, only real Rupay cards with valid BIN ranges will be accepted.

## 📱 **Real Rupay Card BIN Ranges**

For reference, real Rupay cards use these BIN ranges:
- `508500-508509` - Rupay Debit Cards
- `606000-606009` - Rupay Credit Cards
- `607000-607009` - Rupay Prepaid Cards
- `608000-608009` - Rupay Premium Cards

The test card numbers follow these same patterns for realistic testing! 🎉
