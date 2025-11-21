# Account Verification System

This document describes the account verification implementation using a unique 6-digit code that exists in the database.

## Flow Overview

1. **User Registration** → Backend generates unique 6-digit code and sends it to user's email
2. **Automatic Redirect** → User is redirected to `/verify-account`
3. **User enters code** → Only the 6-digit verification code (no email required)
4. **Backend Verification** → Backend searches for the code in the database
5. **Verification Success** → User is redirected to `/login`
6. **Resend Code** (optional) → User can request a new code by providing their email

## Key UX Features

- **No email input for verification**: User only enters the 6-digit code
- **Database-driven verification**: Code is unique and looked up in the database
- **No localStorage or URL params**: Clean, simple flow
- **Auto-focus**: Code input has automatic focus when page loads
- **Extra large input**: Code input uses large text (text-4xl) for maximum visibility
- **Numeric only**: Input automatically filters out non-numeric characters
- **Progressive disclosure**: Email field only appears when user clicks "Reenviar código"

## Files Structure

```
app/(auth)/
├── verify-account/
│   └── page.tsx                          # Verification page
├── components/
│   └── verify-account-form.tsx           # Verification form component
├── hooks/
│   ├── useVerifyAccount.ts               # Verify code hook
│   └── useResendCode.ts                  # Resend code hook
└── actions/
    ├── verifyCodeAction.ts               # Verify code API call
    └── resendVerificationCodeAction.ts   # Resend code API call
```

## API Endpoints

### Verify Code
```typescript
POST /auth-client/verify-code
Body: {
  code: string; // 6-digit numeric code (unique in database)
}
Response: {
  message: string;
}
```

**How it works:**
- The backend receives only the code
- Searches the database for a matching verification code
- If found and not expired, verifies the associated user account
- Returns success or error message

**Error Codes:**
- `400` - Invalid code
- `404` - User not found
- `409` - Account already verified
- `410` - Code expired (24 hours)
- `429` - Too many attempts
- `500` - Server error

### Resend Verification Code
```typescript
POST /auth-client/resend-verification-code
Body: {
  email: string;
}
Response: {
  message: string;
}
```

**Error Codes:**
- `404` - User not found
- `409` - Account already verified
- `429` - Too many resend requests
- `500` - Server error

## Components

### VerifyAccountForm

Located at: `app/(auth)/components/verify-account-form.tsx`

**Props:** None

**Features:**
- **6 separate digit inputs** (primary focus):
  - One input per digit (6 total)
  - Numeric-only validation (filters non-digits)
  - Auto-advance to next input on digit entry
  - Auto-backspace to previous input with Backspace key
  - Paste support: paste 6-digit code and auto-fill all inputs
  - Centered layout with monospace font
  - Large text size (`text-2xl`) and bold font
  - `autoFocus` on first input
  - Each input: `w-12 h-14` (48px × 56px)
- **Verify button** (disabled during submission)
- **Progressive email disclosure**:
  - First click on "Reenviar código" → Shows email input field
  - User enters email → Second click sends the code
- **Resend code button** with:
  - 60-second cooldown timer
  - Disabled states during loading/cooldown
  - Visual feedback (spinning icon when sending)
  - Dynamic text: "Reenviar código" → "Enviar código" (after email shown)
- **Code expiration notice** (24 hours)

**State Management:**
```typescript
const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
const [showEmailInput, setShowEmailInput] = useState(false);
const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

// Handle individual digit input
const handleCodeChange = (index: number, value: string) => {
  const numericValue = value.replace(/\D/g, "");

  if (numericValue.length <= 1) {
    const newCode = [...code];
    newCode[index] = numericValue;
    setCode(newCode);

    // Auto-advance to next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }
};

// Handle backspace navigation
const handleKeyDown = (index: number, e: KeyboardEvent) => {
  if (e.key === "Backspace" && !code[index] && index > 0) {
    inputRefs.current[index - 1]?.focus();
  }
};

// Handle paste
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

  if (pastedData.length === 6) {
    const newCode = pastedData.split("").slice(0, 6);
    setCode(newCode);
    inputRefs.current[5]?.focus();
  }
};

// On submit, join the 6 digits
const onSubmit = () => {
  const fullCode = code.join("");
  if (fullCode.length !== 6) {
    setError("El código debe tener 6 dígitos");
    return;
  }
  verifyAccount(fullCode);
};
```

**Validation:**
```typescript
// Client-side validation on submit
if (code.join("").length !== 6) {
  setError("El código debe tener 6 dígitos");
  return;
}

// Email validation (when shown)
email: {
  required: showEmailInput ? "El email es requerido para reenviar" : false,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}
```

## Hooks

### useVerifyAccount

Located at: `app/(auth)/hooks/useVerifyAccount.ts`

**Returns:**
```typescript
{
  verifyAccount: (code: string) => void;
  isLoading: boolean;
  error: any;
  isSuccess: boolean;
  isError: boolean;
  data: VerifyCodeResponse;
  reset: () => void;
}
```

**Usage:**
```typescript
const { verifyAccount } = useVerifyAccount();

// Only the code is needed
verifyAccount("123456");
```

**Behavior:**
- On success: Shows success toast + redirects to `/login` after 1.5s
- On error: Shows error toast with specific message based on HTTP status code

### useResendCode

Located at: `app/(auth)/hooks/useResendCode.ts`

**Returns:**
```typescript
{
  resendCode: (data: { email: string }) => void;
  isLoading: boolean;
  error: any;
  isSuccess: boolean;
  isError: boolean;
  data: ResendCodeResponse;
  reset: () => void;
}
```

**Behavior:**
- On success: Shows success toast with instructions
- On error: Shows error toast with specific message based on HTTP status code

## Integration with Registration

The registration flow redirects to the verification page:

**File:** `app/(auth)/hooks/useRegister.ts`

```typescript
onSuccess: (data: RegisterResponse) => {
  toast.success("¡Cuenta creada exitosamente!", {
    description: "Te hemos enviado un código de verificación de 6 dígitos a tu email.",
    duration: 5000,
  });

  // Simple redirect (no localStorage, no URL params)
  setTimeout(() => {
    router.push("/verify-account");
  }, 1500);
}
```

**Key Point:** No localStorage or URL params are used. The verification code is unique in the database, so the backend can identify the user by the code alone.

## User Experience Flow

### Successful Registration
1. User fills registration form
2. Backend creates account, generates unique 6-digit code, and sends it via email
3. Success toast appears: "¡Cuenta creada exitosamente! Te hemos enviado un código de verificación..."
4. After 1.5 seconds, redirect to `/verify-account`
5. Page shows large code input field with auto-focus (text-4xl)
6. User enters 6-digit code from email
7. Clicks "Verificar Cuenta"
8. Backend looks up code in database and verifies the associated user
9. Success toast: "¡Cuenta verificada! Tu cuenta ha sido verificada correctamente..."
10. After 1.5 seconds, redirect to `/login`

### Resend Code (Progressive Disclosure)
1. User clicks "Reenviar código" button
2. Email input field appears below
3. User enters their email address
4. Button text changes to "Enviar código"
5. User clicks "Enviar código"
6. Backend sends new code to the provided email
7. Success toast: "Código enviado - Te hemos enviado un nuevo código..."
8. Button shows "Espera Xs para reenviar" countdown
9. After 60 seconds, button becomes available again

### Error Handling

All errors show context-specific toasts:

**Invalid Code (400):**
```
Title: "Código inválido"
Message: "El código ingresado es incorrecto. Por favor verifica e intenta nuevamente."
```

**Expired Code (410):**
```
Title: "Código expirado"
Message: "El código ha expirado. Por favor solicita un nuevo código."
```

**Already Verified (409):**
```
Title: "Ya verificado"
Message: "Esta cuenta ya ha sido verificada. Puedes iniciar sesión."
```

**Too Many Attempts (429):**
```
Title: "Demasiados intentos"
Message: "Has excedido el número de intentos permitidos. Espera unos minutos."
```

## Security Features

1. **Unique Codes:** Each verification code is unique in the database
2. **Code Expiration:** Codes expire after 24 hours
3. **Database Lookup:** Backend verifies code existence and validity before accepting
4. **Rate Limiting:** Backend implements rate limiting for verify and resend endpoints
5. **Attempt Limits:** Maximum number of verification attempts (handled by backend)
6. **Resend Cooldown:** 60-second cooldown prevents abuse
7. **Numeric-Only Input:** Client-side validation ensures only digits are entered
8. **Server-Side Validation:** Backend validates code format, existence, and expiration

## Styling

The verification uses 6 separate inputs with special styling:
```typescript
<div className="flex justify-center gap-2">
  {code.map((digit, index) => (
    <Input
      ref={(el) => (inputRefs.current[index] = el)}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={digit}
      onChange={(e) => handleCodeChange(index, e.target.value)}
      onKeyDown={(e) => handleKeyDown(index, e)}
      onPaste={handlePaste}
      autoFocus={index === 0}
      className="w-12 h-14 text-center text-2xl font-mono font-bold"
    />
  ))}
</div>
```

**Input Styling:**
- **w-12 h-14:** Fixed size (48px × 56px) for each digit box
- **text-center:** Center the digit within the box
- **text-2xl:** Large text (24px) for easy reading
- **font-mono:** Monospace font for consistent width
- **font-bold:** Bold weight for better visibility
- **gap-2:** 8px spacing between inputs
- **inputMode="numeric":** Shows numeric keyboard on mobile devices

**UX Features:**
- First input has `autoFocus`
- Auto-advance on digit entry
- Auto-backspace on Backspace key
- Paste entire code at once (e.g., copy "123456" and paste)

The email input (progressive disclosure):
```typescript
{showEmailInput && (
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input type="email" placeholder="tu@email.com" />
  </div>
)}
```

This creates a modern, app-like interface with individual digit boxes (like banking apps, 2FA apps).

## Testing Checklist

### Code Verification
- [ ] Register new account → receives email with unique 6-digit code
- [ ] Redirect to `/verify-account` (clean URL, no params)
- [ ] Shows 6 separate input boxes for digits
- [ ] First input has auto-focus on page load
- [ ] Each input accepts only 1 digit
- [ ] Cannot enter non-numeric characters in any input
- [ ] Auto-advances to next input after entering digit
- [ ] Backspace moves to previous input when current is empty
- [ ] Can paste 6-digit code and auto-fills all inputs
- [ ] Cannot submit without all 6 digits filled
- [ ] Valid code verifies account and redirects to login
- [ ] Backend correctly identifies user by code alone
- [ ] Invalid code shows error toast
- [ ] Expired code (>24h) shows appropriate error
- [ ] Already verified account shows appropriate message
- [ ] Rate limiting works for verify endpoint

### Resend Code Flow
- [ ] Click "Reenviar código" → Email input appears
- [ ] Button text changes to "Enviar código"
- [ ] Cannot send without valid email
- [ ] Email validation works (format check)
- [ ] Valid email sends new code
- [ ] New code is different from original
- [ ] Resend button has 60-second cooldown
- [ ] Countdown timer displays correctly
- [ ] Rate limiting works for resend endpoint

### UX/UI
- [ ] Form shows 6 clean, separated digit boxes
- [ ] Each box is properly sized (w-12 h-14)
- [ ] Boxes have consistent spacing (gap-2)
- [ ] Mobile shows numeric keyboard (inputMode="numeric")
- [ ] Email field appears smoothly when needed
- [ ] Loading states work (Verificando..., Enviando...)
- [ ] All buttons disable appropriately during operations
- [ ] All inputs disable during verification
- [ ] Toasts show for all success/error cases
- [ ] Mobile responsive design works
- [ ] Visual feedback on focused input

## Data Flow

**No localStorage or URL params used** - The entire flow is stateless from the frontend perspective. The verification code itself carries all necessary information (stored in backend database with user association).
