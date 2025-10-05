# Hospital Management API Documentation (HMS-API)

This document serves as the primary reference for all RESTful API endpoints, data models, and authorization rules for the Hospital Management System backend, built using Node.js, Express, and MongoDB.

---

## Authentication and Authorization

All requests to protected routes must include a JSON Web Token (JWT). This token should be provided in the `Authorization` header using the `Bearer` scheme.

**Example:** `Authorization: Bearer <JWT_TOKEN_HERE>`

---

## User Roles and Access Levels

Authorization is checked based on the `role` field associated with the user.

| Role    | Access Level                       | Responsibilities                                                      |
|---------|------------------------------------|-----------------------------------------------------------------------|
| Admin   | Full Read/Write                    | System configuration, staff management, full access to all records.   |
| Doctor  | Read/Write Patient/Appointment/Inventory | Managing patient records, creating appointments, viewing inventory.     |
| Nurse   | Read/Write Patient/Appointment/Inventory | Patient intake, managing appointments, inventory stock management.    |
| Patient | Read Own Data Only                 | View own appointments, profile, and basic medical history.            |

---

## API Endpoints

### Auth Endpoints (`/api/v1/auth`)

| Method | Endpoint                    | Description                                                   | Access  |
|--------|-----------------------------|---------------------------------------------------------------|---------|
| `POST` | `/register`                 | Register a new user (Staff or Patient).                       | Public  |
| `POST` | `/login`                    | Authenticate and return JWT and user details.                 | Public  |
| `POST` | `/forgotpassword`           | Initiate password reset by sending an email with a unique token. | Public  |
| `PUT`  | `/resetpassword/:resettoken`| Reset password using the token received in the email.         | Public  |

### Patient Management (`/api/v1/patients`)

Endpoints for managing patient demographic and basic medical history data.

| Method   | Endpoint | Description                            | Roles Required      |
|----------|----------|----------------------------------------|---------------------|
| `GET`    | `/`      | Get a list of all patients.            | Admin, Doctor, Nurse|
| `POST`   | `/`      | Create a new patient record.           | Admin, Nurse        |
| `GET`    | `/:id`   | Get a single patient record by ID.     | Admin, Doctor, Nurse|
| `PUT`    | `/:id`   | Update a patient's demographic details.| Admin, Nurse        |
| `DELETE` | `/:id`   | Permanently delete a patient record.   | Admin               |

### Appointment Scheduling (`/api/v1/appointments`)

Endpoints for managing scheduling, booking, and tracking of patient appointments.

| Method   | Endpoint | Description                                             | Roles Required      |
|----------|----------|---------------------------------------------------------|---------------------|
| `GET`    | `/`      | Get all appointments (can be filtered by patient/doctor). | Admin, Doctor, Nurse|
| `POST`   | `/`      | Book a new appointment. Checks doctor availability.     | Admin, Nurse        |
| `GET`    | `/:id`   | Get details for a single appointment.                   | Admin, Doctor, Nurse|
| `PUT`    | `/:id`   | Update appointment details (e.g., reschedule, change status). | Admin, Nurse        |
| `DELETE` | `/:id`   | Cancel and delete an appointment.                       | Admin, Nurse        |

### Inventory Management (`/api/v1/inventory`)

Endpoints for managing medical supplies, stock levels, and critical alerts.

| Method   | Endpoint     | Description                                                         | Roles Required      |
|----------|--------------|---------------------------------------------------------------------|---------------------|
| `GET`    | `/`          | Get all inventory items.                                            | Admin, Doctor, Nurse|
| `POST`   | `/`          | Add a new supply item to the inventory.                             | Admin, Nurse        |
| `GET`    | `/:id`       | Get details for a single inventory item.                            | Admin, Doctor, Nurse|
| `PUT`    | `/:id`       | Update item details, including stock quantity.                      | Admin, Nurse        |
| `DELETE` | `/:id`       | Remove an item from the inventory.                                  | Admin               |
| `POST`   | `/stock/:id` | Atomically decrease stock after usage. Requires `{ "quantity": number }` in the request body. | Doctor, Nurse       |