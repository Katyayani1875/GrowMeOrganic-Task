# 🎨 PrimeReact Server-Side Table Demo  
**GrowMeOrganic Private Limited – Internship Task**

This project is a responsive, performant, and beautifully styled server-side paginated data table built with **React**, **TypeScript**, **PrimeReact**, and **Tailwind CSS**.  
It fetches live data from the public API of the **Art Institute of Chicago**, demonstrating real-world data integration and scalable frontend design.

📍 **Live Demo**: [https://prime-react-server-table.netlify.app](https://prime-react-server-table.netlify.app/)  
📁 **Repository**: [GitHub – Katyayani1875/GrowMeOrganic-Task](https://github.com/Katyayani1875/GrowMeOrganic-Task.git)

---

## ✨ Tech Stack

- **Framework**: [React (with Vite)](https://vitejs.dev/)
- **Language**: TypeScript
- **UI Library**: [PrimeReact](https://primereact.org/) – focusing on the `DataTable` component
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [PrimeIcons](https://primefaces.org/primeicons)

---

## 🚀 Key Features

### 🔄 Server-Side Pagination
- Uses PrimeReact’s **lazy mode**.
- Efficient pagination, sorting, and row-count changes with real-time API calls.
- Only one page of data is held in memory at any time.

### 🎨 Custom Styling
- Extensive use of `pt` (Pass-Through) props to inject **Tailwind classes** into PrimeReact elements.
- A separate CSS file `ArtworksTable.css` handles additional custom theme overrides.

### 🧠 Smart Header Layout
- Selection column includes a **custom "Select All" checkbox** and **Chevron dropdown**.
- Uses `flex-row-reverse` for clean visual arrangement without complicating JSX structure.

### 📱 Responsive & Accessible
- Full horizontal scroll support on small screens.
- Graceful text overflow handling for clean presentation.
- Right-aligned date columns for better scanning.

### 🎯 Fine-tuned UX
- Custom loading indicators
- Styled tooltips
- Minimal and sleek custom scrollbar for professional polish

---

## 🏁 Getting Started

### 🔧 Clone the Repository
```bash
git clone https://github.com/Katyayani1875/GrowMeOrganic-Task.git
cd GrowMeOrganic-Task/primereact-server-table

npm install
# or
yarn install
# or
pnpm install
 ----
📂 Project Structure
katyayani1875-growmeorganic-task/
└── primereact-server-table/
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── vite-env.d.ts
        └── components/
            ├── ArtworksTable.css
            └── ArtworksTable.tsx

