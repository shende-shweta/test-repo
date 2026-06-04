# Jira Spec — Login Page - Authentication UI & Validation

## Metadata

| Field | Value |
|-------|-------|
| Project | KAN |
| Issue Type | Story |
| Priority | 6 - Undefined |
| Module | auth |
| Entity | login-form |
| Feature Type | ui, validation |
| Source References | Figma Make AI chat thread (ai_chat.json); Figma Analysis Agent output |

---

## 1. User Story

As an application user,
I want to see a login form with a username field, password field, and a login button,
So that I can authenticate and access the application.

---

## 2. Background

- The login screen is a full-viewport centered card layout built in React with Tailwind CSS.
- No backend authentication is currently wired; form submission logs credentials to the console as a stub.
- The project uses the design tokens defined in `src/styles/theme.css` (light/dark mode variables).
- The form is rendered inside `src/app/App.tsx`.
- `react-router` is installed but no navigation is implemented post-login.

---

## 3. Scope

**In Scope:**
- Centered card login UI (username input, password input, submit button)
- HTML5 native `required` validation on both fields
- Theme-token-based styling (bg-primary, bg-input-background, border-border, focus:ring-ring)
- Form submission handler stub (console.log placeholder ready for auth logic)

**Out of Scope:**
- Backend authentication / API integration
- Custom error state UI (error banners, inline validation messages)
- Post-login routing / navigation
- "Remember me", "Forgot password", or registration flows

---

## 4. Acceptance Criteria

**AC-A01 — Render Login Form**
- Given the application loads
- When the root route is visited
- Then a centered card with a "Login" heading, username field, password field, and Login button is displayed

**AC-A02 — Required Field Enforcement**
- Given the login form is displayed
- When the user submits the form with one or both fields empty
- Then browser-native HTML5 validation blocks submission and highlights the empty field(s)

**AC-A03 — Submit with Valid Input**
- Given both username and password fields contain non-empty values
- When the user clicks the Login button
- Then `handleSubmit` is called, default browser form submission is prevented, and `{username, password}` is logged to the console

**AC-C01 — Theme Token Application**
- Given the form renders
- When inspecting field and button styles
- Then username and password inputs use `bg-input-background` and `border-border`; the Login button uses `bg-primary` and `text-primary-foreground`

---

## 5. Technical Notes

- **Component file:** `src/app/App.tsx`
- **Form state:** React `useState` hooks (`username`, `password`), both initialised to `''`
- **Submit handler:** `handleSubmit(e: React.FormEvent)` — calls `e.preventDefault()`, then `console.log`
- **Inputs:** `<input type="text" id="username" required>` and `<input type="password" id="password" required>`
- **Button:** `<button type="submit">` — full-width, uses `bg-primary / text-primary-foreground`, `hover:opacity-90`
- **Design tokens (light mode):**
  - `--input-background`: `#f3f3f5`
  - `--primary`: `#030213`
  - `--primary-foreground`: `oklch(1 0 0)`
  - `--border`: `rgba(0,0,0,0.1)`
  - `--ring`: `oklch(0.708 0 0)`
- **Dependencies in use:** React 18, Tailwind CSS 4, `src/styles/theme.css`
- **Not in use (available):** `react-hook-form`, `react-router`

---

## 6. Dependencies

| Dependency | Module / Package | Type | Notes |
|------------|------------------|------|-------|
| React 18 | `react` / `react-dom` | Required | Component and state management |
| Tailwind CSS 4 | `tailwindcss` | Required | Utility class styling |
| Theme tokens | `src/styles/theme.css` | Required | Design token variables used for all colours/radii |
| react-router | `react-router` | Optional | Installed; required if post-login navigation is added |
| react-hook-form | `react-hook-form` | Optional | Installed; required if custom validation is added |

---

## 7. Attachments

| Document | File |
|----------|------|
| Design Document | KAN-XXXX_design_document.png |
| Task List | KAN-XXXX_task_list.png |

*(Ticket key to be substituted after creation.)*

---

## 8. Clarifications

### AC-A03 — Authentication Stub
The current implementation logs credentials to the console only. The assistant explicitly noted "Add your login logic here" in the code comment. Real authentication (API call, token storage, error handling) is out of scope for this ticket and should be tracked separately.

### AC-C01 — Dark Mode
Theme tokens include a `.dark` variant in `theme.css`. The login form does not explicitly toggle dark mode; it inherits the CSS variable values from the active theme class on the root element.
