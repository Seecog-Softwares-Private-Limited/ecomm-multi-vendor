# Postman collection

Import **Indovypar-API.postman_collection.json** into Postman (File → Import).

- Set collection variable `baseUrl` to your API base (e.g. `http://localhost:3000`).
- **Vendor** folder: run **Auth → Vendor Login** first; the session cookie will be sent automatically with subsequent requests.
- Path params like `:id` and `:productId` can be set in the request URL or in Params.
