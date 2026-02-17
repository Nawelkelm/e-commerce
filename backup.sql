--
-- PostgreSQL database dump
--

\restrict hRTPIzqcFBlfemFJ9FrqtSAnB6cDPevWNhQ2jc6MHEEgdL9gaEshFCzgPxuxAE0

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: enum_AuditLogs_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_AuditLogs_status" AS ENUM (
    'success',
    'failure'
);


ALTER TYPE public."enum_AuditLogs_status" OWNER TO postgres;

--
-- Name: enum_BankAccounts_accountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_BankAccounts_accountType" AS ENUM (
    'Cuenta Corriente',
    'Caja de Ahorro'
);


ALTER TYPE public."enum_BankAccounts_accountType" OWNER TO postgres;

--
-- Name: enum_Coupons_discountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Coupons_discountType" AS ENUM (
    'percentage',
    'fixed',
    'freeShipping'
);


ALTER TYPE public."enum_Coupons_discountType" OWNER TO postgres;

--
-- Name: enum_EmailLogs_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_EmailLogs_status" AS ENUM (
    'pending',
    'sent',
    'failed',
    'bounced'
);


ALTER TYPE public."enum_EmailLogs_status" OWNER TO postgres;

--
-- Name: enum_EmailTemplates_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_EmailTemplates_type" AS ENUM (
    'order_confirmation',
    'order_shipped',
    'order_delivered',
    'abandoned_cart',
    'welcome',
    'password_reset',
    'promotional',
    'custom'
);


ALTER TYPE public."enum_EmailTemplates_type" OWNER TO postgres;

--
-- Name: enum_Invoices_afipStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Invoices_afipStatus" AS ENUM (
    'pending',
    'authorized',
    'rejected',
    'error',
    'not_required'
);


ALTER TYPE public."enum_Invoices_afipStatus" OWNER TO postgres;

--
-- Name: enum_Invoices_customerTaxCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Invoices_customerTaxCategory" AS ENUM (
    'responsable_inscripto',
    'responsable_monotributo',
    'exento',
    'no_responsable',
    'consumidor_final'
);


ALTER TYPE public."enum_Invoices_customerTaxCategory" OWNER TO postgres;

--
-- Name: enum_Invoices_invoiceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Invoices_invoiceType" AS ENUM (
    'A',
    'B',
    'C',
    'E',
    'M'
);


ALTER TYPE public."enum_Invoices_invoiceType" OWNER TO postgres;

--
-- Name: enum_Invoices_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Invoices_status" AS ENUM (
    'draft',
    'issued',
    'paid',
    'cancelled',
    'refunded'
);


ALTER TYPE public."enum_Invoices_status" OWNER TO postgres;

--
-- Name: enum_LogisticsCredentials_carrier; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_LogisticsCredentials_carrier" AS ENUM (
    'Andreani',
    'OCA',
    'Correo Argentino'
);


ALTER TYPE public."enum_LogisticsCredentials_carrier" OWNER TO postgres;

--
-- Name: enum_LogisticsCredentials_syncStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_LogisticsCredentials_syncStatus" AS ENUM (
    'success',
    'error',
    'pending',
    'never'
);


ALTER TYPE public."enum_LogisticsCredentials_syncStatus" OWNER TO postgres;

--
-- Name: enum_Orders_paymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Orders_paymentStatus" AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded',
    'pending_verification'
);


ALTER TYPE public."enum_Orders_paymentStatus" OWNER TO postgres;

--
-- Name: enum_Orders_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Orders_status" AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);


ALTER TYPE public."enum_Orders_status" OWNER TO postgres;

--
-- Name: enum_ProductBarcodes_barcodeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ProductBarcodes_barcodeType" AS ENUM (
    'EAN13',
    'EAN8',
    'UPC',
    'CODE128',
    'QR',
    'CODE39',
    'ITF14'
);


ALTER TYPE public."enum_ProductBarcodes_barcodeType" OWNER TO postgres;

--
-- Name: enum_ProductBatches_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ProductBatches_status" AS ENUM (
    'active',
    'depleted',
    'expired',
    'recalled'
);


ALTER TYPE public."enum_ProductBatches_status" OWNER TO postgres;

--
-- Name: enum_ShippingMethods_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_ShippingMethods_type" AS ENUM (
    'carrier',
    'custom',
    'pickup',
    'agreement'
);


ALTER TYPE public."enum_ShippingMethods_type" OWNER TO postgres;

--
-- Name: enum_SmtpSettings_provider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_SmtpSettings_provider" AS ENUM (
    'gmail',
    'outlook',
    'sendgrid',
    'mailgun',
    'custom'
);


ALTER TYPE public."enum_SmtpSettings_provider" OWNER TO postgres;

--
-- Name: enum_SmtpSettings_testStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_SmtpSettings_testStatus" AS ENUM (
    'pending',
    'success',
    'failed'
);


ALTER TYPE public."enum_SmtpSettings_testStatus" OWNER TO postgres;

--
-- Name: enum_StockAlerts_severity; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_StockAlerts_severity" AS ENUM (
    'info',
    'warning',
    'critical'
);


ALTER TYPE public."enum_StockAlerts_severity" OWNER TO postgres;

--
-- Name: enum_StockAlerts_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_StockAlerts_type" AS ENUM (
    'low_stock',
    'out_of_stock',
    'overstock',
    'expiring_soon'
);


ALTER TYPE public."enum_StockAlerts_type" OWNER TO postgres;

--
-- Name: enum_StockMovements_referenceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_StockMovements_referenceType" AS ENUM (
    'order',
    'purchase_order',
    'transfer',
    'import',
    'manual',
    'other'
);


ALTER TYPE public."enum_StockMovements_referenceType" OWNER TO postgres;

--
-- Name: enum_StockMovements_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_StockMovements_type" AS ENUM (
    'purchase',
    'sale',
    'adjustment',
    'return',
    'damage',
    'transfer_in',
    'transfer_out',
    'import'
);


ALTER TYPE public."enum_StockMovements_type" OWNER TO postgres;

--
-- Name: enum_StockReservations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_StockReservations_status" AS ENUM (
    'active',
    'completed',
    'expired',
    'cancelled'
);


ALTER TYPE public."enum_StockReservations_status" OWNER TO postgres;

--
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'customer',
    'admin'
);


ALTER TYPE public."enum_Users_role" OWNER TO postgres;

--
-- Name: enum_afip_credentials_connectionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_afip_credentials_connectionStatus" AS ENUM (
    'not_configured',
    'connected',
    'error',
    'testing'
);


ALTER TYPE public."enum_afip_credentials_connectionStatus" OWNER TO postgres;

--
-- Name: enum_afip_credentials_taxCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."enum_afip_credentials_taxCategory" AS ENUM (
    'responsable_inscripto',
    'responsable_monotributo',
    'exento',
    'no_responsable',
    'consumidor_final'
);


ALTER TYPE public."enum_afip_credentials_taxCategory" OWNER TO postgres;

--
-- Name: enum_shipments_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_shipments_status AS ENUM (
    'pending',
    'label_created',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed_delivery',
    'returned',
    'cancelled'
);


ALTER TYPE public.enum_shipments_status OWNER TO postgres;

--
-- Name: cleanup_expired_carts(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cleanup_expired_carts() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM "CartItems" 
    WHERE "cartId" IN (
        SELECT id FROM "Carts" 
        WHERE "expiresAt" < NOW() AND "userId" IS NULL
    );
    
    DELETE FROM "Carts" 
    WHERE "expiresAt" < NOW() AND "userId" IS NULL;
END;
$$;


ALTER FUNCTION public.cleanup_expired_carts() OWNER TO postgres;

--
-- Name: create_performance_indexes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_performance_indexes() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Índices para productos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Products') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search 
        ON "Products" USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_range 
        ON "Products" (price, "isActive") WHERE "isActive" = true;
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category_active 
        ON "Products" ("categoryId", "isActive") WHERE "isActive" = true;
    END IF;

    -- Índices para pedidos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Orders') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_date 
        ON "Orders" ("userId", "createdAt");
        
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_date 
        ON "Orders" (status, "createdAt");
    END IF;

    -- Índices para carrito
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'CartItems') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cartitems_cart_product 
        ON "CartItems" ("cartId", "productId");
    END IF;
END;
$$;


ALTER FUNCTION public.create_performance_indexes() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLogs; Type: TABLE; Schema: public; Owner: postgres
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
    status public."enum_AuditLogs_status" DEFAULT 'success'::public."enum_AuditLogs_status",
    "errorMessage" text,
    "createdAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."AuditLogs" OWNER TO postgres;

--
-- Name: COLUMN "AuditLogs".action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."AuditLogs".action IS 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.';


--
-- Name: COLUMN "AuditLogs"."resourceType"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."AuditLogs"."resourceType" IS 'Product, User, Order, etc.';


--
-- Name: BankAccounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BankAccounts" (
    id uuid NOT NULL,
    "bankName" character varying(255) NOT NULL,
    "accountType" public."enum_BankAccounts_accountType" NOT NULL,
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


ALTER TABLE public."BankAccounts" OWNER TO postgres;

--
-- Name: COLUMN "BankAccounts"."holderDocument"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."BankAccounts"."holderDocument" IS 'CUIT/CUIL del titular';


--
-- Name: COLUMN "BankAccounts"."isPrimary"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."BankAccounts"."isPrimary" IS 'Cuenta bancaria principal para mostrar por defecto';


--
-- Name: CartItems; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."CartItems" OWNER TO postgres;

--
-- Name: Carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Carts" (
    id uuid NOT NULL,
    "sessionId" character varying(255),
    "expiresAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" uuid
);


ALTER TABLE public."Carts" OWNER TO postgres;

--
-- Name: Categories; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Categories" OWNER TO postgres;

--
-- Name: CouponUsages; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."CouponUsages" OWNER TO postgres;

--
-- Name: CouponUsages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CouponUsages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CouponUsages_id_seq" OWNER TO postgres;

--
-- Name: CouponUsages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CouponUsages_id_seq" OWNED BY public."CouponUsages".id;


--
-- Name: Coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Coupons" (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    "discountType" public."enum_Coupons_discountType" DEFAULT 'percentage'::public."enum_Coupons_discountType" NOT NULL,
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


ALTER TABLE public."Coupons" OWNER TO postgres;

--
-- Name: Coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Coupons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Coupons_id_seq" OWNER TO postgres;

--
-- Name: Coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Coupons_id_seq" OWNED BY public."Coupons".id;


--
-- Name: EmailLogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailLogs" (
    id integer NOT NULL,
    "templateId" integer,
    "recipientEmail" character varying(255) NOT NULL,
    "recipientName" character varying(255),
    subject character varying(255) NOT NULL,
    status public."enum_EmailLogs_status" DEFAULT 'pending'::public."enum_EmailLogs_status" NOT NULL,
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


ALTER TABLE public."EmailLogs" OWNER TO postgres;

--
-- Name: EmailLogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."EmailLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."EmailLogs_id_seq" OWNER TO postgres;

--
-- Name: EmailLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."EmailLogs_id_seq" OWNED BY public."EmailLogs".id;


--
-- Name: EmailTemplates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailTemplates" (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    "htmlContent" text NOT NULL,
    "textContent" text,
    type public."enum_EmailTemplates_type" NOT NULL,
    variables character varying(255)[] DEFAULT (ARRAY[]::character varying[])::character varying(255)[],
    "isActive" boolean DEFAULT true NOT NULL,
    "createdBy" uuid,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."EmailTemplates" OWNER TO postgres;

--
-- Name: EmailTemplates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."EmailTemplates_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."EmailTemplates_id_seq" OWNER TO postgres;

--
-- Name: EmailTemplates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."EmailTemplates_id_seq" OWNED BY public."EmailTemplates".id;


--
-- Name: HomeSettings; Type: TABLE; Schema: public; Owner: postgres
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
    "footerLinksEnabled" boolean DEFAULT true,
    "footerColumn1Title" character varying(100) DEFAULT 'Información'::character varying,
    "footerColumn1Links" jsonb DEFAULT '[{"url": "/sobre-nosotros", "text": "Sobre Nosotros"}, {"url": "/contacto", "text": "Contacto"}, {"url": "/blog", "text": "Blog"}]'::jsonb,
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


ALTER TABLE public."HomeSettings" OWNER TO postgres;

--
-- Name: Invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invoices" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "invoiceNumber" character varying(255) NOT NULL,
    "orderId" uuid,
    "userId" uuid,
    "customerName" character varying(255) NOT NULL,
    "customerEmail" character varying(255) NOT NULL,
    "customerPhone" character varying(255),
    "customerAddress" text,
    "customerTaxId" character varying(255),
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax numeric(10,2) DEFAULT 0 NOT NULL,
    "taxRate" numeric(5,2) DEFAULT 16.00 NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    shipping numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    items jsonb NOT NULL,
    "paymentMethod" character varying(255) NOT NULL,
    "paymentId" character varying(255),
    "paymentDate" timestamp without time zone DEFAULT now() NOT NULL,
    status character varying(50) DEFAULT 'issued'::character varying NOT NULL,
    "issueDate" timestamp without time zone DEFAULT now() NOT NULL,
    "dueDate" timestamp without time zone,
    notes text,
    "customerNotes" text,
    "pdfUrl" character varying(255),
    "cancelledAt" timestamp without time zone,
    "cancelledBy" uuid,
    "cancellationReason" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    cae character varying(14),
    "caeDueDate" date,
    "invoiceType" public."enum_Invoices_invoiceType" DEFAULT 'B'::public."enum_Invoices_invoiceType" NOT NULL,
    "pointOfSale" integer DEFAULT 1 NOT NULL,
    "afipStatus" public."enum_Invoices_afipStatus" DEFAULT 'pending'::public."enum_Invoices_afipStatus" NOT NULL,
    "afipResponse" jsonb,
    "afipRequestDate" timestamp with time zone,
    "customerTaxCategory" public."enum_Invoices_customerTaxCategory" DEFAULT 'consumidor_final'::public."enum_Invoices_customerTaxCategory" NOT NULL,
    "customerCuit" character varying(11),
    observations text
);


ALTER TABLE public."Invoices" OWNER TO postgres;

--
-- Name: COLUMN "Invoices".cae; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices".cae IS 'Código de Autorización Electrónica de AFIP';


--
-- Name: COLUMN "Invoices"."caeDueDate"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices"."caeDueDate" IS 'Fecha de vencimiento del CAE';


--
-- Name: COLUMN "Invoices"."invoiceType"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices"."invoiceType" IS 'Tipo de comprobante fiscal: A=Factura A, B=Factura B, C=Factura C, E=Factura E, M=Factura M';


--
-- Name: COLUMN "Invoices"."pointOfSale"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices"."pointOfSale" IS 'Punto de venta de AFIP';


--
-- Name: COLUMN "Invoices"."afipStatus"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices"."afipStatus" IS 'Estado de autorización en AFIP';


--
-- Name: COLUMN "Invoices"."afipResponse"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices"."afipResponse" IS 'Respuesta completa de AFIP al solicitar CAE';


--
-- Name: COLUMN "Invoices"."afipRequestDate"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices"."afipRequestDate" IS 'Fecha y hora de solicitud a AFIP';


--
-- Name: COLUMN "Invoices"."customerTaxCategory"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices"."customerTaxCategory" IS 'Categoría tributaria del cliente';


--
-- Name: COLUMN "Invoices"."customerCuit"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices"."customerCuit" IS 'CUIT/CUIL del cliente (obligatorio para Factura A y B con RI)';


--
-- Name: COLUMN "Invoices".observations; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Invoices".observations IS 'Observaciones o comentarios en la factura';


--
-- Name: LogisticsCredentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."LogisticsCredentials" (
    id uuid NOT NULL,
    carrier public."enum_LogisticsCredentials_carrier" NOT NULL,
    "isActive" boolean DEFAULT false,
    credentials json DEFAULT '{}'::json NOT NULL,
    "lastSyncAt" timestamp with time zone,
    "syncStatus" public."enum_LogisticsCredentials_syncStatus" DEFAULT 'never'::public."enum_LogisticsCredentials_syncStatus",
    "lastError" text,
    settings json DEFAULT '{}'::json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."LogisticsCredentials" OWNER TO postgres;

--
-- Name: OrderItems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItems" (
    id uuid NOT NULL,
    "orderId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "productName" character varying(255) NOT NULL,
    "productSku" character varying(255) NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    attributes json DEFAULT '{}'::json,
    "productSnapshot" json,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."OrderItems" OWNER TO postgres;

--
-- Name: Orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Orders" (
    id uuid NOT NULL,
    "orderNumber" character varying(255) NOT NULL,
    status public."enum_Orders_status" DEFAULT 'pending'::public."enum_Orders_status",
    "paymentStatus" public."enum_Orders_paymentStatus" DEFAULT 'pending'::public."enum_Orders_paymentStatus",
    "paymentMethod" character varying(255),
    "paymentId" character varying(255),
    subtotal numeric(10,2) NOT NULL,
    "taxAmount" numeric(10,2) DEFAULT 0,
    "shippingAmount" numeric(10,2) DEFAULT 0,
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
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "userId" uuid,
    "paidAt" timestamp without time zone,
    "invoiceId" uuid,
    "invoiceNumber" character varying(255),
    "paymentProofUrl" character varying(255),
    "paymentProofUploadedAt" timestamp without time zone,
    "bankTransferData" jsonb,
    "shippingMethodCode" character varying(255),
    "shippingMethodName" character varying(255),
    "shippingMethodId" uuid
);


ALTER TABLE public."Orders" OWNER TO postgres;

--
-- Name: Permissions; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Permissions" OWNER TO postgres;

--
-- Name: COLUMN "Permissions".resource; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Permissions".resource IS 'The resource this permission applies to (users, products, orders, etc.)';


--
-- Name: COLUMN "Permissions".action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Permissions".action IS 'The action this permission allows (create, read, update, delete)';


--
-- Name: COLUMN "Permissions".category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Permissions".category IS 'Category for grouping permissions (user_management, product_management, etc.)';


--
-- Name: ProductBarcodes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProductBarcodes" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    barcode character varying(255) NOT NULL,
    "barcodeType" public."enum_ProductBarcodes_barcodeType" DEFAULT 'EAN13'::public."enum_ProductBarcodes_barcodeType",
    "isPrimary" boolean DEFAULT false,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ProductBarcodes" OWNER TO postgres;

--
-- Name: COLUMN "ProductBarcodes".barcode; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ProductBarcodes".barcode IS 'Barcode number (EAN, UPC, etc.)';


--
-- Name: COLUMN "ProductBarcodes"."isPrimary"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ProductBarcodes"."isPrimary" IS 'Primary barcode for the product';


--
-- Name: ProductBatches; Type: TABLE; Schema: public; Owner: postgres
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
    status public."enum_ProductBatches_status" DEFAULT 'active'::public."enum_ProductBatches_status",
    notes text,
    "isPerishable" boolean DEFAULT false,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ProductBatches" OWNER TO postgres;

--
-- Name: COLUMN "ProductBatches"."batchNumber"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ProductBatches"."batchNumber" IS 'Unique batch/lot number';


--
-- Name: COLUMN "ProductBatches"."initialQuantity"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ProductBatches"."initialQuantity" IS 'Initial quantity when batch was received';


--
-- Name: COLUMN "ProductBatches"."supplierReference"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ProductBatches"."supplierReference" IS 'Supplier order/invoice reference';


--
-- Name: COLUMN "ProductBatches"."purchaseCost"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ProductBatches"."purchaseCost" IS 'Purchase cost per unit for this batch';


--
-- Name: COLUMN "ProductBatches"."totalCost"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ProductBatches"."totalCost" IS 'Total cost of the batch';


--
-- Name: COLUMN "ProductBatches"."locationCode"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."ProductBatches"."locationCode" IS 'Storage location code';


--
-- Name: Products; Type: TABLE; Schema: public; Owner: postgres
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
    "categoryId" uuid,
    supplier_id integer,
    is_own_production boolean DEFAULT false
);


ALTER TABLE public."Products" OWNER TO postgres;

--
-- Name: RefreshTokens; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."RefreshTokens" OWNER TO postgres;

--
-- Name: ReviewHelpful; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReviewHelpful" (
    id uuid NOT NULL,
    "reviewId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "isHelpful" boolean NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ReviewHelpful" OWNER TO postgres;

--
-- Name: Reviews; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Reviews" OWNER TO postgres;

--
-- Name: RolePermissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RolePermissions" (
    id uuid NOT NULL,
    "roleId" uuid NOT NULL,
    "permissionId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."RolePermissions" OWNER TO postgres;

--
-- Name: Roles; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Roles" OWNER TO postgres;

--
-- Name: COLUMN "Roles"."isSystemRole"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Roles"."isSystemRole" IS 'System roles cannot be deleted';


--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: Settings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."Settings" OWNER TO postgres;

--
-- Name: ShippingMethods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShippingMethods" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    type public."enum_ShippingMethods_type" DEFAULT 'custom'::public."enum_ShippingMethods_type" NOT NULL,
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


ALTER TABLE public."ShippingMethods" OWNER TO postgres;

--
-- Name: SmtpSettings; Type: TABLE; Schema: public; Owner: postgres
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
    provider public."enum_SmtpSettings_provider" DEFAULT 'gmail'::public."enum_SmtpSettings_provider" NOT NULL,
    "lastTestedAt" timestamp with time zone,
    "testStatus" public."enum_SmtpSettings_testStatus",
    "testError" text,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."SmtpSettings" OWNER TO postgres;

--
-- Name: StockAlerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockAlerts" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    type public."enum_StockAlerts_type" NOT NULL,
    severity public."enum_StockAlerts_severity" DEFAULT 'warning'::public."enum_StockAlerts_severity",
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


ALTER TABLE public."StockAlerts" OWNER TO postgres;

--
-- Name: StockLocations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."StockLocations" OWNER TO postgres;

--
-- Name: COLUMN "StockLocations"."locationName"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockLocations"."locationName" IS 'Name of the warehouse/store/location';


--
-- Name: COLUMN "StockLocations"."locationCode"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockLocations"."locationCode" IS 'Unique code for the location';


--
-- Name: COLUMN "StockLocations"."reservedQuantity"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockLocations"."reservedQuantity" IS 'Quantity reserved in pending orders';


--
-- Name: COLUMN "StockLocations"."isPrimary"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockLocations"."isPrimary" IS 'Primary location for this product';


--
-- Name: COLUMN "StockLocations".address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockLocations".address IS 'Physical address of the location';


--
-- Name: StockMovements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockMovements" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    type public."enum_StockMovements_type" NOT NULL,
    quantity integer NOT NULL,
    "previousStock" integer NOT NULL,
    "newStock" integer NOT NULL,
    "unitCost" numeric(10,2),
    "totalCost" numeric(10,2),
    reason character varying(255),
    notes text,
    "referenceType" public."enum_StockMovements_referenceType",
    "referenceId" character varying(255),
    "userId" uuid NOT NULL,
    "locationFrom" character varying(255),
    "locationTo" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."StockMovements" OWNER TO postgres;

--
-- Name: COLUMN "StockMovements".quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockMovements".quantity IS 'Positive for additions, negative for subtractions';


--
-- Name: COLUMN "StockMovements"."unitCost"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockMovements"."unitCost" IS 'Cost per unit for this movement';


--
-- Name: COLUMN "StockMovements"."totalCost"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockMovements"."totalCost" IS 'Total cost of the movement';


--
-- Name: COLUMN "StockMovements".reason; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockMovements".reason IS 'Reason for the stock movement';


--
-- Name: COLUMN "StockMovements"."referenceId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockMovements"."referenceId" IS 'ID of related order, transfer, etc.';


--
-- Name: COLUMN "StockMovements"."userId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockMovements"."userId" IS 'User who performed the action';


--
-- Name: COLUMN "StockMovements"."locationFrom"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockMovements"."locationFrom" IS 'Source location for transfers';


--
-- Name: COLUMN "StockMovements"."locationTo"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockMovements"."locationTo" IS 'Destination location for transfers';


--
-- Name: StockReservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockReservations" (
    id uuid NOT NULL,
    "productId" uuid NOT NULL,
    "userId" uuid,
    "sessionId" character varying(255),
    quantity integer NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    status public."enum_StockReservations_status" DEFAULT 'active'::public."enum_StockReservations_status",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."StockReservations" OWNER TO postgres;

--
-- Name: COLUMN "StockReservations"."sessionId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockReservations"."sessionId" IS 'Session ID for guest users';


--
-- Name: COLUMN "StockReservations"."expiresAt"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."StockReservations"."expiresAt" IS 'Reservation expires after 15 minutes';


--
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
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
    role public."enum_Users_role" DEFAULT 'customer'::public."enum_Users_role",
    "roleId" uuid,
    "isActive" boolean DEFAULT true,
    "emailVerified" boolean DEFAULT false,
    "verificationToken" character varying(255),
    "verificationTokenExpires" timestamp with time zone,
    "lastLoginAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- Name: COLUMN "Users"."shippingAddress"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Users"."shippingAddress" IS 'Dirección de envío por defecto: {firstName, lastName, street, city, state, postalCode, country, phone}';


--
-- Name: COLUMN "Users"."billingAddress"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Users"."billingAddress" IS 'Dirección de facturación Argentina: {firstName, lastName, street, city, state, postalCode, country, phone, cuit, companyName, fiscalCondition}';


--
-- Name: COLUMN "Users"."roleId"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public."Users"."roleId" IS 'Advanced role system - if null, uses legacy role field';


--
-- Name: Wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Wishlists" (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Wishlists" OWNER TO postgres;

--
-- Name: afip_credentials; Type: TABLE; Schema: public; Owner: postgres
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
    "taxCategory" public."enum_afip_credentials_taxCategory" DEFAULT 'responsable_inscripto'::public."enum_afip_credentials_taxCategory" NOT NULL,
    address character varying(255),
    city character varying(255),
    "postalCode" character varying(255),
    province character varying(255),
    "iibbNumber" character varying(255),
    "activityStartDate" date,
    "lastConnectionTest" timestamp with time zone,
    "connectionStatus" public."enum_afip_credentials_connectionStatus" DEFAULT 'not_configured'::public."enum_afip_credentials_connectionStatus",
    "lastError" text,
    "isActive" boolean DEFAULT true,
    config jsonb DEFAULT '{}'::jsonb,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public.afip_credentials OWNER TO postgres;

--
-- Name: COLUMN afip_credentials.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials.name IS 'Nombre descriptivo de la configuración';


--
-- Name: COLUMN afip_credentials.cuit; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials.cuit IS 'CUIT de la empresa (11 dígitos sin guiones)';


--
-- Name: COLUMN afip_credentials."businessName"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."businessName" IS 'Razón social de la empresa';


--
-- Name: COLUMN afip_credentials.certificate; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials.certificate IS 'Contenido del certificado digital (.crt) en formato PEM';


--
-- Name: COLUMN afip_credentials."privateKey"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."privateKey" IS 'Clave privada (.key) en formato PEM';


--
-- Name: COLUMN afip_credentials."pointOfSale"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."pointOfSale" IS 'Punto de venta autorizado por AFIP';


--
-- Name: COLUMN afip_credentials.production; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials.production IS 'true = Producción, false = Homologación/Testing';


--
-- Name: COLUMN afip_credentials."taxCategory"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."taxCategory" IS 'Categoría tributaria del emisor';


--
-- Name: COLUMN afip_credentials.address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials.address IS 'Dirección fiscal de la empresa';


--
-- Name: COLUMN afip_credentials.city; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials.city IS 'Ciudad';


--
-- Name: COLUMN afip_credentials."postalCode"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."postalCode" IS 'Código postal';


--
-- Name: COLUMN afip_credentials.province; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials.province IS 'Provincia';


--
-- Name: COLUMN afip_credentials."iibbNumber"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."iibbNumber" IS 'Número de Ingresos Brutos';


--
-- Name: COLUMN afip_credentials."activityStartDate"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."activityStartDate" IS 'Fecha de inicio de actividades';


--
-- Name: COLUMN afip_credentials."lastConnectionTest"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."lastConnectionTest" IS 'Última vez que se probó la conexión con AFIP';


--
-- Name: COLUMN afip_credentials."connectionStatus"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."connectionStatus" IS 'Estado de la conexión con AFIP';


--
-- Name: COLUMN afip_credentials."lastError"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."lastError" IS 'Último error de conexión o autorización';


--
-- Name: COLUMN afip_credentials."isActive"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials."isActive" IS 'Si esta configuración está activa';


--
-- Name: COLUMN afip_credentials.config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.afip_credentials.config IS 'Configuraciones adicionales en formato JSON';


--
-- Name: shipment_trackings; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.shipment_trackings OWNER TO postgres;

--
-- Name: shipments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipments (
    id uuid NOT NULL,
    "trackingNumber" character varying(255) NOT NULL,
    carrier character varying(255) NOT NULL,
    "carrierService" character varying(255),
    status public.enum_shipments_status DEFAULT 'pending'::public.enum_shipments_status,
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


ALTER TABLE public.shipments OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: TABLE suppliers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.suppliers IS 'Tabla de proveedores para gestión de productos';


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: CouponUsages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponUsages" ALTER COLUMN id SET DEFAULT nextval('public."CouponUsages_id_seq"'::regclass);


--
-- Name: Coupons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons" ALTER COLUMN id SET DEFAULT nextval('public."Coupons_id_seq"'::regclass);


--
-- Name: EmailLogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailLogs" ALTER COLUMN id SET DEFAULT nextval('public."EmailLogs_id_seq"'::regclass);


--
-- Name: EmailTemplates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplates" ALTER COLUMN id SET DEFAULT nextval('public."EmailTemplates_id_seq"'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Data for Name: AuditLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AuditLogs" (id, "userId", action, "resourceType", "resourceId", "oldValues", "newValues", "ipAddress", "userAgent", status, "errorMessage", "createdAt") FROM stdin;
7376afbc-512d-41c8-8e9d-8de307ca2b1e	\N	LOGIN_FAILED	User	admin@example.com	\N	\N	::ffff:172.18.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; es-AR) WindowsPowerShell/5.1.26100.6899	failure	Usuario no encontrado	2025-10-27 18:05:26.37+00
58981ffc-07c8-4858-854f-60fe5f586755	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-10-28 11:40:45.407+00
79c71c42-3b3d-4b07-ba9c-821e685736f4	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-10-28 11:44:17.698+00
62b020fd-8dfb-43cf-8820-933e7ed5de8c	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-10-28 11:54:19.289+00
7e37eab0-e015-4361-8e62-7b08e367b934	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-10-28 13:20:55.056+00
ce4ad6d9-5cc2-4990-8750-c0c288d96be1	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-10-28 19:43:13.329+00
30180a4b-aa9a-40ff-92b7-357aa16bb9a2	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-10-29 15:02:28.116+00
c27ba23a-dff9-488a-b1a3-d2649262268c	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-10-29 19:56:49.988+00
fbe45b17-2338-4b4b-b882-2a918cba4139	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-10-30 13:21:33.899+00
70139c17-f2e1-49f5-a9a0-7f49647c0e04	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-11-04 12:03:58.397+00
78e11294-c613-4259-bc31-7c0366102ac5	b437746d-9471-42bf-88fb-0b5c10a5ed87	LOGIN	User	b437746d-9471-42bf-88fb-0b5c10a5ed87	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-11-04 12:04:07.901+00
78ba12b5-fdba-4449-ad22-06df08e997b2	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-11-04 14:49:27.762+00
081f7d29-4bca-44d1-87b8-fb47bdf872bd	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	success	\N	2025-11-04 18:37:55.006+00
fe971165-d34d-42c9-8f76-c8446d16d50d	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	success	\N	2025-11-13 11:58:08.833+00
3c346051-9981-48a1-aa2c-295775a3af34	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	success	\N	2025-12-22 03:41:58.304+00
b6a3e9ee-5930-4dba-b456-87fe0629c4db	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	success	\N	2025-12-29 12:14:54.276+00
f666f23e-641e-438f-86a0-825b04b2c3f9	5f4734de-6667-4916-97ef-1afc2969cbe5	LOGIN	User	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	success	\N	2026-02-16 00:44:57.584+00
\.


--
-- Data for Name: BankAccounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BankAccounts" (id, "bankName", "accountType", "accountNumber", cbu, alias, "holderName", "holderDocument", "isActive", "isPrimary", "createdAt", "updatedAt") FROM stdin;
65c05701-92e6-4006-bef9-587749749639	ICBC	Caja de Ahorro	321412421	4912912492194129129419	nrk.belo	kelm nahuel	20415101423	t	t	2025-11-04 12:09:19.197+00	2025-11-04 12:09:19.197+00
\.


--
-- Data for Name: CartItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItems" (id, quantity, price, attributes, "createdAt", "updatedAt", "productId", "cartId") FROM stdin;
\.


--
-- Data for Name: Carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Carts" (id, "sessionId", "expiresAt", "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Categories" (id, name, description, slug, "imageUrl", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
8ef53445-2fd5-4abf-b1c2-d47417c118c9	Electrónicos	Dispositivos electrónicos y tecnología	electronicos	\N	t	0	2025-10-24 21:03:34.138+00	2025-10-24 21:03:34.138+00
c86b8bb9-452b-42d6-bde0-24f963a360cb	Ropa	Ropa y accesorios de moda	ropa	\N	t	0	2025-10-24 21:03:34.144+00	2025-10-24 21:03:34.144+00
a7e4038e-4837-4b31-8b73-750ae4d61c2a	Hogar	Artículos para el hogar y decoración	hogar	\N	t	0	2025-10-24 21:03:34.15+00	2025-10-24 21:03:34.15+00
2e543518-5cb0-4bc2-b880-cf9505952d7f	Deportes	Equipos y ropa deportiva	deportes	\N	t	0	2025-10-24 21:03:34.155+00	2025-10-24 21:03:34.155+00
\.


--
-- Data for Name: CouponUsages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CouponUsages" (id, "couponId", "userId", "orderId", "discountApplied", "usedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Coupons" (id, code, description, "discountType", "discountValue", "minPurchase", "maxDiscount", "usageLimit", "usageLimitPerUser", "usedCount", "startDate", "endDate", "isActive", "isPublic", "applicableCategories", "applicableProducts", "excludedCategories", "excludedProducts", "firstPurchaseOnly", stackable, "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EmailLogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailLogs" (id, "templateId", "recipientEmail", "recipientName", subject, status, "sentAt", "openedAt", "clickedAt", "errorMessage", metadata, "orderId", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: EmailTemplates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailTemplates" (id, name, subject, "htmlContent", "textContent", type, variables, "isActive", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HomeSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."HomeSettings" (id, carousel, "heroTitle", "heroSubtitle", "heroCta1Text", "heroCta1Link", "heroCta2Text", "heroCta2Link", "featuresEnabled", "featuresTitle", features, "categoriesEnabled", "categoriesTitle", "categoryIds", "categoryIcons", "testimonialsEnabled", "testimonialsTitle", testimonials, "newsletterEnabled", "newsletterTitle", "newsletterSubtitle", "couponBannerEnabled", "couponBannerTitle", "couponBannerSubtitle", "couponBannerMaxCoupons", "metaTitle", "metaDescription", "metaKeywords", "footerEnabled", "footerAboutTitle", "footerAboutText", "footerContactEnabled", "footerContactTitle", "footerAddress", "footerPhone", "footerEmail", "footerSchedule", "footerSocialEnabled", "footerSocialTitle", "footerFacebook", "footerInstagram", "footerTwitter", "footerYoutube", "footerTiktok", "footerWhatsapp", "footerLinkedin", "footerLinksEnabled", "footerColumn1Title", "footerColumn1Links", "footerColumn2Title", "footerColumn2Links", "footerColumn3Title", "footerColumn3Links", "footerCopyrightText", "footerShowPaymentMethods", "footerPaymentMethods", "createdAt", "updatedAt") FROM stdin;
00000000-0000-0000-0000-000000000001	[]	Bienvenido a Nuestra Tienda	Encuentra los mejores productos al mejor precio	Ver Productos	/productos	Ofertas	/productos?ofertas=true	t	¿Por qué elegirnos?	[{"icon": "truck", "title": "Envío Gratis", "description": "En compras superiores a $10,000"}, {"icon": "shield", "title": "Compra Segura", "description": "Protegemos tus datos"}, {"icon": "refresh", "title": "Devoluciones", "description": "30 días para devolver"}, {"icon": "support", "title": "Soporte 24/7", "description": "Estamos para ayudarte"}]	t	Categorías Destacadas	[]	{}	f	Lo que dicen nuestros clientes	[]	t	Suscríbete a nuestro newsletter	Recibe ofertas exclusivas y novedades	t	¡Ofertas Especiales!	Aprovecha estos cupones de descuento	3	E-Commerce - Tu tienda online de confianza	Encuentra los mejores productos al mejor precio. Envío gratis, compra segura y soporte 24/7.	tienda online, ecommerce, productos, ofertas, envío gratis	t	Sobre Nosotros	Somos una tienda comprometida con la calidad y satisfacción de nuestros clientes.	t	Contacto				Lun - Vie: 9:00 - 18:00	t	Síguenos								t	Información	[{"url": "/sobre-nosotros", "text": "Sobre Nosotros"}, {"url": "/contacto", "text": "Contacto"}, {"url": "/blog", "text": "Blog"}]	Ayuda	[{"url": "/faq", "text": "Preguntas Frecuentes"}, {"url": "/envios", "text": "Envíos"}, {"url": "/devoluciones", "text": "Devoluciones"}]	Legal	[{"url": "/terminos", "text": "Términos y Condiciones"}, {"url": "/privacidad", "text": "Política de Privacidad"}, {"url": "/cookies", "text": "Política de Cookies"}]	© 2025 E-Commerce. Todos los derechos reservados.	t	["visa", "mastercard", "amex", "mercadopago"]	2025-10-25 13:48:17.582+00	2025-10-25 13:48:17.582+00
\.


--
-- Data for Name: Invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invoices" (id, "invoiceNumber", "orderId", "userId", "customerName", "customerEmail", "customerPhone", "customerAddress", "customerTaxId", subtotal, tax, "taxRate", discount, shipping, total, items, "paymentMethod", "paymentId", "paymentDate", status, "issueDate", "dueDate", notes, "customerNotes", "pdfUrl", "cancelledAt", "cancelledBy", "cancellationReason", "createdAt", "updatedAt", cae, "caeDueDate", "invoiceType", "pointOfSale", "afipStatus", "afipResponse", "afipRequestDate", "customerTaxCategory", "customerCuit", observations) FROM stdin;
fe24c868-712f-4f20-8351-30412eda64a5	FAC-2025-000002	f0566266-b942-4ecf-bb85-1c2b9b3ec5aa	5f4734de-6667-4916-97ef-1afc2969cbe5	Admin User	admin@ecommerce.com	1234567890	Dirección del administrador	\N	2399.97	503.99	21.00	0.00	0.00	2903.96	[{"quantity": 3, "productId": "95121177-df92-40d5-9d91-6263b32bdb90", "unitPrice": 799.99, "totalPrice": 2399.97, "description": "Samsung Galaxy S21"}]	mercadopago	\N	2025-10-28 11:28:17.326	paid	2025-10-28 11:28:17.326	2025-11-27 11:28:17.326	Factura generada automáticamente por el sistema	\N	/uploads/invoices/FAC-2025-000002.pdf	\N	\N	\N	2025-10-28 11:28:17.414	2025-10-29 14:13:37.875	\N	\N	B	1	pending	\N	\N	consumidor_final	\N	\N
474e5c8d-a1d2-4a9a-a916-9fe29b3c3062	FAC-2025-000001	8441ba40-3f97-4d98-ac5b-b0e4f7adb74d	5f4734de-6667-4916-97ef-1afc2969cbe5	Admin User	admin@ecommerce.com	1234567890	Dirección del administrador	\N	829.98	174.30	21.00	0.00	0.00	1004.28	[]	mercadopago	\N	2025-10-28 11:11:48.265	paid	2025-10-28 11:11:48.265	2025-11-27 11:11:48.265	Factura generada automáticamente por el sistema	\N	/uploads/invoices/FAC-2025-000001.pdf	\N	\N	\N	2025-10-28 11:18:49.735	2025-10-29 14:13:37.853	\N	\N	B	1	pending	\N	\N	consumidor_final	\N	\N
fa6bd83e-b41a-421c-ad02-025eeaf23bac	FAC-2025-000003	d15857e6-650a-43ac-9339-abccb1591e2e	5f4734de-6667-4916-97ef-1afc2969cbe5	Admin User	admin@ecommerce.com	1234567890	Dirección del administrador	\N	1599.98	336.00	21.00	0.00	0.00	1935.98	[{"quantity": 2, "productId": "95121177-df92-40d5-9d91-6263b32bdb90", "unitPrice": 799.99, "totalPrice": 1599.98, "description": "Samsung Galaxy S21"}]	mercadopago	\N	2025-10-28 11:28:17.354	paid	2025-10-28 11:28:17.354	2025-11-27 11:28:17.354	Factura generada automáticamente por el sistema	\N	/uploads/invoices/FAC-2025-000003.pdf	\N	\N	\N	2025-10-28 11:28:17.49	2025-10-29 14:13:37.879	\N	\N	B	1	pending	\N	\N	consumidor_final	\N	\N
63d57765-d4a1-42d2-a0b4-8f15a6e1ed78	FAC-2025-000004	6b725d33-1f06-4fc6-90ff-686d9d7fdf61	5f4734de-6667-4916-97ef-1afc2969cbe5	Admin User	admin@ecommerce.com	1234567890	Dirección del administrador	\N	799.99	168.00	21.00	0.00	0.00	967.99	[{"quantity": 1, "productId": "95121177-df92-40d5-9d91-6263b32bdb90", "unitPrice": 799.99, "totalPrice": 799.99, "description": "Samsung Galaxy S21"}]	mercadopago	\N	2025-10-28 11:28:17.363	paid	2025-10-28 11:28:17.363	2025-11-27 11:28:17.363	Factura generada automáticamente por el sistema	\N	/uploads/invoices/FAC-2025-000004.pdf	\N	\N	\N	2025-10-28 11:28:17.526	2025-10-29 14:13:37.883	\N	\N	B	1	pending	\N	\N	consumidor_final	\N	\N
6b0e0a9d-7a8f-4c41-bfa3-0793b3ad4637	FAC-2025-000005	5f891dfb-9ce0-4e24-b911-89eb676c471b	5f4734de-6667-4916-97ef-1afc2969cbe5	Admin User	admin@ecommerce.com	1234567890	Dirección del administrador	\N	2399.97	503.99	21.00	0.00	0.00	2903.96	[{"quantity": 3, "productId": "95121177-df92-40d5-9d91-6263b32bdb90", "unitPrice": 799.99, "totalPrice": 2399.97, "description": "Samsung Galaxy S21"}]	mercadopago	\N	2025-10-28 11:28:17.373	paid	2025-10-28 11:28:17.373	2025-11-27 11:28:17.373	Factura generada automáticamente por el sistema	\N	/uploads/invoices/FAC-2025-000005.pdf	\N	\N	\N	2025-10-28 11:28:17.565	2025-10-29 14:13:37.887	\N	\N	B	1	pending	\N	\N	consumidor_final	\N	\N
4ec220f3-ab12-4c89-bc98-237ed88f5d37	FAC-2025-000006	a7678339-4821-4a23-8343-2e13dbf52023	5f4734de-6667-4916-97ef-1afc2969cbe5	Admin User	admin@ecommerce.com	1234567890	Dirección del administrador	\N	875.48	183.85	21.00	0.00	0.00	1059.33	[{"quantity": 1, "productId": "95121177-df92-40d5-9d91-6263b32bdb90", "unitPrice": 799.99, "totalPrice": 799.99, "description": "Samsung Galaxy S21"}, {"quantity": 1, "productId": "100aaf5d-4ac6-4b6b-baf0-561daec15dfc", "unitPrice": 29.99, "totalPrice": 29.99, "description": "Camiseta Nike"}, {"quantity": 1, "productId": "42f2a420-e2cd-466d-99ba-6880928bdcc9", "unitPrice": 45.5, "totalPrice": 45.5, "description": "Lámpara LED"}]	mercadopago	\N	2025-10-28 11:28:17.381	paid	2025-10-28 11:28:17.381	2025-11-27 11:28:17.381	Factura generada automáticamente por el sistema	\N	/uploads/invoices/FAC-2025-000006.pdf	\N	\N	\N	2025-10-28 11:28:17.595	2025-10-29 14:13:37.891	\N	\N	B	1	pending	\N	\N	consumidor_final	\N	\N
\.


--
-- Data for Name: LogisticsCredentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."LogisticsCredentials" (id, carrier, "isActive", credentials, "lastSyncAt", "syncStatus", "lastError", settings, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: OrderItems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItems" (id, "orderId", "productId", "productName", "productSku", quantity, "unitPrice", "totalPrice", attributes, "productSnapshot", "createdAt", "updatedAt") FROM stdin;
d8967b24-7b24-490a-8904-4adb9b39419b	f0566266-b942-4ecf-bb85-1c2b9b3ec5aa	95121177-df92-40d5-9d91-6263b32bdb90	Samsung Galaxy S21	SMSG-S21-001	3	799.99	2399.97	{}	\N	2025-10-28 11:28:17.347+00	2025-10-28 11:28:17.347+00
bb38d0ef-679d-4eb3-90b1-d5dd21cce4ea	d15857e6-650a-43ac-9339-abccb1591e2e	95121177-df92-40d5-9d91-6263b32bdb90	Samsung Galaxy S21	SMSG-S21-001	2	799.99	1599.98	{}	\N	2025-10-28 11:28:17.359+00	2025-10-28 11:28:17.359+00
9d5b1a0d-5036-4fba-ab18-ebdc4a186343	6b725d33-1f06-4fc6-90ff-686d9d7fdf61	95121177-df92-40d5-9d91-6263b32bdb90	Samsung Galaxy S21	SMSG-S21-001	1	799.99	799.99	{}	\N	2025-10-28 11:28:17.368+00	2025-10-28 11:28:17.368+00
7b33acde-a3e5-4b93-a7a1-0cdac9026f3b	5f891dfb-9ce0-4e24-b911-89eb676c471b	95121177-df92-40d5-9d91-6263b32bdb90	Samsung Galaxy S21	SMSG-S21-001	3	799.99	2399.97	{}	\N	2025-10-28 11:28:17.378+00	2025-10-28 11:28:17.378+00
ed94d320-6f30-4faf-a9f4-5367083ab798	a7678339-4821-4a23-8343-2e13dbf52023	95121177-df92-40d5-9d91-6263b32bdb90	Samsung Galaxy S21	SMSG-S21-001	1	799.99	799.99	{}	\N	2025-10-28 11:28:17.386+00	2025-10-28 11:28:17.386+00
e5930277-806a-4805-a582-34d4c57aa6a2	a7678339-4821-4a23-8343-2e13dbf52023	100aaf5d-4ac6-4b6b-baf0-561daec15dfc	Camiseta Nike	NIKE-SHIRT-001	1	29.99	29.99	{}	\N	2025-10-28 11:28:17.39+00	2025-10-28 11:28:17.39+00
89a54b97-d1cc-440a-8616-47dbc4884907	a7678339-4821-4a23-8343-2e13dbf52023	42f2a420-e2cd-466d-99ba-6880928bdcc9	Lámpara LED	HOME-LED-001	1	45.50	45.50	{}	\N	2025-10-28 11:28:17.393+00	2025-10-28 11:28:17.393+00
eb8b6339-4725-497b-b3ff-ff4130ae7046	d7095db8-8618-456c-94d2-945a4300d69f	0403cd07-c095-42a9-a2d9-5410b38dcd40	Set de Golf Callaway	CALLAWAY-SET-ST	1	399.99	399.99	{}	{"name":"Set de Golf Callaway","sku":"CALLAWAY-SET-ST","price":"399.99","salePrice":null}	2025-10-29 17:08:26.598+00	2025-10-29 17:08:26.598+00
f02094ad-1738-4579-a7f0-d14efaf13e86	1b423bc5-5ad0-4219-8aac-2001f0db7bc3	04e996d9-78ba-4d61-abab-e19dd3a26773	Raqueta de Tenis Wilson Pro	WILSON-TEN-PRO	1	249.99	249.99	{}	{"name":"Raqueta de Tenis Wilson Pro","sku":"WILSON-TEN-PRO","price":"249.99","salePrice":null}	2025-10-31 20:41:55.759+00	2025-10-31 20:41:55.759+00
d5e77c42-aeca-4db5-aedc-98399f602cc4	63ca594e-8f03-43fe-84fa-f524652f366f	04e996d9-78ba-4d61-abab-e19dd3a26773	Raqueta de Tenis Wilson Pro	WILSON-TEN-PRO	1	249.99	249.99	{}	{"name":"Raqueta de Tenis Wilson Pro","sku":"WILSON-TEN-PRO","price":"249.99","salePrice":null}	2025-10-31 20:58:30.171+00	2025-10-31 20:58:30.171+00
278e9d90-e303-4be8-ab1b-02ec1778c23b	b371f058-8e99-4ee8-b4e1-40e89b226596	0403cd07-c095-42a9-a2d9-5410b38dcd40	Set de Golf Callaway	CALLAWAY-SET-ST	1	399.99	399.99	{}	{"name":"Set de Golf Callaway","sku":"CALLAWAY-SET-ST","price":"399.99","salePrice":null}	2025-11-03 19:52:41.719+00	2025-11-03 19:52:41.719+00
9ed22b8b-d11d-4e28-b257-727816de79ca	265a92de-626c-4d80-8707-c52dda370a36	414c7c58-e2b2-4e4e-9b62-f0a767a8a57e	Caminadora NordicTrack	NORDIC-TM-1750	1	1499.99	1499.99	{}	{"name":"Caminadora NordicTrack","sku":"NORDIC-TM-1750","price":"1499.99","salePrice":null}	2025-11-03 20:14:27.874+00	2025-11-03 20:14:27.874+00
86322093-02e9-4d2d-9e36-750ef98c586a	073adfa8-72ae-433e-9e66-5d0bdb3c3899	50901c23-8818-42ec-809d-257071a721e7	Yoga Mat Premium	SPORT-YOGA-PM	1	39.99	39.99	{}	{"name":"Yoga Mat Premium","sku":"SPORT-YOGA-PM","price":"39.99","salePrice":null}	2025-11-03 20:53:08.412+00	2025-11-03 20:53:08.412+00
4c5ccde0-2f52-4d86-8969-829cb3726244	5b16f14c-437f-4c06-9066-d37ed1ddff64	50901c23-8818-42ec-809d-257071a721e7	Yoga Mat Premium	SPORT-YOGA-PM	1	39.99	39.99	{}	{"name":"Yoga Mat Premium","sku":"SPORT-YOGA-PM","price":"39.99","salePrice":null}	2025-11-04 10:55:49.546+00	2025-11-04 10:55:49.546+00
d32805a4-d643-4f24-8718-4f4cd9466256	368119b4-5daa-4189-8239-4c5e39437a51	04ed6eb0-4dce-4de9-9679-2d3d7e8064a5	Balón de Fútbol Adidas UEFA	ADIDAS-BALL-UEFA	1	34.99	34.99	{}	{"name":"Balón de Fútbol Adidas UEFA","sku":"ADIDAS-BALL-UEFA","price":"34.99","salePrice":null}	2025-11-04 11:26:00.503+00	2025-11-04 11:26:00.503+00
146928f9-51e0-4710-b8c1-621ca691a972	5b91873a-c729-436d-a584-5e8254640479	50901c23-8818-42ec-809d-257071a721e7	Yoga Mat Premium	SPORT-YOGA-PM	1	39.99	39.99	{}	{"name":"Yoga Mat Premium","sku":"SPORT-YOGA-PM","price":"39.99","salePrice":null}	2025-11-04 12:01:12.414+00	2025-11-04 12:01:12.414+00
da3a697c-16b3-4484-8c13-f4a087f99a36	39745c4c-b209-4a75-9abf-f83caad670b0	0403cd07-c095-42a9-a2d9-5410b38dcd40	Set de Golf Callaway	CALLAWAY-SET-ST	1	399.99	399.99	{}	{"name":"Set de Golf Callaway","sku":"CALLAWAY-SET-ST","price":"399.99","salePrice":null}	2025-11-04 12:03:38.314+00	2025-11-04 12:03:38.314+00
c01e4725-a44f-48bd-bfcd-557b491f973d	264271b0-17d8-436e-8b3b-7f63f56dd930	50901c23-8818-42ec-809d-257071a721e7	Yoga Mat Premium	SPORT-YOGA-PM	1	39.99	39.99	{}	{"name":"Yoga Mat Premium","sku":"SPORT-YOGA-PM","price":"39.99","salePrice":null}	2025-11-04 12:04:34.216+00	2025-11-04 12:04:34.216+00
ff531e82-9333-4eda-895e-4285ae3ca318	508d946a-3a8b-49ee-a610-410fe50a0ed7	50901c23-8818-42ec-809d-257071a721e7	Yoga Mat Premium	SPORT-YOGA-PM	1	39.99	39.99	{}	{"name":"Yoga Mat Premium","sku":"SPORT-YOGA-PM","price":"39.99","salePrice":null}	2025-11-04 12:09:55.089+00	2025-11-04 12:09:55.089+00
ec299b1c-49f4-4d0e-bb40-c1e52a7d04bd	96ff5c3a-1c51-4fba-8384-aa4730b9fed5	50901c23-8818-42ec-809d-257071a721e7	Yoga Mat Premium	SPORT-YOGA-PM	1	39.99	39.99	{}	{"name":"Yoga Mat Premium","sku":"SPORT-YOGA-PM","price":"39.99","salePrice":null}	2025-11-04 13:47:40.182+00	2025-11-04 13:47:40.182+00
19a9c404-7b14-4427-a475-e098804b3917	a03dffef-2d1b-45f2-82d0-a50788fb9038	50901c23-8818-42ec-809d-257071a721e7	Yoga Mat Premium	SPORT-YOGA-PM	1	39.99	39.99	{}	{"name":"Yoga Mat Premium","sku":"SPORT-YOGA-PM","price":"39.99","salePrice":null}	2025-11-04 13:54:10.062+00	2025-11-04 13:54:10.062+00
18a45a47-cb40-46be-93bf-09072e22dec1	409b820a-1cea-4841-a448-e6fbcb457606	414c7c58-e2b2-4e4e-9b62-f0a767a8a57e	Caminadora NordicTrack	NORDIC-TM-1750	1	1499.99	1499.99	{}	{"name":"Caminadora NordicTrack","sku":"NORDIC-TM-1750","price":"1499.99","salePrice":null}	2025-11-05 12:57:58.069+00	2025-11-05 12:57:58.069+00
f3c27ade-cfdd-4812-9e0b-e558ca85db94	2c965a94-538d-4fa4-be85-74145ac40117	9c06fbd7-8eab-4c24-a09a-36a537ac37a4	Reloj Garmin Forerunner 255	GARMIN-FR255	1	349.99	349.99	{}	{"name":"Reloj Garmin Forerunner 255","sku":"GARMIN-FR255","price":"349.99","salePrice":null}	2025-11-05 13:33:32.491+00	2025-11-05 13:33:32.491+00
bb74b0bf-c430-4da8-813d-8aa742231b27	144766c0-b29c-4b08-b429-f778e20846bf	0403cd07-c095-42a9-a2d9-5410b38dcd40	Set de Golf Callaway	CALLAWAY-SET-ST	1	399.99	399.99	{}	{"name":"Set de Golf Callaway","sku":"CALLAWAY-SET-ST","price":"399.99","salePrice":null}	2025-12-29 12:16:16.849+00	2025-12-29 12:16:16.849+00
\.


--
-- Data for Name: Orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Orders" (id, "orderNumber", status, "paymentStatus", "paymentMethod", "paymentId", subtotal, "taxAmount", "shippingAmount", "discountAmount", total, currency, "shippingAddress", "billingAddress", "customerNotes", "adminNotes", "trackingNumber", "estimatedDeliveryDate", "deliveredAt", "cancelledAt", "refundedAt", "createdAt", "updatedAt", "userId", "paidAt", "invoiceId", "invoiceNumber", "paymentProofUrl", "paymentProofUploadedAt", "bankTransferData", "shippingMethodCode", "shippingMethodName", "shippingMethodId") FROM stdin;
8441ba40-3f97-4d98-ac5b-b0e4f7adb74d	ORD-1761649908264-0	shipped	paid	mercadopago	\N	829.98	0.00	0.00	0.00	1004.28	ARS	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	\N	\N	\N	DHL1761833913956428	\N	\N	\N	\N	2025-10-28 11:11:48.265+00	2025-10-30 14:18:33.993+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	\N	\N	\N
f0566266-b942-4ecf-bb85-1c2b9b3ec5aa	ORD-1761650897325-0	shipped	paid	mercadopago	\N	2399.97	0.00	0.00	0.00	2903.96	ARS	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	\N	\N	\N	COR1761833913960419	\N	\N	\N	\N	2025-10-28 11:28:17.326+00	2025-10-30 14:18:34.003+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	\N	\N	\N
d15857e6-650a-43ac-9339-abccb1591e2e	ORD-1761650897354-1	shipped	paid	mercadopago	\N	1599.98	0.00	0.00	0.00	1935.98	ARS	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	\N	\N	\N	DHL176183391396128	\N	\N	\N	\N	2025-10-28 11:28:17.354+00	2025-10-30 14:18:34.007+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	\N	\N	\N
6b725d33-1f06-4fc6-90ff-686d9d7fdf61	ORD-1761650897363-2	shipped	paid	mercadopago	\N	799.99	0.00	0.00	0.00	967.99	ARS	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	\N	\N	\N	OCA1761833913961939	\N	\N	\N	\N	2025-10-28 11:28:17.363+00	2025-10-30 14:18:34.011+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	\N	\N	\N
5f891dfb-9ce0-4e24-b911-89eb676c471b	ORD-1761650897373-3	delivered	paid	mercadopago	\N	2399.97	0.00	0.00	0.00	2903.96	ARS	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	\N	\N	\N	COR1761833913961708	\N	\N	\N	\N	2025-10-28 11:28:17.373+00	2025-10-30 14:18:34.015+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	\N	\N	\N
a7678339-4821-4a23-8343-2e13dbf52023	ORD-1761650897381-4	shipped	paid	mercadopago	\N	875.48	0.00	0.00	0.00	1059.33	ARS	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	\N	\N	\N	FED1761833913961478	\N	\N	\N	\N	2025-10-28 11:28:17.381+00	2025-10-30 14:18:34.019+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	\N	\N	\N
d7095db8-8618-456c-94d2-945a4300d69f	ORD-57706590-3597	processing	pending	Transferencia Bancaria	\N	399.99	84.00	500.00	0.00	983.99	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	COR1761833913961344	\N	2025-10-29 20:04:45.237+00	\N	\N	2025-10-29 17:08:26.59+00	2025-10-30 14:18:34.022+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	\N	\N	\N
1b423bc5-5ad0-4219-8aac-2001f0db7bc3	ORD-43315748-3652	pending	pending	MercadoPago	\N	249.99	52.50	0.00	0.00	302.49	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	\N	\N	2025-10-31 20:41:55.748+00	2025-10-31 20:41:55.748+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
63ca594e-8f03-43fe-84fa-f524652f366f	ORD-44310164-8608	pending	pending	MercadoPago	2911609370-1a100ee8-f342-463d-8cb6-e6045b7e9da0	249.99	52.50	0.00	0.00	302.49	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	\N	\N	2025-10-31 20:58:30.164+00	2025-10-31 20:58:31.148+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
b371f058-8e99-4ee8-b4e1-40e89b226596	ORD-99561695-4158	cancelled	pending	MercadoPago	2911609370-a0442a86-4bb0-4600-a09d-de10d81d4ec1	399.99	84.00	0.00	0.00	483.99	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	2025-11-03 20:10:46.446+00	\N	2025-11-03 19:52:41.696+00	2025-11-03 20:10:46.446+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	RETIRO_LOCAL	Retiro en Local	65e84e16-4459-4be1-b44a-61798c1e8be5
265a92de-626c-4d80-8707-c52dda370a36	ORD-00867864-8912	cancelled	pending	Transferencia Bancaria	\N	1499.99	315.00	0.00	0.00	1814.99	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	2025-11-03 20:14:38.684+00	\N	2025-11-03 20:14:27.864+00	2025-11-03 20:14:38.685+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	RETIRO_LOCAL	Retiro en Local	65e84e16-4459-4be1-b44a-61798c1e8be5
5b16f14c-437f-4c06-9066-d37ed1ddff64	ORD-53749527-4836	cancelled	pending	Transferencia Bancaria	\N	39.99	8.40	0.00	0.00	48.39	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	2025-11-04 11:25:37.807+00	\N	2025-11-04 10:55:49.527+00	2025-11-04 11:25:37.808+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	RETIRO_LOCAL	Retiro en Local	65e84e16-4459-4be1-b44a-61798c1e8be5
073adfa8-72ae-433e-9e66-5d0bdb3c3899	ORD-03188404-5746	cancelled	pending	Transferencia Bancaria	\N	39.99	8.40	0.00	0.00	48.39	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	2025-11-04 11:25:42.49+00	\N	2025-11-03 20:53:08.405+00	2025-11-04 11:25:42.49+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
368119b4-5daa-4189-8239-4c5e39437a51	ORD-55560488-1612	pending	pending	Transferencia Bancaria	\N	34.99	7.35	0.00	0.00	42.34	ARS	{"firstName":"Admin","lastName":"User","street":"","city":"","state":"","postalCode":"","country":"Argentina","phone":""}	{"firstName":"Admin","lastName":"User","street":"","city":"","state":"","postalCode":"","country":"Argentina","phone":""}	\N	\N	\N	\N	\N	\N	\N	2025-11-04 11:26:00.488+00	2025-11-04 11:26:00.488+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
5b91873a-c729-436d-a584-5e8254640479	ORD-57672396-6190	pending	pending	Transferencia Bancaria	\N	39.99	8.40	0.00	0.00	48.39	ARS	{"firstName":"Admin","lastName":"User","street":"","city":"","state":"","postalCode":"","country":"Argentina","phone":""}	{"firstName":"Admin","lastName":"User","street":"","city":"","state":"","postalCode":"","country":"Argentina","phone":""}	\N	\N	\N	\N	\N	\N	\N	2025-11-04 12:01:12.396+00	2025-11-04 12:01:12.396+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
264271b0-17d8-436e-8b3b-7f63f56dd930	ORD-57874210-2614	pending	pending	Transferencia Bancaria	\N	39.99	8.40	0.00	0.00	48.39	ARS	{"firstName":"Roberto","lastName":"Kelm","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Roberto","lastName":"Kelm","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	\N	\N	2025-11-04 12:04:34.21+00	2025-11-04 12:04:34.21+00	b437746d-9471-42bf-88fb-0b5c10a5ed87	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
96ff5c3a-1c51-4fba-8384-aa4730b9fed5	ORD-64060165-7738	cancelled	pending	Transferencia Bancaria	\N	39.99	8.40	0.00	0.00	48.39	ARS	{"firstName":"Admin","lastName":"User","street":"","city":"","state":"","postalCode":"","country":"Argentina","phone":""}	{"firstName":"Admin","lastName":"User","street":"","city":"","state":"","postalCode":"","country":"Argentina","phone":""}	\N	\N	\N	\N	\N	2025-11-04 13:53:19.776+00	\N	2025-11-04 13:47:40.165+00	2025-11-04 13:53:19.776+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
508d946a-3a8b-49ee-a610-410fe50a0ed7	ORD-58195082-6515	cancelled	pending	Transferencia Bancaria	\N	39.99	8.40	0.00	0.00	48.39	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	2025-11-04 13:53:24.364+00	\N	2025-11-04 12:09:55.082+00	2025-11-04 13:53:24.364+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
39745c4c-b209-4a75-9abf-f83caad670b0	ORD-57818306-4820	cancelled	pending	Transferencia Bancaria	\N	399.99	84.00	0.00	0.00	483.99	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	2025-11-04 13:53:30.806+00	\N	2025-11-04 12:03:38.307+00	2025-11-04 13:53:30.806+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
a03dffef-2d1b-45f2-82d0-a50788fb9038	ORD-64450045-5137	pending	pending_verification	Transferencia Bancaria	\N	39.99	8.40	0.00	0.00	48.39	ARS	{"firstName":"Admin","lastName":"User","street":"","city":"","state":"","postalCode":"","country":"Argentina","phone":""}	{"firstName":"Admin","lastName":"User","street":"","city":"","state":"","postalCode":"","country":"Argentina","phone":""}	\N	\N	\N	\N	\N	\N	\N	2025-11-04 13:54:10.046+00	2025-11-04 14:08:48.159+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	/uploads/payment-proofs/proof-a03dffef-2d1b-45f2-82d0-a50788fb9038-1762265328149-949376556.pdf	2025-11-04 14:08:48.158	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
409b820a-1cea-4841-a448-e6fbcb457606	ORD-47478055-5043	cancelled	pending_verification	Transferencia Bancaria	\N	1499.99	315.00	0.00	0.00	1814.99	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	2025-11-05 13:32:56.138+00	\N	2025-11-05 12:57:58.055+00	2025-11-05 13:32:56.138+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	/uploads/payment-proofs/proof-409b820a-1cea-4841-a448-e6fbcb457606-1762347512435-756396783.pdf	2025-11-05 12:58:32.446	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
2c965a94-538d-4fa4-be85-74145ac40117	ORD-49612474-1127	processing	pending_verification	Transferencia Bancaria	\N	349.99	73.50	0.00	0.00	423.49	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	\N	\N	2025-11-05 13:33:32.474+00	2025-11-05 13:34:18.766+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	/uploads/payment-proofs/proof-2c965a94-538d-4fa4-be85-74145ac40117-1762349624315-971725556.pdf	2025-11-05 13:33:44.323	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
144766c0-b29c-4b08-b429-f778e20846bf	ORD-10576841-9274	pending	pending	MercadoPago	2911609370-4fc33933-0296-4aec-8920-6f3758c4c9cc	399.99	84.00	0.00	0.00	483.99	ARS	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	\N	\N	\N	\N	\N	\N	\N	2025-12-29 12:16:16.842+00	2025-12-29 12:16:19.442+00	5f4734de-6667-4916-97ef-1afc2969cbe5	\N	\N	\N	\N	\N	\N	ACORDAR_VENDEDOR	Acordar con el Vendedor	36df22cd-8d45-4b0b-91ad-4a77402777ed
\.


--
-- Data for Name: Permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Permissions" (id, name, resource, action, "displayName", description, category, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductBarcodes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductBarcodes" (id, "productId", barcode, "barcodeType", "isPrimary", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductBatches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProductBatches" (id, "productId", "batchNumber", quantity, "initialQuantity", "manufactureDate", "expirationDate", "supplierName", "supplierReference", "purchaseCost", "totalCost", "locationCode", status, notes, "isPerishable", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Products" (id, name, description, "shortDescription", slug, sku, price, "salePrice", cost, stock, "lowStockThreshold", weight, dimensions, images, attributes, "isActive", "isFeatured", "isDigital", "sortOrder", "seoTitle", "seoDescription", tags, "averageRating", "totalReviews", "supplierId", "isOwnProduction", "createdAt", "updatedAt", "createdBy", "categoryId", supplier_id, is_own_production) FROM stdin;
100aaf5d-4ac6-4b6b-baf0-561daec15dfc	Camiseta Nike	Camiseta deportiva Nike de algodón 100%	\N	camiseta-nike	NIKE-SHIRT-001	29.99	\N	\N	50	5	0.200	"30 x 20 x 2 cm"	["https://placehold.co/400x400/EEE/333?text=Nike+Shirt"]	{}	t	f	f	0	\N	\N	[]	0.00	0	\N	f	2025-10-25 14:55:39.907+00	2025-10-28 11:50:01.028+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
42f2a420-e2cd-466d-99ba-6880928bdcc9	Lámpara LED	Lámpara LED de escritorio con control táctil	\N	lampara-led	HOME-LED-001	45.50	\N	\N	15	5	0.800	"25 x 15 x 40 cm"	["https://placehold.co/400x400/EEE/333?text=LED+Lamp"]	{}	t	f	f	0	\N	\N	[]	0.00	0	\N	f	2025-10-25 14:55:39.916+00	2025-10-28 11:50:01.032+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
9b3ebc11-5416-48de-85e2-dd9333fd9a9c	Zapatillas Adidas	Zapatillas deportivas Adidas para running	\N	zapatillas-adidas	ADIDAS-RUN-001	89.99	\N	\N	30	5	0.600	"32 x 20 x 12 cm"	["https://placehold.co/400x400/EEE/333?text=Adidas+Shoes"]	{}	t	f	f	0	\N	\N	[]	0.00	0	\N	f	2025-10-25 14:55:39.925+00	2025-10-28 11:50:01.036+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
927316a8-7c59-4a82-b153-d8a9628581ea	MacBook Air M2	Laptop Apple MacBook Air con chip M2, 8GB RAM, 256GB SSD	\N	macbook-air-m2	APPLE-MBA-M2	1299.99	\N	\N	10	5	1.240	"30.41 x 21.24 x 1.13 cm"	["https://placehold.co/400x400/EEE/333?text=MacBook+Air"]	{}	t	f	f	0	\N	\N	[]	0.00	0	\N	f	2025-10-25 14:55:39.935+00	2025-10-28 11:50:01.04+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
00e1c18a-56aa-4138-b90f-3985ea9777b9	Jeans Levis 501	Pantalón jeans clásico Levis 501 de corte regular	\N	jeans-levis-501	LEVIS-501-001	65.00	\N	\N	40	5	0.700	"35 x 25 x 3 cm"	["https://placehold.co/400x400/EEE/333?text=Levis+Jeans"]	{}	t	f	f	0	\N	\N	[]	0.00	0	\N	f	2025-10-25 14:55:39.943+00	2025-10-28 11:50:01.044+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
5057cc9b-2648-42d5-becf-4daedbb268a1	Cafetera Nespresso	Cafetera automática Nespresso con sistema de cápsulas	\N	cafetera-nespresso	NESPRESSO-001	159.99	\N	\N	20	5	2.300	"32 x 15 x 26 cm"	["https://placehold.co/400x400/EEE/333?text=Nespresso"]	{}	t	f	f	0	\N	\N	[]	0.00	0	\N	f	2025-10-25 14:55:39.952+00	2025-10-28 11:50:01.048+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
e933a66b-1021-4fe3-8284-653e2f878e21	Pelota de Fútbol	Pelota de fútbol FIFA aprobada, tamaño oficial	\N	pelota-futbol	SPORT-BALL-001	24.99	\N	\N	60	5	0.410	"22 x 22 x 22 cm"	["https://placehold.co/400x400/EEE/333?text=Soccer+Ball"]	{}	t	f	f	0	\N	\N	[]	0.00	0	\N	f	2025-10-25 14:55:39.96+00	2025-10-28 11:50:01.052+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
281e303d-09f8-49dd-a872-0ed5d8e825f8	iPhone 14 Pro Max	iPhone 14 Pro Max con Dynamic Island, cámara de 48MP y pantalla Super Retina XDR de 6.7"	\N	iphone-14-pro-max	APPLE-IP14PM-256	1299.99	\N	\N	15	5	0.240	"16.1 x 7.8 x 0.78 cm"	["https://placehold.co/400x400/EEE/333?text=iPhone+14+Pro"]	{}	t	t	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.771+00	2025-10-28 11:50:01.056+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
f68d2aca-37f7-4382-a909-cc16878d09e0	Samsung Galaxy S23 Ultra	Galaxy S23 Ultra con S Pen, cámara de 200MP y batería de 5000mAh	\N	samsung-galaxy-s23-ultra	SMSG-S23U-512	1199.99	\N	\N	20	5	0.234	"16.3 x 7.8 x 0.89 cm"	["https://placehold.co/400x400/EEE/333?text=Galaxy+S23"]	{}	t	t	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.781+00	2025-10-28 11:50:01.06+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
b3a00eeb-0068-43d1-8a86-858b7a5133b9	MacBook Pro 14" M3	MacBook Pro 14" con chip M3, 16GB RAM, 512GB SSD y pantalla Liquid Retina XDR	\N	macbook-pro-14-m3	APPLE-MBP14-M3	1999.99	\N	\N	8	5	1.600	"31.3 x 22.1 x 1.55 cm"	["https://placehold.co/400x400/EEE/333?text=MacBook+Pro"]	{}	t	t	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.789+00	2025-10-28 11:50:01.064+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
ef73f70d-a3c4-4508-9790-19acf21b199a	iPad Air M2	iPad Air con chip M2, pantalla Liquid Retina de 10.9" y compatibilidad con Apple Pencil	\N	ipad-air-m2	APPLE-IPAD-AIR-M2	599.99	\N	\N	25	5	0.461	"24.8 x 17.9 x 0.61 cm"	["https://placehold.co/400x400/EEE/333?text=iPad+Air"]	{}	t	f	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.796+00	2025-10-28 11:50:01.068+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
164ff0f2-5443-42d1-82da-93326f58f15d	Sony WH-1000XM5	Audífonos inalámbricos con cancelación de ruido líder en la industria	\N	sony-wh-1000xm5	SONY-WH1000XM5	399.99	\N	\N	30	5	0.250	"20 x 18 x 8 cm"	["https://placehold.co/400x400/EEE/333?text=Sony+WH-1000XM5"]	{}	t	f	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.803+00	2025-10-28 11:50:01.072+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
39acba19-be5a-417a-9280-67aa9e9ad3e0	Dell XPS 15	Laptop Dell XPS 15 con Intel i7 13th Gen, 16GB RAM, 512GB SSD	\N	dell-xps-15	DELL-XPS15-I7	1599.99	\N	\N	12	5	1.800	"34.4 x 23 x 1.8 cm"	["https://placehold.co/400x400/EEE/333?text=Dell+XPS+15"]	{}	t	f	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.81+00	2025-10-28 11:50:01.076+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
97ca7953-4577-45a9-9a27-b646fc4d65ca	Canon EOS R6	Cámara mirrorless Canon EOS R6 con sensor full frame de 20MP	\N	canon-eos-r6	CANON-R6-BODY	2499.99	\N	\N	5	5	0.680	"13.8 x 9.7 x 8.8 cm"	["https://placehold.co/400x400/EEE/333?text=Canon+EOS+R6"]	{}	t	f	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.817+00	2025-10-28 11:50:01.08+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
ba370ada-c1bd-4d31-bf31-f21fba867846	Nintendo Switch OLED	Consola Nintendo Switch modelo OLED con pantalla de 7 pulgadas	\N	nintendo-switch-oled	NINTENDO-SW-OLED	349.99	\N	\N	35	5	0.320	"24.2 x 10.3 x 1.4 cm"	["https://placehold.co/400x400/EEE/333?text=Switch+OLED"]	{}	t	f	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.832+00	2025-10-28 11:50:01.093+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
aa81f4b0-684a-4078-9952-9dbd25e9f574	Samsung 65" QLED 4K	Smart TV Samsung QLED 4K de 65" con Quantum Processor y Object Tracking Sound	\N	samsung-65-qled-4k	SMSG-TV65-Q80C	1299.99	1099.99	\N	10	5	21.500	"144.6 x 83 x 2.6 cm"	["https://placehold.co/400x400/EEE/333?text=Samsung+QLED"]	{}	t	t	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.84+00	2025-10-28 11:50:01.097+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
232c22dd-9869-43a9-a0ee-1be3c8869c79	Camiseta Nike Dri-FIT	Camiseta deportiva Nike con tecnología Dri-FIT para máxima transpirabilidad	\N	camiseta-nike-dri-fit	NIKE-SHIRT-DF-001	34.99	\N	\N	80	5	0.150	"30 x 20 x 2 cm"	["https://placehold.co/400x400/EEE/333?text=Nike+Dri-FIT"]	{}	t	f	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.847+00	2025-10-28 11:50:01.1+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
fb117604-c6c2-46cc-b8c2-d20f42b480ff	Jeans Levis 501 Original	Jeans clásicos Levis 501 de corte recto y mezclilla 100% algodón	\N	jeans-levis-501-original	LEVIS-501-BLUE	89.99	\N	\N	50	5	0.700	"35 x 25 x 3 cm"	["https://placehold.co/400x400/EEE/333?text=Levis+501"]	{}	t	t	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.855+00	2025-10-28 11:50:01.104+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
579b8419-6b20-45b6-842e-a2e27d499607	Sudadera Adidas Essentials	Sudadera con capucha Adidas Essentials de algodón suave	\N	sudadera-adidas-essentials	ADIDAS-HOOD-ESS	59.99	\N	\N	60	5	0.500	"32 x 28 x 3 cm"	["https://placehold.co/400x400/EEE/333?text=Adidas+Hoodie"]	{}	t	f	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.863+00	2025-10-28 11:50:01.107+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
32b9bafe-d10e-44a6-b043-e008bc58686b	Vestido Zara Floral	Vestido casual Zara con estampado floral, ideal para primavera-verano	\N	vestido-zara-floral	ZARA-DRESS-FL01	49.99	34.99	\N	40	5	0.300	"35 x 25 x 2 cm"	["https://placehold.co/400x400/EEE/333?text=Zara+Dress"]	{}	t	f	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.87+00	2025-10-28 11:50:01.111+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
d2f5e6a5-03e9-4f90-86ff-f720736da84f	Chaqueta The North Face	Chaqueta impermeable The North Face con aislamiento térmico	\N	chaqueta-north-face	TNF-JACKET-NF01	199.99	\N	\N	25	5	0.800	"38 x 30 x 5 cm"	["https://placehold.co/400x400/EEE/333?text=North+Face"]	{}	t	t	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.877+00	2025-10-28 11:50:01.115+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
16c0a536-ae0f-4af5-9f51-17d64b4b3bc8	Juego de Sartenes Tefal	Set de 3 sartenes Tefal antiadherentes de aluminio forjado	\N	juego-sartenes-tefal	TEFAL-PAN-SET3	79.99	\N	\N	40	5	2.500	"45 x 30 x 15 cm"	[]	{}	t	f	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.936+00	2025-10-26 19:28:00.936+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
95121177-df92-40d5-9d91-6263b32bdb90	Samsung Galaxy S21	Smartphone Samsung Galaxy S21 con cámara de 64MP y pantalla AMOLED	\N	samsung-galaxy-s21	SMSG-S21-001	799.99	\N	\N	25	5	0.169	"15.1 x 7.1 x 0.79 cm"	["https://placehold.co/400x400/EEE/333?text=Galaxy+S21"]	{}	t	f	f	0	\N	\N	[]	0.00	0	\N	f	2025-10-25 14:55:39.864+00	2025-10-28 11:50:01.013+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
73fa97fc-8f16-434e-8062-0edfffc42390	Camisa Ralph Lauren	Camisa clásica Ralph Lauren de corte slim fit	\N	camisa-ralph-lauren	RL-SHIRT-CL01	89.99	\N	\N	35	5	0.250	"30 x 22 x 2 cm"	["https://placehold.co/400x400/EEE/333?text=Ralph+Lauren"]	{}	t	f	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.891+00	2025-10-28 11:50:01.121+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
6b00034e-a811-41d9-94a9-e1f5dac64356	Shorts Nike Pro	Shorts deportivos Nike Pro con tecnología Dri-FIT	\N	shorts-nike-pro	NIKE-SHORT-PR01	29.99	\N	\N	70	5	0.120	"28 x 18 x 2 cm"	["https://placehold.co/400x400/EEE/333?text=Nike+Shorts"]	{}	t	f	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.898+00	2025-10-28 11:50:01.125+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
fb4403da-6540-419a-ba92-26b9695667cc	Botas Timberland	Botas clásicas Timberland impermeables de piel premium	\N	botas-timberland	TBL-BOOT-CL01	199.99	\N	\N	30	5	1.200	"32 x 25 x 15 cm"	["https://placehold.co/400x400/EEE/333?text=Timberland"]	{}	t	f	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.906+00	2025-10-28 11:50:01.128+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
28cba19b-1bfa-4251-b5fc-60a879c2512f	Gorra New Era Yankees	Gorra New Era 59FIFTY de los New York Yankees	\N	gorra-new-era-yankees	NE-CAP-NYY	39.99	\N	\N	55	5	0.100	"20 x 18 x 10 cm"	["https://placehold.co/400x400/EEE/333?text=Yankees+Cap"]	{}	t	f	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.914+00	2025-10-28 11:50:01.131+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
f39d1a81-1691-4f43-bf6a-5c6fe8472614	Cafetera Nespresso Vertuo	Cafetera Nespresso Vertuo con sistema de cápsulas Centrifusion	\N	cafetera-nespresso-vertuo	NESPRESSO-VT-001	189.99	\N	\N	28	5	3.200	"34 x 16 x 30 cm"	["https://placehold.co/400x400/EEE/333?text=Nespresso"]	{}	t	t	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.921+00	2025-10-28 11:50:01.135+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
a0c5c445-ccde-451a-aa2f-928b163d9ea6	Aspiradora Dyson V15	Aspiradora inalámbrica Dyson V15 Detect con láser de detección	\N	aspiradora-dyson-v15	DYSON-V15-DETECT	649.99	\N	\N	15	5	3.100	"125 x 25 x 25 cm"	["https://placehold.co/400x400/EEE/333?text=Dyson+V15"]	{}	t	t	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.928+00	2025-10-28 11:50:01.138+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
1c38fa8f-2cfb-4bea-a5a3-784e31d96040	Lámpara LED Philips Hue	Lámpara inteligente Philips Hue con 16 millones de colores	\N	lampara-led-philips-hue	PHILIPS-HUE-LED	49.99	\N	\N	50	5	0.150	"12 x 12 x 6 cm"	["https://placehold.co/400x400/EEE/333?text=Philips+Hue"]	{}	t	f	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.943+00	2025-10-28 11:50:01.142+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
1dc076f6-7cb8-4480-8014-d3ed2d38bcc5	Licuadora Vitamix E310	Licuadora profesional Vitamix E310 de 1200W	\N	licuadora-vitamix-e310	VITAMIX-E310	349.99	\N	\N	20	5	4.900	"43 x 20 x 23 cm"	["https://placehold.co/400x400/EEE/333?text=Vitamix"]	{}	t	f	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.951+00	2025-10-28 11:50:01.145+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
847eb2c7-2719-4593-a676-c69d8433f3d6	Set de Toallas Egyptian Cotton	Juego de 6 toallas de algodón egipcio 600 GSM	\N	set-toallas-egyptian-cotton	HOME-TOWEL-EC6	89.99	69.99	\N	35	5	1.800	"40 x 30 x 15 cm"	["https://placehold.co/400x400/EEE/333?text=Towels"]	{}	t	f	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.959+00	2025-10-28 11:50:01.148+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
5e480234-2dc7-4c9d-9b51-feea49659158	Purificador de Aire Xiaomi	Purificador de aire Xiaomi Mi Air Purifier 4 con filtro HEPA	\N	purificador-aire-xiaomi	XIAOMI-AIR-P4	149.99	\N	\N	25	5	4.800	"24 x 24 x 52 cm"	["https://placehold.co/400x400/EEE/333?text=Air+Purifier"]	{}	t	f	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.966+00	2025-10-28 11:50:01.152+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
03d412f1-7437-46e2-a540-1b783b369915	Juego de Sábanas Premium	Juego de sábanas king size 100% algodón egipcio 800 hilos	\N	juego-sabanas-premium	HOME-SHEET-KG	129.99	\N	\N	30	5	2.200	"45 x 35 x 10 cm"	["https://placehold.co/400x400/EEE/333?text=Sheets"]	{}	t	f	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.973+00	2025-10-28 11:50:01.155+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
6384597f-e8a1-4e18-b341-bde958468c46	Robot Aspirador iRobot Roomba	Robot aspirador iRobot Roomba j7+ con vaciado automático	\N	robot-aspirador-roomba	IROBOT-J7PLUS	799.99	\N	\N	12	5	3.400	"34 x 34 x 9 cm"	["https://placehold.co/400x400/EEE/333?text=Roomba"]	{}	t	t	f	0	\N	\N	[]	0.00	0	4	f	2025-10-26 19:28:00.981+00	2025-10-28 11:50:01.159+00	5f4734de-6667-4916-97ef-1afc2969cbe5	a7e4038e-4837-4b31-8b73-750ae4d61c2a	\N	f
1c8d1ef1-2f9e-4d8b-8f9f-ae83c4bafddf	Bicicleta Trek FX 3	Bicicleta híbrida Trek FX 3 Disc con frenos de disco hidráulicos	\N	bicicleta-trek-fx3	TREK-FX3-L	899.99	\N	\N	10	5	11.500	"180 x 80 x 100 cm"	["https://placehold.co/400x400/EEE/333?text=Trek+FX3"]	{}	t	t	f	0	\N	\N	[]	0.00	0	5	f	2025-10-26 19:28:00.989+00	2025-10-28 11:50:01.162+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
6810ce02-175b-43a0-98ca-bf0fcda26ec6	Pesas Adjustables Bowflex	Mancuernas ajustables Bowflex SelectTech 552 de 2.5 a 24kg	\N	pesas-adjustables-bowflex	BOWFLEX-DB-552	349.99	\N	\N	18	5	24.000	"40 x 20 x 20 cm"	["https://placehold.co/400x400/EEE/333?text=Bowflex"]	{}	t	f	f	0	\N	\N	[]	0.00	0	5	f	2025-10-26 19:28:01.004+00	2025-10-28 11:50:01.169+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
04e996d9-78ba-4d61-abab-e19dd3a26773	Raqueta de Tenis Wilson Pro	Raqueta de tenis Wilson Pro Staff para nivel avanzado	\N	raqueta-tenis-wilson-pro	WILSON-TEN-PRO	249.99	\N	\N	20	5	0.310	"70 x 30 x 3 cm"	["https://placehold.co/400x400/EEE/333?text=Wilson"]	{}	t	f	f	0	\N	\N	[]	0.00	0	5	f	2025-10-26 19:28:01.013+00	2025-10-31 20:58:30.173+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
04ed6eb0-4dce-4de9-9679-2d3d7e8064a5	Balón de Fútbol Adidas UEFA	Balón oficial Adidas UEFA Champions League tamaño 5	\N	balon-futbol-adidas-uefa	ADIDAS-BALL-UEFA	34.99	\N	\N	74	5	0.430	"22 x 22 x 22 cm"	["https://placehold.co/400x400/EEE/333?text=UEFA+Ball"]	{}	t	f	f	0	\N	\N	[]	0.00	0	5	f	2025-10-26 19:28:00.997+00	2025-11-04 11:26:00.505+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
50901c23-8818-42ec-809d-257071a721e7	Yoga Mat Premium	Tapete de yoga antideslizante extra grueso 6mm	\N	yoga-mat-premium	SPORT-YOGA-PM	39.99	\N	\N	62	5	1.200	"183 x 61 x 0.6 cm"	["https://placehold.co/400x400/EEE/333?text=Yoga+Mat"]	{}	t	f	f	0	\N	\N	[]	0.00	0	5	f	2025-10-26 19:28:01.019+00	2025-11-04 13:54:10.064+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
414c7c58-e2b2-4e4e-9b62-f0a767a8a57e	Caminadora NordicTrack	Caminadora NordicTrack Commercial 1750 con pantalla táctil de 10"	\N	caminadora-nordictrack	NORDIC-TM-1750	1499.99	\N	\N	6	5	136.000	"203 x 99 x 157 cm"	["https://placehold.co/400x400/EEE/333?text=Treadmill"]	{}	t	f	f	0	\N	\N	[]	0.00	0	5	f	2025-10-26 19:28:01.032+00	2025-11-05 13:32:56.131+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
0403cd07-c095-42a9-a2d9-5410b38dcd40	Set de Golf Callaway	Set completo de palos de golf Callaway Strata para principiantes	\N	set-golf-callaway	CALLAWAY-SET-ST	399.99	\N	\N	13	5	10.500	"120 x 35 x 25 cm"	["https://placehold.co/400x400/EEE/333?text=Golf+Set"]	{}	t	f	f	0	\N	\N	[]	0.00	0	5	f	2025-10-26 19:28:01.039+00	2025-12-29 12:16:16.851+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
ef790bf1-556e-4446-b493-e995c54db897	Apple Watch Series 9	Apple Watch Series 9 GPS de 45mm con pantalla Retina siempre activa	\N	apple-watch-series-9	APPLE-AWS9-45MM	429.99	\N	\N	40	5	0.038	"4.5 x 3.8 x 1.1 cm"	["https://placehold.co/400x400/EEE/333?text=Apple+Watch"]	{}	t	t	f	0	\N	\N	[]	0.00	0	2	f	2025-10-26 19:28:00.824+00	2025-10-28 11:50:01.084+00	5f4734de-6667-4916-97ef-1afc2969cbe5	8ef53445-2fd5-4abf-b1c2-d47417c118c9	\N	f
d8b63c56-8666-4eac-9a88-6bb4178a590a	Zapatillas Adidas Ultraboost	Zapatillas running Adidas Ultraboost 22 con tecnología Boost	\N	zapatillas-adidas-ultraboost	ADIDAS-UB-22	179.99	\N	\N	45	5	0.600	"32 x 20 x 12 cm"	["https://placehold.co/400x400/EEE/333?text=Ultraboost"]	{}	t	t	f	0	\N	\N	[]	0.00	0	3	f	2025-10-26 19:28:00.884+00	2025-10-28 11:50:01.118+00	5f4734de-6667-4916-97ef-1afc2969cbe5	c86b8bb9-452b-42d6-bde0-24f963a360cb	\N	f
9c06fbd7-8eab-4c24-a09a-36a537ac37a4	Reloj Garmin Forerunner 255	Reloj GPS running Garmin Forerunner 255 con métricas avanzadas	\N	reloj-garmin-forerunner-255	GARMIN-FR255	349.99	\N	\N	27	5	0.049	"4.6 x 4.6 x 1.3 cm"	["https://placehold.co/400x400/EEE/333?text=Garmin"]	{}	t	t	f	0	\N	\N	[]	0.00	0	5	f	2025-10-26 19:28:01.026+00	2025-11-05 13:33:32.493+00	5f4734de-6667-4916-97ef-1afc2969cbe5	2e543518-5cb0-4bc2-b880-cf9505952d7f	\N	f
\.


--
-- Data for Name: RefreshTokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RefreshTokens" (id, "userId", token, "expiresAt", "isRevoked", "ipAddress", "userAgent", "createdAt", "updatedAt") FROM stdin;
ee866d64-51f6-43be-9675-2b2466b44b00	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MTY1MTY0NSwiZXhwIjoxNzYyMjU2NDQ1fQ.pEClZzVQq-R9mUzeZXwdL1c_3FllM59fVqqL4WEAhBY	2025-11-04 11:40:45.397+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-28 11:40:45.397+00	2025-10-28 11:40:45.397+00
751b96ba-5148-4064-adc7-5a94f2ea992f	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MTY1MTg1NywiZXhwIjoxNzYyMjU2NjU3fQ.yJzn94YyVg8SUx3s_ba9GeVYivb8tjzamHPyuIPLsRM	2025-11-04 11:44:17.693+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-28 11:44:17.693+00	2025-10-28 11:44:17.693+00
4f4e84f0-e287-4f1d-b57c-0ddd5c3274f8	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MTY1MjQ1OSwiZXhwIjoxNzYyMjU3MjU5fQ.Anjt-3lkBKyaquxblFCPLc6KR9wRK2il9JlMA5uZgTE	2025-11-04 11:54:19.283+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-28 11:54:19.283+00	2025-10-28 11:54:19.283+00
b812c893-6279-4ac9-9b55-88950f4e7050	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MTY1NzY1NSwiZXhwIjoxNzYyMjYyNDU1fQ.uPi30PmINj6puKb95oTzF_EszgY2XoryLb2Xl4hxMQc	2025-11-04 13:20:55.046+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-28 13:20:55.047+00	2025-10-28 13:20:55.047+00
83bd92e3-eca2-4b6f-9ad8-6e04098f19e8	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MTY4MDU5MywiZXhwIjoxNzYyMjg1MzkzfQ.Q6QqeFAUK2I3dIXQ1v1SwwCTTPRX_Kj22D2YFgeZQTc	2025-11-04 19:43:13.319+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-28 19:43:13.319+00	2025-10-28 19:43:13.319+00
4ca046a8-e4a6-4c54-85bf-b9473a85ed82	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MTc1MDE0OCwiZXhwIjoxNzYyMzU0OTQ4fQ.ZTNwSrFkl_C6uF-0yZxnSNvB5hBa_mZaECN4vM819ys	2025-11-05 15:02:28.105+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-29 15:02:28.105+00	2025-10-29 15:02:28.105+00
cf31da77-a6ed-4fb7-b582-96c0bce9c482	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MTc2NzgwOSwiZXhwIjoxNzYyMzcyNjA5fQ.MV3P9JGUG0bSgPGlv2MgjZGEuIeHaSxlZDU5svfSmeI	2025-11-05 19:56:49.98+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-29 19:56:49.981+00	2025-10-29 19:56:49.981+00
dd13018b-69b9-4d63-96d5-ae378de8bd0f	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MTgzMDQ5MywiZXhwIjoxNzYyNDM1MjkzfQ.xn7VuCpc4NmNifQZJerlVva_1OTvXNYqWhvYu6t4nOA	2025-11-06 13:21:33.889+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-10-30 13:21:33.89+00	2025-10-30 13:21:33.89+00
cf3d18e7-45df-49c3-8e57-5cb65f69601a	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MjI1NzgzOCwiZXhwIjoxNzYyODYyNjM4fQ.G6Q_akk2Lz5-ZAwbwYI6kpGKOKmvwE1FOmmKQ_vaz6w	2025-11-11 12:03:58.387+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-11-04 12:03:58.388+00	2025-11-04 12:03:58.388+00
caf8f419-4ebd-41fb-8a44-cfe441bdc44f	b437746d-9471-42bf-88fb-0b5c10a5ed87	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI0Mzc3NDZkLTk0NzEtNDJiZi04OGZiLTBiNWMxMGE1ZWQ4NyIsImlhdCI6MTc2MjI1Nzg0NywiZXhwIjoxNzYyODYyNjQ3fQ.X8z3YqD-Xag9XDqVbbDUOYsRxSwp8FuzezKaH8VSSl0	2025-11-11 12:04:07.896+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-11-04 12:04:07.896+00	2025-11-04 12:04:07.896+00
23986c3a-e2d1-4eb3-91b5-5f17e69c928d	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MjI2Nzc2NywiZXhwIjoxNzYyODcyNTY3fQ.ZA55jTCly31WT2zobBntfUrt_T8mGNwi8Bnh5jBqkJE	2025-11-11 14:49:27.755+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-11-04 14:49:27.756+00	2025-11-04 14:49:27.756+00
cc31a047-e1aa-45e2-873e-d0115d07950c	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MjI4MTQ3NCwiZXhwIjoxNzYyODg2Mjc0fQ.8PJASalultkr0vUXjNkiWF2uo55yxPy73zAcRQDsvgo	2025-11-11 18:37:54.997+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36	2025-11-04 18:37:54.997+00	2025-11-04 18:37:54.997+00
1c1acb0d-0652-4c4e-b202-91cd89f966ca	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2MzAzNTA4OCwiZXhwIjoxNzYzNjM5ODg4fQ.TCt9TbZzLBxVweSwIHKr0XgFmuzv5f7WkFEfxsryEX0	2025-11-20 11:58:08.825+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	2025-11-13 11:58:08.825+00	2025-11-13 11:58:08.825+00
8c44b8e6-2f36-4517-992d-9bf067d6d73e	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2NjM3NDkxOCwiZXhwIjoxNzY2OTc5NzE4fQ.KTHNlqlHY_iSPVxjOt_0JzvGpXaYLmObKrXxyj0tQxk	2025-12-29 03:41:58.296+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-22 03:41:58.296+00	2025-12-22 03:41:58.296+00
9aa94c04-c3bd-41f0-af48-80b0a99b929c	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc2NzAxMDQ5NCwiZXhwIjoxNzY3NjE1Mjk0fQ.6GqeBpxmqIva0KBEOp3XgVgZPQllx_jC5uWeKcE2SXE	2026-01-05 12:14:54.268+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2025-12-29 12:14:54.268+00	2025-12-29 12:14:54.268+00
99edfc52-a738-4222-becf-39838d0cecaa	5f4734de-6667-4916-97ef-1afc2969cbe5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNDczNGRlLTY2NjctNDkxNi05N2VmLTFhZmMyOTY5Y2JlNSIsImlhdCI6MTc3MTIwMjY5NywiZXhwIjoxNzcxODA3NDk3fQ.4YU4l6sHNK9f9oYBbm-aDoa1hhAWysm4AWXcBJXdtAI	2026-02-23 00:44:57.576+00	f	172.18.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-16 00:44:57.576+00	2026-02-16 00:44:57.576+00
\.


--
-- Data for Name: ReviewHelpful; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReviewHelpful" (id, "reviewId", "userId", "isHelpful", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Reviews" (id, "productId", "userId", "orderId", rating, title, comment, images, "isVerifiedPurchase", "isApproved", "helpfulCount", "notHelpfulCount", "adminResponse", "adminRespondedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: RolePermissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RolePermissions" (id, "roleId", "permissionId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Roles" (id, name, "displayName", description, "isActive", "isSystemRole", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Settings" (id, key, value, "displayName", description, type, category, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ShippingMethods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShippingMethods" (id, name, code, type, carrier, "isActive", description, price, "isFree", "freeFromAmount", "estimatedDays", zones, restrictions, "requiresAddress", "pickupAddress", icon, "displayOrder", "createdAt", "updatedAt") FROM stdin;
36df22cd-8d45-4b0b-91ad-4a77402777ed	Acordar con el Vendedor	ACORDAR_VENDEDOR	agreement	\N	t	Coordinar forma y costo de envío directamente con el vendedor	0.00	t	\N	\N	[]	{}	f	\N	\N	0	2025-10-31 20:00:44.985+00	2025-10-31 20:00:44.985+00
65e84e16-4459-4be1-b44a-61798c1e8be5	Retiro en Local	RETIRO_LOCAL	pickup	\N	t	Retiro sin cargo en nuestro local comercial	0.00	t	\N	0	[]	{}	f	{"street":"Av. Corrientes 1234","city":"CABA","state":"Buenos Aires","postalCode":"1043","phone":"011-1234-5678","hours":"Lunes a Viernes de 9 a 18hs"}	\N	1	2025-10-31 20:00:44.985+00	2025-10-31 20:00:44.985+00
3dc2d96b-1992-41ab-b76b-99d9f1bf34ca	Andreani	ANDREANI	carrier	Andreani	f	Envío a domicilio o sucursal a través de Andreani	\N	f	\N	3	[]	{}	t	\N	\N	2	2025-10-31 20:00:44.985+00	2025-10-31 20:00:44.985+00
c00405e1-e089-42fe-aaa7-98691e322653	OCA	OCA	carrier	OCA	f	Envío a domicilio o sucursal a través de OCA	\N	f	\N	4	[]	{}	t	\N	\N	3	2025-10-31 20:00:44.985+00	2025-10-31 20:00:44.985+00
08c098ea-d060-4d36-87ab-f16e7ce9c9b1	Correo Argentino	CORREO_ARGENTINO	carrier	Correo Argentino	f	Envío a domicilio o sucursal a través de Correo Argentino	\N	f	\N	5	[]	{}	t	\N	\N	4	2025-10-31 20:00:44.985+00	2025-10-31 20:00:44.985+00
\.


--
-- Data for Name: SmtpSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SmtpSettings" (id, host, port, secure, "user", password, "fromName", "fromEmail", "isActive", "testEmail", provider, "lastTestedAt", "testStatus", "testError", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockAlerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockAlerts" (id, "productId", type, severity, message, "currentStock", threshold, "isRead", "isResolved", "resolvedAt", "resolvedBy", "notificationSent", "notificationSentAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockLocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockLocations" (id, "productId", "locationName", "locationCode", quantity, "reservedQuantity", "isActive", "isPrimary", address, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockMovements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockMovements" (id, "productId", type, quantity, "previousStock", "newStock", "unitCost", "totalCost", reason, notes, "referenceType", "referenceId", "userId", "locationFrom", "locationTo", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockReservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockReservations" (id, "productId", "userId", "sessionId", quantity, "expiresAt", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" (id, "firstName", "lastName", email, password, phone, address, "shippingAddress", "billingAddress", role, "roleId", "isActive", "emailVerified", "verificationToken", "verificationTokenExpires", "lastLoginAt", "createdAt", "updatedAt") FROM stdin;
5f4734de-6667-4916-97ef-1afc2969cbe5	Admin	User	admin@ecommerce.com	$2a$10$V8nYKUvbLADE0HLuUI5VxOhNDsYAMywGQAkNmSkl7QnWfeCR52OpS	1234567890	Dirección del administrador	\N	\N	admin	\N	t	t	b4069ad4028a48150e619a5754d419501266e1e391efb7994556f5b1cf1a8ec0	2025-10-27 19:22:39.44+00	2026-02-16 00:44:57.563+00	2025-10-24 21:03:33.795+00	2026-02-16 00:44:57.563+00
b437746d-9471-42bf-88fb-0b5c10a5ed87	Roberto	Kelm	cliente@example.com	$2a$12$ld/Mr9mESl7uFCjtXG9EfuiTykmS6y9ONdV/Yl4NKSrEDipOSk9S6	0987654321	chacra 134 calle 76 6851	\N	\N	customer	\N	t	t	\N	\N	2025-11-04 12:04:07.889+00	2025-10-24 21:03:34.129+00	2025-11-04 12:04:07.889+00
\.


--
-- Data for Name: Wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Wishlists" (id, "userId", "productId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: afip_credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.afip_credentials (id, name, cuit, "businessName", certificate, "privateKey", "pointOfSale", production, "taxCategory", address, city, "postalCode", province, "iibbNumber", "activityStartDate", "lastConnectionTest", "connectionStatus", "lastError", "isActive", config, "createdAt", "updatedAt") FROM stdin;
ea9f829a-329d-4a5b-8ded-068f7bfbe35c	Testing - Homologación AFIP	20123456789	Empresa de Prueba S.A.	-----BEGIN CERTIFICATE-----\nMIIDdTCCAl2gAwIBAgIEBVr6QjANBgkqhkiG9w0BAQsFADBTMQswCQYDVQQGEwJB\nUjEVMBMGA1UEChMMQUZJUCBURVNUSU5HMRQwEgYDVQQLDAtDT01QUk9CQU5URTEX\nMBUGA1UEAwwOQ09NUFJPUEFOVEVTIENBMB4XDTIwMDEwMTAwMDAwMFoXDTMwMDEw\nMTAwMDAwMFowSTELMAkGA1UEBhMCQVIxFTATBgNVBAoMDEFGSVAgVEVTVElORzEj\nMCEGA1UEAwwaQ1VJVCAyMDEyMzQ1Njc4OSBURVNUSU5HMIIBIjANBgkqhkiG9w0B\nAQEFAAOCAQ8AMIIBCgKCAQEAzPzgFwA+qvgHbG3jI8RHsq7rJWv1Kq3lqGHgGkgH\n6qHOGKbPBZRe1u1W1Xy/6qHT0GkHq3lGH/6qHgGkgH6qHOGKbPBZRe1u1W1Xy/6q\nHT0GkHq3lGH/6qHgGkgH6qHOGKbPBZRe1u1W1Xy/6qHT0GkHq3lGH/TEST_CERT\n-----END CERTIFICATE-----	-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAzPzgFwA+qvgHbG3jI8RHsq7rJWv1Kq3lqGHgGkgH6qHOGKbP\nBZRe1u1W1Xy/6qHT0GkHq3lGH/6qHgGkgH6qHOGKbPBZRe1u1W1Xy/6qHT0GkHq3\nlGH/6qHgGkgH6qHOGKbPBZRe1u1W1Xy/6qHT0GkHq3lGH/TEST_KEY\n-----END RSA PRIVATE KEY-----	1	f	responsable_inscripto	Av. Corrientes 1234	Buenos Aires	C1043	Buenos Aires	\N	\N	2025-10-29 13:16:07.181+00	connected	\N	t	{}	2025-10-29 13:05:22.826+00	2025-10-29 13:16:07.181+00
\.


--
-- Data for Name: shipment_trackings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipment_trackings (id, status, location, description, "timestamp", "carrierMessage", "isPublic", metadata, "createdAt", "updatedAt", "shipmentId") FROM stdin;
9f7f2e31-b9f7-4031-a383-8c603d7eb952	label_created	Centro de Distribución - Buenos Aires	Etiqueta de envío creada	2025-10-28 11:11:48.265+00	\N	t	\N	2025-10-28 11:11:48.265+00	2025-10-28 11:11:48.265+00	516502bb-d8ea-43ee-abe9-31e0eb506db0
d188ac5b-ef73-4d67-a4c5-319ad051514d	picked_up	Centro de Distribución - Buenos Aires	Paquete recogido por el transportista	2025-10-28 17:11:48.265+00	\N	t	\N	2025-10-28 17:11:48.265+00	2025-10-28 17:11:48.265+00	516502bb-d8ea-43ee-abe9-31e0eb506db0
3fed1038-5f25-4d3f-8751-8c027c5d4ca4	in_transit	En tránsito	Paquete en camino al destino	2025-10-29 11:11:48.265+00	\N	t	\N	2025-10-29 11:11:48.265+00	2025-10-29 11:11:48.265+00	516502bb-d8ea-43ee-abe9-31e0eb506db0
2e82037f-cab6-4377-ac18-aeae1a489b4f	in_transit	Centro de Clasificación - Córdoba	Paquete procesado en centro de clasificación	2025-10-30 11:11:48.265+00	\N	t	\N	2025-10-30 11:11:48.265+00	2025-10-30 11:11:48.265+00	516502bb-d8ea-43ee-abe9-31e0eb506db0
6870714e-9caf-4db4-b6ff-59c5185256e0	label_created	Centro de Distribución - Buenos Aires	Etiqueta de envío creada	2025-10-28 11:28:17.326+00	\N	t	\N	2025-10-28 11:28:17.326+00	2025-10-28 11:28:17.326+00	e34c1d7d-afa1-44fe-9f27-f24b52df73b8
1547d031-e5c1-496d-b253-6b40dd17034e	picked_up	Centro de Distribución - Buenos Aires	Paquete recogido por el transportista	2025-10-28 17:28:17.326+00	\N	t	\N	2025-10-28 17:28:17.326+00	2025-10-28 17:28:17.326+00	e34c1d7d-afa1-44fe-9f27-f24b52df73b8
b0ccffe9-640d-4a07-aad6-53d11ef331fe	in_transit	En tránsito	Paquete en camino al destino	2025-10-29 11:28:17.326+00	\N	t	\N	2025-10-29 11:28:17.326+00	2025-10-29 11:28:17.326+00	e34c1d7d-afa1-44fe-9f27-f24b52df73b8
a3461cc7-cb91-4125-816c-1a4492983153	in_transit	Centro de Clasificación - Córdoba	Paquete procesado en centro de clasificación	2025-10-30 11:28:17.326+00	\N	t	\N	2025-10-30 11:28:17.326+00	2025-10-30 11:28:17.326+00	e34c1d7d-afa1-44fe-9f27-f24b52df73b8
a11c263d-86b0-41b2-bab1-7c3993841858	out_for_delivery	Centro de Reparto Local	Paquete en reparto - Será entregado hoy	2025-10-30 08:00:00+00	\N	t	\N	2025-10-30 08:00:00+00	2025-10-30 08:00:00+00	e34c1d7d-afa1-44fe-9f27-f24b52df73b8
8749c91e-8a56-425c-8644-26ceb4d0cfe3	label_created	Centro de Distribución - Buenos Aires	Etiqueta de envío creada	2025-10-28 11:28:17.354+00	\N	t	\N	2025-10-28 11:28:17.354+00	2025-10-28 11:28:17.354+00	a9a8b39e-0063-4494-8d25-8e2cb79cde7c
79934391-1959-41b8-8dee-c12b497c807d	picked_up	Centro de Distribución - Buenos Aires	Paquete recogido por el transportista	2025-10-28 17:28:17.354+00	\N	t	\N	2025-10-28 17:28:17.354+00	2025-10-28 17:28:17.354+00	a9a8b39e-0063-4494-8d25-8e2cb79cde7c
d4e06458-7986-4dd3-9329-d741fb9022c8	label_created	Centro de Distribución - Buenos Aires	Etiqueta de envío creada	2025-10-28 11:28:17.363+00	\N	t	\N	2025-10-28 11:28:17.363+00	2025-10-28 11:28:17.363+00	889817fa-d6b2-476b-ab15-5b6f3629ecf7
80551129-2c83-47fb-889c-5c2e3860955d	picked_up	Centro de Distribución - Buenos Aires	Paquete recogido por el transportista	2025-10-28 17:28:17.363+00	\N	t	\N	2025-10-28 17:28:17.363+00	2025-10-28 17:28:17.363+00	889817fa-d6b2-476b-ab15-5b6f3629ecf7
33c306e3-354e-4b1c-a0a2-5c88a88a3bb8	label_created	Centro de Distribución - Buenos Aires	Etiqueta de envío creada	2025-10-28 11:28:17.373+00	\N	t	\N	2025-10-28 11:28:17.373+00	2025-10-28 11:28:17.373+00	b91de01a-bc5c-40fb-b600-488332a65929
ac7c59bb-afe2-4abc-8719-754d5a8845f6	picked_up	Centro de Distribución - Buenos Aires	Paquete recogido por el transportista	2025-10-28 17:28:17.373+00	\N	t	\N	2025-10-28 17:28:17.373+00	2025-10-28 17:28:17.373+00	b91de01a-bc5c-40fb-b600-488332a65929
d68f045a-5167-4386-bcf7-a20e31fb24e4	in_transit	En tránsito	Paquete en camino al destino	2025-10-29 11:28:17.373+00	\N	t	\N	2025-10-29 11:28:17.373+00	2025-10-29 11:28:17.373+00	b91de01a-bc5c-40fb-b600-488332a65929
16c5095c-fc33-4614-86d2-f0fcf8fe158f	in_transit	Centro de Clasificación - Córdoba	Paquete procesado en centro de clasificación	2025-10-30 11:28:17.373+00	\N	t	\N	2025-10-30 11:28:17.373+00	2025-10-30 11:28:17.373+00	b91de01a-bc5c-40fb-b600-488332a65929
ec98ae6a-bb7a-4519-bdb8-e6da710491dd	out_for_delivery	Centro de Reparto Local	Paquete en reparto - Será entregado hoy	2025-11-03 08:00:00+00	\N	t	\N	2025-11-03 08:00:00+00	2025-11-03 08:00:00+00	b91de01a-bc5c-40fb-b600-488332a65929
db13c8c3-97e9-4faa-87bf-6b166b3be27f	delivered	Domicilio del Cliente	Paquete entregado exitosamente	2025-11-03 14:30:00+00	Entregado y firmado por el destinatario	t	\N	2025-11-03 14:30:00+00	2025-11-03 14:30:00+00	b91de01a-bc5c-40fb-b600-488332a65929
71b64171-54b0-4414-acd1-a5417b8d2a5a	label_created	Centro de Distribución - Buenos Aires	Etiqueta de envío creada	2025-10-28 11:28:17.381+00	\N	t	\N	2025-10-28 11:28:17.381+00	2025-10-28 11:28:17.381+00	20fb0cdc-0c34-4508-9549-a60c64c99320
bda96d15-5e60-4bb3-925d-d6228e957f1b	picked_up	Centro de Distribución - Buenos Aires	Paquete recogido por el transportista	2025-10-28 17:28:17.381+00	\N	t	\N	2025-10-28 17:28:17.381+00	2025-10-28 17:28:17.381+00	20fb0cdc-0c34-4508-9549-a60c64c99320
41ffa3d5-ed5e-4ada-8ebd-b63cfaeb9ffc	in_transit	En tránsito	Paquete en camino al destino	2025-10-29 11:28:17.381+00	\N	t	\N	2025-10-29 11:28:17.381+00	2025-10-29 11:28:17.381+00	20fb0cdc-0c34-4508-9549-a60c64c99320
2aef6d47-0406-4766-abfd-97b042337efa	in_transit	Centro de Clasificación - Córdoba	Paquete procesado en centro de clasificación	2025-10-30 11:28:17.381+00	\N	t	\N	2025-10-30 11:28:17.381+00	2025-10-30 11:28:17.381+00	20fb0cdc-0c34-4508-9549-a60c64c99320
7044ea93-982a-40e8-9e12-8afa94c29dac	label_created	Centro de Distribución - Buenos Aires	Etiqueta de envío creada	2025-10-29 17:08:26.59+00	\N	t	\N	2025-10-29 17:08:26.59+00	2025-10-29 17:08:26.59+00	85fa0d46-3b89-4f8b-8353-6ed76e6233e7
\.


--
-- Data for Name: shipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipments (id, "trackingNumber", carrier, "carrierService", status, "shippingCost", weight, dimensions, "shippingAddress", "originAddress", "estimatedDeliveryDate", "shippedAt", "deliveredAt", "packageType", "numberOfPackages", "insuranceAmount", notes, "labelUrl", "trackingUrl", "signatureRequired", "deliveryProofUrl", "recipientSignature", "deliveredBy", "failedDeliveryReason", "attemptedDeliveries", "lastAttemptDate", "createdAt", "updatedAt", "orderId") FROM stdin;
516502bb-d8ea-43ee-abe9-31e0eb506db0	DHL1761833913956428	DHL	Next Day	in_transit	683.45	2.57	{"length":42,"width":38,"height":32}	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	{"street":"Av. Corrientes 1234","city":"Buenos Aires","state":"CABA","postalCode":"1043","country":"Argentina"}	2025-11-02 11:11:48.265+00	2025-10-29 11:11:48.265+00	\N	Envelope	3	0.00	Envío para orden ORD-1761649908264-0	\N	https://dhl.com/track/DHL1761833913956428	f	\N	\N	\N	\N	0	\N	2025-10-28 11:11:48.265+00	2025-10-30 14:18:33.96+00	8441ba40-3f97-4d98-ac5b-b0e4f7adb74d
e34c1d7d-afa1-44fe-9f27-f24b52df73b8	COR1761833913960419	Correo Argentino	Next Day	out_for_delivery	1337.29	4.35	{"length":21,"width":20,"height":24}	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	{"street":"Av. Corrientes 1234","city":"Buenos Aires","state":"CABA","postalCode":"1043","country":"Argentina"}	2025-11-04 11:28:17.326+00	2025-10-29 11:28:17.326+00	\N	Box	1	3352.81	Envío para orden ORD-1761650897325-0	\N	https://correoargentino.com/track/COR1761833913960419	f	\N	\N	\N	\N	0	\N	2025-10-28 11:28:17.326+00	2025-10-30 14:18:33.961+00	f0566266-b942-4ecf-bb85-1c2b9b3ec5aa
a9a8b39e-0063-4494-8d25-8e2cb79cde7c	DHL176183391396128	DHL	Standard	picked_up	719.11	2.64	{"length":20,"width":45,"height":36}	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	{"street":"Av. Corrientes 1234","city":"Buenos Aires","state":"CABA","postalCode":"1043","country":"Argentina"}	2025-11-05 11:28:17.354+00	\N	\N	Pallet	1	0.00	Envío para orden ORD-1761650897354-1	\N	https://dhl.com/track/DHL176183391396128	f	\N	\N	\N	\N	0	\N	2025-10-28 11:28:17.354+00	2025-10-30 14:18:33.961+00	d15857e6-650a-43ac-9339-abccb1591e2e
889817fa-d6b2-476b-ab15-5b6f3629ecf7	OCA1761833913961939	OCA	Next Day	picked_up	915.00	5.16	{"length":37,"width":41,"height":32}	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	{"street":"Av. Corrientes 1234","city":"Buenos Aires","state":"CABA","postalCode":"1043","country":"Argentina"}	2025-11-04 11:28:17.363+00	\N	\N	Box	1	0.00	Envío para orden ORD-1761650897363-2	\N	https://oca.com/track/OCA1761833913961939	f	\N	\N	\N	\N	0	\N	2025-10-28 11:28:17.363+00	2025-10-30 14:18:33.961+00	6b725d33-1f06-4fc6-90ff-686d9d7fdf61
b91de01a-bc5c-40fb-b600-488332a65929	COR1761833913961708	Correo Argentino	Standard	delivered	1076.93	3.35	{"length":36,"width":47,"height":21}	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	{"street":"Av. Corrientes 1234","city":"Buenos Aires","state":"CABA","postalCode":"1043","country":"Argentina"}	2025-11-03 11:28:17.373+00	2025-10-29 11:28:17.373+00	2025-11-03 11:28:17.373+00	Box	3	5872.25	Envío para orden ORD-1761650897373-3	\N	https://correoargentino.com/track/COR1761833913961708	f	\N	\N	\N	\N	0	\N	2025-10-28 11:28:17.373+00	2025-10-30 14:18:33.961+00	5f891dfb-9ce0-4e24-b911-89eb676c471b
20fb0cdc-0c34-4508-9549-a60c64c99320	FED1761833913961478	FedEx	Express	in_transit	1264.03	4.23	{"length":35,"width":22,"height":17}	"{\\"street\\":\\"Calle Falsa 123\\",\\"city\\":\\"Buenos Aires\\",\\"state\\":\\"CABA\\",\\"zipCode\\":\\"1000\\",\\"country\\":\\"Argentina\\"}"	{"street":"Av. Corrientes 1234","city":"Buenos Aires","state":"CABA","postalCode":"1043","country":"Argentina"}	2025-11-03 11:28:17.381+00	2025-10-29 11:28:17.381+00	\N	Box	3	0.00	Envío para orden ORD-1761650897381-4	\N	https://fedex.com/track/FED1761833913961478	t	\N	\N	\N	\N	0	\N	2025-10-28 11:28:17.381+00	2025-10-30 14:18:33.961+00	a7678339-4821-4a23-8343-2e13dbf52023
85fa0d46-3b89-4f8b-8353-6ed76e6233e7	COR1761833913961344	Correo Argentino	Express	pending	1180.57	4.04	{"length":21,"width":25,"height":20}	{"firstName":"Admin","lastName":"User","street":"chacra 134 calle 76 6851","city":"Posadas","state":"Misiones","postalCode":"3300","country":"Argentina","phone":"03764969830"}	{"street":"Av. Corrientes 1234","city":"Buenos Aires","state":"CABA","postalCode":"1043","country":"Argentina"}	2025-11-04 17:08:26.59+00	\N	\N	Box	1	0.00	Envío para orden ORD-57706590-3597	\N	https://correoargentino.com/track/COR1761833913961344	f	\N	\N	\N	\N	0	\N	2025-10-29 17:08:26.59+00	2025-10-30 14:18:33.961+00	d7095db8-8618-456c-94d2-945a4300d69f
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, contact_person, email, phone, address, city, state, country, postal_code, tax_id, website, notes, is_active, created_at, updated_at) FROM stdin;
1	Producción Propia	Interno	\N	\N	\N	\N	\N	México	\N	\N	\N	Productos fabricados internamente	t	2025-10-25 14:47:52.280418+00	2025-10-25 14:47:52.280418+00
2	Tech Supplies S.A.	Juan García	contacto@techsupplies.com	+52 55 1234 5678	Av. Reforma 123	Ciudad de México	CDMX	México	06600	TSA-123456	https://techsupplies.com	Proveedor principal de electrónicos	t	2025-10-26 19:28:00.721+00	2025-10-26 19:28:00.721+00
3	Fashion Direct	María López	info@fashiondirect.com	+52 33 9876 5432	Av. Chapultepec 456	Guadalajara	Jalisco	México	44100	FD-789012	https://fashiondirect.com	Importador de ropa de marca	t	2025-10-26 19:28:00.741+00	2025-10-26 19:28:00.741+00
4	Home & Living	Carlos Ramírez	ventas@homeliving.com	+52 81 5555 1234	Calzada del Valle 789	Monterrey	Nuevo León	México	66220	HL-345678	\N	Artículos para el hogar	t	2025-10-26 19:28:00.748+00	2025-10-26 19:28:00.748+00
5	Sports Pro	Ana Torres	contacto@sportspro.mx	+52 442 888 9999	Blvd. Bernardo Quintana 321	Querétaro	Querétaro	México	76090	SP-901234	https://sportspro.mx	Equipamiento deportivo profesional	t	2025-10-26 19:28:00.755+00	2025-10-26 19:28:00.755+00
\.


--
-- Name: CouponUsages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CouponUsages_id_seq"', 1, false);


--
-- Name: Coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Coupons_id_seq"', 1, false);


--
-- Name: EmailLogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."EmailLogs_id_seq"', 1, false);


--
-- Name: EmailTemplates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."EmailTemplates_id_seq"', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 6, true);


--
-- Name: AuditLogs AuditLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_pkey" PRIMARY KEY (id);


--
-- Name: BankAccounts BankAccounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BankAccounts"
    ADD CONSTRAINT "BankAccounts_pkey" PRIMARY KEY (id);


--
-- Name: CartItems CartItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_pkey" PRIMARY KEY (id);


--
-- Name: Carts Carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_pkey" PRIMARY KEY (id);


--
-- Name: Categories Categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_name_key" UNIQUE (name);


--
-- Name: Categories Categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY (id);


--
-- Name: Categories Categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_slug_key" UNIQUE (slug);


--
-- Name: CouponUsages CouponUsages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponUsages"
    ADD CONSTRAINT "CouponUsages_pkey" PRIMARY KEY (id);


--
-- Name: Coupons Coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_code_key" UNIQUE (code);


--
-- Name: Coupons Coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_pkey" PRIMARY KEY (id);


--
-- Name: EmailLogs EmailLogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_pkey" PRIMARY KEY (id);


--
-- Name: EmailTemplates EmailTemplates_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplates"
    ADD CONSTRAINT "EmailTemplates_name_key" UNIQUE (name);


--
-- Name: EmailTemplates EmailTemplates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplates"
    ADD CONSTRAINT "EmailTemplates_pkey" PRIMARY KEY (id);


--
-- Name: HomeSettings HomeSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."HomeSettings"
    ADD CONSTRAINT "HomeSettings_pkey" PRIMARY KEY (id);


--
-- Name: Invoices Invoices_invoiceNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_invoiceNumber_key" UNIQUE ("invoiceNumber");


--
-- Name: Invoices Invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_pkey" PRIMARY KEY (id);


--
-- Name: LogisticsCredentials LogisticsCredentials_carrier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LogisticsCredentials"
    ADD CONSTRAINT "LogisticsCredentials_carrier_key" UNIQUE (carrier);


--
-- Name: LogisticsCredentials LogisticsCredentials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."LogisticsCredentials"
    ADD CONSTRAINT "LogisticsCredentials_pkey" PRIMARY KEY (id);


--
-- Name: OrderItems OrderItems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItems"
    ADD CONSTRAINT "OrderItems_pkey" PRIMARY KEY (id);


--
-- Name: Orders Orders_orderNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_orderNumber_key" UNIQUE ("orderNumber");


--
-- Name: Orders Orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_pkey" PRIMARY KEY (id);


--
-- Name: Permissions Permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permissions"
    ADD CONSTRAINT "Permissions_name_key" UNIQUE (name);


--
-- Name: Permissions Permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Permissions"
    ADD CONSTRAINT "Permissions_pkey" PRIMARY KEY (id);


--
-- Name: ProductBarcodes ProductBarcodes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductBarcodes"
    ADD CONSTRAINT "ProductBarcodes_pkey" PRIMARY KEY (id);


--
-- Name: ProductBatches ProductBatches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductBatches"
    ADD CONSTRAINT "ProductBatches_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- Name: Products Products_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_sku_key" UNIQUE (sku);


--
-- Name: Products Products_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_slug_key" UNIQUE (slug);


--
-- Name: RefreshTokens RefreshTokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY (id);


--
-- Name: RefreshTokens RefreshTokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "RefreshTokens_token_key" UNIQUE (token);


--
-- Name: ReviewHelpful ReviewHelpful_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReviewHelpful"
    ADD CONSTRAINT "ReviewHelpful_pkey" PRIMARY KEY (id);


--
-- Name: Reviews Reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reviews"
    ADD CONSTRAINT "Reviews_pkey" PRIMARY KEY (id);


--
-- Name: RolePermissions RolePermissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_pkey" PRIMARY KEY (id);


--
-- Name: RolePermissions RolePermissions_roleId_permissionId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_roleId_permissionId_key" UNIQUE ("roleId", "permissionId");


--
-- Name: Roles Roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_name_key" UNIQUE (name);


--
-- Name: Roles Roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "Roles_pkey" PRIMARY KEY (id);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: Settings Settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_key_key" UNIQUE (key);


--
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (id);


--
-- Name: ShippingMethods ShippingMethods_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShippingMethods"
    ADD CONSTRAINT "ShippingMethods_code_key" UNIQUE (code);


--
-- Name: ShippingMethods ShippingMethods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShippingMethods"
    ADD CONSTRAINT "ShippingMethods_pkey" PRIMARY KEY (id);


--
-- Name: SmtpSettings SmtpSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SmtpSettings"
    ADD CONSTRAINT "SmtpSettings_pkey" PRIMARY KEY (id);


--
-- Name: StockAlerts StockAlerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockAlerts"
    ADD CONSTRAINT "StockAlerts_pkey" PRIMARY KEY (id);


--
-- Name: StockLocations StockLocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLocations"
    ADD CONSTRAINT "StockLocations_pkey" PRIMARY KEY (id);


--
-- Name: StockMovements StockMovements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_pkey" PRIMARY KEY (id);


--
-- Name: StockReservations StockReservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockReservations"
    ADD CONSTRAINT "StockReservations_pkey" PRIMARY KEY (id);


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: Wishlists Wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wishlists"
    ADD CONSTRAINT "Wishlists_pkey" PRIMARY KEY (id);


--
-- Name: afip_credentials afip_credentials_cuit_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.afip_credentials
    ADD CONSTRAINT afip_credentials_cuit_key UNIQUE (cuit);


--
-- Name: afip_credentials afip_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.afip_credentials
    ADD CONSTRAINT afip_credentials_pkey PRIMARY KEY (id);


--
-- Name: shipment_trackings shipment_trackings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_trackings
    ADD CONSTRAINT shipment_trackings_pkey PRIMARY KEY (id);


--
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- Name: shipments shipments_trackingNumber_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT "shipments_trackingNumber_key" UNIQUE ("trackingNumber");


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: afip_credentials_cuit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX afip_credentials_cuit ON public.afip_credentials USING btree (cuit);


--
-- Name: afip_credentials_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX afip_credentials_is_active ON public.afip_credentials USING btree ("isActive");


--
-- Name: audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action ON public."AuditLogs" USING btree (action);


--
-- Name: audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_created_at ON public."AuditLogs" USING btree ("createdAt");


--
-- Name: audit_logs_resource_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_resource_type ON public."AuditLogs" USING btree ("resourceType");


--
-- Name: audit_logs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_status ON public."AuditLogs" USING btree (status);


--
-- Name: audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id ON public."AuditLogs" USING btree ("userId");


--
-- Name: cart_items_cart_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cart_items_cart_id ON public."CartItems" USING btree ("cartId");


--
-- Name: cart_items_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cart_items_product_id ON public."CartItems" USING btree ("productId");


--
-- Name: carts_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX carts_expires_at ON public."Carts" USING btree ("expiresAt");


--
-- Name: carts_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX carts_session_id ON public."Carts" USING btree ("sessionId");


--
-- Name: carts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX carts_user_id ON public."Carts" USING btree ("userId");


--
-- Name: categories_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_is_active ON public."Categories" USING btree ("isActive");


--
-- Name: categories_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_slug ON public."Categories" USING btree (slug);


--
-- Name: categories_sort_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_sort_order ON public."Categories" USING btree ("sortOrder");


--
-- Name: idx_products_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_supplier ON public."Products" USING btree (supplier_id);


--
-- Name: idx_suppliers_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (is_active);


--
-- Name: invoices_afip_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_afip_status_idx ON public."Invoices" USING btree ("afipStatus");


--
-- Name: invoices_cae_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_cae_idx ON public."Invoices" USING btree (cae);


--
-- Name: invoices_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_created_at ON public."Invoices" USING btree ("createdAt");


--
-- Name: invoices_invoice_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_invoice_number ON public."Invoices" USING btree ("invoiceNumber");


--
-- Name: invoices_issue_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_issue_date ON public."Invoices" USING btree ("issueDate");


--
-- Name: invoices_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_order_id ON public."Invoices" USING btree ("orderId");


--
-- Name: invoices_point_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_point_type_idx ON public."Invoices" USING btree ("pointOfSale", "invoiceType");


--
-- Name: invoices_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_status ON public."Invoices" USING btree (status);


--
-- Name: invoices_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_user_id ON public."Invoices" USING btree ("userId");


--
-- Name: orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at ON public."Orders" USING btree ("createdAt");


--
-- Name: orders_invoice_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_invoice_number ON public."Orders" USING btree ("invoiceNumber");


--
-- Name: orders_order_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_number ON public."Orders" USING btree ("orderNumber");


--
-- Name: orders_payment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_payment_id ON public."Orders" USING btree ("paymentId");


--
-- Name: orders_payment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_payment_status ON public."Orders" USING btree ("paymentStatus");


--
-- Name: orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status ON public."Orders" USING btree (status);


--
-- Name: orders_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_user_id ON public."Orders" USING btree ("userId");


--
-- Name: permissions_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permissions_category ON public."Permissions" USING btree (category);


--
-- Name: permissions_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permissions_name ON public."Permissions" USING btree (name);


--
-- Name: permissions_resource_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX permissions_resource_action ON public."Permissions" USING btree (resource, action);


--
-- Name: product_barcodes_barcode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_barcodes_barcode ON public."ProductBarcodes" USING btree (barcode);


--
-- Name: product_barcodes_barcode_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_barcodes_barcode_type ON public."ProductBarcodes" USING btree ("barcodeType");


--
-- Name: product_barcodes_is_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_barcodes_is_primary ON public."ProductBarcodes" USING btree ("isPrimary");


--
-- Name: product_barcodes_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_barcodes_product_id ON public."ProductBarcodes" USING btree ("productId");


--
-- Name: product_batches_batch_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_batches_batch_number ON public."ProductBatches" USING btree ("batchNumber");


--
-- Name: product_batches_expiration_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_batches_expiration_date ON public."ProductBatches" USING btree ("expirationDate");


--
-- Name: product_batches_location_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_batches_location_code ON public."ProductBatches" USING btree ("locationCode");


--
-- Name: product_batches_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_batches_product_id ON public."ProductBatches" USING btree ("productId");


--
-- Name: product_batches_product_id_batch_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_batches_product_id_batch_number ON public."ProductBatches" USING btree ("productId", "batchNumber");


--
-- Name: product_batches_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_batches_status ON public."ProductBatches" USING btree (status);


--
-- Name: products_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category_id ON public."Products" USING btree ("categoryId");


--
-- Name: products_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_is_active ON public."Products" USING btree ("isActive");


--
-- Name: products_is_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_is_featured ON public."Products" USING btree ("isFeatured");


--
-- Name: products_price; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_price ON public."Products" USING btree (price);


--
-- Name: products_sku; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sku ON public."Products" USING btree (sku);


--
-- Name: products_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_slug ON public."Products" USING btree (slug);


--
-- Name: products_stock; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_stock ON public."Products" USING btree (stock);


--
-- Name: products_supplier_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_supplier_id ON public."Products" USING btree ("supplierId");


--
-- Name: refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_expires_at ON public."RefreshTokens" USING btree ("expiresAt");


--
-- Name: refresh_tokens_is_revoked; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_is_revoked ON public."RefreshTokens" USING btree ("isRevoked");


--
-- Name: refresh_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_token ON public."RefreshTokens" USING btree (token);


--
-- Name: refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_user_id ON public."RefreshTokens" USING btree ("userId");


--
-- Name: role_permissions_permission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX role_permissions_permission_id ON public."RolePermissions" USING btree ("permissionId");


--
-- Name: role_permissions_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX role_permissions_role_id ON public."RolePermissions" USING btree ("roleId");


--
-- Name: role_permissions_role_id_permission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX role_permissions_role_id_permission_id ON public."RolePermissions" USING btree ("roleId", "permissionId");


--
-- Name: roles_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX roles_is_active ON public."Roles" USING btree ("isActive");


--
-- Name: roles_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX roles_name ON public."Roles" USING btree (name);


--
-- Name: shipment_trackings_shipment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_trackings_shipment_id ON public.shipment_trackings USING btree ("shipmentId");


--
-- Name: shipment_trackings_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_trackings_timestamp ON public.shipment_trackings USING btree ("timestamp");


--
-- Name: shipments_carrier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipments_carrier ON public.shipments USING btree (carrier);


--
-- Name: shipments_estimated_delivery_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipments_estimated_delivery_date ON public.shipments USING btree ("estimatedDeliveryDate");


--
-- Name: shipments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipments_order_id ON public.shipments USING btree ("orderId");


--
-- Name: shipments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipments_status ON public.shipments USING btree (status);


--
-- Name: shipments_tracking_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipments_tracking_number ON public.shipments USING btree ("trackingNumber");


--
-- Name: stock_alerts_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_alerts_created_at ON public."StockAlerts" USING btree ("createdAt");


--
-- Name: stock_alerts_is_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_alerts_is_read ON public."StockAlerts" USING btree ("isRead");


--
-- Name: stock_alerts_is_resolved; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_alerts_is_resolved ON public."StockAlerts" USING btree ("isResolved");


--
-- Name: stock_alerts_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_alerts_product_id ON public."StockAlerts" USING btree ("productId");


--
-- Name: stock_alerts_severity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_alerts_severity ON public."StockAlerts" USING btree (severity);


--
-- Name: stock_alerts_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_alerts_type ON public."StockAlerts" USING btree (type);


--
-- Name: stock_locations_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_locations_is_active ON public."StockLocations" USING btree ("isActive");


--
-- Name: stock_locations_is_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_locations_is_primary ON public."StockLocations" USING btree ("isPrimary");


--
-- Name: stock_locations_location_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_locations_location_code ON public."StockLocations" USING btree ("locationCode");


--
-- Name: stock_locations_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_locations_product_id ON public."StockLocations" USING btree ("productId");


--
-- Name: stock_locations_product_id_location_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX stock_locations_product_id_location_code ON public."StockLocations" USING btree ("productId", "locationCode");


--
-- Name: stock_movements_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_movements_created_at ON public."StockMovements" USING btree ("createdAt");


--
-- Name: stock_movements_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_movements_product_id ON public."StockMovements" USING btree ("productId");


--
-- Name: stock_movements_reference_type_reference_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_movements_reference_type_reference_id ON public."StockMovements" USING btree ("referenceType", "referenceId");


--
-- Name: stock_movements_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_movements_type ON public."StockMovements" USING btree (type);


--
-- Name: stock_movements_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_movements_user_id ON public."StockMovements" USING btree ("userId");


--
-- Name: stock_reservations_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_reservations_expires_at ON public."StockReservations" USING btree ("expiresAt");


--
-- Name: stock_reservations_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_reservations_product_id ON public."StockReservations" USING btree ("productId");


--
-- Name: stock_reservations_session_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_reservations_session_id ON public."StockReservations" USING btree ("sessionId");


--
-- Name: stock_reservations_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_reservations_status ON public."StockReservations" USING btree (status);


--
-- Name: stock_reservations_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_reservations_user_id ON public."StockReservations" USING btree ("userId");


--
-- Name: suppliers_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suppliers_is_active ON public.suppliers USING btree (is_active);


--
-- Name: suppliers_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX suppliers_name ON public.suppliers USING btree (name);


--
-- Name: users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email ON public."Users" USING btree (email);


--
-- Name: users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role ON public."Users" USING btree (role);


--
-- Name: wishlists_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wishlists_created_at ON public."Wishlists" USING btree ("createdAt");


--
-- Name: wishlists_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wishlists_product_id ON public."Wishlists" USING btree ("productId");


--
-- Name: wishlists_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wishlists_user_id ON public."Wishlists" USING btree ("userId");


--
-- Name: wishlists_user_id_product_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX wishlists_user_id_product_id ON public."Wishlists" USING btree ("userId", "productId");


--
-- Name: AuditLogs AuditLogs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "AuditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CartItems CartItems_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public."Carts"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CartItems CartItems_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItems"
    ADD CONSTRAINT "CartItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Carts Carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Carts"
    ADD CONSTRAINT "Carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CouponUsages CouponUsages_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponUsages"
    ADD CONSTRAINT "CouponUsages_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public."Coupons"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CouponUsages CouponUsages_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponUsages"
    ADD CONSTRAINT "CouponUsages_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CouponUsages CouponUsages_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CouponUsages"
    ADD CONSTRAINT "CouponUsages_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: Coupons Coupons_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Coupons"
    ADD CONSTRAINT "Coupons_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EmailLogs EmailLogs_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id);


--
-- Name: EmailLogs EmailLogs_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."EmailTemplates"(id);


--
-- Name: EmailLogs EmailLogs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailLogs"
    ADD CONSTRAINT "EmailLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id);


--
-- Name: EmailTemplates EmailTemplates_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplates"
    ADD CONSTRAINT "EmailTemplates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."Users"(id);


--
-- Name: Invoices Invoices_cancelledBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_cancelledBy_fkey" FOREIGN KEY ("cancelledBy") REFERENCES public."Users"(id);


--
-- Name: Invoices Invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON DELETE RESTRICT;


--
-- Name: Invoices Invoices_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invoices"
    ADD CONSTRAINT "Invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON DELETE RESTRICT;


--
-- Name: Orders Orders_shippingMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES public."ShippingMethods"(id) ON DELETE SET NULL;


--
-- Name: Orders Orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Orders"
    ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProductBarcodes ProductBarcodes_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductBarcodes"
    ADD CONSTRAINT "ProductBarcodes_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;


--
-- Name: ProductBatches ProductBatches_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProductBatches"
    ADD CONSTRAINT "ProductBatches_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;


--
-- Name: Products Products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Categories"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Products Products_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_supplier_id_fkey" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;


--
-- Name: RefreshTokens RefreshTokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RefreshTokens"
    ADD CONSTRAINT "RefreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermissions RolePermissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permissions"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermissions RolePermissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "RolePermissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Roles"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockAlerts StockAlerts_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockAlerts"
    ADD CONSTRAINT "StockAlerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;


--
-- Name: StockAlerts StockAlerts_resolvedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockAlerts"
    ADD CONSTRAINT "StockAlerts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: StockLocations StockLocations_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLocations"
    ADD CONSTRAINT "StockLocations_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;


--
-- Name: StockMovements StockMovements_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;


--
-- Name: StockMovements StockMovements_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockMovements"
    ADD CONSTRAINT "StockMovements_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- Name: StockReservations StockReservations_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockReservations"
    ADD CONSTRAINT "StockReservations_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;


--
-- Name: StockReservations StockReservations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockReservations"
    ADD CONSTRAINT "StockReservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Users Users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Roles"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Wishlists Wishlists_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wishlists"
    ADD CONSTRAINT "Wishlists_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Wishlists Wishlists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Wishlists"
    ADD CONSTRAINT "Wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipment_trackings shipment_trackings_shipmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_trackings
    ADD CONSTRAINT "shipment_trackings_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES public.shipments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shipments shipments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Orders"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict hRTPIzqcFBlfemFJ9FrqtSAnB6cDPevWNhQ2jc6MHEEgdL9gaEshFCzgPxuxAE0

