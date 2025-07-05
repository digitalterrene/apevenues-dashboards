# Property Services API Documentation

This API allows service providers to manage their service offerings for specific properties. It handles the association between services and properties, enabling service providers to offer their services to property owners.

## Base URL

`/api/properties/[propertyId]/services`

## Endpoints

### 1. Offer a Service to a Property

**POST** `/api/properties/[propertyId]/services`

Allows a service provider to offer one of their services to a specific property.

#### Request Body

```json
{
  "serviceId": "string (required)",
  "price": "number (required)",
  "duration": "string (required)",
  "description": "string (optional)",
  "terms": "string (optional)",
  "isActive": "boolean (optional, defaults to true)"
}
```

#### Example Request

```javascript
fetch("/api/properties/507f1f77bcf86cd799439011/services", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-auth-token",
  },
  body: JSON.stringify({
    serviceId: "507f1f77bcf86cd799439012",
    price: 100,
    duration: "hour",
    description: "Professional photography services",
    terms: "Minimum 2 hour booking required",
  }),
});
```

#### Responses

- **201 Created**: Service successfully offered to property
- **400 Bad Request**: Missing required fields or invalid IDs
- **401 Unauthorized**: No authentication token provided
- **403 Forbidden**: User is not a service provider
- **404 Not Found**: Property or service not found
- **409 Conflict**: Service already offered to this property

### 2. Get All Services for a Property

**GET** `/api/properties/[propertyId]/services`

Retrieves all active services offered to a specific property.

#### Example Request

```javascript
fetch("/api/properties/507f1f77bcf86cd799439011/services", {
  headers: {
    Authorization: "Bearer your-auth-token",
  },
});
```

#### Response

```json
{
  "success": true,
  "services": [
    {
      "id": "service-offer-id",
      "name": "Service Name",
      "description": "Service description",
      "providerName": "Provider Business Name",
      "providerId": "provider-user-id",
      "price": 100,
      "duration": "hour",
      "terms": "Service terms",
      "createdAt": "ISO-date-string"
    }
  ]
}
```

### 3. Remove a Service from a Property

**DELETE** `/api/properties/[propertyId]/services`

Allows a service provider to delist their service from a property.

#### Request Body

```json
{
  "serviceId": "string (required)"
}
```

#### Example Request

```javascript
fetch("/api/properties/507f1f77bcf86cd799439011/services", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer your-auth-token",
  },
  body: JSON.stringify({
    serviceId: "507f1f77bcf86cd799439012",
  }),
});
```

#### Responses

- **200 OK**: Service successfully removed from property
- **400 Bad Request**: Invalid IDs
- **401 Unauthorized**: No authentication token provided
- **403 Forbidden**: User is not a service provider
- **404 Not Found**: Service offer not found
- **500 Internal Server Error**: Failed to remove service

## Authentication

All endpoints require authentication with a valid JWT token in the `Authorization` header:

```
Authorization: Bearer your-jwt-token
```

The token must belong to a service provider (businessType: "service-provider") for POST and DELETE operations.

## Data Model

### Service Offer

```typescript
interface ServiceOffer {
  serviceId: string; // Reference to the service being offered
  providerId: string; // Reference to the service provider
  propertyId: string; // Reference to the property
  price: number; // Price for this specific offering
  duration: string; // Duration unit (hour, day, event, etc.)
  description?: string; // Optional custom description
  terms?: string; // Optional terms and conditions
  isActive?: boolean; // Whether the offer is active
  createdAt: Date; // When the offer was created
  updatedAt: Date; // When the offer was last updated
}
```

## Error Handling

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## Best Practices

1. Always check the response status code before processing the response body
2. Handle 401 errors by redirecting to login or refreshing the token
3. Validate all required fields before making requests
4. Use the `isActive` field to temporarily disable offers instead of deleting them
5. Cache GET responses when appropriate to reduce server load

## Rate Limiting

The API may enforce rate limiting (typically 100 requests per minute per user). Check response headers for:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: When the limit resets (UTC timestamp)
