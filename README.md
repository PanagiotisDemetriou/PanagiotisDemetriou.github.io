# panayiotis demetriou — personal website

Static site (plain HTML/CSS/JS, no build step). Hosted free on GitHub Pages.

## Deploy to GitHub Pages (about 5 minutes)

1. Sign in to GitHub as **PanagiotisDemetriou**.
2. Create a new **public** repository named exactly **`PanagiotisDemetriou.github.io`**.
   Don't add a README; leave it empty.
3. On the empty repo page, click **"uploading an existing file"**.
4. Drag in **everything inside this folder**: `index.html`, `.nojekyll`, `README.md` and the
   `assets` folder. `index.html` must sit at the top level of the repo, not inside a subfolder.
   (On macOS, press `Cmd+Shift+.` in Finder to see the hidden `.nojekyll` file. It's optional.)
5. Click **Commit changes**.
6. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**,
   branch **main**, folder **/ (root)**, then click **Save**.
7. After 1–2 minutes the site is live at **https://panagiotisdemetriou.github.io**.

### Or with git

```bash
cd site
git init -b main
git add .
git commit -m "Personal website"
git remote add origin https://github.com/PanagiotisDemetriou/PanagiotisDemetriou.github.io.git
git push -u origin main
```

Then enable Pages as in step 6.

## Editing

- Text content: `index.html` (each section is clearly commented).
- Colours & fonts: the `:root` variables at the top of `assets/style.css`.
- CV: replace `assets/Panayiotis_Demetriou_CV.pdf` (keep the same file name).
- Images: `assets/img/`.
