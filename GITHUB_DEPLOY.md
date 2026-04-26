# Deploy workflow

Muc tieu cua project: push code len GitHub, Netlify tu dong deploy website
`phuonglam.com`.

## Workflow hien tai

1. Sua code website tren may local.
2. Commit va push len repo GitHub:
   `https://github.com/lamtran-dotcom/website-phuonglam.git`
3. Netlify tu dong lay code moi tu branch `main`.
4. Netlify deploy website va cap nhat `https://phuonglam.com`.

Khong can upload thu cong bang FTP nua.

## Hosting hien tai

Website dang chay qua Netlify:

- Domain chinh: `https://phuonglam.com`
- Netlify site: `beamish-beignet-69d71e.netlify.app`
- SSL/HTTPS: Netlify tu cap mien phi va tu gia han
- Deploy trigger: push len GitHub branch `main`

## DNS tai inet.vn

Domain `phuonglam.com` dang tro ve Netlify bang DNS:

- `A` record cho root domain: `75.2.60.5`
- `CNAME` record cho `www`: `beamish-beignet-69d71e.netlify.app`

## FTP da bo

Truoc do da thu deploy qua FTP len hosting 000nethost nhung that bai voi loi:

```text
530 Login authentication failed
```

Da test nhieu cach va xac dinh luong FTP khong phu hop de tu dong deploy tu
GitHub Actions, nen da chuyen sang Netlify.

## Ghi chu

- Khong can GitHub secrets FTP nua cho workflow deploy chinh.
- Khong can chay GitHub Actions de deploy website.
- Moi thay doi website chi can commit va push len GitHub.
- Netlify se tu upload va cap nhat website that.
