# Security Policy for Bayo Basics

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please **DO NOT** create a public issue. Instead, send an email to the repository owner with details about the vulnerability.

## Security Measures Implemented

This project includes several security measures to protect against common web vulnerabilities:

### 1. Authentication & Authorization
- JWT-based authentication with 24-hour token expiration
- Role-based access control (user/admin)
- Password hashing with bcrypt (salt rounds: 10)
- Admin endpoints protected with `requireAdmin` middleware

### 2. Rate Limiting
- General rate limit: 100 requests per 15 minutes per IP
- Authentication rate limit: 5 attempts per 15 minutes
- API rate limit (chat): 30 requests per minute
- Applied to all sensitive endpoints

### 3. CORS Protection
- Strict origin checking
- Only configured origins allowed
- Credentials only sent to allowed origins
- Environment-based origin configuration

### 4. Security Headers (Helmet.js)
- Content Security Policy (CSP) configured
- HSTS (HTTP Strict Transport Security) enabled
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection enabled

### 5. Input Validation & Sanitization
- Chatbot input sanitization to prevent prompt injection
- SQL injection pattern detection
- File upload type validation (JPEG, PNG, GIF, WebP only)
- File upload size limit (5MB)
- Random cryptographically secure filenames

### 6. SSL/TLS
- Database connections use SSL in production
- Certificate verification enabled in production
- Environment-based SSL configuration

### 7. File Upload Security
- Admin-only file upload endpoint
- File type validation (MIME type + extension)
- File size limits
- Secure random filename generation
- No execution permissions on upload directory

### 8. Error Handling
- Generic error messages in production
- Detailed logs only in development
- No stack traces exposed in production

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DB_SSL_CA=-----BEGIN CERTIFICATE-----... (for production)

# Authentication
JWT_SECRET=your_very_long_random_secret_min_32_chars

# External APIs
OPENROUTER_API_KEY=your_openrouter_api_key

# Application
FRONTEND_URL=https://your-production-domain.com
NODE_ENV=production
PORT=3001
```

## Security Checklist for Production

- [ ] Change all default passwords
- [ ] Generate new JWT_SECRET (min 32 random characters)
- [ ] Configure SSL/TLS for database
- [ ] Set up proper CORS origins
- [ ] Enable Helmet.js security headers
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular dependency updates (`npm audit`)
- [ ] Remove any hardcoded credentials
- [ ] Enable 2FA on GitHub account
- [ ] Review and revoke any exposed API keys
- [ ] Configure proper file upload permissions
- [ ] Set up automated security scanning

## Known Limitations & Future Improvements

1. **Magic Number Validation**: File uploads currently check MIME type and extension. Magic number validation would provide additional security.

2. **Content Scanning**: Files are not scanned for malicious content before storage.

3. **Request Signing**: API requests are not cryptographically signed.

4. **IP Whitelisting**: No IP whitelisting for admin endpoints (rate limiting is in place).

5. **Session Management**: Using stateless JWT; consider implementing refresh tokens.

6. **Audit Logging**: Basic logging in place; consider structured audit logs for security events.

## Dependency Security

Run regular security audits:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Update dependencies
npm update
```

## Contact

For security concerns, contact the repository maintainer directly.

---

Last updated: 2024
