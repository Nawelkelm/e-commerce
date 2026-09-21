-- ===========================================================================
--  Esquema base de TiendaKit.
--
--  Generado con pg_dump sobre una base construida por sequelize.sync() a
--  partir de los modelos, para garantizar que el esquema que crean las
--  migraciones sea identico al que creaba sync().
--
--  Lo ejecuta la migracion 20240101000000-initial-schema.js, que primero
--  verifica si el esquema ya existe. No editar a mano: si cambia un modelo,
--  el cambio va en una migracion nueva, no aca.
-- ===========================================================================
--
--

--
-- Name: AuditLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLogs" (
    id uuid NOT NULL,
    "userId" uuid,
    action character varying(255) NOT NULL,
    "resourceType" character varying(255) NOT NULL,
    "resourceId" character varying(255),
    "oldValues" jsonb,
    "newValues" jsonb,
    "ipAddress" character varying(255),
    "userAgent" character varying(255),
    status character varying(255) DEFAULT 'success'::character varying,
    "errorMessage" text,
    "createdAt" timestamp with time zone NOT NULL
);

--
-- Name: BankAccounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BankAccounts" (
    id uuid NOT NULL,
    "bankName" character varying(255) NOT NULL,
    "accountType" character varying(255) NOT NULL,
    "accountNumber" character varying(255) NOT NULL,
    cbu character varying(22) NOT NULL,
    alias character varying(255),
    "holderName" character varying(255) NOT NULL,
    "holderDocument" character varying(255) NOT NULL,
    "isActive" boolean DEFAULT true,
    "isPrimary" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: CartItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CartItems" (
    id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(10,2) NOT NULL,
    attributes json DEFAULT '{}'::json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "productId" uuid,
    "cartId" uuid
);

--
-- Name: Carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Carts" (
    id uuid NOT NULL,
    "sessionId" character varying(255),
    "expiresAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" uuid
);

--
-- Name: Categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Categories" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    slug character varying(255) NOT NULL,
    "imageUrl" character varying(255),
    "isActive" boolean DEFAULT true,
    "sortOrder" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: ContentPages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ContentPages" (
    id uuid NOT NULL,
    slug character varying(120) NOT NULL,
    title character varying(200) NOT NULL,
    content text DEFAULT ''::text,
    excerpt character varying(300),
    "metaTitle" character varying(200),
    "metaDescription" character varying(300),
    "isPublished" boolean DEFAULT true,
    "isSystem" boolean DEFAULT false,
    "sortOrder" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: CouponUsages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CouponUsages" (
    id integer NOT NULL,
    "couponId" integer NOT NULL,
    "userId" uuid NOT NULL,
    "orderId" uuid,
    "discountApplied" numeric(10,2) NOT NULL,
    "usedAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: CouponUsages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."CouponUsages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: CouponUsages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."CouponUsages_id_seq" OWNED BY public."CouponUsages".id;

--
-- Name: Coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Coupons" (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    "discountType" character varying(255) DEFAULT 'percentage'::character varying NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "minPurchase" numeric(10,2) DEFAULT 0,
    "maxDiscount" numeric(10,2),
    "usageLimit" integer,
    "usageLimitPerUser" integer DEFAULT 1,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "isPublic" boolean DEFAULT true NOT NULL,
    "applicableCategories" integer[],
    "applicableProducts" integer[],
    "excludedCategories" integer[],
    "excludedProducts" integer[],
    "firstPurchaseOnly" boolean DEFAULT false NOT NULL,
    stackable boolean DEFAULT false NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: Coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Coupons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: Coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Coupons_id_seq" OWNED BY public."Coupons".id;

--
-- Name: EmailLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailLogs" (
    id integer NOT NULL,
    "templateId" integer,
    "recipientEmail" character varying(255) NOT NULL,
    "recipientName" character varying(255),
    subject character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "sentAt" timestamp with time zone,
    "openedAt" timestamp with time zone,
    "clickedAt" timestamp with time zone,
    "errorMessage" text,
    metadata jsonb DEFAULT '{}'::jsonb,
    "orderId" uuid,
    "userId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: EmailLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EmailLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: EmailLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EmailLogs_id_seq" OWNED BY public."EmailLogs".id;

--
-- Name: EmailTemplates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailTemplates" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    "htmlContent" text NOT NULL,
    "textContent" text,
    type character varying(255) NOT NULL,
    variables character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: EmailTemplates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EmailTemplates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: EmailTemplates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EmailTemplates_id_seq" OWNED BY public."EmailTemplates".id;

--
-- Name: HomeSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."HomeSettings" (
    id uuid NOT NULL,
    carousel jsonb DEFAULT '[]'::jsonb,
    "heroTitle" character varying(200) DEFAULT 'Bienvenido a Nuestra Tienda'::character varying,
    "heroSubtitle" text DEFAULT 'Encuentra los mejores productos al mejor precio'::text,
    "heroCta1Text" character varying(100) DEFAULT 'Ver Productos'::character varying,
    "heroCta1Link" character varying(200) DEFAULT '/productos'::character varying,
    "heroCta2Text" character varying(100) DEFAULT 'Ofertas'::character varying,
    "heroCta2Link" character varying(200) DEFAULT '/productos?ofertas=true'::character varying,
    "featuresEnabled" boolean DEFAULT true,
    "featuresTitle" character varying(200) DEFAULT '¿Por qué elegirnos?'::character varying,
    features jsonb DEFAULT '[{"icon": "truck", "title": "Envío Gratis", "description": "En compras superiores a $10,000"}, {"icon": "shield", "title": "Compra Segura", "description": "Protegemos tus datos"}, {"icon": "refresh", "title": "Devoluciones", "description": "30 días para devolver"}, {"icon": "support", "title": "Soporte 24/7", "description": "Estamos para ayudarte"}]'::jsonb,
    "categoriesEnabled" boolean DEFAULT true,
    "categoriesTitle" character varying(200) DEFAULT 'Categorías Destacadas'::character varying,
    "categoryIds" jsonb DEFAULT '[]'::jsonb,
    "categoryIcons" jsonb DEFAULT '{}'::jsonb,
    "testimonialsEnabled" boolean DEFAULT false,
    "testimonialsTitle" character varying(200) DEFAULT 'Lo que dicen nuestros clientes'::character varying,
    testimonials jsonb DEFAULT '[]'::jsonb,
    "newsletterEnabled" boolean DEFAULT true,
    "newsletterTitle" character varying(200) DEFAULT 'Suscríbete a nuestro newsletter'::character varying,
    "newsletterSubtitle" text DEFAULT 'Recibe ofertas exclusivas y novedades'::text,
    "couponBannerEnabled" boolean DEFAULT true,
    "couponBannerTitle" character varying(200) DEFAULT '¡Ofertas Especiales!'::character varying,
    "couponBannerSubtitle" character varying(200) DEFAULT 'Aprovecha estos cupones de descuento'::character varying,
    "couponBannerMaxCoupons" integer DEFAULT 3,
    "metaTitle" character varying(200) DEFAULT 'E-Commerce - Tu tienda online de confianza'::character varying,
    "metaDescription" text DEFAULT 'Encuentra los mejores productos al mejor precio. Envío gratis, compra segura y soporte 24/7.'::text,
    "metaKeywords" text DEFAULT 'tienda online, ecommerce, productos, ofertas, envío gratis'::text,
    "footerEnabled" boolean DEFAULT true,
    "footerAboutTitle" character varying(100) DEFAULT 'Sobre Nosotros'::character varying,
    "footerAboutText" text DEFAULT 'Somos una tienda comprometida con la calidad y satisfacción de nuestros clientes.'::text,
    "footerContactEnabled" boolean DEFAULT true,
    "footerContactTitle" character varying(100) DEFAULT 'Contacto'::character varying,
    "footerAddress" text DEFAULT ''::text,
    "footerPhone" character varying(100) DEFAULT ''::character varying,
    "footerEmail" character varying(100) DEFAULT ''::character varying,
    "footerSchedule" character varying(200) DEFAULT 'Lun - Vie: 9:00 - 18:00'::character varying,
    "footerSocialEnabled" boolean DEFAULT true,
    "footerSocialTitle" character varying(100) DEFAULT 'Síguenos'::character varying,
    "footerFacebook" character varying(200) DEFAULT ''::character varying,
    "footerInstagram" character varying(200) DEFAULT ''::character varying,
    "footerTwitter" character varying(200) DEFAULT ''::character varying,
    "footerYoutube" character varying(200) DEFAULT ''::character varying,
    "footerTiktok" character varying(200) DEFAULT ''::character varying,
    "footerWhatsapp" character varying(100) DEFAULT ''::character varying,
    "footerLinkedin" character varying(200) DEFAULT ''::character varying,
    "legalBusinessName" character varying(200) DEFAULT ''::character varying,
    "legalCuit" character varying(20) DEFAULT ''::character varying,
    "legalTaxCategory" character varying(60) DEFAULT ''::character varying,
    "legalAddress" character varying(250) DEFAULT ''::character varying,
    "legalJurisdiction" character varying(150) DEFAULT ''::character varying,
    "footerLinksEnabled" boolean DEFAULT true,
    "footerColumn1Title" character varying(100) DEFAULT 'Información'::character varying,
    "footerColumn1Links" jsonb DEFAULT '[{"url": "/sobre-nosotros", "text": "Sobre Nosotros"}, {"url": "/contacto", "text": "Contacto"}]'::jsonb,
    "footerColumn2Title" character varying(100) DEFAULT 'Ayuda'::character varying,
    "footerColumn2Links" jsonb DEFAULT '[{"url": "/faq", "text": "Preguntas Frecuentes"}, {"url": "/envios", "text": "Envíos"}, {"url": "/devoluciones", "text": "Devoluciones"}]'::jsonb,
    "footerColumn3Title" character varying(100) DEFAULT 'Legal'::character varying,
    "footerColumn3Links" jsonb DEFAULT '[{"url": "/terminos", "text": "Términos y Condiciones"}, {"url": "/privacidad", "text": "Política de Privacidad"}, {"url": "/cookies", "text": "Política de Cookies"}]'::jsonb,
    "footerCopyrightText" character varying(200) DEFAULT '© 2025 E-Commerce. Todos los derechos reservados.'::character varying,
    "footerShowPaymentMethods" boolean DEFAULT true,
    "footerPaymentMethods" jsonb DEFAULT '["visa", "mastercard", "amex", "mercadopago"]'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: Invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoices" (
    id uuid NOT NULL,
    "invoiceNumber" character varying(255) NOT NULL,
    "orderId" uuid,
    "userId" uuid,
    "customerName" character varying(255) NOT NULL,
    "customerEmail" character varying(255),
    "customerPhone" character varying(255),
    "customerAddress" text,
    "customerTaxId" character varying(255),
    cae character varying(14),
    "caeDueDate" date,
    "invoiceType" character varying(255) DEFAULT 'B'::character varying NOT NULL,
    "pointOfSale" integer DEFAULT 1 NOT NULL,
    origin character varying(10) DEFAULT 'store'::character varying NOT NULL,
    "afipVoucherType" integer,
    "afipVoucherNumber" integer,
    "arcaSyncedAt" timestamp with time zone,
    "afipStatus" character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    "afipResponse" jsonb,
    "afipRequestDate" timestamp with time zone,
    "customerTaxCategory" character varying(255) DEFAULT 'consumidor_final'::character varying NOT NULL,
    "customerCuit" character varying(11),
    observations text,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 16 NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    shipping numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    items jsonb NOT NULL,
    "paymentMethod" character varying(255),
    "paymentId" character varying(255),
    "paymentDate" timestamp with time zone NOT NULL,
    status character varying(255) DEFAULT 'issued'::character varying NOT NULL,
    "issueDate" timestamp with time zone NOT NULL,
    "dueDate" timestamp with time zone,
    notes text,
    "customerNotes" text,
    "pdfUrl" character varying(255),
    "cancelledAt" timestamp with time zone,
    "cancelledBy" uuid,
    "cancellationReason" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: LogisticsCredentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LogisticsCredentials" (
    id uuid NOT NULL,
    carrier character varying(255) NOT NULL,
    "isActive" boolean DEFAULT false,
    credentials json DEFAULT '{}'::json NOT NULL,
    "lastSyncAt" timestamp with time zone,
    "syncStatus" character varying(255) DEFAULT 'never'::character varying,
    "lastError" text,
    settings json DEFAULT '{}'::json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: OrderItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrderItems" (
    id uuid NOT NULL,
    "productName" character varying(255) NOT NULL,
    "productSku" character varying(255) NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    attributes json DEFAULT '{}'::json,
    "productSnapshot" json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "productId" uuid,
    "orderId" uuid
);

--
-- Name: Orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Orders" (
    id uuid NOT NULL,
    "orderNumber" character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying,
    "paymentStatus" character varying(255) DEFAULT 'pending'::character varying,
    "paymentMethod" character varying(255),
    "paymentId" character varying(255),
    subtotal numeric(10,2) NOT NULL,
    "taxAmount" numeric(10,2) DEFAULT 0,
    "shippingAmount" numeric(10,2) DEFAULT 0,
    "shippingMethodId" uuid,
    "shippingMethodCode" character varying(255),
    "shippingMethodName" character varying(255),
    "discountAmount" numeric(10,2) DEFAULT 0,
    total numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'ARS'::character varying,
    "shippingAddress" json NOT NULL,
    "billingAddress" json,
    "customerNotes" text,
    "adminNotes" text,
    "trackingNumber" character varying(255),
    "estimatedDeliveryDate" timestamp with time zone,
    "deliveredAt" timestamp with time zone,
    "cancelledAt" timestamp with time zone,
    "refundedAt" timestamp with time zone,
    "paidAt" timestamp with time zone,
    "invoiceId" uuid,
    "invoiceNumber" character varying(255),
    "paymentProofUrl" character varying(255),
    "paymentProofUploadedAt" timestamp with time zone,
    "bankTransferData" jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" uuid
);

--
-- Name: Permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Permissions" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    resource character varying(255) NOT NULL,
    action character varying(255) NOT NULL,
    "displayName" character varying(255) NOT NULL,
    description text,
    category character varying(255) DEFAULT 'general'::character varying NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: ProductBarcodes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductBarcodes" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    barcode character varying(255) NOT NULL,
    "barcodeType" character varying(255) DEFAULT 'EAN13'::character varying,
    "isPrimary" boolean DEFAULT false,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: ProductBatches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductBatches" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    "batchNumber" character varying(255) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "initialQuantity" integer NOT NULL,
    "manufactureDate" date,
    "expirationDate" date,
    "supplierName" character varying(255),
    "supplierReference" character varying(255),
    "purchaseCost" numeric(10,2),
    "totalCost" numeric(10,2),
    "locationCode" character varying(255),
    status character varying(255) DEFAULT 'active'::character varying,
    notes text,
    "isPerishable" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: Products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Products" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "shortDescription" character varying(500),
    slug character varying(255) NOT NULL,
    sku character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    "salePrice" numeric(10,2),
    cost numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    "lowStockThreshold" integer DEFAULT 5,
    weight numeric(8,3),
    dimensions json,
    images json DEFAULT '[]'::json,
    attributes json DEFAULT '{}'::json,
    "isActive" boolean DEFAULT true,
    "isFeatured" boolean DEFAULT false,
    "isDigital" boolean DEFAULT false,
    "sortOrder" integer DEFAULT 0,
    "seoTitle" character varying(255),
    "seoDescription" text,
    tags json DEFAULT '[]'::json,
    "averageRating" numeric(3,2) DEFAULT 0,
    "totalReviews" integer DEFAULT 0,
    "supplierId" integer,
    "isOwnProduction" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "createdBy" uuid,
    "categoryId" uuid
);

--
-- Name: RefreshTokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefreshTokens" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    token character varying(500) NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "isRevoked" boolean DEFAULT false,
    "ipAddress" character varying(255),
    "userAgent" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: RegretRequests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RegretRequests" (
    id uuid NOT NULL,
    "customerName" character varying(200) NOT NULL,
    "customerEmail" character varying(200) NOT NULL,
    "customerPhone" character varying(50),
    "customerDocument" character varying(50),
    "orderNumber" character varying(100),
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    "adminNotes" text,
    "resolvedAt" timestamp with time zone,
    "userId" uuid,
    "orderId" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: ReviewHelpful; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReviewHelpful" (
    id uuid NOT NULL,
    "reviewId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "isHelpful" boolean NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Reviews" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "orderId" uuid,
    rating integer NOT NULL,
    title character varying(200),
    comment text NOT NULL,
    images character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "isVerifiedPurchase" boolean DEFAULT false NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "notHelpfulCount" integer DEFAULT 0 NOT NULL,
    "adminResponse" text,
    "adminRespondedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: RolePermissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RolePermissions" (
    id uuid NOT NULL,
    "roleId" uuid NOT NULL,
    "permissionId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: Roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Roles" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    "displayName" character varying(255) NOT NULL,
    description text,
    "isActive" boolean DEFAULT true,
    "isSystemRole" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Settings" (
    id uuid NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    "displayName" character varying(255),
    description text,
    type character varying(50) DEFAULT 'text'::character varying,
    category character varying(100) DEFAULT 'general'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: ShippingMethods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ShippingMethods" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'custom'::character varying NOT NULL,
    carrier character varying(255),
    "isActive" boolean DEFAULT true,
    description text,
    price numeric(10,2),
    "isFree" boolean DEFAULT false,
    "freeFromAmount" numeric(10,2),
    "estimatedDays" integer,
    zones json DEFAULT '[]'::json,
    restrictions json DEFAULT '{}'::json,
    "requiresAddress" boolean DEFAULT true,
    "pickupAddress" json,
    icon character varying(255),
    "displayOrder" integer DEFAULT 0,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: SmtpSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SmtpSettings" (
    id uuid NOT NULL,
    host character varying(255) DEFAULT 'smtp.gmail.com'::character varying NOT NULL,
    port integer DEFAULT 587 NOT NULL,
    secure boolean DEFAULT false NOT NULL,
    "user" character varying(255),
    password character varying(255),
    "fromName" character varying(255) DEFAULT 'E-Commerce'::character varying NOT NULL,
    "fromEmail" character varying(255) DEFAULT 'noreply@example.com'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "testEmail" character varying(255),
    provider character varying(255) DEFAULT 'gmail'::character varying NOT NULL,
    "lastTestedAt" timestamp with time zone,
    "testStatus" character varying(255),
    "testError" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: StockAlerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockAlerts" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    type character varying(255) NOT NULL,
    severity character varying(255) DEFAULT 'warning'::character varying,
    message character varying(255) NOT NULL,
    "currentStock" integer NOT NULL,
    threshold integer,
    "isRead" boolean DEFAULT false,
    "isResolved" boolean DEFAULT false,
    "resolvedAt" timestamp with time zone,
    "resolvedBy" uuid,
    "notificationSent" boolean DEFAULT false,
    "notificationSentAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: StockLocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockLocations" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    "locationName" character varying(255) NOT NULL,
    "locationCode" character varying(255) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "reservedQuantity" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true,
    "isPrimary" boolean DEFAULT false,
    address json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: StockMovements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockMovements" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    type character varying(255) NOT NULL,
    quantity integer NOT NULL,
    "previousStock" integer NOT NULL,
    "newStock" integer NOT NULL,
    "unitCost" numeric(10,2),
    "totalCost" numeric(10,2),
    reason character varying(255),
    notes text,
    "referenceType" character varying(255),
    "referenceId" character varying(255),
    "userId" uuid NOT NULL,
    "locationFrom" character varying(255),
    "locationTo" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: StockReservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StockReservations" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    "userId" uuid,
    "sessionId" character varying(255),
    quantity integer NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    id uuid NOT NULL,
    "firstName" character varying(255) NOT NULL,
    "lastName" character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(255),
    address text,
    "shippingAddress" jsonb,
    "billingAddress" jsonb,
    role character varying(255) DEFAULT 'customer'::character varying,
    "roleId" uuid,
    "isActive" boolean DEFAULT true,
    "emailVerified" boolean DEFAULT false,
    "verificationToken" character varying(255),
    "verificationTokenExpires" timestamp with time zone,
    "lastLoginAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: Wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wishlists" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: afip_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.afip_credentials (
    id uuid NOT NULL,
    name character varying(255) DEFAULT 'Configuración Principal'::character varying NOT NULL,
    cuit character varying(11) NOT NULL,
    "businessName" character varying(255) NOT NULL,
    certificate text,
    "privateKey" text,
    "pointOfSale" integer DEFAULT 1 NOT NULL,
    production boolean DEFAULT false NOT NULL,
    "taxCategory" character varying(255) DEFAULT 'responsable_inscripto'::character varying NOT NULL,
    address character varying(255),
    city character varying(255),
    "postalCode" character varying(255),
    province character varying(255),
    "iibbNumber" character varying(255),
    "activityStartDate" date,
    "lastConnectionTest" timestamp with time zone,
    "connectionStatus" character varying(255) DEFAULT 'not_configured'::character varying,
    "lastError" text,
    "isActive" boolean DEFAULT true,
    config jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);

--
-- Name: shipment_trackings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipment_trackings (
    id uuid NOT NULL,
    status character varying(255) NOT NULL,
    location character varying(255),
    description text NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    "carrierMessage" text,
    "isPublic" boolean DEFAULT true,
    metadata json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "shipmentId" uuid
);

--
-- Name: shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipments (
    id uuid NOT NULL,
    "trackingNumber" character varying(255) NOT NULL,
    carrier character varying(255) NOT NULL,
    "carrierService" character varying(255),
    status character varying(255) DEFAULT 'pending'::character varying,
    "shippingCost" numeric(10,2) DEFAULT 0 NOT NULL,
    weight numeric(10,2),
    dimensions json,
    "shippingAddress" json NOT NULL,
    "originAddress" json,
    "estimatedDeliveryDate" timestamp with time zone,
    "shippedAt" timestamp with time zone,
    "deliveredAt" timestamp with time zone,
    "packageType" character varying(255),
    "numberOfPackages" integer DEFAULT 1,
    "insuranceAmount" numeric(10,2) DEFAULT 0,
    notes text,
    "labelUrl" character varying(255),
    "trackingUrl" character varying(255),
    "signatureRequired" boolean DEFAULT false,
    "deliveryProofUrl" character varying(255),
    "recipientSignature" character varying(255),
    "deliveredBy" character varying(255),
    "failedDeliveryReason" text,
    "attemptedDeliveries" integer DEFAULT 0,
    "lastAttemptDate" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "orderId" uuid
);

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    contact_person character varying(255),
    email character varying(255),
    phone character varying(50),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100) DEFAULT 'México'::character varying,
    postal_code character varying(20),
    tax_id character varying(50),
    website character varying(255),
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;

--
-- Name: CouponUsages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponUsages" ALTER COLUMN id SET DEFAULT nextval('public."CouponUsages_id_seq"'::regclass);

--
-- Name: Coupons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons" ALTER COLUMN id SET DEFAULT nextval('public."Coupons_id_seq"'::regclass);

--
-- Name: EmailLogs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLogs" ALTER COLUMN id SET DEFAULT nextval('public."EmailLogs_id_seq"'::regclass);

--
-- Name: EmailTemplates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailTemplates" ALTER COLUMN id SET DEFAULT nextval('public."EmailTemplates_id_seq"'::regclass);

--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);

--
-- Name: AuditLogs AuditLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_pkey" PRIMARY KEY (id);

--
-- Name: BankAccounts BankAccounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BankAccounts"
    ADD CONSTRAINT "BankAccounts_pkey" PRIMARY KEY (id);

--
-- Name: CartItems CartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (id);

--
-- Name: Carts Carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_pkey" PRIMARY KEY (id);

--
-- Name: Categories Categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY (id);

--
-- Name: ContentPages ContentPages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ContentPages"
    ADD CONSTRAINT "ContentPages_pkey" PRIMARY KEY (id);

--
-- Name: CouponUsages CouponUsages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponUsages"
    ADD CONSTRAINT "CouponUsages_pkey" PRIMARY KEY (id);

--
-- Name: Coupons Coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_pkey" PRIMARY KEY (id);

--
-- Name: EmailLogs EmailLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_pkey" PRIMARY KEY (id);

--
-- Name: EmailTemplates EmailTemplates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailTemplates"
    ADD CONSTRAINT "EmailTemplates_pkey" PRIMARY KEY (id);

--
-- Name: HomeSettings HomeSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."HomeSettings"
    ADD CONSTRAINT "HomeSettings_pkey" PRIMARY KEY (id);

--
-- Name: Invoices Invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_pkey" PRIMARY KEY (id);

--
-- Name: LogisticsCredentials LogisticsCredentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LogisticsCredentials"
    ADD CONSTRAINT "LogisticsCredentials_pkey" PRIMARY KEY (id);

--
-- Name: OrderItems OrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);

--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);

--
-- Name: Permissions Permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Permissions"
    ADD CONSTRAINT "Permissions_pkey" PRIMARY KEY (id);

--
-- Name: ProductBarcodes ProductBarcodes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBarcodes"
    ADD CONSTRAINT "ProductBarcodes_pkey" PRIMARY KEY (id);

--
-- Name: ProductBatches ProductBatches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBatches"
    ADD CONSTRAINT "ProductBatches_pkey" PRIMARY KEY (id);

--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);

--
-- Name: RefreshTokens RefreshTokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY (id);

--
-- Name: RegretRequests RegretRequests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RegretRequests"
    ADD CONSTRAINT "RegretRequests_pkey" PRIMARY KEY (id);

--
-- Name: ReviewHelpful ReviewHelpful_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReviewHelpful"
    ADD CONSTRAINT "ReviewHelpful_pkey" PRIMARY KEY (id);

--
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);

--
-- Name: RolePermissions RolePermissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_pkey" PRIMARY KEY (id);

--
-- Name: RolePermissions RolePermissions_roleId_permissionId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_roleId_permissionId_key" UNIQUE ("roleId", "permissionId");

--
-- Name: Roles Roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_pkey" PRIMARY KEY (id);

--
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (id);

--
-- Name: ShippingMethods ShippingMethods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ShippingMethods"
    ADD CONSTRAINT "ShippingMethods_pkey" PRIMARY KEY (id);

--
-- Name: SmtpSettings SmtpSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SmtpSettings"
    ADD CONSTRAINT "SmtpSettings_pkey" PRIMARY KEY (id);

--
-- Name: StockAlerts StockAlerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockAlerts"
    ADD CONSTRAINT "StockAlerts_pkey" PRIMARY KEY (id);

--
-- Name: StockLocations StockLocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockLocations"
    ADD CONSTRAINT "StockLocations_pkey" PRIMARY KEY (id);

--
-- Name: StockMovements StockMovements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_pkey" PRIMARY KEY (id);

--
-- Name: StockReservations StockReservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockReservations"
    ADD CONSTRAINT "StockReservations_pkey" PRIMARY KEY (id);

--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);

--
-- Name: Wishlists Wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlists"
    ADD CONSTRAINT "Wishlists_pkey" PRIMARY KEY (id);

--
-- Name: afip_credentials afip_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.afip_credentials
    ADD CONSTRAINT afip_credentials_pkey PRIMARY KEY (id);

--
-- Name: shipment_trackings shipment_trackings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment_trackings
    ADD CONSTRAINT shipment_trackings_pkey PRIMARY KEY (id);

--
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);

--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);

--
-- Name: afip_credentials_cuit; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX afip_credentials_cuit ON public.afip_credentials USING btree (cuit);

--
-- Name: afip_credentials_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX afip_credentials_is_active ON public.afip_credentials USING btree ("isActive");

--
-- Name: audit_logs_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_action ON public."AuditLogs" USING btree (action);

--
-- Name: audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at ON public."AuditLogs" USING btree ("createdAt");

--
-- Name: audit_logs_resource_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_resource_type ON public."AuditLogs" USING btree ("resourceType");

--
-- Name: audit_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_status ON public."AuditLogs" USING btree (status);

--
-- Name: audit_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_user_id ON public."AuditLogs" USING btree ("userId");

--
-- Name: cart_items_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cart_items_cart_id ON public."CartItems" USING btree ("cartId");

--
-- Name: cart_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cart_items_product_id ON public."CartItems" USING btree ("productId");

--
-- Name: carts_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_expires_at ON public."Carts" USING btree ("expiresAt");

--
-- Name: carts_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_session_id ON public."Carts" USING btree ("sessionId");

--
-- Name: carts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX carts_user_id ON public."Carts" USING btree ("userId");

--
-- Name: categories_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_is_active ON public."Categories" USING btree ("isActive");

--
-- Name: categories_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name ON public."Categories" USING btree (name);

--
-- Name: categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug ON public."Categories" USING btree (slug);

--
-- Name: categories_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_sort_order ON public."Categories" USING btree ("sortOrder");

--
-- Name: content_pages_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX content_pages_slug ON public."ContentPages" USING btree (slug);

--
-- Name: coupons_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX coupons_code ON public."Coupons" USING btree (code);

--
-- Name: email_templates_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX email_templates_name ON public."EmailTemplates" USING btree (name);

--
-- Name: invoices_afip_identity; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX invoices_afip_identity ON public."Invoices" USING btree ("pointOfSale", "afipVoucherType", "afipVoucherNumber");

--
-- Name: invoices_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_created_at ON public."Invoices" USING btree ("createdAt");

--
-- Name: invoices_invoice_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX invoices_invoice_number ON public."Invoices" USING btree ("invoiceNumber");

--
-- Name: invoices_issue_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_issue_date ON public."Invoices" USING btree ("issueDate");

--
-- Name: invoices_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_order_id ON public."Invoices" USING btree ("orderId");

--
-- Name: invoices_origin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_origin ON public."Invoices" USING btree (origin);

--
-- Name: invoices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_status ON public."Invoices" USING btree (status);

--
-- Name: invoices_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_user_id ON public."Invoices" USING btree ("userId");

--
-- Name: logistics_credentials_carrier; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX logistics_credentials_carrier ON public."LogisticsCredentials" USING btree (carrier);

--
-- Name: order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id ON public."OrderItems" USING btree ("orderId");

--
-- Name: order_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_product_id ON public."OrderItems" USING btree ("productId");

--
-- Name: order_items_product_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_product_sku ON public."OrderItems" USING btree ("productSku");

--
-- Name: orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_at ON public."Orders" USING btree ("createdAt");

--
-- Name: orders_invoice_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_invoice_number ON public."Orders" USING btree ("invoiceNumber");

--
-- Name: orders_order_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_order_number ON public."Orders" USING btree ("orderNumber");

--
-- Name: orders_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_payment_id ON public."Orders" USING btree ("paymentId");

--
-- Name: orders_payment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_payment_status ON public."Orders" USING btree ("paymentStatus");

--
-- Name: orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status ON public."Orders" USING btree (status);

--
-- Name: orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_user_id ON public."Orders" USING btree ("userId");

--
-- Name: permissions_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_category ON public."Permissions" USING btree (category);

--
-- Name: permissions_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permissions_name ON public."Permissions" USING btree (name);

--
-- Name: permissions_resource_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permissions_resource_action ON public."Permissions" USING btree (resource, action);

--
-- Name: product_barcodes_barcode; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_barcodes_barcode ON public."ProductBarcodes" USING btree (barcode);

--
-- Name: product_barcodes_barcode_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_barcodes_barcode_type ON public."ProductBarcodes" USING btree ("barcodeType");

--
-- Name: product_barcodes_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_barcodes_is_primary ON public."ProductBarcodes" USING btree ("isPrimary");

--
-- Name: product_barcodes_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_barcodes_product_id ON public."ProductBarcodes" USING btree ("productId");

--
-- Name: product_batches_batch_number; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_batches_batch_number ON public."ProductBatches" USING btree ("batchNumber");

--
-- Name: product_batches_expiration_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_batches_expiration_date ON public."ProductBatches" USING btree ("expirationDate");

--
-- Name: product_batches_location_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_batches_location_code ON public."ProductBatches" USING btree ("locationCode");

--
-- Name: product_batches_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_batches_product_id ON public."ProductBatches" USING btree ("productId");

--
-- Name: product_batches_product_id_batch_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX product_batches_product_id_batch_number ON public."ProductBatches" USING btree ("productId", "batchNumber");

--
-- Name: product_batches_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX product_batches_status ON public."ProductBatches" USING btree (status);

--
-- Name: products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_category_id ON public."Products" USING btree ("categoryId");

--
-- Name: products_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_is_active ON public."Products" USING btree ("isActive");

--
-- Name: products_is_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_is_featured ON public."Products" USING btree ("isFeatured");

--
-- Name: products_price; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_price ON public."Products" USING btree (price);

--
-- Name: products_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku ON public."Products" USING btree (sku);

--
-- Name: products_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_slug ON public."Products" USING btree (slug);

--
-- Name: products_stock; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_stock ON public."Products" USING btree (stock);

--
-- Name: products_supplier_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_supplier_id ON public."Products" USING btree ("supplierId");

--
-- Name: refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_expires_at ON public."RefreshTokens" USING btree ("expiresAt");

--
-- Name: refresh_tokens_is_revoked; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_is_revoked ON public."RefreshTokens" USING btree ("isRevoked");

--
-- Name: refresh_tokens_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX refresh_tokens_token ON public."RefreshTokens" USING btree (token);

--
-- Name: refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_user_id ON public."RefreshTokens" USING btree ("userId");

--
-- Name: regret_requests_customer_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX regret_requests_customer_email ON public."RegretRequests" USING btree ("customerEmail");

--
-- Name: regret_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX regret_requests_status ON public."RegretRequests" USING btree (status);

--
-- Name: role_permissions_permission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_permission_id ON public."RolePermissions" USING btree ("permissionId");

--
-- Name: role_permissions_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX role_permissions_role_id ON public."RolePermissions" USING btree ("roleId");

--
-- Name: role_permissions_role_id_permission_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX role_permissions_role_id_permission_id ON public."RolePermissions" USING btree ("roleId", "permissionId");

--
-- Name: roles_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX roles_is_active ON public."Roles" USING btree ("isActive");

--
-- Name: roles_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_name ON public."Roles" USING btree (name);

--
-- Name: settings_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX settings_key ON public."Settings" USING btree (key);

--
-- Name: shipment_trackings_shipment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipment_trackings_shipment_id ON public.shipment_trackings USING btree ("shipmentId");

--
-- Name: shipment_trackings_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipment_trackings_timestamp ON public.shipment_trackings USING btree ("timestamp");

--
-- Name: shipments_carrier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipments_carrier ON public.shipments USING btree (carrier);

--
-- Name: shipments_estimated_delivery_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipments_estimated_delivery_date ON public.shipments USING btree ("estimatedDeliveryDate");

--
-- Name: shipments_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipments_order_id ON public.shipments USING btree ("orderId");

--
-- Name: shipments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX shipments_status ON public.shipments USING btree (status);

--
-- Name: shipments_tracking_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX shipments_tracking_number ON public.shipments USING btree ("trackingNumber");

--
-- Name: shipping_methods_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX shipping_methods_code ON public."ShippingMethods" USING btree (code);

--
-- Name: stock_alerts_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_alerts_created_at ON public."StockAlerts" USING btree ("createdAt");

--
-- Name: stock_alerts_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_alerts_is_read ON public."StockAlerts" USING btree ("isRead");

--
-- Name: stock_alerts_is_resolved; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_alerts_is_resolved ON public."StockAlerts" USING btree ("isResolved");

--
-- Name: stock_alerts_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_alerts_product_id ON public."StockAlerts" USING btree ("productId");

--
-- Name: stock_alerts_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_alerts_severity ON public."StockAlerts" USING btree (severity);

--
-- Name: stock_alerts_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_alerts_type ON public."StockAlerts" USING btree (type);

--
-- Name: stock_locations_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_locations_is_active ON public."StockLocations" USING btree ("isActive");

--
-- Name: stock_locations_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_locations_is_primary ON public."StockLocations" USING btree ("isPrimary");

--
-- Name: stock_locations_location_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_locations_location_code ON public."StockLocations" USING btree ("locationCode");

--
-- Name: stock_locations_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_locations_product_id ON public."StockLocations" USING btree ("productId");

--
-- Name: stock_locations_product_id_location_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX stock_locations_product_id_location_code ON public."StockLocations" USING btree ("productId", "locationCode");

--
-- Name: stock_movements_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_created_at ON public."StockMovements" USING btree ("createdAt");

--
-- Name: stock_movements_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_product_id ON public."StockMovements" USING btree ("productId");

--
-- Name: stock_movements_reference_type_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_reference_type_reference_id ON public."StockMovements" USING btree ("referenceType", "referenceId");

--
-- Name: stock_movements_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_type ON public."StockMovements" USING btree (type);

--
-- Name: stock_movements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_user_id ON public."StockMovements" USING btree ("userId");

--
-- Name: stock_reservations_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_expires_at ON public."StockReservations" USING btree ("expiresAt");

--
-- Name: stock_reservations_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_product_id ON public."StockReservations" USING btree ("productId");

--
-- Name: stock_reservations_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_session_id ON public."StockReservations" USING btree ("sessionId");

--
-- Name: stock_reservations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_status ON public."StockReservations" USING btree (status);

--
-- Name: stock_reservations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_reservations_user_id ON public."StockReservations" USING btree ("userId");

--
-- Name: suppliers_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX suppliers_is_active ON public.suppliers USING btree (is_active);

--
-- Name: suppliers_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX suppliers_name ON public.suppliers USING btree (name);

--
-- Name: users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email ON public."Users" USING btree (email);

--
-- Name: users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role ON public."Users" USING btree (role);

--
-- Name: wishlists_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wishlists_created_at ON public."Wishlists" USING btree ("createdAt");

--
-- Name: wishlists_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wishlists_product_id ON public."Wishlists" USING btree ("productId");

--
-- Name: wishlists_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX wishlists_user_id ON public."Wishlists" USING btree ("userId");

--
-- Name: wishlists_user_id_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX wishlists_user_id_product_id ON public."Wishlists" USING btree ("userId", "productId");

--
-- Name: AuditLogs AuditLogs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: CartItems CartItems_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Carts"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: CartItems CartItems_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Carts Carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: CouponUsages CouponUsages_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponUsages"
    ADD CONSTRAINT "CouponUsages_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: CouponUsages CouponUsages_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponUsages"
    ADD CONSTRAINT "CouponUsages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: CouponUsages CouponUsages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CouponUsages"
    ADD CONSTRAINT "CouponUsages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;

--
-- Name: Coupons Coupons_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: EmailLogs EmailLogs_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id);

--
-- Name: EmailLogs EmailLogs_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."EmailTemplates"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: EmailLogs EmailLogs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: EmailTemplates EmailTemplates_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailTemplates"
    ADD CONSTRAINT "EmailTemplates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Invoices Invoices_cancelledBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_cancelledBy_fkey" FOREIGN KEY ("cancelledBy") REFERENCES public."Users"(id);

--
-- Name: Invoices Invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: Invoices Invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

--
-- Name: OrderItems OrderItems_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: OrderItems OrderItems_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Orders Orders_shippingMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES public."ShippingMethods"(id);

--
-- Name: Orders Orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: ProductBarcodes ProductBarcodes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBarcodes"
    ADD CONSTRAINT "ProductBarcodes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;

--
-- Name: ProductBatches ProductBatches_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductBatches"
    ADD CONSTRAINT "ProductBatches_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;

--
-- Name: Products Products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Products Products_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Products Products_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: RefreshTokens RefreshTokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "RefreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: RegretRequests RegretRequests_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RegretRequests"
    ADD CONSTRAINT "RegretRequests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: RegretRequests RegretRequests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RegretRequests"
    ADD CONSTRAINT "RegretRequests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: ReviewHelpful ReviewHelpful_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReviewHelpful"
    ADD CONSTRAINT "ReviewHelpful_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public."Reviews"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: ReviewHelpful ReviewHelpful_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReviewHelpful"
    ADD CONSTRAINT "ReviewHelpful_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;

--
-- Name: Reviews Reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;

--
-- Name: Reviews Reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;

--
-- Name: RolePermissions RolePermissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permissions"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: RolePermissions RolePermissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Roles"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: StockAlerts StockAlerts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockAlerts"
    ADD CONSTRAINT "StockAlerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;

--
-- Name: StockAlerts StockAlerts_resolvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockAlerts"
    ADD CONSTRAINT "StockAlerts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: StockLocations StockLocations_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockLocations"
    ADD CONSTRAINT "StockLocations_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;

--
-- Name: StockMovements StockMovements_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;

--
-- Name: StockMovements StockMovements_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;

--
-- Name: StockReservations StockReservations_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockReservations"
    ADD CONSTRAINT "StockReservations_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;

--
-- Name: StockReservations StockReservations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StockReservations"
    ADD CONSTRAINT "StockReservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Users Users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Roles"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: Wishlists Wishlists_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlists"
    ADD CONSTRAINT "Wishlists_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: Wishlists Wishlists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wishlists"
    ADD CONSTRAINT "Wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;

--
-- Name: shipment_trackings shipment_trackings_shipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipment_trackings
    ADD CONSTRAINT "shipment_trackings_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES public.shipments(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: shipments shipments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
--
