# DEPRECATED: See INTEGRATIONS.md for current Swell integration details

# Swell.is E-commerce Integration (legacy)

## Overview

This document outlines the Swell.is headless commerce integration for Prism Health Lab's diagnostic testing platform. The integration provides a complete e-commerce solution for ordering diagnostic panels, managing shopping carts, and processing secure payments.

## 🚀 Features Implemented

### ✅ Core E-commerce Functionality
- **Product Catalog**: Dynamic diagnostic panel loading from Swell
- **Shopping Cart**: Real-time cart management with React Context
- **Checkout Flow**: Multi-step secure checkout process
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Ready for payment gateway configuration

### ✅ Medical-Specific Features
- **Diagnostic Panel Modeling**: Custom product attributes for medical tests
- **HIPAA Compliance**: Secure data handling and privacy protection
- **Medical Workflow**: Integration points for appointment scheduling
- **Patient Portal**: Order history and results management hooks

### ✅ Technical Implementation
- **Frontend**: React with Swell.js SDK for client-side operations
- **Backend**: Next.js API routes with Swell Node.js SDK
- **State Management**: React Context for cart and authentication
- **Webhooks**: Order processing and Supabase integration hooks
- **TypeScript**: Full type safety with custom interfaces

## 📁 File Structure

```
lib/
  swell.ts                 # Swell SDK configuration and helpers
  
context/
  CartContext.tsx          # Shopping cart state management
  
app/
  api/
    swell/
      products/route.ts    # Product API endpoints
    webhooks/
      swell/route.ts       # Webhook handlers for order processing
  
  components/
    CartIcon.tsx           # Shopping cart component
    Navigation.tsx         # Updated with cart integration
  
  products/
    page.tsx              # Original static products page
    page-with-swell.tsx   # Dynamic Swell-powered products page
  
  checkout/
    page.tsx              # Multi-step checkout flow
    success/page.tsx      # Order confirmation page
  
scripts/
  populate-swell-products.js  # Script to populate Swell store with diagnostic panels
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local` with your Swell credentials:

```bash
# Swell.is Configuration
NEXT_PUBLIC_SWELL_STORE_ID=your-store-id
NEXT_PUBLIC_SWELL_PUBLIC_KEY=pk_your_public_key_here
SWELL_SECRET_KEY=sk_your_secret_key_here
NEXT_PUBLIC_SWELL_URL=https://your-store-id.swell.store

# Optional: Supabase for order integration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Initial Store Setup

1. **Create Swell Account**: Sign up at [swell.is](https://swell.is)
2. **Get API Keys**: Copy your Store ID and API keys from the Swell dashboard
3. **Populate Products**: Run the setup script to create diagnostic panels

```bash
npm run populate-swell
```

## 🛍️ Product Catalog

### Diagnostic Panel Categories

```typescript
- Performance & Recovery: Athletic optimization panels
- Wellness & Longevity: Preventive health monitoring  
- Hormone Health: Hormone balance and optimization
- Comprehensive Health: Complete multi-biomarker assessments
```

### Custom Product Attributes

Each diagnostic panel includes medical-specific attributes:

```typescript
interface DiagnosticPanel {
  attributes: {
    keyTests: string[];          // List of included tests
    turnaroundTime: string;      // Results delivery time
    fasting: boolean;            // Fasting requirement
    sampleType: string;          // Sample collection method
    biomarkers: number;          // Number of biomarkers tested
    bestFor: string;             // Target audience
  }
}
```

## 🛒 Shopping Cart

### Cart Context Features

- **Real-time Updates**: Instant cart synchronization
- **Persistent Storage**: Cart persists across sessions
- **Error Handling**: Robust error management
- **Loading States**: User feedback during operations

### Usage Example

```typescript
import { useCart } from '@/context/CartContext';

const { cart, addToCart, updateCartItem, removeFromCart } = useCart();

// Add diagnostic panel to cart
await addToCart('panel-id', { quantity: 1 });

// Update quantity
await updateCartItem('item-id', 2);

// Remove item
await removeFromCart('item-id');
```

## 💳 Checkout Process

### Multi-Step Flow

1. **Billing Information**: Customer details and address
2. **Payment Information**: Secure credit card processing
3. **Order Review**: Final confirmation before submission

### Security Features

- **Form Validation**: Client and server-side validation
- **HTTPS Encryption**: All data transmitted securely
- **PCI Compliance**: Ready for payment processor integration
- **HIPAA Considerations**: Medical data privacy protection

### Medical Compliance

- **Patient Consent**: Terms and conditions acknowledgment
- **Data Protection**: Secure handling of medical orders
- **Audit Trail**: Complete order tracking
- **Privacy Controls**: HIPAA-compliant data processing

## 🔗 API Integration

### Frontend API (Swell.js)

```typescript
import swell from '@/lib/swell';

// Get products
const products = await swell.products.list({ category: 'wellness' });

// Manage cart
await swell.cart.addItem({ product_id: 'panel-id', quantity: 1 });

// Checkout
const order = await swell.cart.submitOrder({ billing, payment });
```

### Backend API (Swell Node)

```typescript
// In API routes
import swell from 'swell-node';

swell.init(storeId, secretKey);

// Create products
const product = await swell.post('/products', productData);

// Process webhooks
const order = await swell.get(`/orders/${orderId}`);
```

## 🔄 Webhook Integration

### Supported Events

- `order.created`: New order placed
- `order.updated`: Order status changes
- `order.paid`: Payment confirmation
- `subscription.created`: Recurring test setup
- `subscription.updated`: Subscription changes

### Webhook Handler

```typescript
// app/api/webhooks/swell/route.ts
export async function POST(request: NextRequest) {
  const { type, data } = await request.json();
  
  switch (type) {
    case 'order.created':
      await handleOrderCreated(data);
      break;
    // ... other handlers
  }
}
```

## 🏥 Medical Workflow Integration

### Order to Appointment Flow

1. **Order Placed**: Customer completes checkout
2. **Webhook Triggered**: `order.paid` event received
3. **Appointment Created**: Scheduling system integration
4. **Confirmation Sent**: Email with appointment details
5. **Results Ready**: Notification when tests complete

### Patient Portal Integration

```typescript
// Connect orders to patient accounts
const patientOrders = await swell.account.getOrders();

// Link to results delivery
const orderResults = await getResultsForOrder(orderId);
```

## 📊 Analytics & Reporting

### Business Metrics

- **Revenue Tracking**: Order totals and trends
- **Panel Popularity**: Most ordered diagnostic tests
- **Customer Behavior**: Cart abandonment and conversion
- **Geographic Data**: Testing center utilization

### Medical Insights

- **Test Demand**: Popular biomarker combinations
- **Seasonal Trends**: Health monitoring patterns
- **Customer Segments**: Demographic analysis
- **Outcome Tracking**: Long-term health improvements

## 🔒 Security Considerations

### Data Protection

- **Encryption**: All sensitive data encrypted in transit and at rest
- **Access Controls**: Role-based permissions for admin functions
- **Audit Logging**: Complete activity tracking for compliance
- **Webhook Security**: Signature verification for webhook endpoints

### HIPAA Compliance

- **Business Associate Agreement**: Required with Swell for PHI handling
- **Data Minimization**: Only collect necessary medical information
- **Retention Policies**: Configurable data retention periods
- **Breach Notification**: Incident response procedures

## 🚀 Deployment

### Production Checklist

- [ ] Configure production Swell environment
- [ ] Set up payment gateway (Stripe, PayPal, etc.)
- [ ] Enable webhook signature verification
- [ ] Configure SSL certificates
- [ ] Set up monitoring and alerting
- [ ] Complete security audit
- [ ] HIPAA compliance review
- [ ] Load testing for high traffic

### Environment Configuration

```bash
# Production environment variables
NEXT_PUBLIC_SWELL_STORE_ID=prod-store-id
NEXT_PUBLIC_SWELL_PUBLIC_KEY=pk_live_...
SWELL_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SWELL_URL=https://your-domain.com
```

## 📈 Future Enhancements

### Phase 2 Features

- **Subscription Management**: Recurring diagnostic monitoring
- **Bundle Pricing**: Multi-panel discounts
- **Insurance Integration**: Direct billing capabilities
- **Telemedicine**: Consultation booking integration
- **Mobile App**: React Native with Swell integration

### Advanced Analytics

- **Predictive Health**: AI-powered test recommendations
- **Population Health**: Aggregate trend analysis
- **Personalized Medicine**: Tailored panel suggestions
- **Research Integration**: Anonymized data for studies

## 🆘 Troubleshooting

### Common Issues

**Cart not updating:**
- Check network connectivity
- Verify Swell API credentials
- Clear browser cache and cookies

**Checkout failures:**
- Validate payment information
- Check webhook endpoint configuration
- Review error logs in Swell dashboard

**Product not loading:**
- Confirm product is active in Swell
- Check category assignments
- Verify API permissions

### Support Resources

- **Swell Documentation**: [developers.swell.is](https://developers.swell.is)
- **Community Support**: Swell Discord server
- **Technical Support**: Enterprise support plan available

## 📞 Contact

For technical questions about this integration:

- **Development Team**: dev@prismhealthlab.com
- **Swell Support**: Support ticket through dashboard
- **Emergency Issues**: After-hours support line

---

*Last updated: July 2025*  
*Integration Version: 1.0*
