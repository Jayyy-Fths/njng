# /images/ — Photo Folder

Drop your photos here, then update the HTML references in `index.html`.

## Image Slots

| Slot Name          | HTML Attribute        | Where it shows         | Recommended Size |
|--------------------|-----------------------|------------------------|------------------|
| `hero-background`  | `data-slot="hero-background"` | Full hero background   | 1920×1080px     |
| `photo-featured`   | `data-slot="photo-featured"`  | Gallery large panel    | 800×600px       |
| `photo-2`          | `data-slot="photo-2"`         | Gallery top-right      | 400×300px       |
| `photo-3`          | `data-slot="photo-3"`         | Gallery mid-right      | 400×300px       |
| `photo-4`          | `data-slot="photo-4"`         | Gallery bottom-left    | 400×300px       |
| `photo-5`          | `data-slot="photo-5"`         | Gallery bottom-right   | 400×300px       |
| `photo-strip-1`    | `data-slot="photo-strip-1"`   | Photo strip slot 1     | 600×450px       |
| `photo-strip-2`    | `data-slot="photo-strip-2"`   | Photo strip slot 2     | 600×450px       |
| `photo-strip-3`    | `data-slot="photo-strip-3"`   | Photo strip slot 3     | 600×450px       |

## How to Add a Photo

**Hero background:**
```html
<!-- In index.html, find the .hero-image-slot img and set: -->
<img src="images/hero-soldiers.jpg" alt="NJ Guard soldiers" style="opacity:0.45">
```

**Gallery photos:**
```html
<!-- Find the .gallery-item with the right data-slot, uncomment the img tag: -->
<img src="images/training.jpg" alt="Guard soldiers during annual training">
```

**Photo strip:**
```html
<!-- Find the .photo-slot with the right data-slot, uncomment the img tag: -->
<img src="images/ceremony.jpg" alt="Guard ceremony">
```

## Tips

- Use `.jpg` or `.webp` for photos (smaller file size)
- Compress large images before adding (aim for < 500KB each)
- Add descriptive `alt` text for accessibility
- Hero background looks best as a wide landscape photo with soldiers/training
- Official DVIDS photos are public domain: https://www.dvidshub.net/
