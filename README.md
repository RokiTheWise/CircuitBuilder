# ⚡ LogiSketch

![LogiSketch Banner](logic-lens/public/LogiSketch.png)
**LogiSketch** is an interactive web tool designed to bridge the gap between Boolean algebra and digital logic circuits. It parses boolean equations in real-time, generates truth tables, and visualizes the corresponding logic circuit diagram instantly.

Built for students, engineers, and hobbyists, LogiSketch simplifies the process of visualizing digital logic.

## 🚀 Features

- **Real-Time Parsing**: Type equations (e.g., `AB + C'`) and see the circuit update instantly. Supports up to 5 inputs (A-E).
- **Universal Logic Modes**: Switch between **Standard** gates (AND/OR/NOT), **NAND-only**, and **NOR-only** implementations with a single click.
- **Interactive Visualization**: Powered by [React Flow](https://reactflow.dev/), the circuit diagram is fully interactive—zoom, pan, and drag nodes.
- **Dynamic Truth Table**: Automatically generates the full truth table for your current equation.
- **Professional Reports**: Generate and download a high-quality PNG report containing the equation, truth table, and circuit diagram.
- **Mobile Optimized**: Fully responsive design with a split-stack layout for mobile devices and touch-friendly controls.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: @xyflow/react (React Flow)
- **Animations**: Framer Motion
- **Export**: html-to-image

## 📸 Screenshots

|       Standard Mode        |           NAND Implementation            |
| :------------------------: | :--------------------------------------: |
|                            |                                          |
| _Visualizing `Q = AB + C`_ | _The same circuit using Universal Logic_ |

## 📦 Getting Started

1.  **Clone the repository**

    ```bash
    git clone [https://github.com/dexterjethro/LogiSketch.git](https://github.com/RokiTheWise/CircuitBuilder.git)
    cd LogiSketch
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server**

    ```bash
    npm run dev
    ```

4.  **Open your browser**
    Navigate to `http://localhost:3000` to see the app in action.

## 🎮 How to Use

1.  **Input**: Use the input counter to select the number of variables (1-5).
2.  **Type**: Enter your boolean equation in the text box.
    - Use `+` for OR
    - Use `'` for NOT (e.g., `A'`)
    - Implicit multiplication is AND (e.g., `AB`)
3.  **Explore**: Drag the canvas to inspect the generated circuit.
4.  **Mode**: Click "NAND" or "NOR" in the sidebar to see how to build the circuit using universal gates.
5.  **Export**: Click the **Actions** dropdown in the top right and select "Download Report" to save your work.

## 🗺️ Roadmap

- [x] Basic Gate Implementation
- [x] Universal Logic (NAND/NOR)
- [x] Report Generation
- [ ] Karnaugh Map (K-Map) Visualization
- [ ] Shareable URLs (Deep linking)
- [ ] Dark Mode

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Author

**Dexter Jethro Enriquez**

- Portfolio: [djenriquez.dev](https://djenriquez.dev/)
- GitHub: [@RokiTheWise](https://github.com/RokiTheWise)

---

_Made with ❤️ and Boolean Algebra._
