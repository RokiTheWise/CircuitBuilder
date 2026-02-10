"use client";

import {
  FiChevronDown,
  FiGithub,
  FiDownload,
  FiCoffee,
  FiGrid,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useState } from "react";
import { IconType } from "react-icons";
import { toPng, toJpeg } from "html-to-image";

interface StaggeredDropDownProps {
  equation: string;
  numInputs: number;
  tableOutputs: Record<number, number>;
}

const StaggeredDropDown = ({
  equation,
  numInputs,
  tableOutputs,
}: StaggeredDropDownProps) => {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // STEP 1: Capture the Circuit Visual
      const circuitElement = document.querySelector(
        ".react-flow__renderer",
      ) as HTMLElement;

      if (!circuitElement) {
        console.error("Circuit element not found");
        return;
      }

      // FIX 1: Wait for mobile rendering
      await new Promise((resolve) => setTimeout(resolve, 300));

      // FIX 2: Use toJpeg instead of toPng for the circuit part
      // and LOWER the pixelRatio to 1. Mobile browsers crash with high-res canvas.
      const circuitImgData = await toJpeg(circuitElement, {
        quality: 0.9,
        backgroundColor: "#ffffff",
        width: circuitElement.offsetWidth,
        height: circuitElement.offsetHeight,
        pixelRatio: 1, // Crucial: Keep this at 1 for mobile stability
        cacheBust: true,
      });

      // STEP 2: Build the "Ghost" Report Container
      const reportContainer = document.createElement("div");
      reportContainer.style.position = "fixed";
      reportContainer.style.top = "0";
      reportContainer.style.left = "0";
      reportContainer.style.zIndex = "-100";
      reportContainer.style.width = "800px";
      reportContainer.style.padding = "40px";
      reportContainer.style.backgroundColor = "#ffffff";
      reportContainer.style.fontFamily = "sans-serif";
      reportContainer.style.color = "#0f172a";

      // STEP 3: Generate Truth Table HTML
      let tableRows = "";
      const maxRows = Math.pow(2, numInputs);
      const headers = Array.from({ length: numInputs }, (_, i) =>
        String.fromCharCode(65 + i),
      ).join("</th><th>");

      for (let i = 0; i < maxRows; i++) {
        const binary = i.toString(2).padStart(numInputs, "0");
        const cols = binary
          .split("")
          .map((bit) => `<td style="padding: 4px;">${bit}</td>`)
          .join("");
        const out = tableOutputs[i] === 1 ? 1 : 0;
        const color =
          out === 1 ? "color: #2563eb; font-weight: bold;" : "color: #94a3b8;";

        tableRows += `
          <tr style="border-bottom: 1px solid #e2e8f0; text-align: center; height: 30px;">
            ${cols}
            <td style="${color} padding: 4px;">${out}</td>
          </tr>
        `;
      }

      // STEP 4: Assemble the HTML
      reportContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
           <h1 style="margin: 0; font-size: 32px; font-weight: 900;">Logi<span style="color: #2563eb">Sketch</span> Report</h1>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 5px;">Boolean Equation</h3>
          <div style="font-size: 36px; font-weight: 900; color: #0f172a;">Q = ${equation || "?"}</div>
        </div>

        <div style="display: flex; gap: 40px; align-items: flex-start;">
          
          <div style="flex: 0 0 200px;">
            <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 10px;">Truth Table</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f1f5f9; height: 35px;">
                  <th>${headers}</th>
                  <th style="color: #2563eb;">OUT</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>

          <div style="flex: 1;">
            <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; font-weight: bold; margin-bottom: 10px;">Logic Circuit</h3>
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <img src="${circuitImgData}" style="width: 100%; display: block;" />
            </div>
          </div>

        </div>
        
        <div style="margin-top: 40px; text-align: right; font-size: 12px; color: #94a3b8;">
          Generated with LogiSketch
        </div>
      `;

      document.body.appendChild(reportContainer);

      // FIX 3: Wait for ghost element to paint
      await new Promise((resolve) => setTimeout(resolve, 500));

      // STEP 5: Capture the Report (Safe to use PNG here for crisp text)
      // Keep pixelRatio at 1.5 or 1 for safety on mobile
      const finalReportUrl = await toPng(reportContainer, {
        cacheBust: true,
        pixelRatio: 1.5,
      });

      document.body.removeChild(reportContainer);

      // STEP 6: Trigger Download
      const a = document.createElement("a");
      a.setAttribute("download", "logisketch-report.png");
      a.setAttribute("href", finalReportUrl);
      a.click();
    } catch (err) {
      console.error("Report generation failed:", err);
      alert("Mobile generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center justify-center">
      <motion.div animate={open ? "open" : "closed"} className="relative">
        <button
          onClick={() => setOpen((pv) => !pv)}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <span className="font-bold text-sm">
            {isGenerating ? "Generating..." : "Actions"}
          </span>
          <motion.span variants={iconVariants}>
            <FiChevronDown />
          </motion.span>
        </button>

        <motion.ul
          initial={wrapperVariants.closed}
          variants={wrapperVariants}
          style={{ originY: "top" }}
          className="flex flex-col gap-2 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] right-0 w-48 overflow-hidden border border-slate-100"
        >
          <Option
            setOpen={setOpen}
            Icon={FiDownload}
            text="Download Report"
            onClick={handleDownload}
          />
          <Option
            setOpen={setOpen}
            Icon={FiGrid}
            text="View Portfolio"
            onClick={() => window.open("https://djenriquez.dev/", "_blank")}
          />
          <Option
            setOpen={setOpen}
            Icon={FiGithub}
            text="View Source"
            onClick={() =>
              window.open(
                "https://github.com/RokiTheWise/CircuitBuilder",
                "_blank",
              )
            }
          />
        </motion.ul>
      </motion.div>
    </div>
  );
};

// ... (Rest of component remains same)

const Option = ({
  text,
  Icon,
  setOpen,
  onClick,
}: {
  text: string;
  Icon: IconType;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onClick?: () => void;
}) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => {
        setOpen(false);
        if (onClick) onClick();
      }}
      className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
    >
      <motion.span variants={actionIconVariants}>
        <Icon />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  );
};

export default StaggeredDropDown;

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
    },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: "afterChildren",
    },
  },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
};
