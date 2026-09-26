# Madhubani Palette by JJ

## Description
Madhubani Palette by JJ is a full-stack art and handicrafts storefront for browsing Madhubani products, placing cash-on-delivery orders, and managing products and orders through an admin interface.

## Features
- Product catalogue with search, categories, stock, and featured products
- Product details, cart, and checkout/order submission
- Admin registration and JWT-based login
- Admin product creation, image upload, editing, and order management
- MongoDB-backed product, order, admin, and recommendation data
- Optional Cloudinary image storage

## Tech Stack
- Frontend: React 19, React Router, Vite
- Backend: Node.js, Express 5
- Database: MongoDB with Mongoose
- Authentication: bcryptjs and JSON Web Tokens
- File uploads: Multer and Cloudinary
- Other tools: ESLint, Nodemon

## Project Structure
- `frontend/`: Vite React application, storefront, admin UI, styles, and assets
- `backend/`: Express API server, routes, models, middleware, configuration, and seed scripts
- `backend/config/`: MongoDB and Cloudinary configuration
- `backend/routes/`: product, order, admin, and recommendation endpoints
- `backend/models/`: Mongoose schemas
- `backend/seed/products.js`: primary product seed script
- `backend/models/seed/product.js`: additional product seed data script

## Requirements
- Node.js 18 or newer
- npm
- MongoDB database, local or hosted
- Cloudinary account for admin image uploads

## Installation
Install each package separately:

```bash
cd backend
npm install
cd ../frontend
npm install
```

## Environment Variables
Copy the safe templates and fill in your own local values. Never commit `.env` files.

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Backend variables:

- `PORT`: API port, default `5000`
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: private signing key for admin tokens
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary credentials for image uploads

Frontend variables:

- `VITE_API_URL`: backend API base URL, default `https://madhubani-pallete-backend.onrender.com`

## Run the Project
From Windows Explorer, double-click `launch.bat` to open the backend and frontend in separate development windows.

You can also run the launcher from PowerShell:

```powershell
.\launch.ps1
```

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The Vite terminal will display the local frontend URL. The backend health check is available at `http://localhost:5000/`.

## Build
Create a production frontend build with:

```bash
cd frontend
npm run build
```

Preview the production build with `npm run preview` from `frontend/`.

## API / Backend
The API is served from `http://localhost:5000` by default:

- `GET /`: health check
- `GET /api/products`: list products
- `GET /api/products/:id`: get one product and increment views
- `POST /api/products`: create a product, optionally with an image upload
- `PUT /api/products/:id`: update a product
- `DELETE /api/products/:id`: delete a product
- `POST /api/orders`: create an order
- `GET /api/orders`: list orders
- `GET /api/orders/:id`: get one order
- `PUT /api/orders/:id/status`: update order status
- `POST /api/admin/register`: register an admin
- `POST /api/admin/login`: receive a JWT admin token
- `GET /api/recommendations/:userId`: get recommendations
- `POST /api/recommendations/interaction`: record a product interaction

## Database
Set `MONGODB_URI` before starting the backend. To insert the primary product catalogue:

```bash
cd backend
npm run seed
```

The seed script inserts products without deleting existing records and uses placeholder image metadata when no image is provided. The separate `backend/models/seed/product.js` script can also be run directly when its alternate dataset is needed.

## Testing
No automated test suite is defined. Available checks are:

```bash
cd backend
node --check server.js
cd ../frontend
npm run lint
npm run build
```

The current frontend lint configuration reports one existing `react-hooks/set-state-in-effect` error in the admin dashboard initial data-loading effect; the production build succeeds.

## Troubleshooting
- If the storefront cannot load products, confirm MongoDB is reachable, the backend is running, and `VITE_API_URL` points to the backend.
- If admin image uploads fail, verify all Cloudinary variables and the 5 MB upload limit.
- If admin login fails, confirm `JWT_SECRET` is set and restart the backend after changing `.env`.
- Run `npm install` separately in `backend/` and `frontend/`; they are independent packages.

## Author
No author information was present in the project metadata.
