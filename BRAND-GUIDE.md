# Illumin8 CMS Brand Guide

---

## Logo
- **Logo Height:** Always 78px tall.
- **Usage:** Place on white or light backgrounds for best visibility. Maintain clear space around the logo equal to the height of the lowercase "i" in the wordmark.
- **File:** (Insert logo SVG/PNG here)

---

## Color Palette
| Name              | HEX      | Usage                        |
|-------------------|----------|------------------------------|
| Illumin8 Yellow   | #FFE600  | Primary, buttons, highlights |
| Illumin8 Orange   | #FF9100  | Button borders, accents      |
| Light Gray        | #EEEEEE  | UI backgrounds, cards        |
| Black             | #000000  | Text, logo, nav, icons       |
| White             | #FFFFFF  | Background, text contrast    |

---

## Typography
- **Font Family:**
  - "Poppins", Helvetica, Arial, Lucida, sans-serif;

- **Headings (h1, h2):**
  - Weight: 700 (bold)
  - Example: `font-family: 'Poppins', Helvetica, Arial, Lucida, sans-serif; font-weight: 700;`

- **Headings (h3, h4):**
  - Weight: 500 (medium)

- **Body:**
  - Weight: 300 (light)
  - Font Size: 18px
  - Line Height: 26px

---

## Buttons
```css
.button {
  background-color: #FFE600;
  border-width: 4px;
  border-color: #FF9100;
  border-radius: 50px;
  font-weight: bold;
  font-style: normal;
  text-transform: none;
  text-decoration: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.button:hover {
  border-color: #FFE600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
```
- **Text:** Black, bold
- **Shape:** Pill/rounded (50px radius)
- **Shadow:** Subtle on hover

---

## Form Inputs
```css
.input {
  font-size: 18px;
  line-height: 26px;
  color: #333;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 25px;
  padding: 10px 20px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: none;
  height: auto;
}
.input:focus {
  border-color: #FFE600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
```

---

## Iconography
- Use [Bootstrap Icons](https://icons.getbootstrap.com/) via React/bs library.
- Style: Default Bootstrap (line/solid as provided).
- Color: Black or Illumin8 Yellow for emphasis.

---

## UI Elements
- **Cards, Alerts, etc.:**
  - Border radius: 25px
  - Background: #FFFFFF or #EEEEEE
  - Subtle box shadow on hover
- **Navbar:**
  - Background: #FFFFFF
  - Link text: #000000
  - Logo: 78px tall, left-aligned
- **Spacing:**
  - Use multiples of 8px for padding/margin

---

## Imagery/Photography
- Use clean, high-contrast, modern images
- Prefer digital/tech themes
- Subtle yellow/orange overlays or accents for brand consistency

---

## Light Mode Only
- No dark mode. All UI elements are designed for light backgrounds.

---

## Example Usage
```jsx
// Button Example (React)
<button className="button">Get Started</button>

// Input Example (React)
<input className="input" placeholder="Your email" />

// Bootstrap Icon Example (React)
import { Alarm } from 'react-bootstrap-icons';
<Alarm color="#000" size={32} />
```

---

## Contact
For questions about the brand guide, contact the Illumin8 CMS team at hello@illumin8.ca 