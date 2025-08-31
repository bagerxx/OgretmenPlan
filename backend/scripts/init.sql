-- PostgreSQL initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone to Turkey
SET timezone = 'Europe/Istanbul';

-- Create additional indexes for performance
-- These will be created after Prisma migration
