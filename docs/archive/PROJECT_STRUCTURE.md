# Project Structure & API Endpoints

## Folder Structure

```
scooter-wraps-landing/
├── app/                              # Next.js App Router
│   ├── api/                          # API Routes
│   │   ├── models/
│   │   │   └── route.ts              # GET /api/models
│   │   ├── designs/
│   │   │   └── route.ts              # GET /api/designs?model=...
│   │   ├── checkout/
│   │   │   └── route.ts              # POST /api/checkout
│   │   └── book-installation/
│   │       └── route.ts              # POST /api/book-installation
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
│
├── components/                       # React Components
│   ├── Header.tsx                    # Navigation header
│   ├── Footer.tsx                    # Footer
│   ├── Hero3DShowcase.tsx            # 3D scooter showcase
│   ├── DesignCatalog.tsx             # Design catalog with filters
│   ├── CheckoutModal.tsx             # Checkout form modal
│   ├── HowToInstall.tsx              # Installation guide
│   ├── ProductionQC.tsx              # Production & QC section
│   ├── InstallationBooking.tsx       # Booking calendar
│   ├── Reviews.tsx                   # Customer reviews
│   ├── Contact.tsx                   # Contact section
│   ├── Analytics.tsx                 # Analytics integration
│   └── StructuredData.tsx            # SEO structured data
│
├── hooks/                            # Custom React Hooks
│   └── useTranslations.ts            # i18n translation hook
│
├── public/                           # Static Assets
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service worker
│   ├── models/                       # 3D GLB/glTF models
│   │   ├── honda-lead.glb
│   │   ├── honda-vision.glb
│   │   ├── honda-airblade.glb
│   │   ├── yamaha-nvx.glb
│   │   ├── vinfast.glb
│   │   └── vespa.glb
│   ├── textures/                     # Design textures
│   │   ├── design-1.jpg
│   │   ├── design-2.jpg
│   │   └── design-3.jpg
│   ├── designs/                      # Design preview images
│   │   ├── carbon-black.jpg
│   │   ├── racing-red.jpg
│   │   └── ...
│   ├── production/                   # Workshop photos
│   │   ├── workshop-1.jpg
│   │   └── ...
│   ├── icon-192x192.png              # PWA icon
│   └── icon-512x512.png              # PWA icon
│
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── next.config.js                    # Next.js config
└── README.md                         # Documentation
```

## API Endpoints

### 1. GET /api/models

Returns list of all available scooter models.

**Request:**

```
GET /api/models
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "honda-lead",
      "name": "Honda Lead",
      "nameVi": "Honda Lead",
      "glbPath": "/models/honda-lead.glb",
      "thumbnail": "/models/honda-lead-thumb.jpg",
      "description": "Phù hợp với Honda Lead các đời",
      "availableDesigns": 15
    },
    {
      "id": "honda-vision",
      "name": "Honda Vision",
      "nameVi": "Honda Vision",
      "glbPath": "/models/honda-vision.glb",
      "thumbnail": "/models/honda-vision-thumb.jpg",
      "description": "Phù hợp với Honda Vision các đời",
      "availableDesigns": 18
    }
    // ... more models
  ],
  "count": 6
}
```

---

### 2. GET /api/designs

Returns filtered list of designs.

**Request:**

```
GET /api/designs?model=honda-lead&style=sport&new=true&search=carbon
```

**Query Parameters:**

- `model` (optional): Filter by model ID (e.g., "honda-lead", "all")
- `style` (optional): Filter by style (e.g., "sport", "racing", "all")
- `new` (optional): Show only new designs ("true" or "false")
- `search` (optional): Search term for name, description, or tags

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "modelId": "honda-lead",
      "name": "Carbon Fiber Black",
      "nameVi": "Carbon Đen",
      "image": "/designs/carbon-black.jpg",
      "price": 500000,
      "isNew": false,
      "style": "sport",
      "styleVi": "Thể thao",
      "description": "Thiết kế carbon fiber đen sang trọng",
      "tags": ["carbon", "black", "sport"]
    }
    // ... more designs
  ],
  "count": 6,
  "filters": {
    "modelId": "honda-lead",
    "style": "sport",
    "isNew": true,
    "search": "carbon"
  }
}
```

---

### 3. POST /api/checkout

Processes checkout and creates order.

**Request:**

```
POST /api/checkout
Content-Type: application/json
```

**Request Body:**

```json
{
  "designId": "1",
  "paymentMethod": "cod",
  "deliveryOption": "shipping",
  "name": "Nguyễn Văn A",
  "phone": "+84123456789",
  "email": "email@example.com",
  "address": "123 Đường ABC, Phường XYZ, Nha Trang",
  "totalPrice": 500000
}
```

**Payment Methods:**

- `cod`: Cash on Delivery
- `momo`: MoMo Wallet
- `zalopay`: ZaloPay
- `bank`: Bank Transfer
- `card`: Credit/Debit Card

**Delivery Options:**

- `shipping`: Shipping only
- `shipping-install`: Shipping + Installation service

**Response:**

```json
{
  "success": true,
  "orderId": "ORD-1704067200000-abc123xyz",
  "paymentUrl": null,
  "message": "Order created successfully"
}
```

**Response (for e-wallets):**

```json
{
  "success": true,
  "orderId": "ORD-1704067200000-abc123xyz",
  "paymentUrl": "https://payment.momo.vn/gateway?orderId=...",
  "message": "Order created successfully"
}
```

---

### 4. POST /api/book-installation

Creates installation booking appointment.

**Request:**

```
POST /api/book-installation
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Nguyễn Văn A",
  "phone": "+84123456789",
  "email": "email@example.com",
  "scooterModel": "Honda Lead",
  "date": "2024-02-15T00:00:00.000Z",
  "time": "14:00",
  "workshopId": "1",
  "timezone": "Asia/Ho_Chi_Minh",
  "notes": "Optional notes about the installation"
}
```

**Time Slots:**

- `08:00`, `09:00`, `10:00`, `11:00`
- `13:00`, `14:00`, `15:00`, `16:00`, `17:00`, `18:00`, `19:00`

**Workshop IDs:**

- `1`: Xưởng chính - Trần Phú
- `2`: Xưởng phụ - Nguyễn Thị Minh Khai

**Response:**

```json
{
  "success": true,
  "bookingId": "BK-1704067200000-abc123xyz",
  "message": "Booking created successfully",
  "booking": {
    "id": "BK-1704067200000-abc123xyz",
    "date": "2024-02-15T00:00:00.000Z",
    "time": "14:00",
    "workshopId": "1"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Time slot already booked"
}
```

---

## Data Models

### Model

```typescript
interface Model {
  id: string
  name: string
  nameVi: string
  glbPath: string
  thumbnail: string
  description: string
  availableDesigns: number
}
```

### Design

```typescript
interface Design {
  id: string
  modelId: string
  name: string
  nameVi: string
  image: string
  price: number
  isNew: boolean
  style: string
  styleVi: string
  description: string
  tags: string[]
}
```

### Order

```typescript
interface Order {
  id: string
  designId: string
  paymentMethod: 'cod' | 'momo' | 'zalopay' | 'bank' | 'card'
  deliveryOption: 'shipping' | 'shipping-install'
  name: string
  phone: string
  email?: string
  address: string
  totalPrice: number
  status: 'pending' | 'payment_pending' | 'confirmed' | 'shipped' | 'completed'
  createdAt: string
}
```

### Booking

```typescript
interface Booking {
  id: string
  name: string
  phone: string
  email?: string
  scooterModel: string
  date: string
  time: string
  workshopId: string
  timezone: string
  notes?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**HTTP Status Codes:**

- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `409`: Conflict (e.g., time slot already booked)
- `500`: Internal Server Error

## Integration Notes

### Payment Gateways

1. **MoMo Wallet**: Integrate with [MoMo Payment Gateway API](https://developers.momo.vn/)
2. **ZaloPay**: Integrate with [ZaloPay API](https://zalopay.vn/developer)
3. **Bank Transfer**: Set up webhook to verify transfers
4. **Cards**: Integrate with payment processor (Stripe, PayPal, etc.)

### Database

In production, replace mock data with:

- PostgreSQL/MongoDB for orders and bookings
- Redis for caching
- File storage (S3, Cloudinary) for images and 3D models

### Email/SMS

Integrate with:

- Email: SendGrid, Mailgun, or AWS SES
- SMS: Twilio, AWS SNS, or Vietnamese SMS providers
