# 🔒 Security Guide - ToolBox Tamil Admin

Complete security documentation for your ToolBox Tamil admin dashboard.

## 🛡️ Security Overview

Your admin dashboard implements multiple layers of security to protect your website management system.

### Key Security Features

✅ **SHA-256 Password Hashing**
- All passwords are hashed using Web Crypto API
- Salt added to prevent rainbow table attacks
- Passwords never stored in plain text

✅ **No Default Credentials**
- No hardcoded usernames or passwords
- First-time setup wizard required
- Unique credentials for each installation

✅ **Secure Session Management**
- 30-minute session timeout
- Auto-logout on inactivity
- Session token generation
- Real-time activity tracking

✅ **Activity Logging**
- All actions logged with timestamps
- Failed login attempts tracked
- IP address logging (local)
- Audit trail for compliance

✅ **Protection Measures**
- Minimum password length (8 characters)
- Password strength meter
- Session encryption
- HTTPS recommended

---

## 🚀 First-Time Setup

When you first access the admin dashboard, you'll be automatically redirected to the setup wizard.

### Setup Process:

1. **Navigate to Admin**
   ```
   https://strategyasia.github.io/toolbox-tamil/admin/
   ```

2. **Create Admin Account**
   - Choose username (minimum 3 characters)
   - Create strong password (minimum 8 characters)
   - Confirm password
   - Click "Create Admin Account"

3. **Password Requirements:**
   - ✅ At least 8 characters
   - ✅ Mix of uppercase and lowercase
   - ✅ Include numbers
   - ✅ Use special characters
   - ✅ Avoid common patterns

4. **Strength Meter:**
   - 🔴 Weak: < 2 points
   - 🟡 Medium: 2-4 points
   - 🟢 Strong: 5+ points

---

## 🔐 Password Security

### Creating a Strong Password

**Good Examples:**
```
T00lBox@Tamil2024!
MySecure#Admin$Pass
P@ssw0rd!Complex9
```

**Bad Examples:**
```
admin123 (too simple)
password (common word)
12345678 (only numbers)
toolbox (too short)
```

### Password Hashing

Your password is hashed using SHA-256 with a custom salt:

```javascript
// How it works (technical details)
Input: "MyPassword123!"
Salt: "toolbox_tamil_salt_2024"
Combined: "MyPassword123!toolbox_tamil_salt_2024"
SHA-256 Hash: "a8f5f167f44f4964e6c998dee827110c..."
Stored: Only the hash, never plain text
```

**Benefits:**
- 🔒 Password never stored in readable form
- 🛡️ Salt prevents dictionary attacks
- 🔐 Hash cannot be reversed
- ✅ Industry-standard security

---

## 🔑 Managing Your Credentials

### Changing Your Password

**From Admin Dashboard:**

1. Login to admin dashboard
2. Go to **Settings** → **Security** tab
3. Enter current password
4. Enter new password (min 8 characters)
5. Confirm new password
6. Click **"Update Password"**

**Important:**
- ⚠️ Current password required for verification
- ✅ New password must be different
- 📝 Change logged in activity logs
- 🔐 All sessions remain valid

### Password Best Practices

**DO:**
- ✅ Use unique password (don't reuse)
- ✅ Change periodically (every 90 days)
- ✅ Use password manager
- ✅ Keep credentials private
- ✅ Log out when done

**DON'T:**
- ❌ Share credentials
- ❌ Write password down
- ❌ Use common words
- ❌ Use personal information
- ❌ Save in browser (public computers)

---

## 🆘 Emergency Access Recovery

If you forget your password, you'll need to reset the admin system.

### Reset Procedure

**⚠️ WARNING:** This will delete all admin data!

1. **Open Browser Console**
   - Press F12 or Right-click → Inspect
   - Go to "Console" tab

2. **Run Reset Command**
   ```javascript
   AdminAuth.resetAdmin('RESET_TOOLBOX_TAMIL_ADMIN_2024')
   ```

3. **Verify Reset**
   - You should see: `{success: true}`
   - All admin data is now cleared

4. **Re-setup**
   - Navigate to admin URL
   - You'll be redirected to setup wizard
   - Create new credentials

**Reset Confirmation Code:**
```
RESET_TOOLBOX_TAMIL_ADMIN_2024
```

**Important Notes:**
- ⚠️ This action cannot be undone
- 📝 All settings will be lost
- 🔄 Activity logs will be cleared
- ✅ Ad and site settings preserved (separate storage)

---

## 🕐 Session Management

### Session Duration

**Default Timeout:** 30 minutes

**How It Works:**
- Session starts on successful login
- Activity tracked on mouse/keyboard events
- Timer resets on any activity
- Auto-logout after 30 minutes of inactivity

### Staying Logged In

**Remember Me Option:**
- Checkbox on login page
- Extends session for 30 days
- Stored securely in localStorage
- Still requires activity every 30 minutes

### Manual Logout

**Always logout when:**
- ✅ Finished managing website
- ✅ Using public computer
- ✅ Leaving computer unattended
- ✅ Switching users

**How to Logout:**
- Click **"Logout"** button in sidebar
- Or navigate away and wait for timeout

---

## 📝 Activity Logs

### What Gets Logged

**Login Events:**
- Successful logins
- Failed login attempts
- Username used
- Timestamp

**Settings Changes:**
- Password updates
- Site settings modified
- Ad configuration changes

**Admin Actions:**
- Account creation (setup)
- Account reset attempts
- Password changes
- Logout events

### Log Information

Each log entry contains:
```json
{
  "timestamp": "2024-01-21T15:30:45.123Z",
  "type": "login",
  "description": "User logged in successfully",
  "ip": "Local",
  "status": "success"
}
```

### Viewing Logs

1. Login to admin dashboard
2. Go to **Activity Logs** section
3. Filter by:
   - Event type
   - Date range
   - Status (success/failed)
4. Export as CSV if needed

### Log Retention

- **Stored:** Last 100 events
- **Location:** Browser localStorage
- **Older logs:** Auto-deleted
- **Export:** Recommended for compliance

---

## 🌐 Production Security

### For Live/Production Sites

**Essential Steps:**

1. **Use HTTPS**
   ```
   ✅ https://yourdomain.com/admin/
   ❌ http://yourdomain.com/admin/
   ```

2. **Add .htaccess Protection** (if using Apache)
   ```apache
   # Restrict access to admin folder
   <Files "admin/*">
     Order Deny,Allow
     Deny from all
     Allow from YOUR_IP_ADDRESS
   </Files>
   ```

3. **Implement Rate Limiting**
   - Limit login attempts (e.g., 5 tries per 15 minutes)
   - Block IPs after failed attempts
   - Use Cloudflare or similar service

4. **Enable Two-Factor Authentication**
   - Consider adding 2FA layer
   - Use authenticator apps
   - SMS verification backup

5. **Regular Backups**
   - Export settings weekly
   - Backup localStorage data
   - Keep offline copies

6. **Monitor Access**
   - Review activity logs regularly
   - Check for suspicious patterns
   - Investigate failed logins

### Server-Side Considerations

**For Production Deployment:**

```
Current: Client-side only (localStorage)
Production: Move to secure backend

Benefits:
- Database storage
- Server-side validation
- API authentication
- Token-based auth (JWT)
- Rate limiting
- IP whitelisting
- SSL/TLS encryption
```

---

## 🚨 Security Incidents

### If You Suspect Unauthorized Access

**Immediate Actions:**

1. **Change Password**
   - Settings → Security → Update Password
   - Use completely new password

2. **Review Activity Logs**
   - Check for suspicious logins
   - Note unknown timestamps
   - Look for settings changes

3. **Check Settings**
   - Verify site settings unchanged
   - Check ad configuration
   - Review Google Analytics setup

4. **Consider Reset**
   - If severely compromised
   - Use emergency reset
   - Start fresh with new credentials

### Prevention Tips

**Security Checklist:**

- [ ] Strong, unique password
- [ ] HTTPS enabled
- [ ] Regular password changes
- [ ] Activity log monitoring
- [ ] Logout after use
- [ ] No shared credentials
- [ ] Private computer only
- [ ] Browser cache clearing
- [ ] Antivirus up to date

---

## 🔍 Security Audit

### Monthly Security Review

**Checklist:**

1. **Password Health**
   - [ ] Changed in last 90 days
   - [ ] Strong (8+ characters)
   - [ ] Not reused elsewhere
   - [ ] Not written down

2. **Activity Logs**
   - [ ] No unauthorized access
   - [ ] No suspicious patterns
   - [ ] Failed logins reviewed
   - [ ] Logs exported/backed up

3. **Settings**
   - [ ] Site info correct
   - [ ] Ad config valid
   - [ ] Analytics working
   - [ ] No unauthorized changes

4. **Access Control**
   - [ ] Only you have access
   - [ ] Credentials private
   - [ ] Sessions properly closed
   - [ ] Remember me disabled (public)

---

## 📞 Security Support

### Need Help?

**Documentation:**
- ADMIN.md - Admin dashboard guide
- README.md - Project overview
- This file - Security guide

**Emergency Contact:**
- Check GitHub issues
- Review activity logs
- Use reset if needed

**Remember:**
- 🔐 Security is your responsibility
- 🛡️ Strong passwords are essential
- 📝 Monitor activity regularly
- ✅ Follow best practices

---

**🔒 Stay Secure! வாழ்க தமிழ்! 🇮🇳**

*Your security protects your website and users.*
