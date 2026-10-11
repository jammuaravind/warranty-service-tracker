# Warranty & Service Tracker (React frontend)

React + Vite + plain CSS frontend. It talks to a Spring Boot REST API backed by MySQL.
The frontend never connects to MySQL directly.

## 1. Architecture
React (browser) --Axios/JSON--> Spring Boot REST API --JPA--> MySQL

* `src/services/api.js` is the only file that talks to the backend.
* `src/utils/warrantyUtils.js` holds the single warranty-status function used by every page.
* Expiry date and status are calculated in the browser from `purchaseDate` + `warrantyDurationMonths`.

## 2. Prerequisites (Windows)
1. Install Node.js LTS from https://nodejs.org
2. Open PowerShell and check: `node -v` and `npm -v`
3. Install VS Code from https://code.visualstudio.com

## 3. Run the frontend
Run these in PowerShell, inside this project folder (open it in VS Code, then Terminal > New Terminal):

    npm install
    Copy-Item .env.example .env
    npm run dev

Open http://localhost:5173 in your browser. Stop the server with Ctrl + C.
This zip already contains package.json, so you do not need `npm create vite`. To start from scratch instead:
`npm create vite@latest warranty-service-tracker -- --template react`, then
`npm install axios react-router-dom react-icons`, and copy the `src` folder and `index.html` over.

## 4. Environment variables (.env)
    VITE_API_BASE_URL=http://localhost:8080/api
    VITE_USE_MOCK=false
Restart `npm run dev` after any change. Never put database passwords in `.env`: every value is visible in the browser.

## 5. Backend API contract (assumed)
| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| GET | /api/products | all products | 200 + JSON array |
| GET | /api/products/{id} | one product | 200 + JSON object |
| POST | /api/products | create | 201/200 + created product |
| PUT | /api/products/{id} | update | 200 + updated product |
| DELETE | /api/products/{id} | delete | 200/204 |

Product JSON (field names must match your Spring Boot DTO/entity):

    { "id": 1, "productName": "Laptop", "purchaseDate": "2026-08-15",
      "warrantyDurationMonths": 24, "serviceDate": "2027-02-15", "notes": "Keep the invoice safely" }

Dates are `yyyy-MM-dd` strings (use `LocalDate` in Java). `serviceDate` and `notes` may be null.
Errors: 400 for validation (optional JSON `{ "message": "..." }` is shown to the user), 404 if the id does not exist, 500 for server errors.
If your backend uses other field names (for example `name` instead of `productName`), either rename them in the Java entity/DTO, or map them inside `src/services/api.js` before returning data.

## 6. Spring Boot CORS (required)
Browsers block calls from http://localhost:5173 to http://localhost:8080 unless the backend allows it.
Add to your Spring Boot project:

    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.web.servlet.config.annotation.CorsRegistry;
    import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

    @Configuration
    public class CorsConfig {
        @Bean
        public WebMvcConfigurer corsConfigurer() {
            return new WebMvcConfigurer() {
                @Override
                public void addCorsMappings(CorsRegistry registry) {
                    registry.addMapping("/api/**")
                            .allowedOrigins("http://localhost:5173")
                            .allowedMethods("GET", "POST", "PUT", "DELETE");
                }
            };
        }
    }

## 7. Connect to the MySQL-backed backend
1. Start MySQL and create the database (for example `warranty_tracker`).
2. In the Spring Boot project, set `spring.datasource.url`, `username`, `password` in `application.properties` (backend only).
3. Run the backend from its project folder: `mvn spring-boot:run` (it listens on http://localhost:8080).
4. In your browser open http://localhost:8080/api/products. You should see `[]` or a JSON list.
5. Start the frontend (section 3) in a second terminal and open http://localhost:5173.

## 8. Demo mode (optional, no backend)
Set `VITE_USE_MOCK=true` in `.env` and restart. Products are stored only in this browser's localStorage and an orange banner is always shown.
Nothing is saved to MySQL. Set it back to `false` for real use.

## 9. Warranty rules
* Expiry date = purchase date + warranty months (31 Jan + 1 month = end of February).
* Valid through the expiry date: Expired only when today is after it.
* Active: more than 30 days left. Expiring Soon: 0-30 days left. Expired: past the expiry date.
* Dates are handled as local date-only values, which avoids timezone off-by-one errors.
* Upcoming service dates: today up to 60 days ahead.

## 10. Testing checklist
- [ ] Dashboard shows counts that match the saved products (not hardcoded).
- [ ] Add Product saves, redirects to /products, and the row exists in the MySQL `products` table.
- [ ] Products list shows saved records after a page refresh.
- [ ] Search (also from the top bar) and the status filter narrow the list.
- [ ] Product details show the correct expiry date and status.
- [ ] Edit loads the saved values and the changes persist.
- [ ] Delete asks for confirmation, then removes the product.
- [ ] Status test: add products purchased with 1 month warranty at different dates to see Active, Expiring Soon and Expired.
- [ ] Invalid forms are rejected: empty name, future purchase date, 0 or negative or decimal months, service date before purchase.
- [ ] Stop the backend: pages show "Cannot reach the server" with a Try again button.
- [ ] Open http://localhost:5173/products/9999 to see the "not found" message; /abc shows the 404 page.
- [ ] Resize the window or use browser dev tools (F12, device toolbar) to check tablet and phone layouts.

## 11. Troubleshooting
* **"npm is not recognized"**: reinstall Node.js, then restart PowerShell and VS Code.
* **"running scripts is disabled" in PowerShell**: run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Command Prompt.
* **"Cannot reach the server"**: backend not running, wrong port, or CORS missing. Check http://localhost:8080/api/products directly.
* **CORS error in the browser console**: add the CORS config in section 6 and restart the backend.
* **Changed .env but nothing changed**: restart `npm run dev`.
* **Fields show empty or undefined**: JSON names differ from section 5. Compare with http://localhost:8080/api/products.
* **Port 5173 in use**: close the other dev server, or Vite will offer the next port; use the URL it prints.
