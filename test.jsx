import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async (text) => {
    try {
      const url = "https://n8n.switchology.in/webhook-test/chat";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
        return data.answer || "No response from server.";
      } else {
        const responseText = await response.text();
        console.error("Warning: Server returned non-JSON response:", responseText);
        return responseText;
      }
    } catch (err) {
      console.error("Error sending message:", err);
      return "⚠️ Error: Could not connect to server.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: input }]);
    const reply = await sendMessage(input);
    setMessages((prev) => [...prev, { from: "user", text: input }, { from: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          backgroundColor: "#4f46e5",
          color: "#fff",
          fontSize: "24px",
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        💬
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "300px",
            maxHeight: "400px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              backgroundColor: "#f9f9f9",
            }}
          >
            {messages.map((msg, i) => (
              <p key={i} style={{ margin: "5px 0" }}>
                <strong>{msg.from}:</strong> {msg.text}
              </p>
            ))}
          </div>

          <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: "10px",
                backgroundColor: "#4f46e5",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}


// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Grid,
//   Typography,
//   Chip,
//   Button,
//   Stack,
//   Divider,
//   Paper,
// } from "@mui/material";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const switchgearPageOptions = {
//   StudyPeriod: [
//     "Today",
//     "Last 7 Days / This Week",
//     "This Month",
//     "This Quarter",
//     "This Year (Year-to-date)",
//     "Coming Month",
//     "Coming Year",
//   ],
//   IndustrySegment: [
//     "Low Voltage Switchgear",
//     "Medium & High Voltage Switchgear",
//     "Control Panels & Automation",
//     "Metering & Smart Meters",
//     "Renewable Energy Integration",
//     "Grid Modernization & Smart Grid",
//     "Industrial vs Residential vs Utility Markets",
//   ],
//   GeographicFocus: [
//     "India (National overview)",
//     "Region-wise within India (North, South, East, West)",
//     "Global",
//     "Export/Import Focus",
//   ],
//   TypeOfContent: [
//     "News Articles & Blogs",
//     "Market Reports & Analysis",
//     "Recent Product Launches & Innovations",
//     "Company Profiles & Stocks",
//     "Upcoming Industry Events & Conferences",
//     "Policy & Regulatory Updates",
//   ],
//   CompanyFocus: [
//     "Top Industry Players (ABB, L&T, etc)",
//     "Emerging Startups & Innovators",
//     "Unorganized Sector Insights",
//   ],
//   OutputFormat: [
//     "Executive Summary (Brief)",
//     "Detailed Research Report",
//     "Data & Charts (Trends, forecasts)",
//   ],
// };

// // 🔹 Normalize OutputFormat for backend compatibility
// const normalizeFormat = (format) => {
//   if (format.startsWith("Executive Summary")) return "Executive Summary";
//   if (format.startsWith("Detailed Research Report")) return "Detailed Research Report";
//   if (format.startsWith("Data & Charts")) return "Data & Charts";
//   return format;
// };

// // 🔹 Formatter function: JSON → text with structured report
// const formatReport = (report) => {
//   if (!report) return "";

//   const { title, week_ending, trending_topics, upcoming_events, summary, outputFormat } = report;

//   let output = "";

//   // Title + Week
//   if (title) output += `# ${title}\n`;
//   if (week_ending) output += `Week Ending: ${week_ending}\n\n`;

//   // Summary
//   if (summary) {
//     output += `## Summary\n${summary}\n\n`;
//   }

//   // Trending Topics
//   if (trending_topics?.length) {
//     output += `## Trending Topics\n`;
//     trending_topics.forEach((t, i) => {
//       output += `### ${i + 1}. ${t.title}\n`;
//       if (t.summary) output += `${t.summary}\n`;
//       if (t.source) {
//         output += `Source: ${t.source.name} (${t.source.date})`;
//         if (t.source.url) output += ` | URL: ${t.source.url}`;
//         output += `\n`;
//       }
//       output += `\n`;
//     });
//   }

//   // Upcoming Events
//   if (upcoming_events?.length) {
//     output += `## Upcoming Events\n`;
//     upcoming_events.forEach((e, i) => {
//       output += `### ${i + 1}. ${e.event_name}\n`;
//       if (e.dates) output += `Dates: ${e.dates}\n`;
//       if (e.location) output += `Location: ${e.location}\n`;
//       if (e.highlights) output += `Highlights: ${e.highlights}\n`;
//       if (e.source) output += `Source: ${e.source}\n`;
//       output += `\n`;
//     });
//   }

//   return output.trim();
// };


// export default function SwitchgearPage() {
//   const [selections, setSelections] = useState({
//     StudyPeriod: "",
//     IndustrySegment: [],
//     GeographicFocus: [],
//     TypeOfContent: [],
//     CompanyFocus: [],
//     OutputFormat: "",
//   });

//   const [status, setStatus] = useState("");
//   const [apiResponse, setApiResponse] = useState(""); // full response text
//   const [displayedText, setDisplayedText] = useState(""); // typing effect text
//   const [chartData, setChartData] = useState([]); // for charts
//   const [activeFormat, setActiveFormat] = useState(""); // remember what was selected

//   const handleChange = (step, value) => {
//     const isSingleSelect = step === "StudyPeriod" || step === "OutputFormat";

//     if (isSingleSelect) {
//       setSelections({ ...selections, [step]: value });
//     } else {
//       const current = selections[step];
//       if (current.includes(value)) {
//         setSelections({
//           ...selections,
//           [step]: current.filter((v) => v !== value),
//         });
//       } else {
//         setSelections({ ...selections, [step]: [...current, value] });
//       }
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       setStatus("Sending...");
//       setApiResponse("");
//       setDisplayedText("");
//       setChartData([]);

//       const normalizedOutputFormat = normalizeFormat(selections.OutputFormat);
//       const payload = { ...selections, OutputFormat: normalizedOutputFormat };

//       setActiveFormat(normalizedOutputFormat);

//       const response = await fetch(
//         "https://n8n.switchology.in/webhook-test/switchgear",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();

//         // Use 'text' field directly if it exists
//         const reportText = data.text || "";


//         if (normalizeFormat(selections.OutputFormat) === "Data & Charts") {
//           setChartData(data.chartData || []);
//           setStatus("");
//         } else {
//           setApiResponse(reportText);
//           setStatus("");
//         }
//       } else {
//         setStatus(`Error: ${response.statusText}`);
//       }
//     } catch (error) {
//       setStatus(`Error: ${error.message}`);
//     }
//   };

//   // 🔹 Typing effect with pause per line/paragraph
//  useEffect(() => {
//   if (!apiResponse) {
//     setDisplayedText("");
//     return;
//   }

//   const lines = apiResponse.split("\n");
//   let lineIndex = 0;
//   let charIndex = 0;
//   let currentText = "";
//   let timerId = null;

//   const typeNext = () => {
//     if (lineIndex >= lines.length) return;
//     if (charIndex < lines[lineIndex].length) {
//       currentText += lines[lineIndex][charIndex];
//       setDisplayedText(currentText);
//       charIndex++;
//       timerId = setTimeout(typeNext, 20);
//     } else {
//       currentText += "\n";
//       setDisplayedText(currentText);
//       lineIndex++;
//       charIndex = 0;
//       timerId = setTimeout(typeNext, 100);
//     }
//   };

//   typeNext();

//   return () => {
//     if (timerId) clearTimeout(timerId);
//   };
// }, [apiResponse]);




//   const steps = Object.keys(switchgearPageOptions);

//   return (
//     <Box maxWidth={1200} mx="auto" p={4}>
//       <Typography variant="h4" gutterBottom>
//         Market Research Study - Switchgear Components
//       </Typography>

//       <Paper variant="outlined" sx={{ p: 3, borderColor: "#ccc" }}>
//         <Grid container spacing={2}>
//           {steps.map((step, idx) => (
//             <Grid item xs={12} key={step}>
//               <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
//                 {step.replace(/([A-Z])/g, " $1")}
//               </Typography>

//               <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 2 }}>
//                 {switchgearPageOptions[step].map((option) => (
//                   <Chip
//                     key={option}
//                     label={option}
//                     size="small"
//                     variant={
//                       step === "StudyPeriod" || step === "OutputFormat"
//                         ? selections[step] === option
//                           ? "filled"
//                           : "outlined"
//                         : selections[step].includes(option)
//                           ? "filled"
//                           : "outlined"
//                     }
//                     onClick={() => handleChange(step, option)}
//                     sx={{
//                       backgroundColor:
//                         step === "StudyPeriod" || step === "OutputFormat"
//                           ? selections[step] === option
//                             ? "#856edf"
//                             : "transparent"
//                           : selections[step].includes(option)
//                             ? "#856edf"
//                             : "transparent",
//                       color:
//                         step === "StudyPeriod" || step === "OutputFormat"
//                           ? selections[step] === option
//                             ? "#fff"
//                             : "inherit"
//                           : selections[step].includes(option)
//                             ? "#fff"
//                             : "inherit",
//                       borderColor:
//                         step === "StudyPeriod" || step === "OutputFormat"
//                           ? selections[step] === option
//                             ? "#856edf"
//                             : undefined
//                           : selections[step].includes(option)
//                             ? "#856edf"
//                             : undefined,
//                       "&:hover": {
//                         backgroundColor:
//                           step === "StudyPeriod" || step === "OutputFormat"
//                             ? selections[step] === option
//                               ? "#7458c5"
//                               : "#f5f5f5"
//                             : selections[step].includes(option)
//                               ? "#7458c5"
//                               : "#f5f5f5",
//                       },
//                       p: 1,
//                     }}
//                   />
//                 ))}
//               </Stack>

//               {idx < steps.length - 1 && <Divider sx={{ my: 1 }} />}
//             </Grid>
//           ))}
//         </Grid>
//       </Paper>

//       <Box mt={4}>
//         <Button
//           variant="contained"
//           sx={{
//             backgroundColor: "#856edf",
//             "&:hover": { backgroundColor: "#7458c5" },
//           }}
//           onClick={handleSubmit}
//         >
//           Submit
//         </Button>

//         {status && (
//           <Typography variant="body1" mt={2}>
//             {status}
//           </Typography>
//         )}

//         {/* 🔹 Text Mode */}
//         {displayedText && activeFormat !== "Data & Charts" && (
//           <Paper
//             variant="outlined"
//             sx={{ mt: 3, p: 2, backgroundColor: "#f9f9f9", borderColor: "#ddd" }}
//           >
//             <Typography
//               variant="body1"
//               sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
//             >
//               {displayedText}
//             </Typography>
//           </Paper>
//         )}

//         {/* 🔹 Chart Mode */}
//         {chartData.length > 0 && activeFormat === "Data & Charts" && (
//           <Paper
//             variant="outlined"
//             sx={{ mt: 3, p: 2, backgroundColor: "#f9f9f9", borderColor: "#ddd" }}
//           >
//             <Typography variant="h6" gutterBottom>
//               Chart Data
//             </Typography>
//             <ResponsiveContainer width="100%" height={400}>
//               <LineChart data={chartData}>
//                 <CartesianGrid stroke="#ccc" />
//                 <XAxis dataKey="title" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="value" stroke="#856edf" />
//               </LineChart>
//             </ResponsiveContainer>

//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={chartData}>
//                 <CartesianGrid stroke="#ccc" />
//                 <XAxis dataKey="title" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="value" fill="#856edf" />
//               </BarChart>
//             </ResponsiveContainer>
//           </Paper>
//         )}
//       </Box>
//     </Box>
//   );
// }
