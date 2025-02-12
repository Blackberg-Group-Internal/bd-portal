"use client";

import React, { useState } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import { useToast } from '@/app/context/ToastContext';

export default function GraphicGeneratorPage() {
  const { addToast } = useToast();

  const graphicTemplates = {
    userTesting: {
      type: "userTesting",
      title: "Sample Title Goes Here",
      subtitle:
        "Blackberg leverages...",
      bullets: [
        "Bullet point: Provide brief description",
        "Bullet point: Provide a brief description"
      ],
      startColor: "#006154",
      endColor: "#B5D334"
    },
    arrowSvg: {
      type: "arrowSvg",
      // We'll store an array of steps, each with text + color
      steps: [
        {
          text: "Step One",
          color: "#006154"
        },
        {
          text: "Step Two",
          color: "#006154"
        },
        {
          text: "Step Three",
          color: "#006154"
        }
      ]
    },  
    threeBoxes: {
        type: "threeBoxes",
        backgroundColor: "#0A4435",
        boxes: [
          {
            title: "Optimal User Experience",
            items: "User Research\nWireframing\nUsability Testing\nInteraction Design"
          },
          {
            title: "Engaging Visual Experience",
            items: "Branding Consistency\nTypography Selection\nColor Theory\nCustom Imagery and Icons"
          },
          {
            title: "Adaptive Responsive Design",
            items: "Mobile-First Layouts\nOptimized Interactions\nScalable Templates\nFluid User Experience"
          }
        ]
      }
  };

  // All created graphics live here
  const [graphics, setGraphics] = useState([
    // Start with one "userTesting" by default
    { ...graphicTemplates.userTesting }
  ]);

  // Which template is selected in the dropdown
  const [selectedTemplate, setSelectedTemplate] = useState("userTesting");

  // Refs for capturing screenshots
  const previewRefs = React.useRef({});

  // CREATE a new graphic from whichever template is selected
  const handleCreateGraphic = () => {
    const newGraphic = { ...graphicTemplates[selectedTemplate] };
    setGraphics((prev) => [...prev, newGraphic]);
  };

  // DELETE a graphic
  const handleDeleteGraphic = (index) => {
    setGraphics((prev) => prev.filter((_, i) => i !== index));
    addToast(`Graphic has been deleted`, "danger");
  };

   const handleCopyImage = (index) => {
    const ref = previewRefs.current[index];
    if (!ref) return;
  
    html2canvas(ref).then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]);
        addToast(`Graphic copied to clipboard!`, "success");
      });
    });
  }

  // DOWNLOAD a graphic
  const handleDownload = async (index) => {
    const ref = previewRefs.current[index];
    if (!ref) return;

    try {
      const canvas = await html2canvas(ref);
      const link = document.createElement("a");
      link.download = "graphic.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      addToast(`Graphic has been downloaded!`, "success");
    } catch (err) {
      console.error("Error capturing the graphic:", err);
      addToast(`Graphic could not be downloaded.`, "danger");
    }
  };

  // ============== HANDLERS for userTesting ==============
  const handleChange = (index, field, value) => {
    setGraphics((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleBulletChange = (gIndex, bIndex, newValue) => {
    setGraphics((prev) => {
      const updated = [...prev];
      updated[gIndex].bullets[bIndex] = newValue;
      return updated;
    });
  };

  const handleAddBullet = (gIndex) => {
    setGraphics((prev) => {
      const updated = [...prev];
      updated[gIndex].bullets.push("New bullet item");
      return updated;
    });
  };

  // ============== HANDLERS for arrowSvg ==============
  const handleStepTextChange = (gIndex, stepIndex, newValue) => {
    setGraphics((prev) => {
      const updated = [...prev];
      updated[gIndex].steps[stepIndex].text = newValue;
      return updated;
    });
  };

  const handleStepColorChange = (gIndex, stepIndex, newValue) => {
    setGraphics((prev) => {
      const updated = [...prev];
      updated[gIndex].steps[stepIndex].color = newValue;
      return updated;
    });
  };

  function handleBoxTitleChange(gIndex, boxIndex, newTitle) {
    setGraphics((prev) => {
      const updated = [...prev];
      updated[gIndex].boxes[boxIndex].title = newTitle;
      return updated;
    });
  }

  function handleBoxItemsChange(gIndex, boxIndex, newItems) {
    setGraphics((prev) => {
      const updated = [...prev];
      updated[gIndex].boxes[boxIndex].items = newItems;
      return updated;
    });
  }

  return (
    <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
      <div className="container">
        {/* === Breadcrumbs & Title === */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="breadcrumbs d-flex align-items-center">
              <Link href="/home" className="text-decoration-none me-1">
                Home
              </Link>
              <span className="mx-1">/</span>
              <span>Graphic Generator</span>
            </div>
          </div>
          <div className="col-12">
            <h1 className="fw-bold mb-4">Graphic Generator</h1>
          </div>
        </div>

        {/* === SELECT TEMPLATE & CREATE NEW GRAPHIC === */}
        <div className="row mb-3">
          <div className="col-auto">
            <select
              className="form-select"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="userTesting">User Testing & Discovery Tools</option>
              <option value="arrowSvg">Arrow Steps (SVG)</option>
              <option value="threeBoxes">Three Boxes Template</option>
            </select>
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" onClick={handleCreateGraphic}>
              Create Graphic
            </button>
          </div>
        </div>

        {/* === RENDER EACH GRAPHIC === */}
        {graphics.map((graphic, gIndex) => {
          const isArrowSvg = graphic.type === "arrowSvg";
          const isThreeBoxes = graphic.type === "threeBoxes";

          // Dynamically build the className string:
            const previewColumnClass = isThreeBoxes
            ? "col-12 mb-4"    // full width for threeBoxes
            : "col-12 col-md-9 mb-3 mb-md-0"; // half width for others

            // Dynamically build the className string:
            const formColumnClass = isThreeBoxes
            ? "col-12 mb-4"    // full width for threeBoxes
            : "col-12 col-md-3 d-flex flex-column"; // half width for others

          // Set up the ref callback
          const setRef = (el) => {
            if (el) {
              previewRefs.current[gIndex] = el;
            }
          };

          return (
            <div key={gIndex} className="row mb-5 bg-white shadow rounded-4 rounded-lg p-4">
              {/* PREVIEW COLUMN */}
              <div className={previewColumnClass}>
                {isArrowSvg ? (
                  // ---------- ARROW SVG PREVIEW ----------
                  <div ref={setRef} style={{ width: "100%", maxWidth: "750px" }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      height="auto"
                      viewBox="0 0 750 225"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <defs>
                        <clipPath id="a734ebb091">
                          <path d="M 22.5 76.464844 L 273.898438 76.464844 L 273.898438 148.535156 L 22.5 148.535156 Z M 22.5 76.464844 " />
                        </clipPath>
                        <clipPath id="d8598c1b6b">
                          <path d="M 22.5 76.464844 L 237.792969 76.464844 L 273.828125 112.5 L 237.792969 148.535156 L 22.5 148.535156 L 58.535156 112.5 Z M 22.5 76.464844 " />
                        </clipPath>
                        <clipPath id="96e3821f9d">
                          <path d="M 248.894531 76.464844 L 500.292969 76.464844 L 500.292969 148.535156 L 248.894531 148.535156 Z M 248.894531 76.464844 " />
                        </clipPath>
                        <clipPath id="af6d5b1f1d">
                          <path d="M 248.894531 76.464844 L 464.1875 76.464844 L 500.21875 112.5 L 464.1875 148.535156 L 248.894531 148.535156 L 284.929688 112.5 Z M 248.894531 76.464844 " />
                        </clipPath>
                        <clipPath id="ebd332cb21">
                          <path d="M 476.171875 76.464844 L 727.570312 76.464844 L 727.570312 148.535156 L 476.171875 148.535156 Z M 476.171875 76.464844 " />
                        </clipPath>
                        <clipPath id="c65270a83f">
                          <path d="M 476.171875 76.464844 L 691.464844 76.464844 L 727.5 112.5 L 691.464844 148.535156 L 476.171875 148.535156 L 512.207031 112.5 Z M 476.171875 76.464844 " />
                        </clipPath>
                      </defs>
                      {/* First arrow */}
                      <g clipPath="url(#a734ebb091)">
                        <g clipPath="url(#d8598c1b6b)">
                          <path
                            fill={graphic.steps[0].color}
                            d="M 22.5 76.464844 L 273.898438 76.464844 L 273.898438 148.535156 L 22.5 148.535156 Z M 22.5 76.464844 "
                          />
                        </g>
                      </g>
                      <text
                        x="150"
                        y="115"
                        fill="#fff"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {graphic.steps[0].text}
                      </text>

                      {/* Second arrow */}
                      <g clipPath="url(#96e3821f9d)">
                        <g clipPath="url(#af6d5b1f1d)">
                          <path
                            fill={graphic.steps[1].color}
                            d="M 248.894531 76.464844 L 500.292969 76.464844 L 500.292969 148.535156 L 248.894531 148.535156 Z M 248.894531 76.464844 "
                          />
                        </g>
                      </g>
                      <text
                        x="375"
                        y="115"
                        fill="#fff"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {graphic.steps[1].text}
                      </text>

                      {/* Third arrow */}
                      <g clipPath="url(#ebd332cb21)">
                        <g clipPath="url(#c65270a83f)">
                          <path
                            fill={graphic.steps[2].color}
                            d="M 476.171875 76.464844 L 727.570312 76.464844 L 727.570312 148.535156 L 476.171875 148.535156 Z M 476.171875 76.464844 "
                          />
                        </g>
                      </g>
                      <text
                        x="600"
                        y="115"
                        fill="#fff"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {graphic.steps[2].text}
                      </text>
                    </svg>
                  </div>
                  ) : isThreeBoxes ? (
                  /* ================= THREE BOXES PREVIEW ================= */
                  <div
                    ref={setRef}
                    className="three-boxes-container"
                    style={{
                      position: "relative",
                      width: "100%",
                      minHeight: "300px",
                      borderRadius: "24px",
                      padding: "1rem",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-evenly",
                      alignItems: "flex-start",
                    }}
                  >
                    {graphic.boxes.map((box, i) => {
                      // Convert the box.items string to an array by splitting on newlines
                      const itemArray = box.items.split("\n").filter(Boolean);

                      return (
                        <div
                          key={i}
                          style={{
                            padding: "1.5rem",
                            margin: "0.5rem",
                            minWidth: "200px",
                            flex: "1 1 200px",
                          }}
                          className="shadow"
                        >
                          <h5 style={{ marginBottom: "1rem" }} className="text-center">{box.title}</h5>
                          <ul style={{ paddingLeft: "1.2rem" }} className="text-center list-unstyled">
                            {itemArray.map((li, idx) => (
                              <li key={idx}>{li}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                  ) : (
                  // ---------- USER TESTING PREVIEW ----------
                  <div
                    ref={setRef}
                    style={{
                      minHeight: "300px",
                      maxWidth: "400px",
                      padding: "1rem",
                      color: "#fff",
                      background: `linear-gradient(146deg, ${graphic.startColor} 61%, ${graphic.endColor} 100%)`,
                      borderRadius: "4px"
                    }}
                  >
                    <h2 className="mb-1">{graphic.title}</h2>
                    <hr style={{ border: "1px solid rgba(255, 255, 255, 0.3)" }} />
                    <p>{graphic.subtitle}</p>
                    <ul>
                      {graphic.bullets?.map((b, bIndex) => (
                        <li key={bIndex}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* FORM COLUMN */}
              <div className={formColumnClass}>
                {/* The form itself */}
                <div className="flex-grow-1 mb-3">
                  {isArrowSvg ? (
                    // ===== ARROW SVG FORM =====
                    <div>
                      <h5 className="mb-3">Arrow SVG Steps</h5>
                      {graphic.steps.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="mb-4 p-2 border rounded"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <label className="form-label fw-bold">
                            Step {stepIndex + 1} Text
                          </label>
                          <input
                            type="text"
                            className="form-control mb-2"
                            value={step.text}
                            onChange={(e) =>
                              handleStepTextChange(gIndex, stepIndex, e.target.value)
                            }
                          />

                          <label className="form-label fw-bold me-2">
                            Arrow Color:
                          </label>
                          <input
                            type="color"
                            className="form-control-color"
                            value={step.color}
                            onChange={(e) =>
                              handleStepColorChange(gIndex, stepIndex, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    ) : isThreeBoxes ? (
                        /* ============= THREE BOXES FORM ============= */
                        <div className="d-flex flex-column">
                          <h5 className="mb-3">Three Boxes Settings</h5>
                          <div className="d-flex flex-column flex-md-row justify-content-between">
                          {graphic.boxes.map((box, boxIndex) => (
                            <div
                              key={boxIndex}
                              className="mb-4 p-2 border rounded"
                              style={{ backgroundColor: "#f8f9fa" }}
                            >
                              <label className="form-label fw-bold">
                                Box {boxIndex + 1} Title
                              </label>
                              <input
                                type="text"
                                className="form-control mb-2"
                                value={box.title}
                                onChange={(e) =>
                                  handleBoxTitleChange(gIndex, boxIndex, e.target.value)
                                }
                              />
    
                              <label className="form-label fw-bold">
                                Box {boxIndex + 1} Items
                              </label>
                              <textarea
                                className="form-control"
                                rows={4}
                                value={box.items}
                                onChange={(e) =>
                                  handleBoxItemsChange(gIndex, boxIndex, e.target.value)
                                }
                              />
                              <small className="text-muted">
                                Separate items by newlines.
                              </small>
                            </div>
                          ))}
                          </div>
                        </div>
                      ) : (
                    // ===== USER TESTING FORM =====
                    <div>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={graphic.title}
                          onChange={(e) => handleChange(gIndex, "title", e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">Subtitle</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={graphic.subtitle}
                          onChange={(e) =>
                            handleChange(gIndex, "subtitle", e.target.value)
                          }
                        />
                      </div>

                      <div className="mb-3 d-flex align-items-center">
                        <label className="form-label fw-bold me-2">Start Color</label>
                        <input
                          type="color"
                          className="form-control-color me-4"
                          style={{ width: "2.5rem", height: "2rem" }}
                          value={graphic.startColor}
                          onChange={(e) =>
                            handleChange(gIndex, "startColor", e.target.value)
                          }
                        />

                        <label className="form-label fw-bold me-2">End Color</label>
                        <input
                          type="color"
                          className="form-control-color"
                          style={{ width: "2.5rem", height: "2rem" }}
                          value={graphic.endColor}
                          onChange={(e) =>
                            handleChange(gIndex, "endColor", e.target.value)
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold">Bullet Points</label>
                        {graphic.bullets.map((bullet, bIndex) => (
                          <div className="input-group mb-2" key={bIndex}>
                            <input
                              type="text"
                              className="form-control"
                              value={bullet}
                              onChange={(e) =>
                                handleBulletChange(gIndex, bIndex, e.target.value)
                              }
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleAddBullet(gIndex)}
                        >
                          + Add Bullet
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS: Download & Delete */}
                <div>
                <button className="btn btn-primary me-2" onClick={() => handleCopyImage(gIndex)}>Copy Image</button>
                  <button
                    className="btn btn-success me-2"
                    onClick={() => handleDownload(gIndex)}
                  >
                    Download as PNG
                  </button>
                  
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteGraphic(gIndex)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
