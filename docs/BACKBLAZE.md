# Backblaze B2 setup (manual)

File uploads go **directly from the browser to B2** using a presigned URL — the
bytes never touch the app server. Create the bucket and keys by hand, then put
the values in `.env` (never in git).

## 1. Account and bucket

1. <https://www.backblaze.com> → sign up (B2 storage is pay-per-use, first
   10 GB/month is free).
2. B2 Cloud Storage → **Buckets → Create a Bucket**:
   - **Bucket name**: must be globally unique, e.g. `my-app-uploads`.
   - **Files in Bucket**: **Private** (presigned URLs only work properly for
     private buckets; nobody may read a file without a signed URL).
   - **Object Lock**: Disabled.

## 2. Application key

1. **Application Keys → Add a New Application Key**:
   - Give it a name (e.g. `my-app`).
   - Optional but recommended: restrict it to the bucket you just created.
2. Copy the **keyID** → `B2_KEY_ID` and the **applicationKey** (shown only
   once) → `B2_APPLICATION_KEY`.

## 3. Endpoint and region

S3-compatible endpoint format: `https://s3.<region>.backblazeb2.com`

| Bucket location | `B2_ENDPOINT`                        | `B2_REGION`   |
| --------------- | ------------------------------------ | ------------- |
| US West         | `https://s3.us-west-000.backblazeb2.com` | `us-west-000` |
| US East         | `https://s3.us-east-000.backblazeb2.com` | `us-east-000` |
| EU Central      | `https://s3.eu-central-000.backblazeb2.com` | `eu-central-000` |
| Australia       | `https://s3.ap-southeast-000.backblazeb2.com` | `ap-southeast-000` |

The region code is also shown in the B2 UI next to your bucket. Fill:

```
B2_ENDPOINT=https://s3.<region>.backblazeb2.com
B2_REGION=<region>          # e.g. us-west-000
B2_BUCKET=<bucket name>
```

## 4. CORS (required for browser uploads)

Without CORS, the browser blocks the `PUT` that sends the file to B2.

1. B2 UI → **Buckets → your bucket → CORS Rules → Edit** (or **CORS Rules →
   Add**).
2. Add a rule:

   ```xml
   <CORSConfiguration>
     <CORSRule>
       <AllowedOrigin>http://localhost:3000</AllowedOrigin>
       <AllowedOrigin>https://yourdomain.com</AllowedOrigin>
       <AllowedMethod>PUT</AllowedMethod>
       <AllowedMethod>POST</AllowedMethod>
       <AllowedMethod>GET</AllowedMethod>
       <AllowedHeader>*</AllowedHeader>
       <ExposeHeader>ETag</ExposeHeader>
       <MaxAgeSeconds>3600</MaxAgeSeconds>
     </CORSRule>
   </CORSConfiguration>
   ```

3. Save. Rule changes can take a minute to propagate.

## 5. Verify

1. Fill all five `B2_*` keys in `.env`.
2. `npm run dev`, sign in, open `/dashboard`.
3. Pick a file under **Example upload** — you should see
   `Uploaded <name>` and the object under **Buckets → Files**.

## Notes

- Uploads are validated with Zod server-side (`/api/upload`): allowed types
  (png, jpeg, webp, gif, pdf) and a 5 MB limit.
- The presigned URL expires after 60 seconds and is bound to the file's
  `Content-Type`.
- The 5 MB limit is enforced on the *requested* size; for untrusted public
  traffic add a bucket lifecycle rule / max upload size at the bucket level.
