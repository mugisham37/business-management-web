# Contextual Error Messages: Before vs After

## The Problem We Solved

Users don't know WHY an error occurred or WHAT to do next. Generic error messages leave them confused and frustrated.

## Solution: Context-Aware, Actionable Feedback

We now extract the specific field and value that caused the error, then provide:
1. **Clear explanation** of what went wrong
2. **Specific suggestions** with actual examples
3. **Why it matters** - context about the rule
4. **Next steps** - clear actions to take

---

## Example 1: Duplicate Organization Name

### Your Specific Case

**User Input:**
```
Organization Name: "Acme Corp"
```

**What Happens:**
Database already has an organization named "Acme Corp"

### Before (Generic)
```
┌─────────────────────────────────────────────────┐
│ 🔴  Duplicate Entry                        ✕   │
│                                                 │
│ This value already exists in the system.        │
│                                                 │
│ Suggestions:                                    │
│ • Try using a different value                   │
│ • Check if the record already exists            │
└─────────────────────────────────────────────────┘
```

**Problems:**
- ❌ User doesn't know WHICH value is duplicate
- ❌ No specific suggestions
- ❌ Doesn't explain why this matters
- ❌ User might think it's their fault

### After (Context-Aware) ✅
```
┌─────────────────────────────────────────────────┐
│ 🔴  Organization Name Already Taken        ✕   │
│                                                 │
│ The organization name "Acme Corp" is already    │
│ registered. Organization names must be unique   │
│ to prevent confusion.                           │
│                                                 │
│ What you can do:                                │
│ • Try "Acme Corp 2" or "Acme Corp Inc"          │
│ • Add your location: "Acme Corp - New York"     │
│ • Use a more specific name: "Acme Corp          │
│   Solutions"                                    │
│ • Contact support if you believe this is your   │
│   organization                                  │
│                                                 │
│ ▼ Technical Details                             │
└─────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Shows the EXACT name that's duplicate
- ✅ Provides SPECIFIC alternatives using their input
- ✅ Explains WHY names must be unique
- ✅ Offers support option if it's actually their org
- ✅ User knows exactly what to do next

---

## Example 2: Duplicate Email

**User Input:**
```
Email: "john@example.com"
```

### Before (Generic)
```
┌─────────────────────────────────────────────────┐
│ 🔴  Duplicate Entry                        ✕   │
│                                                 │
│ This value already exists in the system.        │
│                                                 │
│ Suggestions:                                    │
│ • Try using a different value                   │
└─────────────────────────────────────────────────┘
```

### After (Context-Aware) ✅
```
┌─────────────────────────────────────────────────┐
│ 🔴  Email Already Registered               ✕   │
│                                                 │
│ An account with the email "john@example.com"    │
│ already exists. Each email can only be used     │
│ once.                                           │
│                                                 │
│ What you can do:                                │
│ • Try logging in instead - you may already      │
│   have an account                               │
│ • Use a different email address                 │
│ • Click "Forgot Password" if you can't          │
│   remember your password                        │
│ • Contact support if you need help accessing    │
│   your account                                  │
│                                                 │
│ ▼ Technical Details                             │
└─────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Shows the exact email
- ✅ Suggests logging in (they might have forgotten)
- ✅ Provides password recovery option
- ✅ Explains the one-email-per-account rule

---

## Example 3: Duplicate Username

**User Input:**
```
Username: "johndoe"
```

### Before (Generic)
```
┌─────────────────────────────────────────────────┐
│ 🔴  Duplicate Entry                        ✕   │
│                                                 │
│ This value already exists in the system.        │
└─────────────────────────────────────────────────┘
```

### After (Context-Aware) ✅
```
┌─────────────────────────────────────────────────┐
│ 🔴  Username Already Taken                 ✕   │
│                                                 │
│ The username "johndoe" is already taken.        │
│ Please choose a different username.             │
│                                                 │
│ What you can do:                                │
│ • Try "johndoe123" or "johndoe_official"        │
│ • Add numbers or underscores: "johndoe_2024"    │
│ • Choose a more unique username                 │
│                                                 │
│ ▼ Technical Details                             │
└─────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Shows the exact username
- ✅ Provides SPECIFIC alternatives using their input
- ✅ Suggests patterns (numbers, underscores)

---

## Example 4: Duplicate Phone Number

**User Input:**
```
Phone: "+1234567890"
```

### Before (Generic)
```
┌─────────────────────────────────────────────────┐
│ 🔴  Duplicate Entry                        ✕   │
│                                                 │
│ This value already exists in the system.        │
└─────────────────────────────────────────────────┘
```

### After (Context-Aware) ✅
```
┌─────────────────────────────────────────────────┐
│ 🔴  Phone Number Already Registered        ✕   │
│                                                 │
│ This phone number is already registered to      │
│ another account.                                │
│                                                 │
│ What you can do:                                │
│ • Verify you entered the correct phone number   │
│ • Try logging in if you already have an         │
│   account                                       │
│ • Contact support if you need to update your    │
│   phone number                                  │
│                                                 │
│ ▼ Technical Details                             │
└─────────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Suggests verifying the number (typo?)
- ✅ Suggests logging in (might have account)
- ✅ Provides support option for updates

---

## How It Works

### 1. Extract Field Information

```typescript
// From Prisma error message
"Unique constraint failed on the fields: (`name`)"
    ↓
fieldName = "name"

// From operation variables
{ organizationName: "Acme Corp" }
    ↓
fieldValue = "Acme Corp"
```

### 2. Generate Context-Aware Content

```typescript
generateContextualTitle("name", "RegisterOwner")
    ↓
"Organization Name Already Taken"

generateContextualDescription("name", "Acme Corp", "RegisterOwner")
    ↓
"The organization name 'Acme Corp' is already registered. 
 Organization names must be unique to prevent confusion."

generateContextualSuggestions("name", "Acme Corp", "RegisterOwner")
    ↓
[
  "Try 'Acme Corp 2' or 'Acme Corp Inc'",
  "Add your location: 'Acme Corp - New York'",
  "Use a more specific name: 'Acme Corp Solutions'",
  "Contact support if you believe this is your organization"
]
```

### 3. Display to User

The enhanced toast shows:
- **Title**: Field-specific (e.g., "Organization Name Already Taken")
- **Description**: Includes the actual value and explains why
- **Suggestions**: Specific, actionable alternatives using their input
- **Support**: Option to contact support if needed

---

## Comparison Table

| Aspect | Before | After |
|--------|--------|-------|
| **Title** | Generic "Duplicate Entry" | Specific "Organization Name Already Taken" |
| **Description** | "This value already exists" | "The organization name 'Acme Corp' is already registered" |
| **Suggestions** | Generic "Try different value" | Specific "Try 'Acme Corp 2' or 'Acme Corp Inc'" |
| **Context** | None | "Organization names must be unique to prevent confusion" |
| **User Action** | Unclear | Crystal clear |
| **User Blame** | Feels like user's fault | Explains it's a system constraint |

---

## Additional Features

### 1. Field Value Extraction

The system automatically extracts the field value from:
- Operation variables (e.g., `organizationName`)
- Common variations (e.g., `name`, `organizationName`, `organization_name`)
- Nested objects

### 2. Operation Context

Different suggestions based on operation:
- **Registration**: Suggests alternatives, explains uniqueness
- **Update**: Suggests checking existing records
- **Login**: Suggests password recovery

### 3. Smart Suggestions

Suggestions are generated based on:
- Field type (name, email, username, phone)
- Field value (actual user input)
- Operation type (register, update, etc.)
- Common patterns (numbers, locations, industries)

### 4. Why It Matters

Each message explains:
- **What** went wrong (specific field and value)
- **Why** it's a problem (system constraint)
- **How** to fix it (specific alternatives)
- **Who** to contact (support option)

---

## User Experience Impact

### Before
```
User: "Why did it fail? What do I do?"
User: *Tries random things*
User: *Gets frustrated*
User: *Abandons registration*
```

### After
```
User: "Oh, that name is taken. Let me try 'Acme Corp 2'"
User: *Follows suggestion*
User: *Successfully registers*
User: *Happy customer*
```

---

## Developer Experience

### Easy to Extend

Add new field types:

```typescript
// In generateContextualSuggestions()
if (fieldName === 'customField') {
  if (fieldValue) {
    suggestions.push(`Try "${fieldValue}_v2"`);
  }
  suggestions.push('Use a more specific value');
  return suggestions;
}
```

### Automatic

No code changes needed in resolvers or services. The system automatically:
1. Detects the error type
2. Extracts field and value
3. Generates contextual feedback
4. Displays to user

---

## Summary

**Key Improvements:**
1. ✅ Shows EXACT value that caused the error
2. ✅ Provides SPECIFIC alternatives using user's input
3. ✅ Explains WHY the constraint exists
4. ✅ Offers CLEAR next steps
5. ✅ Includes support option
6. ✅ Removes user blame
7. ✅ Increases success rate

**Result:**
Users understand what went wrong and know exactly what to do next, leading to:
- Higher registration completion rates
- Lower support tickets
- Better user satisfaction
- Faster problem resolution
