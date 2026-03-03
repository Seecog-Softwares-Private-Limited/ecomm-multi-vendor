# Postman collection

Import **Indovypar-API.postman_collection.json** into Postman (File → Import).

- Set collection variable `baseUrl` to your API base (e.g. `http://localhost:3004`).
- **Vendor** folder: run **Auth → Vendor Login** first. The response token is saved to `{{vendorToken}}` and sent as `Authorization: Bearer` on all Vendor requests.
- Path params like `:id` and `:productId` can be set in the request URL or in Params.

---

## Testing "Create Order" (Vendor)

Use these steps to create a test order and see it in **Get Orders** and the vendor dashboard.

### 1. Prerequisites

- **Vendor:** One approved vendor with at least one **ACTIVE** product (create a product, then get it approved if needed).
- **Customer:** At least one **User** (customer) who has at least one **Address**. To get this:
  - Use **Auth → Customer Register** (or **Customer Login** if already registered), then add an address via the app, **or**
  - Insert a user and address in the database for testing.

### 2. Get IDs in Postman

1. Run **Auth → Vendor Login** (email/password of your vendor). The token is saved automatically.
2. Open **Vendor → Get Create Order Test Data** and send the request.
3. You should get a **200** response like:
   ```json
   {
     "success": true,
     "data": {
       "customerUserId": "abc123-user-uuid",
       "shippingAddressId": "def456-address-uuid",
       "productId": "ghi789-product-uuid",
       "productName": "My Product",
       "customerEmail": "customer@example.com"
     }
   }
   ```
4. If you get **404**: "No test data" — then either no User has an Address, or your vendor has no **ACTIVE** product. Create a customer + address (e.g. register and add address in the app) and ensure you have at least one ACTIVE product.

### 3. Create the order

The collection is set up so **Get Create Order Test Data** saves `customerUserId`, `shippingAddressId`, and `productId` into collection variables. **Create Order** uses `{{customerUserId}}`, `{{shippingAddressId}}`, and `{{productId}}` in its body.

1. Open **Vendor → Create Order** (no need to edit the body if you just ran **Get Create Order Test Data**).
2. Send the request. You should get **200** with something like:
   ```json
   {
     "success": true,
     "data": {
       "orderId": "new-order-uuid",
       "totalAmount": 899
     }
   }
   ```

If you prefer to paste IDs manually: use the test-data response and set `customerUserId`, `shippingAddressId`, and `items[0].productId` in the Create Order body.

### 4. Verify

- Run **Vendor → Get Orders**. The new order should appear in the list.
- Open the vendor dashboard in the browser; the order should show there as well.
