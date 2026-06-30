import PDFDocument from 'pdfkit-table';

export async function generateProfessionalReport(res, reportData) {
    const { title, filename, userName, summary, tableHeader, tableRows } = reportData;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Create a document with bufferPages to allow global footers/page numbers
    const doc = new PDFDocument({ 
        margin: 40,
        margins: { top: 50, bottom: 70, left: 40, right: 40 },
        size: 'A4', 
        bufferPages: true 
    });
    
    // Corporate Colors
    const colors = {
        primary: '#1e3a8a', // Dark Indigo/Blue
        secondary: '#0f172a', // Slate 900
        accent: '#3b82f6', // Blue 500
        light: '#f8fafc',
        border: '#cbd5e1',
        text: '#334155',
        muted: '#64748b',
        white: '#ffffff'
    };

    doc.pipe(res);

    // ==========================================
    // 1. Header Banner (Page 1)
    // ==========================================
    // Draw background banner (ignores margins because we use absolute coordinates)
    doc.rect(0, 0, doc.page.width, 110).fill(colors.primary);
    
    doc.font('Helvetica-Bold')
       .fontSize(26)
       .fillColor(colors.white)
       .text('EXPENSE TRACKER', 40, 35);
       
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#93c5fd')
       .text('FINANCIAL STATEMENT', 40, 68);

    // Date on the right side of the banner
    doc.font('Helvetica')
       .fontSize(10)
       .fillColor(colors.white)
       .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, doc.page.width - 240, 45, { align: 'right', width: 200 });

    // Set starting Y below the banner
    doc.y = 140; 

    // ==========================================
    // 2. Report Metadata
    // ==========================================
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fillColor(colors.secondary)
       .text(title.toUpperCase(), 40, doc.y);

    doc.moveDown(0.5);
    
    doc.font('Helvetica-Bold')
       .fontSize(9)
       .fillColor(colors.text)
       .text('PREPARED FOR: ', 40, doc.y, { continued: true })
       .font('Helvetica')
       .fillColor(colors.muted)
       .text(userName.toUpperCase());

    doc.moveDown(2);

    // ==========================================
    // 3. Executive Summary (Rounded Cards)
    // ==========================================
    const summaryTop = doc.y;
    // Calculate equal widths for the cards
    const cardSpacing = 15;
    const cardWidth = (doc.page.width - 80 - (cardSpacing * (summary.length - 1))) / summary.length;
    
    let currentX = 40;
    
    summary.forEach((stat) => {
        // Draw card background
        doc.roundedRect(currentX, summaryTop, cardWidth, 60, 4)
           .fillAndStroke(colors.light, colors.border);
        
        // Label
        doc.font('Helvetica-Bold').fontSize(8).fillColor(colors.muted);
        doc.text(stat.label.toUpperCase(), currentX + 12, summaryTop + 14, { width: cardWidth - 24, align: 'left' });
        
        // Value
        doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.primary);
        doc.text(stat.value, currentX + 12, summaryTop + 32, { width: cardWidth - 24, align: 'left' });
        
        currentX += cardWidth + cardSpacing;
    });

    doc.y = summaryTop + 85;

    // ==========================================
    // 4. Data Table (pdfkit-table)
    // ==========================================
    const table = {
        title: { label: "Transaction Ledger", fontSize: 14, color: colors.secondary, fontFamily: 'Helvetica-Bold' },
        headers: tableHeader,
        rows: tableRows
    };

    const tableOptions = {
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9).fillColor(colors.secondary),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            doc.font("Helvetica").fontSize(9).fillColor(colors.text);
        },
        x: 40,
        y: doc.y,
        width: doc.page.width - 80,
        padding: 6,
        columnSpacing: 5,
        divider: {
            header: { disabled: false, width: 1.5, opacity: 1, color: colors.secondary },
            horizontal: { disabled: false, width: 0.5, opacity: 1, color: colors.border }
        }
    };

    await doc.table(table, tableOptions);

    // ==========================================
    // 5. Global Footer across all pages
    // ==========================================
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        
        const bottom = doc.page.height - 40;
        
        // Footer divider line
        doc.moveTo(40, bottom - 15)
           .lineTo(doc.page.width - 40, bottom - 15)
           .lineWidth(0.5)
           .strokeColor(colors.border)
           .stroke();
        
        // Footer text
        doc.fontSize(8)
           .fillColor(colors.muted)
           .text('PRIVATE AND CONFIDENTIAL', 40, bottom, { align: 'left', lineBreak: false });
           
        doc.fontSize(8)
           .fillColor(colors.muted)
           .text(`Page ${i + 1} of ${pages.count}`, 40, bottom, { align: 'right', lineBreak: false });
    }

    // Finalize
    doc.end();
}
