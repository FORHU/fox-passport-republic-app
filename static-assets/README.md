# Static assets

Brand and marketing images (logos, hero photos, destination photos). This folder
is their source of truth; the app does not serve them from here.

They are served from an object store, and `assetUrl()` (`src/shared/lib/assets.ts`)
builds their addresses from `NEXT_PUBLIC_ASSETS_URL`:

| Where | Store | `NEXT_PUBLIC_ASSETS_URL` |
|---|---|---|
| Local | MinIO from the API repo's `docker compose up` (it uploads this folder automatically) | `http://localhost:9000/fox-passport-dev/static` |
| dev.foxpassport.com | S3 behind CloudFront | the `staging` environment variable in GitHub |

A key mirrors the path here: `destinations/paris.jpg` is
`<NEXT_PUBLIC_ASSETS_URL>/destinations/paris.jpg`.

## Changing an image

1. Add or replace the file here and commit it.
2. Local: `docker compose up minio-init` in the API repo re-uploads the folder.
3. AWS: upload it to the bucket behind the CDN, under `static/`:

   ```sh
   aws s3 sync static-assets s3://<bucket>/static --exclude README.md
   ```
