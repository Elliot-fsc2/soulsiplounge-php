const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serves a clean, self-contained JavaScript POS controller frontend directly
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Xprinter XP-58H Serial Controller</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f4f6f9; }
                .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-block; width: 400px; }
                button { color: white; border: none; padding: 14px 24px; font-size: 16px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; margin-bottom: 12px; }
                .btn-primary { background: #007bff; }
                .btn-primary:hover { background: #0056b3; }
                .btn-success { background: #28a745; }
                .btn-success:hover { background: #218838; }
                .btn-disabled { background: #ccc; cursor: not-allowed; }
                #status { margin-top: 15px; color: #666; font-weight: bold; font-size: 14px; }
                .badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 15px; font-weight: bold; }
                .badge-red { background: #f8d7da; color: #721c24; }
                .badge-green { background: #d4edda; color: #155724; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Xprinter XP-58H Controller</h2>
                
                <div id="connection-badge" class="badge badge-red">Status: Offline / Unlinked</div>

                <button id="pair-btn" class="btn-primary" onclick="linkSerialPrinter()">
                    1. Connect & Save Printer (First Time Only)
                </button>

                <button id="print-btn" class="btn-disabled" disabled onclick="sendSilentPrint()">
                    2. Pay & Print Receipt (100% Silent)
                </button>

                <div id="status">Ready to initialize</div>
            </div>

            <script>
                let chosenSerialPort = null;

                // Check for saved printer channels when opening the checkout page
                window.onload = async () => {
                    if (navigator.serial) {
                        try {
                            const ports = await navigator.serial.getPorts();
                            if (ports.length > 0) {
                                document.getElementById('status').innerText = "Found saved printer layout...";
                                await setupSerialPipeline(ports[0]);
                            }
                        } catch (err) {
                            console.log("Auto-connect profile skipped:", err);
                        }
                    } else {
                        document.getElementById('status').innerText = "Error: Browser does not support Web Serial.";
                    }
                };

                // Step 1: Open browser native dialogue device selection popup 
                async function linkSerialPrinter() {
                    const statusDiv = document.getElementById('status');
                    statusDiv.innerText = "Please select your Xprinter Virtual COM port in the browser menu...";
                    
                    try {
                        // Triggers the dropdown window layout
                        const port = await navigator.serial.requestPort();
                        await setupSerialPipeline(port);
                        statusDiv.innerText = "✓ Xprinter saved and linked successfully!";
                        statusDiv.style.color = "green";
                    } catch (err) {
                        statusDiv.innerText = "✕ Connection aborted: " + err.message;
                        statusDiv.style.color = "red";
                    }
                }

                // Handle configuration mappings for data communication
                async function setupSerialPipeline(port) {
                    chosenSerialPort = port;
                    
                    // Activate structural indicators
                    const badge = document.getElementById('connection-badge');
                    badge.innerText = "Status: Connected & Secured";
                    badge.className = "badge badge-green";

                    const printBtn = document.getElementById('print-btn');
                    printBtn.className = "btn-success";
                    printBtn.removeAttribute('disabled');
                }

                // Step 2: Totally Silent background transmission (No confirmation boxes)
                async function sendSilentPrint() {
                    if (!chosenSerialPort) {
                        alert("Please pair your printer channel device first.");
                        return;
                    }

                    const statusDiv = document.getElementById('status');
                    statusDiv.innerText = "Streaming receipt bytes silently...";
                    statusDiv.style.color = "#007bff";

                    // Pre-encoded 32-column raw byte text array string for 58mm Xprinter models
                    const receiptData = new Uint8Array([
                        27, 64, // Initialize 
                        32, 32, 32, 32, 83, 79, 85, 76, 83, 73, 80, 32, 67, 79, 70, 70, 69, 69, 10,
                        45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 10,
                        49, 120, 32, 69, 115, 112, 114, 101, 115, 115, 111, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 36, 51, 46, 53, 48, 10,
                        49, 120, 32, 67, 114, 111, 105, 115, 115, 97, 110, 116, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 36, 52, 46, 48, 48, 10,
                        45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 10,
                        84, 79, 84, 65, 76, 58, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 36, 55, 46, 53, 48, 10,
                        10, 10, 10, 10 // 4 lines spacing feed for clear manual tear off
                    ]);

                    try {
                        // Open channel interface at standard 9600 baud rate matching Xprinter hardware default
                        await chosenSerialPort.open({ baudRate: 9600 });
                        
                        const writer = chosenSerialPort.writable.getWriter();
                        await writer.write(receiptData);
                        
                        // Close stream links clean
                        writer.releaseLock();
                        await chosenSerialPort.close();

                        statusDiv.innerText = "✓ Receipt Printed Instantly & Silently!";
                        statusDiv.style.color = "green";
                    } catch (error) {
                        statusDiv.innerText = "✕ Transmission error: " + error.message;
                        statusDiv.style.color = "red";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(8181, () => console.log('POS Server active! Run http://localhost:8181 in Chrome/Edge.'));
