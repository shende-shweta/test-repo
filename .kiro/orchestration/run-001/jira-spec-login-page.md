# Jira Spec — Login Page (React.js)

## Metadata

| Field | Value |
|-------|-------|
| Project | MAD |
| Issue Type | Story |
| Priority | 6 - Undefined |
| Module | Authentication |
| Entity | User Session / JWT |
| Feature Type | crud, validation, integration |
| Source References | jiradoc-s.md (user-supplied input) |

---

## 1. User Story

As an application user,
I want a login page with email and password authentication,
So that I can securely authenticate and access protected areas of the application.

---

## 2. Background

- The application requires a dedicated login route to authenticate users via a REST API.
- On successful authentication, a JWT token is returned and must be persisted in `localStorage`.
- The login form must enforce client-side validation before any API call is made.
- API endpoint: `POST ${REACT_APP_API_BASE_URL}/auth/login`
  - 200 OK → `{ token }` — store JWT, redirect to `/dashboard`
  - 401 → `{ message }` — show "Invalid email or password"
  - 5xx → show generic error message
- Stack: React 18, TypeScript, Tailwind CSS; libraries: `axios`, `react-router-dom`.

---

## 3. Scope

**In Scope:**
- Login form UI with email and password fields (Tailwind CSS, mobile-responsive)
- Client-side validation: empty-field check, email format check
- Login button disabled state when fields are empty; loading spinner during API call
- `POST /auth/login` via axios; JWT stored in `localStorage` on success
- Error display: 401 → "Invalid email or password"; 5xx → generic error
- Redirect to `/dashboard` on success via `useNavigate`
- Accessible labels and keyboard navigation

**Out of Scope:**
- Server-side session management or refresh-token logic
- Registration, forgot-password, or SSO flows
- Backend API implementation

---

## 4. Acceptance Criteria

### Section A — Form CRUD / Interaction

**AC-A01 — Render Login Form**
- Given the user navigates to the login route
- When the page loads
- Then email field, password field, and a login button are rendered with accessible labels

**AC-A02 — Mandatory Field Enforcement**
- Given one or both fields are empty
- When the user attempts to submit
- Then the login button remains disabled and no API call is made

**AC-A03 — Email Format Validation**
- Given the email field contains an invalid format
- When the user attempts to submit
- Then a validation error is shown and the API call is not triggered

**AC-A04 — Loading State**
- Given both fields are valid
- When the login button is clicked
- Then the button shows a spinner and is disabled for the duration of the API call

### Section C — Integration / Validation / Defaults

**AC-C01 — Successful Login**
- Given valid credentials are submitted
- When the API returns 200 OK with `{ token }`
- Then the JWT is stored in `localStorage` and the user is redirected to `/dashboard`

**AC-C02 — Invalid Credentials (401)**
- Given credentials are submitted
- When the API returns 401
- Then "Invalid email or password" is displayed and no redirect occurs

**AC-C03 — Server Error (5xx)**
- Given credentials are submitted
- When the API returns a 5xx response
- Then a generic error message is displayed and no redirect occurs

**AC-C04 — Mobile Responsive Layout**
- Given the user accesses the login page on a mobile viewport
- When the page renders
- Then the layout adapts correctly using Tailwind responsive utilities

**AC-C05 — Keyboard Navigation**
- Given the login form is rendered
- When the user navigates using the keyboard (Tab, Enter)
- Then all interactive elements are reachable and operable

---

## 5. Technical Notes

- **Component state:** `email`, `password`, `isLoading`, `error` via `useState`
- **API call:** `axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, { email, password })`
- **JWT storage:** `localStorage.setItem('token', response.data.token)`
- **Routing:** `useNavigate()` from `react-router-dom` for redirect to `/dashboard`
- **Validation:** inline before axios call; disable submit button when `!email || !password`
- **Error handling:** catch block checks `error.response?.status`; 401 → specific message, else generic
- **Accessibility:** `<label htmlFor>` paired with inputs; `aria-busy` on button during loading

---

## 6. Dependencies

| Dependency | Module / Package | Type | Notes |
|------------|-----------------|------|-------|
| axios | HTTP client | Required | API calls to `/auth/login` |
| react-router-dom | Routing | Required | `useNavigate` for redirect |
| Tailwind CSS | Styling | Required | Responsive layout utilities |
| REACT_APP_API_BASE_URL | Env config | Required | Base URL for API endpoint |

---

## 7. Attachments

| Document | File |
|----------|------|
| Design Document | MAD-XXXX_design_document.png |
| Task List | MAD-XXXX_task_list.png |

*(Attachment files to be generated and uploaded after ticket creation.)*

---

## 8. Clarifications

### AC-A02 / AC-A03 — Client-Side vs Server-Side Validation
Client-side validation (empty check, email format) is a UX guard only. Server-side validation on the API is out of scope for this ticket. The disabled-button state is the primary enforcement mechanism before the API call.

### AC-C01 — JWT Storage Choice
`localStorage` is specified in the input. If the team later decides to use `httpOnly` cookies for security, that would be a separate ticket.
