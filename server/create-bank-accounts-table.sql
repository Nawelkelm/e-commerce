CREATE TABLE IF NOT EXISTS "BankAccounts" (
    id UUID PRIMARY KEY,
    "bankName" VARCHAR(255) NOT NULL,
    "accountType" VARCHAR(50) NOT NULL,
    "accountNumber" VARCHAR(255) NOT NULL,
    cbu VARCHAR(22) NOT NULL,
    alias VARCHAR(255),
    "holderName" VARCHAR(255) NOT NULL,
    "holderDocument" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "isPrimary" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
