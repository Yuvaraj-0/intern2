
Method	Endpoint	Access	Description
POST	/api/v1/products	Admin	Create product
GET	/api/v1/products	User/Admin	Get all products (with pagination, filters)
GET	/api/v1/products/:id	User/Admin	Get single product
PUT	/api/v1/products/:id	Admin	Update product
DELETE	/api/v1/products/:id	Admin	Delete product
GET	/api/v1/products/categories	User/Admin	Get categories list